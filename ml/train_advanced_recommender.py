"""
Training script for Advanced Hybrid Recommendation System
Run this to train all 15 recommendation models
"""

import os
import sys
import pandas as pd
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from advanced_recommender import AdvancedHybridRecommender

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_data():
    """Load books and ratings data"""
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    
    books_path = os.path.join(ml_dir, 'books.csv')
    ratings_path = os.path.join(ml_dir, 'ratings.csv')
    
    if not os.path.exists(books_path) or not os.path.exists(ratings_path):
        logger.error("Data files not found! Please export data first.")
        logger.info("You can export data by calling the /recommend/retrain API endpoint")
        return None, None
    
    books_df = pd.read_csv(books_path)
    ratings_df = pd.read_csv(ratings_path)
    
    logger.info(f"Loaded {len(books_df)} books and {len(ratings_df)} ratings")
    
    return books_df, ratings_df


def train_models(books_df, ratings_df):
    """Train all recommendation models"""
    logger.info("=" * 80)
    logger.info("Starting Advanced Hybrid Recommender Training")
    logger.info("=" * 80)
    
    # Initialize recommender
    recommender = AdvancedHybridRecommender()
    
    # Train all models
    recommender.fit(books_df, ratings_df)
    
    # Save models
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    recommender.save(models_dir)
    
    logger.info("=" * 80)
    logger.info("✅ Training Complete!")
    logger.info(f"Models saved to: {models_dir}")
    logger.info("=" * 80)
    
    return recommender


def test_recommendations(recommender, books_df, ratings_df):
    """Test the trained recommender"""
    logger.info("\n" + "=" * 80)
    logger.info("Testing Recommendations")
    logger.info("=" * 80)
    
    # Get a sample user
    if len(ratings_df) > 0:
        sample_user_id = ratings_df.iloc[0]['user_id']
        user_rated_books = ratings_df[ratings_df['user_id'] == sample_user_id]['book_id'].tolist()
        all_book_ids = books_df['id'].tolist()
        
        logger.info(f"\nTesting recommendations for User {sample_user_id}")
        logger.info(f"User has rated {len(user_rated_books)} books")
        
        # Test different strategies
        strategies = [
            ('Hybrid (All Combined)', None),
            ('Popularity-Based', 'popularity'),
            ('Trending', 'trending'),
            ('Content-Based', 'content'),
            ('Collaborative Filtering', 'collaborative'),
            ('Context-Aware (Evening)', 'context'),
            ('Quiz-Based (Adventurous)', 'quiz')
        ]
        
        for strategy_name, strategy_key in strategies:
            logger.info(f"\n📚 {strategy_name}:")
            
            if strategy_key:
                recs = recommender.get_strategy_specific_recommendations(
                    strategy=strategy_key,
                    user_id=sample_user_id,
                    candidate_books=[bid for bid in all_book_ids if bid not in user_rated_books],
                    context='evening',
                    personality='adventurous',
                    n=5
                )
            else:
                recs = recommender.get_hybrid_recommendations(
                    user_id=sample_user_id,
                    user_rated_books=user_rated_books,
                    all_book_ids=all_book_ids,
                    n_recommendations=5
                )
            
            for i, (book_id, score) in enumerate(recs, 1):
                book = books_df[books_df['id'] == book_id].iloc[0]
                logger.info(f"  {i}. {book['title']} by {book['author']} (Score: {score:.3f})")


def main():
    """Main training function"""
    # Load data
    books_df, ratings_df = load_data()
    
    if books_df is None or ratings_df is None:
        logger.error("Failed to load data. Exiting.")
        return
    
    # Validate data
    if len(books_df) < 10:
        logger.error("Insufficient books data (need at least 10 books)")
        return
    
    if len(ratings_df) < 20:
        logger.warning("Low number of ratings (< 20). Recommendations may not be optimal.")
    
    # Train models
    recommender = train_models(books_df, ratings_df)
    
    # Test recommendations
    test_recommendations(recommender, books_df, ratings_df)
    
    logger.info("\n" + "=" * 80)
    logger.info("🎉 All Done! Your advanced recommendation system is ready!")
    logger.info("=" * 80)


if __name__ == "__main__":
    main()
