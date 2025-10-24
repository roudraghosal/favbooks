"""
Script to enrich all books with Google Books cover images and data
"""
import asyncio
from app.core.database import SessionLocal
from app.models import Book
from app.services.external_apis import ExternalBookAPI

async def enrich_all_books():
    """Enrich all books with Google Books data"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).all()
        print(f"Found {len(books)} books to enrich\n")
        
        enriched_count = 0
        
        for book in books:
            print(f"Processing: {book.title} by {book.author}")
            
            try:
                # Search Google Books
                search_query = f"{book.title} {book.author}"
                google_results = await ExternalBookAPI.search_google_books(search_query, max_results=1)
                
                if google_results:
                    google_data = google_results[0]
                    updated = False
                    
                    # Update cover image if better quality available
                    if google_data.get("cover_image_url"):
                        old_cover = book.cover_image_url
                        book.cover_image_url = google_data["cover_image_url"]  # type: ignore[assignment]
                        print(f"  ✅ Updated cover image")
                        print(f"     Old: {old_cover}")
                        print(f"     New: {google_data['cover_image_url']}")
                        updated = True
                    
                    # Update description if missing
                    if book.description is None and google_data.get("description"):  # type: ignore[has-type]
                        book.description = google_data["description"]  # type: ignore[assignment]
                        print(f"  ✅ Added description")
                        updated = True
                    
                    # Update ISBN if missing
                    if book.isbn is None and google_data.get("isbn"):  # type: ignore[has-type]
                        book.isbn = google_data["isbn"]  # type: ignore[assignment]
                        print(f"  ✅ Added ISBN: {google_data['isbn']}")
                        updated = True
                    
                    if updated:
                        enriched_count += 1
                        db.commit()
                        print(f"  💾 Saved changes")
                    else:
                        print(f"  ℹ️  No updates needed")
                else:
                    print(f"  ⚠️  No Google Books data found")
                
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                continue
            
            print()
        
        print(f"\n✅ Enrichment complete!")
        print(f"   Total books: {len(books)}")
        print(f"   Enriched: {enriched_count}")
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Starting book enrichment with Google Books data...\n")
    asyncio.run(enrich_all_books())
