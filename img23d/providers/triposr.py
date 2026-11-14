"""TripoSR (open source, runs locally, free). Needs the TripoSR repo on PYTHONPATH
(setup script clones it to ./TripoSR)."""
import os
import sys
import threading

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "TripoSR"))


class TripoSRProvider:
    name = "triposr"

    def __init__(self):
        import torch
        import rembg
        from tsr.system import TSR

        self.torch = torch
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
        self.resolution = int(os.environ.get("MESH_RESOLUTION", "256"))
        self.lock = threading.Lock()
        print(f"[triposr] loading model on {self.device} ...", flush=True)
        self.model = TSR.from_pretrained(
            "stabilityai/TripoSR", config_name="config.yaml", weight_name="model.ckpt"
        )
        self.model.renderer.set_chunk_size(8192)
        self.model.to(self.device)
        self.rembg_session = rembg.new_session()
        print("[triposr] ready", flush=True)

    def generate(self, image_path: str, out_path: str) -> None:
        import numpy as np
        from PIL import Image
        from tsr.utils import remove_background, resize_foreground

        with self.lock:
            image = Image.open(image_path).convert("RGB")
            image = remove_background(image, self.rembg_session)
            image = resize_foreground(image, 0.85)
            arr = np.array(image).astype(np.float32) / 255.0
            arr = arr[:, :, :3] * arr[:, :, 3:4] + (1 - arr[:, :, 3:4]) * 0.5
            image = Image.fromarray((arr * 255.0).astype(np.uint8))
            with self.torch.no_grad():
                codes = self.model(image, device=self.device)
            mesh = self.model.extract_mesh(codes, True, resolution=self.resolution)[0]
            mesh.export(out_path)
            if self.device.startswith("cuda"):
                self.torch.cuda.empty_cache()
