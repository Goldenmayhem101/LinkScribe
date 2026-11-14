# Image → 3D Batch

Upload many 2D images; each becomes a 3D model (.glb) using the open-source
[TripoSR](https://github.com/VAST-AI-Research/TripoSR) model running **locally**.
No API keys, no per-model fees, no usage limits.

## Setup (once, on your own computer)
Needs Python 3.10–3.12 and git. An NVIDIA GPU (~6 GB VRAM+) is strongly recommended.

    python setup.py

## Run
    python run.py          # real 3D generation
    python run.py --mock   # fake spheres, to try the UI without a GPU

Open http://localhost:8000, drop in images, preview, download single files or a ZIP.
The first run downloads the model weights (~1.7 GB) once.

## Tips
- Best input: one character, front-facing, plain background, good lighting.
- Backgrounds are removed automatically.
- Higher detail: `MESH_RESOLUTION=320 python run.py` (uses more VRAM).
- Out-of-memory? Lower `MESH_RESOLUTION` (e.g. 192).

## Notes
- Results are static meshes with vertex colours — not rigged or animated.
- Windows: TripoSR's `torchmcubes` dependency compiles from source and needs
  Visual Studio Build Tools (C++) and the CUDA toolkit. If setup fails there, use WSL2.
- Other image→3D models can be added as providers in `providers/`.
