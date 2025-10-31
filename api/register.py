import json
import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import and_, or_
from sqlalchemy.sql import func
from passlib.context import CryptContext

# Ensure psycopg2cffi is used for PostgreSQL connections
try:
    import psycopg2cffi as psycopg2
    psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
    psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)
except ImportError:
    pass

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
    # Ensure we use psycopg2cffi for PostgreSQL connections
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2cffi://")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def handler(event, context):
    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"detail": "Method not allowed"})
        }

    try:
        # Parse JSON body
        body = event.get("body", "{}")
        if event.get("isBase64Encoded"):
            import base64
            body = base64.b64decode(body).decode("utf-8")
        data = json.loads(body)
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")

        # Check database configuration
        if not DATABASE_URL or not SessionLocal:
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"detail": "Database not configured"})
            }

        db = SessionLocal()
        try:
            # Check if user exists
            if db.query(User).filter(User.email == email).first():
                return {
                    "statusCode": 400,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({"detail": "Email already registered"})
                }

            if db.query(User).filter(User.username == username).first():
                return {
                    "statusCode": 400,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({"detail": "Username already taken"})
                }

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

            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "id": db_user.id,
                    "email": db_user.email,
                    "username": db_user.username,
                    "is_admin": db_user.is_admin
                })
            }
        finally:
            db.close()
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"detail": str(e)})
        }