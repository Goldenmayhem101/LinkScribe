import os


def get_provider(name: str | None = None):
    """Pick the image->3D backend. Add new ones here (e.g. a hosted API)."""
    name = (name or os.environ.get("PROVIDER", "triposr")).lower()
    if name == "mock":
        from .mock import MockProvider
        return MockProvider()
    if name == "triposr":
        from .triposr import TripoSRProvider
        return TripoSRProvider()
    raise ValueError(f"Unknown provider: {name}")
