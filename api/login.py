import json
import os
import sys
from datetime import timedelta

# Add shared directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from models import SessionLocal
from security import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

def handler(request, response):
    if request.method != "POST":
        response.status_code = 405
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps({"detail": "Method not allowed"})
        return

    try:
        # Parse JSON body
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        db = SessionLocal()
        try:
            user = authenticate_user(db, email, password)
            if not user:
                response.status_code = 401
                response.headers["Content-Type"] = "application/json"
                response.body = json.dumps({"detail": "Incorrect email or password"})
                return

            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )

            response.status_code = 200
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "is_admin": user.is_admin
                }
            })
        finally:
            db.close()
    except Exception as e:
        response.status_code = 400
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps({"detail": str(e)})