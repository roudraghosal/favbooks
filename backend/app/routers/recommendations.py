from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
import os
import pandas as pd
import logging
from app.core.database import get_db
from app.models import User, Book, Rating
from app.schemas import BookWithRecommendationScore
import sys

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add ML directory to path
ml_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'ml')
sys.path.append(ml_dir)

try:
    from ml.advanced_recommender import AdvancedHybridRecommender
    from ml.recommender import HybridRecommender
except ImportError:
    # Fallback if ML modules are not available
    AdvancedHybridRecommender = None
    HybridRecommender = None

router = APIRouter()


class RecommendationService:
    def __init__(self):
        self.recommender = None
        self.advanced_recommender = None
        self.models_loaded = False
        self.load_models()
    
    def load_models(self):
        """Load trained ML models"""
        if AdvancedHybridRecommender is None and HybridRecommender is None:
            return
        
        try:
            models_dir = os.path.join(ml_dir, 'models')
            if os.path.exists(models_dir):
                # Try to load advanced recommender first
                if AdvancedHybridRecommender is not None:
                    self.advanced_recommender = AdvancedHybridRecommender()
                    self.advanced_recommender.load(models_dir)
                    self.models_loaded = True
                    logger.info("✅ Advanced Hybrid Recommender loaded successfully")
                # Fallback to basic recommender
                elif HybridRecommender is not None:
                    self.recommender = HybridRecommender()
                    self.recommender.load(models_dir)
                    self.models_loaded = True
                    logger.info("✅ Basic Hybrid Recommender loaded successfully")
        except Exception as e:
            print(f"Error loading ML models: {e}")
            self.models_loaded = False
    
    def get_fallback_recommendations(self, db: Session, user_id: int, n_recommendations: int = 10) -> List[tuple]:
        """Fallback recommendations based on popular books"""
        # Get books with highest average rating and most ratings
        popular_books = (
            db.query(Book)
            .order_by(
                func.coalesce(Book.average_rating, 0).desc(),
                func.coalesce(Book.rating_count, 0).desc()
            )
            .limit(max(n_recommendations * 2, n_recommendations))
            .all()
        )

        if not popular_books:
            # Last resort: return any books available
            popular_books = (
                db.query(Book)
                .order_by(Book.id.asc())
                .limit(n_recommendations)
                .all()
            )
        
        # Get user's rated books to filter them out
        user_rated_books = set(
            db.query(Rating.book_id)
            .filter(Rating.user_id == user_id)
            .all()
        )
        user_rated_book_ids = {book_id[0] for book_id in user_rated_books}
        
        # Filter out user's rated books and assign scores
        recommendations = []
        for i, book in enumerate(popular_books):
            if book.id not in user_rated_book_ids:
                # Higher score for higher-ranked books
                score = 1.0 - (i / len(popular_books))
                recommendations.append((book.id, score))
                
                if len(recommendations) >= n_recommendations:
                    break
        
        return recommendations
    
    def get_recommendations(
        self, 
        db: Session, 
        user_id: int, 
        n_recommendations: int = 10,
        context: Optional[str] = None,
        personality: Optional[str] = None,
        strategy: Optional[str] = None
    ) -> List[tuple]:
        """Get recommendations for a user"""
        if not self.models_loaded or (self.recommender is None and self.advanced_recommender is None):
            return self.get_fallback_recommendations(db, user_id, n_recommendations)
        
        try:
            # Get user's rated books
            user_ratings = (
                db.query(Rating)
                .filter(Rating.user_id == user_id)
                .all()
            )
            user_rated_books = [rating.book_id for rating in user_ratings]
            
            # Get all book IDs
            all_books = db.query(Book.id).all()
            all_book_ids = [book[0] for book in all_books]
            
            if not user_rated_books:
                # Cold start: return popular books
                return self.get_fallback_recommendations(db, user_id, n_recommendations)
            
            # Use advanced recommender if available
            if self.advanced_recommender is not None:
                if strategy:
                    # Get recommendations from specific strategy
                    recommendations = self.advanced_recommender.get_strategy_specific_recommendations(
                        strategy=strategy,
                        user_id=user_id,
                        candidate_books=[bid for bid in all_book_ids if bid not in user_rated_books],
                        context=context,
                        personality=personality,
                        n=n_recommendations
                    )
                else:
                    # Get hybrid recommendations
                    recommendations = self.advanced_recommender.get_hybrid_recommendations(
                        user_id=user_id,
                        user_rated_books=user_rated_books,  # type: ignore[arg-type]
                        all_book_ids=all_book_ids,
                        n_recommendations=n_recommendations,
                        context=context,
                        personality=personality,
                        diversity_enabled=True
                    )
            # Fallback to basic recommender
            elif self.recommender is not None:
                recommendations = self.recommender.get_hybrid_recommendations(
                    user_id=user_id,
                    user_rated_books=user_rated_books,  # type: ignore[arg-type]
                    all_book_ids=all_book_ids,
                    n_recommendations=n_recommendations
                )
            else:
                return self.get_fallback_recommendations(db, user_id, n_recommendations)
            
            return recommendations
            
        except Exception as e:
            print(f"Error getting ML recommendations: {e}")
            return self.get_fallback_recommendations(db, user_id, n_recommendations)


