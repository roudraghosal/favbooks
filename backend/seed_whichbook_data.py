"""
Script to populate the database with sample mood books and world map data
"""
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.whichbook import MoodBook, WorldMapCountry, Admin, Creator
from backend.app.core.security import get_password_hash
from datetime import datetime

def add_sample_mood_books(db: Session):
    """Add sample mood books with different moods and countries"""
    
    sample_books = [
        {
            "title": "The Alchemist",
            "author": "Paulo Coelho",
            "description": "A mystical and uplifting tale of following your dreams",
            "mood_vector": [7, 2, 5, 6, 3, 5, 8, 9],  # happy, sad, calm, thrilling, dark, funny, emotional, optimistic
            "country": "Brazil",
            "latitude": -14.2350,
            "longitude": -51.9253,
            "complexity": 6,
            "literary_tone": "philosophical",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg"
        },
        {
            "title": "Norwegian Wood",
            "author": "Haruki Murakami",
            "description": "A melancholic love story set in 1960s Tokyo",
            "mood_vector": [3, 8, 7, 2, 5, 2, 9, 3],
            "country": "Japan",
            "latitude": 36.2048,
            "longitude": 138.2529,
            "complexity": 7,
            "literary_tone": "contemplative",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg"
        },
        {
            "title": "Gone Girl",
            "author": "Gillian Flynn",
            "description": "A dark psychological thriller about a missing wife",
            "mood_vector": [2, 6, 3, 9, 9, 3, 7, 2],
            "country": "United States",
            "latitude": 37.0902,
            "longitude": -95.7129,
            "complexity": 8,
            "literary_tone": "suspenseful",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg"
        },
        {
            "title": "The Hitchhiker's Guide to the Galaxy",
            "author": "Douglas Adams",
            "description": "A hilarious sci-fi comedy about space travel",
            "mood_vector": [8, 1, 4, 7, 2, 10, 4, 8],
            "country": "United Kingdom",
            "latitude": 55.3781,
            "longitude": -3.4360,
            "complexity": 5,
            "literary_tone": "humorous",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg"
        },
        {
            "title": "One Hundred Years of Solitude",
            "author": "Gabriel García Márquez",
            "description": "A magical realist epic spanning generations",
            "mood_vector": [5, 5, 6, 6, 4, 6, 8, 6],
            "country": "Colombia",
            "latitude": 4.5709,
            "longitude": -74.2973,
            "complexity": 9,
            "literary_tone": "magical realism",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg"
        },
        {
            "title": "The God of Small Things",
            "author": "Arundhati Roy",
            "description": "A poignant story of forbidden love in Kerala",
            "mood_vector": [4, 7, 6, 5, 6, 3, 9, 4],
            "country": "India",
            "latitude": 20.5937,
            "longitude": 78.9629,
            "complexity": 8,
            "literary_tone": "lyrical",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780812979657-L.jpg"
        },
        {
            "title": "The Little Prince",
            "author": "Antoine de Saint-Exupéry",
            "description": "A charming philosophical tale for all ages",
            "mood_vector": [7, 4, 8, 3, 2, 6, 7, 8],
            "country": "France",
            "latitude": 46.2276,
            "longitude": 2.2137,
            "complexity": 4,
            "literary_tone": "whimsical",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg"
        },
        {
            "title": "Crime and Punishment",
            "author": "Fyodor Dostoevsky",
            "description": "A dark psychological exploration of guilt and redemption",
            "mood_vector": [2, 9, 4, 7, 9, 1, 9, 3],
            "country": "Russia",
            "latitude": 61.5240,
            "longitude": 105.3188,
            "complexity": 10,
            "literary_tone": "philosophical",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780143058144-L.jpg"
        },
        {
            "title": "Things Fall Apart",
            "author": "Chinua Achebe",
            "description": "A powerful story of colonialism's impact on African society",
            "mood_vector": [4, 7, 5, 6, 6, 3, 8, 4],
            "country": "Nigeria",
            "latitude": 9.0820,
            "longitude": 8.6753,
            "complexity": 7,
            "literary_tone": "tragic",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9780385474542-L.jpg"
        },
        {
            "title": "Before the Coffee Gets Cold",
            "author": "Toshikazu Kawaguchi",
            "description": "A heartwarming tale about time travel and second chances",
            "mood_vector": [6, 5, 8, 4, 3, 5, 9, 7],
            "country": "Japan",
            "latitude": 36.2048,
            "longitude": 138.2529,
            "complexity": 5,
            "literary_tone": "heartwarming",
            "cover_url": "https://covers.openlibrary.org/b/isbn/9781335430997-L.jpg"
        }
    ]
    
    for book_data in sample_books:
        mood_book = MoodBook(**book_data)
        db.add(mood_book)
    
    db.commit()
    print(f"✅ Added {len(sample_books)} sample mood books")


