#!/usr/bin/env python3
"""
Database initialization script for BookHub
Creates tables and initial admin user
"""

import os
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Base, User
from app.core.database import engine

def init_database():
    """Initialize database with tables and admin user"""
    print("🔧 Initializing database...")
    
    try:
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Check if admin user exists
            admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
            
            if not admin_user:
                print("👤 Creating admin user...")
                
                # Create admin user
                admin_user = User(
                    email=settings.ADMIN_EMAIL,
                    username="admin",
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    is_admin=True
                )
                
                db.add(admin_user)
                db.commit()
                print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
            else:
                print(f"ℹ️  Admin user already exists: {settings.ADMIN_EMAIL}")
            
            # Create a regular test user
            test_user = db.query(User).filter(User.email == "user@bookapp.com").first()
            if not test_user:
                print("👤 Creating test user...")
                test_user = User(
                    email="user@bookapp.com", 
                    username="testuser",
                    hashed_password=get_password_hash("user123"),
                    is_admin=False
                )
                db.add(test_user)
                db.commit()
                print("✅ Test user created: user@bookapp.com")
            else:
                print("ℹ️  Test user already exists: user@bookapp.com")
                
        finally:
            db.close()
            
        print("🎉 Database initialization completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    init_database()