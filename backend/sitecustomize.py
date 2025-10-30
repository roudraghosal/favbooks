import sys
import os

# This file is automatically imported by Python if present in the PYTHONPATH.
# It ensures that the backend root is always in sys.path for import resolution.
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
import sys
import os
from pathlib import Path

# Get the backend directory path
backend_dir = os.environ.get('RENDER_BACKEND_PATH', '/opt/render/project/src/backend')

# If running on Render (check for typical Render paths)
if '/opt/render/project' in sys.prefix or os.path.exists('/opt/render/project/src/backend'):
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
        print(f"Added {backend_dir} to Python path")
else:
    # Local development - find backend directory relative to this file
    current_file = Path(__file__).resolve()
    if 'backend' in current_file.parts:
        backend_idx = current_file.parts.index('backend')
        backend_dir = Path(*current_file.parts[:backend_idx+1])
        if str(backend_dir) not in sys.path:
            sys.path.insert(0, str(backend_dir))
            print(f"Added {backend_dir} to Python path (local)")
