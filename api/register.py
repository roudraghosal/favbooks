import json
import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import and_, or_
from sqlalchemy.sql import func
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Inline models for Vercel deployment
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

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

        # Check database configuration
        if not DATABASE_URL or not SessionLocal:
            response.status_code = 500
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({"detail": "Database not configured"})
            return

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