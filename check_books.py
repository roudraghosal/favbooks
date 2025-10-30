from backend.app.core.database import SessionLocal
from backend.app.models import Book

db = SessionLocal()
count = db.query(Book).count()
print(f'Total books in database: {count}')

if count > 0:
    sample = db.query(Book).first()
    if sample:
        print(f'Sample book: {sample.title} by {sample.author}')
else:
    print('No books found in database!')

db.close()
