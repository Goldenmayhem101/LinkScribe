"""One-time setup on YOUR machine: python setup.py   (needs Python 3.10-3.12, git)
Creates ./venv, installs PyTorch (CUDA if you have an NVIDIA GPU), clones TripoSR."""
import os, subprocess, sys, shutil, platform

here = os.path.dirname(os.path.abspath(__file__))
venv = os.path.join(here, "venv")
py = os.path.join(venv, "Scripts" if platform.system() == "Windows" else "bin", "python")

def run(*cmd):
    print(">", " ".join(cmd), flush=True)
    subprocess.check_call(cmd, cwd=here)

if not os.path.exists(py):
    run(sys.executable, "-m", "venv", venv)
run(py, "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel")

has_nvidia = shutil.which("nvidia-smi") is not None
if has_nvidia:
    run(py, "-m", "pip", "install", "torch", "torchvision", "--index-url", "https://download.pytorch.org/whl/cu121")
else:
    print("No NVIDIA GPU detected: installing CPU PyTorch (works, but slow).")
    run(py, "-m", "pip", "install", "torch", "torchvision")

if not os.path.exists(os.path.join(here, "TripoSR")):
    run("git", "clone", "https://github.com/VAST-AI-Research/TripoSR.git", "TripoSR")
run(py, "-m", "pip", "install", "-r", os.path.join("TripoSR", "requirements.txt"))
run(py, "-m", "pip", "install", "-r", "requirements.txt")
print("\nSetup done. Start the app with:  python run.py")
