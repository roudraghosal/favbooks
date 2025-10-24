"""
Database migration script to create WhichBook+ tables
Run this script to add new mood-based discovery, creator portal, and admin tables
"""
from app.core.database import engine, Base
from app.models import (
    User, Genre, Book, Rating, Wishlist,
    UserAchievement, UserStreak, ReadingChallenge, 
    ChallengeParticipation, Quiz, QuizAttempt, StickerGeneration,
    MoodBook, Creator, CreatorContent, ContentComment, ContentLike,
    Admin, BestsellerList, WorldMapCountry
)

def create_tables():
    """Create all tables in the database"""
    print("Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        print("\nCreated tables:")
        print("- Existing: users, genres, books, ratings, wishlists")
        print("- Achievements: user_achievements, user_streaks, reading_challenges, etc.")
        print("- WhichBook+: mood_books, creators, creator_content, content_comments, content_likes")
        print("- Admin: admins, bestseller_lists, world_map_countries")
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        raise

if __name__ == "__main__":
    create_tables()
