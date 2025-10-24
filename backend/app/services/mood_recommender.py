"""
Mood-based book recommendation engine using cosine similarity
"""
import numpy as np
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.whichbook import MoodBook


class MoodRecommender:
    """
    Recommends books based on mood vector similarity
    Uses cosine similarity to match user's mood preferences with books
    """
    
    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        Returns value between 0 and 1 (higher = more similar)
        """
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        magnitude1 = np.linalg.norm(vec1_np)
        magnitude2 = np.linalg.norm(vec2_np)
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return float(dot_product / (magnitude1 * magnitude2))
    
    @staticmethod
    def recommend_by_mood(
        db: Session,
        user_mood_vector: List[float],
        limit: int = 10,
        country_filter: str = "",
        complexity_min: int = 1,
        complexity_max: int = 10
    ) -> List[Tuple[MoodBook, float]]:
        """
        Recommend books based on mood vector similarity
        
        Args:
            db: Database session
            user_mood_vector: User's mood preferences [happy, sad, calm, thrilling, dark, funny, emotional, optimistic]
            limit: Maximum number of recommendations
            country_filter: Optional country filter for world map integration
            complexity_min: Minimum complexity level (1-10)
            complexity_max: Maximum complexity level (1-10)
        
        Returns:
            List of (book, similarity_score) tuples
        """
        # Build query
        query = db.query(MoodBook)
        
        # Apply filters
        if country_filter:
            query = query.filter(MoodBook.country == country_filter)
        if complexity_min and complexity_min > 1:
            query = query.filter(MoodBook.complexity >= complexity_min)
        if complexity_max and complexity_max < 10:
            query = query.filter(MoodBook.complexity <= complexity_max)
        
        # Get all books
        all_books = query.all()
        
        # Calculate similarity for each book
        scored_books = []
        for book in all_books:
            similarity = MoodRecommender.cosine_similarity(
                user_mood_vector,
                list(book.mood_vector)  # type: ignore[arg-type]
            )
            scored_books.append((book, similarity))
        
        # Sort by similarity (descending) and return top N
        scored_books.sort(key=lambda x: x[1], reverse=True)
        return scored_books[:limit]
    
    @staticmethod
    def auto_tag_mood_from_description(description: str) -> List[float]:
        """
        Auto-tag mood vector from book description using keyword matching
        This is a simple implementation - can be enhanced with AI/ML
        
        Returns: [happy, sad, calm, thrilling, dark, funny, emotional, optimistic]
        """
        description_lower = description.lower()
        
        # Keyword mapping for each mood dimension
        mood_keywords = {
            'happy': ['joy', 'happy', 'cheerful', 'delight', 'smile', 'laughter', 'celebration'],
            'sad': ['sad', 'tragic', 'sorrow', 'grief', 'loss', 'melancholy', 'tears'],
            'calm': ['calm', 'peaceful', 'serene', 'tranquil', 'quiet', 'gentle', 'soothing'],
            'thrilling': ['thriller', 'suspense', 'action', 'adventure', 'exciting', 'intense', 'fast-paced'],
            'dark': ['dark', 'grim', 'horror', 'sinister', 'disturbing', 'macabre', 'ominous'],
            'funny': ['funny', 'humor', 'comedy', 'hilarious', 'wit', 'amusing', 'entertaining'],
            'emotional': ['emotional', 'heartfelt', 'moving', 'touching', 'poignant', 'deep'],
            'optimistic': ['hope', 'optimistic', 'uplifting', 'inspiring', 'positive', 'bright']
        }
        
        mood_vector = []
        for mood_name in ['happy', 'sad', 'calm', 'thrilling', 'dark', 'funny', 'emotional', 'optimistic']:
            keywords = mood_keywords[mood_name]
            score = sum(1 for keyword in keywords if keyword in description_lower)
            # Normalize to 0-10 scale (cap at 10)
            normalized_score = min(score * 2, 10)
            mood_vector.append(float(normalized_score))
        
        return mood_vector
    
    @staticmethod
    def get_country_books_stats(db: Session) -> dict:
        """Get statistics about books by country"""
        from sqlalchemy import func
        
        stats = db.query(
            MoodBook.country,
            func.count(MoodBook.id).label('count')
        ).filter(
            MoodBook.country.isnot(None)
        ).group_by(
            MoodBook.country
        ).all()
        
        return {country: count for country, count in stats}
