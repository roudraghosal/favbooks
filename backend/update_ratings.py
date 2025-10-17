"""
Update average ratings for all books based on existing ratings
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func
from app.core.database import SessionLocal
from app.models import Book, Rating


def update_average_ratings():
    """Update average rating and rating count for all books"""
    db = SessionLocal()
    try:
        # Get all books
        books = db.query(Book).all()
        
        for book in books:
            # Calculate average rating
            rating_data = db.query(
                func.avg(Rating.rating).label('avg_rating'),
                func.count(Rating.rating).label('rating_count')
            ).filter(Rating.book_id == book.id).first()
            
            if rating_data and rating_data.rating_count and rating_data.rating_count > 0:  # type: ignore[union-attr]
                book.average_rating = round(float(rating_data.avg_rating), 2)  # type: ignore[assignment, union-attr]
                book.rating_count = rating_data.rating_count  # type: ignore[assignment, union-attr]
                print(f"✅ Updated {book.title}: {book.average_rating} stars ({book.rating_count} ratings)")
            else:
                # Set a default rating for books without ratings so they still show up
                book.average_rating = 3.5  # type: ignore[assignment]  # Default rating to make books visible
                book.rating_count = 0  # type: ignore[assignment]
                print(f"ℹ️ Set default rating for {book.title}: 3.5 stars (no ratings yet)")
        
        db.commit()
        print("✅ All book ratings updated successfully!")
        
        # Show updated books
        books = db.query(Book).all()
        print("\n📚 Books in database:")
        for book in books:
            print(f"  - {book.title} by {book.author}: {book.average_rating}⭐ ({book.rating_count} ratings)")
        
    except Exception as e:
        print(f"❌ Error updating ratings: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    update_average_ratings()