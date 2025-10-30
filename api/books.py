import json
import os
import sys
from sqlalchemy import and_, or_

# Add shared directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

try:
    from models import Book, Genre, SessionLocal
    print("Successfully imported shared models")
except Exception as e:
    print(f"Failed to import shared models: {e}")

def handler(request, response):
    try:
        print("Books API handler called")

        # Check if DATABASE_URL is set
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            response.status_code = 500
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({"error": "DATABASE_URL not configured"})
            return

        print(f"DATABASE_URL found: {db_url[:50]}...")

        # Parse query parameters
        q = request.query.get("q")
        genre = request.query.get("genre")
        min_rating = float(request.query.get("min_rating", 0))
        max_rating = float(request.query.get("max_rating", 5))
        sort_by = request.query.get("sort_by", "title")
        sort_order = request.query.get("sort_order", "asc")
        page = int(request.query.get("page", 1))
        size = int(request.query.get("size", 10))

        print(f"Query params: q={q}, genre={genre}, page={page}, size={size}")

        db = SessionLocal()
        try:
            print("Database session created")
            query = db.query(Book)

            # Apply filters (simplified)
            if q:
                query = query.filter(
                    or_(Book.title.ilike(f"%{q}%"), Book.author.ilike(f"%{q}%"))
                )
            if genre:
                query = query.join(Book.genres).filter(Genre.name.ilike(f"%{genre}%"))
            if min_rating > 0:
                query = query.filter(Book.average_rating >= min_rating)
            if max_rating < 5:
                query = query.filter(Book.average_rating <= max_rating)

            # Sorting
            order_field = getattr(Book, sort_by, Book.title)
            if sort_order == "desc":
                order_field = order_field.desc()
            query = query.order_by(order_field)

            # Pagination
            total = query.count()
            offset = (page - 1) * size
            books = query.offset(offset).limit(size).all()

            print(f"Found {total} books, returning {len(books)} books")

            # Convert to dict
            books_data = []
            for book in books:
                books_data.append({
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "description": book.description,
                    "average_rating": book.average_rating or 0.0,
                    "rating_count": book.rating_count or 0,
                    "cover_image_url": book.cover_image_url,
                    "genres": [{"id": g.id, "name": g.name} for g in book.genres]
                })

            response.status_code = 200
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({
                "items": books_data,
                "total": total,
                "page": page,
                "size": size,
                "pages": (total + size - 1) // size
            })
            print("Response sent successfully")
        except Exception as db_error:
            print(f"Database error: {db_error}")
            response.status_code = 500
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({"error": f"Database error: {str(db_error)}"})
        finally:
            db.close()
            print("Database session closed")
    except Exception as e:
        print(f"General error: {e}")
        response.status_code = 500
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps({"error": f"Server error: {str(e)}"})