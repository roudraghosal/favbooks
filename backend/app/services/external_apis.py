"""
External API Integration Service
Fetches book data from Google Books API and Open Library API
"""

import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import hashlib
import json

logger = logging.getLogger(__name__)

class ExternalBookAPI:
    """Service to fetch book data from external APIs"""
    
    GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    OPEN_LIBRARY_BASE_URL = "https://openlibrary.org"
    OPEN_LIBRARY_COVERS = "https://covers.openlibrary.org/b"
    
    # Cache configuration
    cache = {}
    cache_duration = timedelta(hours=24)
    
    @classmethod
    def _get_cache_key(cls, source: str, query: str) -> str:
        """Generate cache key"""
        return hashlib.md5(f"{source}:{query}".encode()).hexdigest()
    
    @classmethod
    def _get_from_cache(cls, key: str) -> Optional[Dict]:
        """Get data from cache if not expired"""
        if key in cls.cache:
            data, timestamp = cls.cache[key]
            if datetime.now() - timestamp < cls.cache_duration:
                return data
            else:
                del cls.cache[key]
        return None
    
    @classmethod
    def _set_cache(cls, key: str, data: Dict):
        """Store data in cache"""
        cls.cache[key] = (data, datetime.now())
    
    @classmethod
    async def search_google_books(cls, query: str, max_results: int = 40) -> List[Dict]:
        """
        Search books using Google Books API
        
        Args:
            query: Search query (title, author, ISBN, etc.)
            max_results: Maximum number of results to return
            
        Returns:
            List of book dictionaries
        """
        cache_key = cls._get_cache_key("google", query)
        cached_data = cls._get_from_cache(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached Google Books results for: {query}")
            return cached_data
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "q": query,
                    "maxResults": max_results,
                    "printType": "books",
                    "orderBy": "relevance"
                }
                
                response = await client.get(cls.GOOGLE_BOOKS_BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                books = []
                for item in data.get("items", []):
                    volume_info = item.get("volumeInfo", {})
                    
                    book = {
                        "external_id": item.get("id"),
                        "source": "google_books",
                        "title": volume_info.get("title", "Unknown Title"),
                        "authors": volume_info.get("authors", []),
                        "author": ", ".join(volume_info.get("authors", ["Unknown Author"])),
                        "description": volume_info.get("description", ""),
                        "publisher": volume_info.get("publisher", ""),
                        "published_date": volume_info.get("publishedDate", ""),
                        "isbn": next((id["identifier"] for id in volume_info.get("industryIdentifiers", []) 
                                     if id["type"] in ["ISBN_13", "ISBN_10"]), None),
                        "page_count": volume_info.get("pageCount", 0),
                        "categories": volume_info.get("categories", []),
                        "genres": volume_info.get("categories", []),
                        "average_rating": volume_info.get("averageRating", 0.0),
                        "ratings_count": volume_info.get("ratingsCount", 0),
                        "language": volume_info.get("language", "en"),
                        "preview_link": volume_info.get("previewLink", ""),
                        "info_link": volume_info.get("infoLink", ""),
                        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail", 
                                          volume_info.get("imageLinks", {}).get("smallThumbnail", "")),
                        "thumbnail": volume_info.get("imageLinks", {}).get("thumbnail", ""),
                    }
                    books.append(book)
                
                cls._set_cache(cache_key, books)
                logger.info(f"Fetched {len(books)} books from Google Books API")
                return books
                
        except Exception as e:
            logger.error(f"Error fetching from Google Books API: {str(e)}")
            return []
    
    @classmethod
    async def search_open_library(cls, query: str, limit: int = 40) -> List[Dict]:
        """
        Search books using Open Library API
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of book dictionaries
        """
        cache_key = cls._get_cache_key("openlibrary", query)
        cached_data = cls._get_from_cache(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached Open Library results for: {query}")
            return cached_data
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "q": query,
                    "limit": limit,
                    "fields": "key,title,author_name,first_publish_year,isbn,subject,cover_i,ratings_average,ratings_count,number_of_pages_median,language,publisher"
                }
                
                response = await client.get(f"{cls.OPEN_LIBRARY_BASE_URL}/search.json", params=params)
                response.raise_for_status()
                data = response.json()
                
                books = []
                for doc in data.get("docs", []):
                    cover_id = doc.get("cover_i")
                    cover_url = f"{cls.OPEN_LIBRARY_COVERS}/id/{cover_id}-L.jpg" if cover_id else ""
                    
                    book = {
                        "external_id": doc.get("key", "").replace("/works/", ""),
                        "source": "open_library",
                        "title": doc.get("title", "Unknown Title"),
                        "authors": doc.get("author_name", []),
                        "author": ", ".join(doc.get("author_name", ["Unknown Author"])),
                        "description": "",  # Open Library search doesn't include descriptions
                        "publisher": ", ".join(doc.get("publisher", [])[:3]) if doc.get("publisher") else "",
                        "published_date": str(doc.get("first_publish_year", "")),
                        "isbn": doc.get("isbn", [None])[0] if doc.get("isbn") else None,
                        "page_count": doc.get("number_of_pages_median", 0),
                        "categories": doc.get("subject", [])[:5],
                        "genres": doc.get("subject", [])[:5],
                        "average_rating": doc.get("ratings_average", 0.0),
                        "ratings_count": doc.get("ratings_count", 0),
                        "language": doc.get("language", ["en"])[0] if doc.get("language") else "en",
                        "cover_image_url": cover_url,
                        "thumbnail": cover_url,
                    }
                    books.append(book)
                
                cls._set_cache(cache_key, books)
                logger.info(f"Fetched {len(books)} books from Open Library API")
                return books
                
        except Exception as e:
            logger.error(f"Error fetching from Open Library API: {str(e)}")
            return []
    
    @classmethod
    async def get_book_by_isbn(cls, isbn: str) -> Optional[Dict]:
        """Get book details by ISBN from both APIs"""
        # Try Google Books first
        google_books = await cls.search_google_books(f"isbn:{isbn}", max_results=1)
        if google_books:
            return google_books[0]
        
        # Try Open Library
        open_books = await cls.search_open_library(f"isbn:{isbn}", limit=1)
        if open_books:
            return open_books[0]
        
        return None
    
    @classmethod
    async def get_trending_books(cls) -> List[Dict]:
        """Get trending/popular books from external APIs"""
        queries = [
            "bestseller 2024",
            "popular fiction",
            "award winning books"
        ]
        
        all_books = []
        for query in queries:
            books = await cls.search_google_books(query, max_results=15)
            all_books.extend(books)
        
        # Remove duplicates based on title
        seen_titles = set()
        unique_books = []
        for book in all_books:
            if book["title"] not in seen_titles:
                seen_titles.add(book["title"])
                unique_books.append(book)
        
        return unique_books[:40]
    
    @classmethod
    async def get_books_by_genre(cls, genre: str, limit: int = 20) -> List[Dict]:
        """Get books by specific genre"""
        google_books = await cls.search_google_books(f"subject:{genre}", max_results=limit)
        return google_books
    
    @classmethod
    async def get_books_by_author(cls, author: str, limit: int = 20) -> List[Dict]:
        """Get books by specific author"""
        google_books = await cls.search_google_books(f"inauthor:{author}", max_results=limit)
        return google_books
    
    @classmethod
    async def enrich_book_data(cls, book_title: str, author: str = "") -> Optional[Dict]:
        """
        Enrich existing book data with external API information
        
        Args:
            book_title: Title of the book
            author: Author name (optional)
            
        Returns:
            Enriched book data dictionary
        """
        query = f"{book_title} {author}".strip()
        
        # Try Google Books first (usually better data)
        google_books = await cls.search_google_books(query, max_results=1)
        if google_books:
            return google_books[0]
        
        # Fallback to Open Library
        open_books = await cls.search_open_library(query, limit=1)
        if open_books:
            return open_books[0]
        
        return None


