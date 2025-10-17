"""
Initialize achievement-related database tables
"""
from app.core.database import engine, Base
from app.models import User, Book, Genre, Rating, Wishlist
from app.models.achievements import (
    UserAchievement, UserStreak, ReadingChallenge,
    ChallengeParticipation, Quiz, QuizAttempt, StickerGeneration,
    BadgeType, MilestoneType
)
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


def init_achievement_tables():
    """Create all achievement tables"""
    print("Creating achievement tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Achievement tables created successfully!")


def add_sample_challenges():
    """Add sample reading challenges"""
    print("\nAdding sample challenges...")
    
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Check if challenges already exist
        existing = db.query(ReadingChallenge).first()
        if existing:
            print("⚠️  Challenges already exist, skipping...")
            return
        
        challenges = [
            ReadingChallenge(
                title="Book Explorer Challenge",
                description="Read 10 books to become a Verified Book Explorer",
                challenge_type="books_count",
                target_value=10,
                duration_days=30,
                reward_badge=BadgeType.VERIFIED_EXPLORER,
                is_active=True
            ),
            ReadingChallenge(
                title="30-Day Reading Streak",
                description="Read something every day for 30 days",
                challenge_type="streak_days",
                target_value=30,
                duration_days=30,
                reward_badge=BadgeType.READING_STREAK,
                is_active=True
            ),
            ReadingChallenge(
                title="Genre Explorer",
                description="Read books from 5 different genres",
                challenge_type="genre_variety",
                target_value=5,
                duration_days=60,
                reward_badge=BadgeType.GENRE_MASTER,
                is_active=True
            ),
            ReadingChallenge(
                title="Review Master",
                description="Write 25 book reviews",
                challenge_type="reviews_count",
                target_value=25,
                duration_days=90,
                reward_badge=BadgeType.REVIEW_EXPERT,
                is_active=True
            ),
            ReadingChallenge(
                title="Book Collector",
                description="Read 50 books total",
                challenge_type="books_count",
                target_value=50,
                duration_days=None,  # Open-ended
                reward_badge=BadgeType.BOOK_COLLECTOR,
                is_active=True
            )
        ]
        
        for challenge in challenges:
            db.add(challenge)
        
        db.commit()
        print(f"✅ Added {len(challenges)} sample challenges!")
        
    except Exception as e:
        print(f"❌ Error adding challenges: {e}")
        db.rollback()
    finally:
        db.close()


def add_sample_quizzes():
    """Add sample book quizzes"""
    print("\nAdding sample quizzes...")
    
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Check if quizzes already exist
        existing = db.query(Quiz).first()
        if existing:
            print("⚠️  Quizzes already exist, skipping...")
            return
        
        # Get a sample book
        book = db.query(Book).first()
        
        quizzes = [
            Quiz(
                title="Reading Comprehension Quiz",
                description="Test your understanding of classic literature",
                book_id=book.id if book else None,
                difficulty="medium",
                passing_score=70,
                reward_badge=BadgeType.QUIZ_CHAMPION,
                is_active=True
            ),
            Quiz(
                title="Author Knowledge Quiz",
                description="How well do you know famous authors?",
                book_id=None,
                difficulty="hard",
                passing_score=80,
                reward_badge=BadgeType.QUIZ_CHAMPION,
                is_active=True
            ),
            Quiz(
                title="Genre Trivia",
                description="Test your knowledge across different book genres",
                book_id=None,
                difficulty="easy",
                passing_score=60,
                reward_badge=None,
                is_active=True
            )
        ]
        
        for quiz in quizzes:
            db.add(quiz)
        
        db.commit()
        print(f"✅ Added {len(quizzes)} sample quizzes!")
        
    except Exception as e:
        print(f"❌ Error adding quizzes: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("Achievement System Initialization")
    print("=" * 50)
    
    init_achievement_tables()
    add_sample_challenges()
    add_sample_quizzes()
    
    print("\n" + "=" * 50)
    print("✅ Achievement system initialized successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start your backend server")
    print("2. Login to your account")
    print("3. Rate some books to unlock achievements!")
    print("4. Check /achievements page to see your progress")
    print("5. Generate social media stickers for your badges!")
