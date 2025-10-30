"""
Simple script to add sample books
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create engine directly
DATABASE_URL = "sqlite:///./bookdb.sqlite3"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

# Add books directly using SQL
sample_books = [
    ("The Great Gatsby", "F. Scott Fitzgerald", "A classic American novel about the Jazz Age, love, and the American Dream.", "9780743273565", 1925, "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg"),
    ("To Kill a Mockingbird", "Harper Lee", "A gripping tale of racial injustice and childhood innocence in the American South.", "9780061120084", 1960, "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg"),
    ("1984", "George Orwell", "A dystopian social science fiction novel about totalitarian control.", "9780451524935", 1949, "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg"),
    ("Pride and Prejudice", "Jane Austen", "A romantic novel about manners, upbringing, morality, and marriage.", "9780141439518", 1813, "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"),
    ("The Catcher in the Rye", "J.D. Salinger", "A controversial novel about teenage rebellion and alienation.", "9780316769174", 1951, "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg"),
    ("Harry Potter and the Philosopher's Stone", "J.K. Rowling", "The first book in the magical Harry Potter series.", "9780747532699", 1997, "https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg"),
    ("The Lord of the Rings", "J.R.R. Tolkien", "An epic high fantasy novel about the quest to destroy the One Ring.", "9780544003415", 1954, "https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg"),
    ("The Hitchhiker's Guide to the Galaxy", "Douglas Adams", "A comedic science fiction series about space travel and the meaning of life.", "9780345391803", 1979, "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg"),
    ("Dune", "Frank Herbert", "A science fiction masterpiece about politics, religion, and ecology on a desert planet.", "9780441172719", 1965, "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg"),
    ("The Hobbit", "J.R.R. Tolkien", "A fantasy adventure about Bilbo Baggins and his unexpected journey.", "9780547928227", 1937, "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg"),
    ("Brave New World", "Aldous Huxley", "A dystopian novel about a technologically advanced future society.", "9780060850524", 1932, "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg"),
    ("The Hunger Games", "Suzanne Collins", "A dystopian thriller about a televised fight to the death.", "9780439023481", 2008, "https://covers.openlibrary.org/b/isbn/9780439023481-L.jpg"),
    ("The Da Vinci Code", "Dan Brown", "A mystery thriller about a conspiracy in the Catholic Church.", "9780307474278", 2003, "https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg"),
    ("The Alchemist", "Paulo Coelho", "A philosophical novel about following your dreams.", "9780061122415", 1988, "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg"),
    ("The Chronicles of Narnia", "C.S. Lewis", "A fantasy series about children who discover a magical world.", "9780066238500", 1950, "https://covers.openlibrary.org/b/isbn/9780066238500-L.jpg"),
]

from sqlalchemy import text

for book_data in sample_books:
    try:
        db.execute(
            text("""
                INSERT INTO books (title, author, description, isbn, publication_year, cover_image_url)
                VALUES (:title, :author, :desc, :isbn, :year, :cover)
            """),
            {
                "title": book_data[0],
                "author": book_data[1],
                "desc": book_data[2],
                "isbn": book_data[3],
                "year": book_data[4],
                "cover": book_data[5]
            }
        )
        print(f"✅ Added: {book_data[0]}")
    except Exception as e:
        print(f"❌ Error adding {book_data[0]}: {e}")

db.commit()
db.close()

print("\n✅ Books added successfully!")
print(f"Total books added: {len(sample_books)}")
