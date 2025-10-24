"""
Populate database with trending books that have cover images
"""
import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Book
from app.services.external_apis import ExternalBookAPI
from app.core.security import get_password_hash

async def add_trending_books():
    """Add trending books with cover images to database"""
    db = SessionLocal()
    try:
        # Check if books already exist
        existing_count = db.query(Book).count()
        if existing_count > 0:
            print(f"✅ Database already has {existing_count} books")
            return
        
        print("📚 Fetching trending books from external APIs...")
        trending_books = await ExternalBookAPI.get_trending_books()
        
        print(f"✅ Found {len(trending_books)} trending books")
        
        added_count = 0
        for book_data in trending_books[:50]:  # Add first 50 trending books
            # Check if book exists by title and author
            existing = db.query(Book).filter(
                Book.title == book_data["title"],
                Book.author == book_data["author"]
            ).first()
            
            if not existing:
                # Extract year from published_date if possible
                pub_year = None
                try:
                    pub_date = book_data.get("published_date", "")
                    if pub_date and len(pub_date) >= 4:
                        pub_year = int(pub_date[:4])
                except:
                    pass
                
                book = Book(
                    title=book_data["title"],
                    author=book_data["author"],
                    description=book_data.get("description", ""),
                    isbn=book_data.get("isbn"),
                    publication_year=pub_year,
                    average_rating=book_data.get("average_rating", 0.0),
                    rating_count=book_data.get("ratings_count", 0),
                    cover_image_url=book_data.get("cover_image_url", "")
                )
                db.add(book)
                added_count += 1
                
                if book_data.get("cover_image_url"):
                    print(f"✅ {book_data['title'][:40]} - HAS COVER")
                else:
                    print(f"❌ {book_data['title'][:40]} - NO COVER")
        
        db.commit()
        print(f"\n✅ Added {added_count} books to database!")
        
        # Verify books have covers
        with_covers = db.query(Book).filter(
            Book.cover_image_url.isnot(None),
            Book.cover_image_url != ""
        ).count()
        print(f"📊 Books with covers: {with_covers}/{added_count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(add_trending_books())
