#!/usr/bin/env python3
"""
Database initialization script for Vercel Postgres
Run this locally or in Vercel environment to create tables
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import Base

def init_database():
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL environment variable not set")
        return

    print(f"Initializing database: {database_url[:50]}...")

    # Create engine
    engine = create_engine(database_url)

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

    return True

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)