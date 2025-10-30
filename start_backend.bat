@echo off
cd /d "c:\Users\Roudra\Music\project\New folder"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
