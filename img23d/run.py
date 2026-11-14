"""Start the app with the venv's Python: python run.py [--mock]"""
import os, platform, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
py = os.path.join(here, "venv", "Scripts" if platform.system() == "Windows" else "bin", "python")
env = dict(os.environ)
if "--mock" in sys.argv:
    env["PROVIDER"] = "mock"
print("Open http://localhost:8000")
subprocess.call([py if os.path.exists(py) else sys.executable, "-m", "uvicorn", "app:app", "--port", "8000"], cwd=here, env=env)
