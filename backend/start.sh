#!/bin/bash
# Render startup script
# This script sets up the environment and starts the FastAPI application

# Export the Python path to include the backend directory
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend"

# Navigate to backend directory if not already there
cd /opt/render/project/src/backend || cd backend || true

# Start uvicorn
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
