#!/usr/bin/env python3
"""
Startup script for Render deployment
This ensures the backend directory is in Python's path
"""
if __name__ == "__main__":
    import sys
    import os
    from pathlib import Path
    
    # Add the backend directory to Python path
    backend_dir = Path(__file__).parent.absolute()
    sys.path.insert(0, str(backend_dir))
    
    # Set PYTHONPATH environment variable
    os.environ['PYTHONPATH'] = str(backend_dir)
    
    # Import uvicorn and run
    import uvicorn
    
    # Get port from environment (Render provides this)
    port = int(os.environ.get('PORT', 8000))
    
    # Run the app
    uvicorn.run("main:app", host="0.0.0.0", port=port)

