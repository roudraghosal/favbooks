from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Create engine
DATABASE_URL = "sqlite:///./backend/bookdb.sqlite3"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Update all books with None ratings to 0
db = SessionLocal()
try:
    # Update average_rating
    db.execute(text("UPDATE books SET average_rating = 0.0 WHERE average_rating IS NULL"))
    # Update rating_count
    db.execute(text("UPDATE books SET rating_count = 0 WHERE rating_count IS NULL"))
    db.commit()
    print("✓ Successfully updated all books with NULL ratings to 0")
    
    # Check results
    result = db.execute(text("SELECT COUNT(*) FROM books WHERE average_rating IS NULL OR rating_count IS NULL"))
    null_count = result.scalar()
    print(f"✓ Books with NULL ratings remaining: {null_count}")
    
    total = db.execute(text("SELECT COUNT(*) FROM books"))
    total_count = total.scalar()
    print(f"✓ Total books in database: {total_count}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    db.rollback()
finally:
    db.close()
