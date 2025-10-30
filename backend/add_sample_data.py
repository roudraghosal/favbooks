"""
Add sample books and data for testing recommendations
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import Book, Genre, Rating, User
from app.core.security import get_password_hash


def add_sample_books():
    """Add sample books to the database"""
    db = SessionLocal()
    try:
        # Sample books data
        sample_books = [
            {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "description": "A classic American novel about the Jazz Age, love, and the American Dream.",
                "isbn": "9780743273565",
                "publication_year": 1925,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg"
            },
            {
                "title": "To Kill a Mockingbird", 
                "author": "Harper Lee",
                "description": "A gripping tale of racial injustice and childhood innocence in the American South.",
                "isbn": "9780061120084",
                "publication_year": 1960,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg"
            },
            {
                "title": "1984",
                "author": "George Orwell", 
                "description": "A dystopian social science fiction novel about totalitarian control.",
                "isbn": "9780451524935",
                "publication_year": 1949,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg"
            },
            {
                "title": "Pride and Prejudice",
                "author": "Jane Austen",
                "description": "A romantic novel about manners, upbringing, morality, and marriage.",
                "isbn": "9780141439518",
                "publication_year": 1813,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"
            },
            {
                "title": "The Catcher in the Rye",
                "author": "J.D. Salinger",
                "description": "A controversial novel about teenage rebellion and alienation.",
                "isbn": "9780316769174",
                "publication_year": 1951,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg"
            },
            {
                "title": "Harry Potter and the Philosopher's Stone",
                "author": "J.K. Rowling",
                "description": "The first book in the magical Harry Potter series.",
                "isbn": "9780747532699",
                "publication_year": 1997,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg"
            },
            {
                "title": "The Lord of the Rings",
                "author": "J.R.R. Tolkien",
                "description": "An epic high fantasy novel about the quest to destroy the One Ring.",
                "isbn": "9780544003415",
                "publication_year": 1954,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg"
            },
            {
                "title": "The Hitchhiker's Guide to the Galaxy",
                "author": "Douglas Adams",
                "description": "A comedic science fiction series about space travel and the meaning of life.",
                "isbn": "9780345391803",
                "publication_year": 1979,
                "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg"
            }
        ]
        
        # Get genres
        fiction_genre = db.query(Genre).filter(Genre.name == "Fiction").first()
        fantasy_genre = db.query(Genre).filter(Genre.name == "Fantasy").first()
        scifi_genre = db.query(Genre).filter(Genre.name == "Science Fiction").first()
        
        # Add books
        for book_data in sample_books:
            existing_book = db.query(Book).filter(Book.isbn == book_data["isbn"]).first()
            if not existing_book:
                book = Book(**book_data)
                db.add(book)
                db.flush()  # Get the book ID
                
                # Add genre associations
                if fiction_genre:
                    book.genres.append(fiction_genre)
                
                if book_data["title"] in ["Harry Potter and the Philosopher's Stone", "The Lord of the Rings"]:
                    if fantasy_genre:
                        book.genres.append(fantasy_genre)
                elif book_data["title"] == "The Hitchhiker's Guide to the Galaxy":
                    if scifi_genre:
                        book.genres.append(scifi_genre)
        
        db.commit()
        print("✅ Sample books added successfully!")
        
        # Add some sample ratings
        admin_user = db.query(User).filter(User.email == "admin@bookapp.com").first()
        if admin_user:
            books = db.query(Book).all()
            ratings_data = [
                (books[0].id, 5),  # Great Gatsby - 5 stars
                (books[1].id, 4),  # To Kill a Mockingbird - 4 stars  
                (books[2].id, 4),  # 1984 - 4 stars
                (books[5].id, 5),  # Harry Potter - 5 stars
                (books[6].id, 5),  # Lord of the Rings - 5 stars
            ]
            
            for book_id, rating_value in ratings_data:
                existing_rating = db.query(Rating).filter(
                    Rating.user_id == admin_user.id,
                    Rating.book_id == book_id
                ).first()
                
                if not existing_rating:
                    rating = Rating(
                        user_id=admin_user.id,
                        book_id=book_id,
                        rating=rating_value
                    )
                    db.add(rating)
            
            db.commit()
            print("✅ Sample ratings added successfully!")
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_sample_books()
