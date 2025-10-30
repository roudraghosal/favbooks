import json
import os
import sys

# Add shared directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from models import User, SessionLocal
from security import get_password_hash

def handler(request, response):
    if request.method != "POST":
        response.status_code = 405
        response.body = json.dumps({"detail": "Method not allowed"})
        return

    try:
        # Parse JSON body
        data = json.loads(request.body)
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")

        db = SessionLocal()
        try:
            # Check if user exists
            if db.query(User).filter(User.email == email).first():
                response.status_code = 400
                response.headers["Content-Type"] = "application/json"
                response.body = json.dumps({"detail": "Email already registered"})
                return

            if db.query(User).filter(User.username == username).first():
                response.status_code = 400
                response.headers["Content-Type"] = "application/json"
                response.body = json.dumps({"detail": "Username already taken"})
                return

            # Create user
            hashed_password = get_password_hash(password)
            db_user = User(
                email=email,
                username=username,
                hashed_password=hashed_password,
                is_admin=email == "admin@bookapp.com"  # Default admin email
            )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            response.status_code = 200
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username,
                "is_admin": db_user.is_admin
            })
        finally:
            db.close()
    except Exception as e:
        response.status_code = 400
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps({"detail": str(e)})