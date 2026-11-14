"""GLB -> FBX using headless Blender (apt install blender)."""
import shutil
import subprocess
import tempfile
from pathlib import Path

SCRIPT = """
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
bpy.ops.export_scene.fbx(filepath=a[1], path_mode='COPY', embed_textures=True, add_leaf_bones=False)
"""


def blender_available() -> bool:
    return shutil.which("blender") is not None


def glb_to_fbx(glb: str, fbx: str) -> None:
    exe = shutil.which("blender")
    if not exe:
        raise RuntimeError("Blender is not installed (run: apt-get install -y blender)")
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write(SCRIPT)
        script = f.name
    try:
        r = subprocess.run([exe, "-b", "-noaudio", "-P", script, "--", glb, fbx],
                           capture_output=True, text=True, timeout=300)
        if not Path(fbx).exists():
            raise RuntimeError("FBX conversion failed: " + (r.stderr or r.stdout)[-400:])
    finally:
        Path(script).unlink(missing_ok=True)
