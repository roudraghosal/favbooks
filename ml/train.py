import pandas as pd
import sys
import os
from datetime import datetime
import logging

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.recommender import HybridRecommender
from ml.sample_data import create_sample_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_models():
    """Train and save recommendation models"""
    logger.info("Starting model training...")
    
    # Create models directory
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Load or create sample data
    data_dir = os.path.dirname(__file__)
    books_file = os.path.join(data_dir, 'books.csv')
    ratings_file = os.path.join(data_dir, 'ratings.csv')
    
    if not os.path.exists(books_file) or not os.path.exists(ratings_file):
        logger.info("Sample data not found. Creating sample data...")
        create_sample_data()
    
    # Load data
    logger.info("Loading data...")
    books_df = pd.read_csv(books_file)
    ratings_df = pd.read_csv(ratings_file)
    
    logger.info(f"Loaded {len(books_df)} books and {len(ratings_df)} ratings")
    
    # Initialize and train hybrid recommender
    recommender = HybridRecommender()
    recommender.fit(books_df, ratings_df)
    
    # Save models
    logger.info("Saving models...")
    recommender.save(models_dir)
    
    # Save training metadata
    metadata = {
        'training_date': datetime.now().isoformat(),
        'books_count': len(books_df),
        'ratings_count': len(ratings_df),
        'users_count': ratings_df['user_id'].nunique()
    }
    
    metadata_file = os.path.join(models_dir, 'training_metadata.txt')
    with open(metadata_file, 'w') as f:
        for key, value in metadata.items():
            f.write(f"{key}: {value}\n")
    
    logger.info("Model training completed successfully!")
    return True


def should_retrain(ratings_count_threshold: int = 100):
    """Check if models should be retrained based on new ratings"""
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    metadata_file = os.path.join(models_dir, 'training_metadata.txt')
    
    if not os.path.exists(metadata_file):
        return True
    
    # Read previous training metadata
    try:
        with open(metadata_file, 'r') as f:
            metadata = {}
            for line in f:
                key, value = line.strip().split(': ')
                metadata[key] = value
        
        previous_ratings_count = int(metadata.get('ratings_count', 0))
        
        # Load current ratings count
        ratings_file = os.path.join(os.path.dirname(__file__), 'ratings.csv')
        if os.path.exists(ratings_file):
            current_ratings_df = pd.read_csv(ratings_file)
            current_ratings_count = len(current_ratings_df)
            
            # Retrain if we have significant new ratings
            new_ratings = current_ratings_count - previous_ratings_count
            return new_ratings >= ratings_count_threshold
        
    except Exception as e:
        logger.error(f"Error checking retrain conditions: {e}")
        return True
    
    return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train recommendation models')
    parser.add_argument('--force', action='store_true', help='Force retrain even if not needed')
    parser.add_argument('--threshold', type=int, default=100, help='New ratings threshold for auto-retrain')
    
    args = parser.parse_args()
    
    if args.force or should_retrain(args.threshold):
        train_models()
    else:
        logger.info("No retraining needed based on current thresholds")