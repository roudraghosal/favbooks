import json
import os
import sys
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy import and_, or_
from sqlalchemy.sql import func
from jose import JWTError, jwt
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings from environment
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

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

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            return None
        return {"email": email}
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

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

        # Check database configuration
        if not DATABASE_URL or not SessionLocal:
            response.status_code = 500
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({"detail": "Database not configured"})
            return

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