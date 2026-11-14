"""Batch 2D image -> 3D model web app. Run: uvicorn app:app --port 8000"""
import io
import os
import queue
import shutil
import threading
import uuid
import zipfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from providers import get_provider
from convert import glb_to_fbx

DATA = Path(os.environ.get("DATA_DIR", Path(__file__).parent / "data"))
IN_DIR, OUT_DIR = DATA / "inputs", DATA / "outputs"
for d in (IN_DIR, OUT_DIR):
    d.mkdir(parents=True, exist_ok=True)

ALLOWED = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
MAX_BYTES = 25 * 1024 * 1024

app = FastAPI(title="img23d")
jobs: dict[str, dict] = {}
order: list[str] = []
q: "queue.Queue[str]" = queue.Queue()
provider = None


def worker():
    global provider
    while True:
        job_id = q.get()
        job = jobs.get(job_id)
        if not job or job["status"] == "cancelled":
            continue
        try:
            if provider is None:
                job["status"] = "loading model"
                provider = get_provider()
            job["status"] = "processing"
            provider.generate(job["input"], job["output"])
            job["status"] = "done"
        except Exception as e:  # keep the batch going
            job["status"] = "failed"
            job["error"] = f"{type(e).__name__}: {e}"
        finally:
            q.task_done()


threading.Thread(target=worker, daemon=True).start()


def public(job):
    return {k: job[k] for k in ("id", "name", "status", "error")}


@app.post("/api/upload")
async def upload(files: list[UploadFile] = File(...)):
    created = []
    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED:
            created.append({"name": f.filename, "status": "failed", "error": "unsupported file type", "id": uuid.uuid4().hex})
            continue
        data = await f.read()
        if len(data) > MAX_BYTES:
            created.append({"name": f.filename, "status": "failed", "error": "file too large (25MB max)", "id": uuid.uuid4().hex})
            continue
        job_id = uuid.uuid4().hex
        inp = IN_DIR / f"{job_id}{ext}"
        inp.write_bytes(data)
        job = {"id": job_id, "name": Path(f.filename).name, "status": "queued", "error": None,
               "input": str(inp), "output": str(OUT_DIR / f"{job_id}.glb")}
        jobs[job_id] = job
        order.append(job_id)
        q.put(job_id)
        created.append(public(job))
    return created


@app.get("/api/jobs")
def list_jobs():
    return [public(jobs[i]) for i in order if i in jobs]


def get_job(job_id):
    if job_id not in jobs:
        raise HTTPException(404, "no such job")
    return jobs[job_id]


@app.get("/api/jobs/{job_id}/model.glb")
def model(job_id: str):
    job = get_job(job_id)
    if job["status"] != "done":
        raise HTTPException(409, "not ready")
    return FileResponse(job["output"], media_type="model/gltf-binary",
                        filename=Path(job["name"]).stem + ".glb")


def fbx_path(job):
    fbx = Path(job["output"]).with_suffix(".fbx")
    if not fbx.exists():
        try:
            glb_to_fbx(job["output"], str(fbx))
        except Exception as e:
            raise HTTPException(500, str(e))
    return fbx


@app.get("/api/jobs/{job_id}/model.fbx")
def model_fbx(job_id: str):
    job = get_job(job_id)
    if job["status"] != "done":
        raise HTTPException(409, "not ready")
    return FileResponse(fbx_path(job), media_type="application/octet-stream",
                        filename=Path(job["name"]).stem + ".fbx")


@app.get("/api/jobs/{job_id}/input")
def job_input(job_id: str):
    return FileResponse(get_job(job_id)["input"])


@app.post("/api/jobs/{job_id}/retry")
def retry(job_id: str):
    job = get_job(job_id)
    if job["status"] == "failed" and Path(job["input"]).exists():
        job.update(status="queued", error=None)
        q.put(job_id)
    return public(job)


@app.delete("/api/jobs/{job_id}")
def delete(job_id: str):
    job = get_job(job_id)
    job["status"] = "cancelled"
    for p in (job["input"], job["output"], Path(job["output"]).with_suffix(".fbx")):
        Path(p).unlink(missing_ok=True)
    jobs.pop(job_id, None)
    if job_id in order:
        order.remove(job_id)
    return {"ok": True}


@app.get("/api/download.zip")
def download_all(fmt: str = "glb"):
    buf = io.BytesIO()
    seen = {}
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as z:
        for i in order:
            j = jobs.get(i)
            if j and j["status"] == "done":
                stem = Path(j["name"]).stem
                seen[stem] = seen.get(stem, 0) + 1
                name = stem if seen[stem] == 1 else f"{stem}_{seen[stem]}"
                if fmt == "fbx":
                    z.write(fbx_path(j), name + ".fbx")
                else:
                    z.write(j["output"], name + ".glb")
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/zip",
                             headers={"Content-Disposition": 'attachment; filename="models.zip"'})


app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True), name="static")
