import json
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.core.security import authenticate_user, create_access_token
from app.models import User
from datetime import timedelta
from app.core.config import settings

# Database setup for Vercel Postgres
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/favbooks")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def handler(request, response):
    if request.method != "POST":
        response.status_code = 405
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

            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
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