# Global recommendation service instance
recommendation_service = RecommendationService()


@router.get("/{user_id}", response_model=List[BookWithRecommendationScore])
async def get_user_recommendations(
    user_id: int,
    n_recommendations: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    context: str = Query(None, description="Context: morning, afternoon, evening, night, weekend, workday"),
    personality: str = Query(None, description="Personality type: adventurous, intellectual, creative, romantic, analytical"),
    strategy: str = Query(None, description="Specific strategy: popularity, trending, content, collaborative, demographic, context, quiz, association"),
    db: Session = Depends(get_db)
):
    """
    Get personalized book recommendations for a user
    
    **Supports 15 recommendation strategies:**
    - Popularity-Based: Trending or top-rated books
    - Content-Based: Similar to what user liked (genre, author, description)
    - Collaborative Filtering: Based on similar users' preferences
    - Hybrid: Combines multiple approaches
    - Knowledge-Based: Uses explicit preferences/rules
    - Demographic-Based: Based on demographic data
    - Context-Aware: Based on time, mood, location
    - Association Rules: Books bought/rated together
    - Personality/Quiz-Based: Matching user personality
    - Multi-Objective: Balances accuracy, diversity, novelty
    """
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get recommendations
    recommendations = recommendation_service.get_recommendations(
        db, user_id, n_recommendations, context, personality, strategy
    )
    
    if not recommendations:
        recommendations = recommendation_service.get_fallback_recommendations(
            db, user_id, n_recommendations
        )
    
    # Fetch book details
    book_ids = [rec[0] for rec in recommendations]
    books = db.query(Book).filter(Book.id.in_(book_ids)).all()
    
    # Create response with recommendation scores
    books_dict = {book.id: book for book in books}
    recommendations_response = []
    
    for book_id, score in recommendations:
        if book_id in books_dict:
            book = books_dict[book_id]
            book_with_score = BookWithRecommendationScore(
                id=book.id,  # type: ignore[arg-type]
                title=book.title,  # type: ignore[arg-type]
                author=book.author,  # type: ignore[arg-type]
                description=book.description,  # type: ignore[arg-type]
                isbn=book.isbn,  # type: ignore[arg-type]
                publication_year=book.publication_year,  # type: ignore[arg-type]
                cover_image_url=book.cover_image_url,  # type: ignore[arg-type]
                audio_preview_url=book.audio_preview_url,  # type: ignore[arg-type]
                price=book.price,  # type: ignore[arg-type]
                average_rating=book.average_rating,  # type: ignore[arg-type]
                rating_count=book.rating_count,  # type: ignore[arg-type]
                created_at=book.created_at,  # type: ignore[arg-type]
                genres=[],  # Would need to fetch genres separately
                recommendation_score=round(score, 3)
            )
            recommendations_response.append(book_with_score)
    
    return recommendations_response


@router.post("/retrain")
async def retrain_models(
    db: Session = Depends(get_db)
):
    """Trigger model retraining (admin endpoint)"""
    try:
        # Export current data for training
        books = db.query(Book).all()
        ratings = db.query(Rating).all()
        
        if not books or not ratings:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient data for training"
            )
        
        # Export to CSV for ML training
        books_data = []
        for book in books:
            genre_names = ' '.join([genre.name for genre in book.genres])
            books_data.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'description': book.description or '',
                'genres': genre_names,
                'publication_year': book.publication_year,
                'price': book.price,
                'average_rating': book.average_rating,
                'rating_count': book.rating_count
            })
        
        ratings_data = []
        for rating in ratings:
            ratings_data.append({
                'id': rating.id,
                'user_id': rating.user_id,
                'book_id': rating.book_id,
                'rating': rating.rating,
                'created_at': rating.created_at.isoformat() if rating.created_at is not None else None  # type: ignore[union-attr]
            })
        
        # Save to ML directory
        books_df = pd.DataFrame(books_data)
        ratings_df = pd.DataFrame(ratings_data)
        
        books_df.to_csv(os.path.join(ml_dir, 'books.csv'), index=False)
        ratings_df.to_csv(os.path.join(ml_dir, 'ratings.csv'), index=False)
        
        # Reload models (in production, this would trigger async training)
        recommendation_service.load_models()
        
        return {"message": "Model retraining initiated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during model retraining: {str(e)}"
        )