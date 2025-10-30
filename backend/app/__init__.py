"""
App package initialization
Sets up Python path for module imports
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent.absolute()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
