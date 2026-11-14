"""Fake provider for testing the app without a GPU: makes a textured-colour sphere/box."""
import time
import numpy as np
import trimesh
from PIL import Image


class MockProvider:
    name = "mock"

    def generate(self, image_path: str, out_path: str) -> None:
        img = Image.open(image_path).convert("RGB").resize((8, 8))
        color = np.array(img).reshape(-1, 3).mean(axis=0).astype(np.uint8)
        mesh = trimesh.creation.icosphere(subdivisions=3, radius=0.5)
        mesh.visual.vertex_colors = np.tile(np.append(color, 255), (len(mesh.vertices), 1))
        time.sleep(1)
        mesh.export(out_path)