class BookDataEnricher:
    """Service to enrich local database with external API data"""
    
    @staticmethod
    async def enrich_book(book_data: Dict) -> Dict:
        """Enrich a single book with external API data"""
        try:
            external_data = await ExternalBookAPI.enrich_book_data(
                book_data.get("title", ""),
                book_data.get("author", "")
            )
            
            if external_data:
                # Merge external data with local data
                enriched = book_data.copy()
                
                # Update fields if they're empty or better in external data
                if not enriched.get("description"):
                    enriched["description"] = external_data.get("description", "")
                
                if not enriched.get("cover_image_url"):
                    enriched["cover_image_url"] = external_data.get("cover_image_url", "")
                
                if not enriched.get("genres"):
                    enriched["genres"] = external_data.get("genres", [])
                
                if not enriched.get("isbn"):
                    enriched["isbn"] = external_data.get("isbn")
                
                enriched["publisher"] = external_data.get("publisher", "")
                enriched["published_date"] = external_data.get("published_date", "")
                enriched["page_count"] = external_data.get("page_count", 0)
                
                return enriched
            
            return book_data
            
        except Exception as e:
            logger.error(f"Error enriching book data: {str(e)}")
            return book_data
    
    @staticmethod
    async def enrich_books_batch(books: List[Dict]) -> List[Dict]:
        """Enrich multiple books with external API data"""
        enriched_books = []
        for book in books:
            enriched = await BookDataEnricher.enrich_book(book)
            enriched_books.append(enriched)
        return enriched_books