def add_world_map_countries(db: Session):
    """Add popular countries for world map visualization"""
    
    countries = [
        {"country_name": "United States", "country_code": "US", "latitude": 37.0902, "longitude": -95.7129, "flag_emoji": "🇺🇸"},
        {"country_name": "United Kingdom", "country_code": "GB", "latitude": 55.3781, "longitude": -3.4360, "flag_emoji": "🇬🇧"},
        {"country_name": "India", "country_code": "IN", "latitude": 20.5937, "longitude": 78.9629, "flag_emoji": "🇮🇳"},
        {"country_name": "Japan", "country_code": "JP", "latitude": 36.2048, "longitude": 138.2529, "flag_emoji": "🇯🇵"},
        {"country_name": "France", "country_code": "FR", "latitude": 46.2276, "longitude": 2.2137, "flag_emoji": "🇫🇷"},
        {"country_name": "Germany", "country_code": "DE", "latitude": 51.1657, "longitude": 10.4515, "flag_emoji": "🇩🇪"},
        {"country_name": "Brazil", "country_code": "BR", "latitude": -14.2350, "longitude": -51.9253, "flag_emoji": "🇧🇷"},
        {"country_name": "Russia", "country_code": "RU", "latitude": 61.5240, "longitude": 105.3188, "flag_emoji": "🇷🇺"},
        {"country_name": "China", "country_code": "CN", "latitude": 35.8617, "longitude": 104.1954, "flag_emoji": "🇨🇳"},
        {"country_name": "Colombia", "country_code": "CO", "latitude": 4.5709, "longitude": -74.2973, "flag_emoji": "🇨🇴"},
        {"country_name": "Nigeria", "country_code": "NG", "latitude": 9.0820, "longitude": 8.6753, "flag_emoji": "🇳🇬"},
        {"country_name": "Australia", "country_code": "AU", "latitude": -25.2744, "longitude": 133.7751, "flag_emoji": "🇦🇺"},
        {"country_name": "Canada", "country_code": "CA", "latitude": 56.1304, "longitude": -106.3468, "flag_emoji": "🇨🇦"},
        {"country_name": "Mexico", "country_code": "MX", "latitude": 23.6345, "longitude": -102.5528, "flag_emoji": "🇲🇽"},
        {"country_name": "South Africa", "country_code": "ZA", "latitude": -30.5595, "longitude": 22.9375, "flag_emoji": "🇿🇦"},
    ]
    
    for country_data in countries:
        # Check if country already exists
        existing = db.query(WorldMapCountry).filter(
            WorldMapCountry.country_code == country_data["country_code"]
        ).first()
        if not existing:
            country = WorldMapCountry(**country_data)
            db.add(country)
    
    db.commit()
    print(f"✅ Added {len(countries)} countries for world map")


def add_sample_admin(db: Session):
    """Add a sample admin account"""
    
    admin = Admin(
        username="admin",
        email="admin@whichbook.com",
        hashed_password=get_password_hash("admin123"),
        is_super_admin=True
    )
    
    db.add(admin)
    db.commit()
    print("✅ Added sample admin account (admin@whichbook.com / admin123)")


def add_sample_creator(db: Session):
    """Add a sample creator account"""
    
    creator = Creator(
        name="Jane Austen",
        email="jane@example.com",
        username="jane_writes",
        hashed_password=get_password_hash("creator123"),
        bio="Aspiring writer and poetry enthusiast",
        is_verified=True
    )
    
    db.add(creator)
    db.commit()
    print("✅ Added sample creator account (jane@example.com / creator123)")


def main():
    """Run all sample data scripts"""
    print("\n🚀 Populating WhichBook+ database with sample data...\n")
    
    db = SessionLocal()
    
    try:
        add_sample_mood_books(db)
        add_world_map_countries(db)
        add_sample_admin(db)
        add_sample_creator(db)
        
        print("\n✅ Sample data added successfully!")
        print("\n📊 Database Statistics:")
        
        from app.models.whichbook import MoodBook, WorldMapCountry, Admin, Creator
        
        mood_books_count = db.query(MoodBook).count()
        countries_count = db.query(WorldMapCountry).count()
        admins_count = db.query(Admin).count()
        creators_count = db.query(Creator).count()
        
        print(f"  - Mood Books: {mood_books_count}")
        print(f"  - Countries: {countries_count}")
        print(f"  - Admins: {admins_count}")
        print(f"  - Creators: {creators_count}")
        
        print("\n🎉 WhichBook+ is ready to use!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    main()
