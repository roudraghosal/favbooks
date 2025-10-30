"""
Database initialization script
Creates all tables and initial data
"""
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, SessionLocal
from app.models import Base, User, Genre
from app.core.security import get_password_hash
from app.core.config import settings


def create_tables():
    """Create all database tables"""
    # Import all models to register them with Base.metadata
    # This is critical - models must be imported before create_all()
    from app.models import (
        User, Genre, Book, Rating, Wishlist,
        UserAchievement, UserStreak, ReadingChallenge, 
        ChallengeParticipation, Quiz, QuizAttempt, StickerGeneration,
        MoodBook, Creator, CreatorContent, ContentComment, ContentLike,
        Admin, BestsellerList, WorldMapCountry
    )
    
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")


def create_admin_user():
    """Create admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        
        if not admin_user:
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
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


def create_sample_genres():
    """Create sample genres"""
    db = SessionLocal()
    try:
        sample_genres = [
            {"name": "Fiction", "description": "Literary fiction and novels"},
            {"name": "Mystery", "description": "Mystery and detective stories"},
            {"name": "Romance", "description": "Romance novels"},
            {"name": "Science Fiction", "description": "Science fiction and futuristic stories"},
            {"name": "Fantasy", "description": "Fantasy and magical stories"},
            {"name": "Thriller", "description": "Thriller and suspense novels"},
            {"name": "Biography", "description": "Biographies and autobiographies"},
            {"name": "History", "description": "Historical books and accounts"},
            {"name": "Self-help", "description": "Self-improvement and personal development"},
            {"name": "Business", "description": "Business and entrepreneurship books"},
        ]
        
        for genre_data in sample_genres:
            existing = db.query(Genre).filter(Genre.name == genre_data["name"]).first()
            if not existing:
                genre = Genre(**genre_data)
                db.add(genre)
        
        db.commit()
        print("✅ Sample genres created")
        
    except Exception as e:
        print(f"❌ Error creating genres: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    print("🔧 Initializing database...")
    
    # Create tables
    create_tables()
    
    # Create admin user
    create_admin_user()
    
    # Create sample genres
    create_sample_genres()
    
    print("✅ Database initialization complete!")


if __name__ == "__main__":
    main()
