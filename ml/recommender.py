import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ContentBasedRecommender:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = None
        self.book_features = None
        self.book_indices = None
    
    def prepare_features(self, books_df: pd.DataFrame) -> pd.DataFrame:
        """Prepare book features for content-based filtering"""
        # Combine description and genres for content features
        books_df['content_features'] = (
            books_df['description'].fillna('') + ' ' + 
            books_df['genres'].fillna('')
        )
        return books_df
    
    def fit(self, books_df: pd.DataFrame):
        """Train the content-based model"""
        logger.info("Training content-based recommender...")
        
        # Prepare features
        books_df = self.prepare_features(books_df)
        self.book_features = books_df[['id', 'title', 'author', 'content_features']].copy()
        
        # Create TF-IDF matrix
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(
            books_df['content_features']
        )
        
        # Create book index mapping
        self.book_indices = pd.Series(
            books_df.index, 
            index=books_df['id']
        ).drop_duplicates()
        
        logger.info("Content-based model trained successfully")
    
    def get_recommendations(self, book_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """Get content-based recommendations for a book"""
        if self.book_indices is None or book_id not in self.book_indices:  # type: ignore[operator]
            return []
        
        # Get book index
        idx = self.book_indices[book_id]  # type: ignore[index]
        
        # Calculate cosine similarity
        if self.tfidf_matrix is None:
            return []
        sim_scores = cosine_similarity(
            self.tfidf_matrix[idx:idx+1],  # type: ignore[index]
            self.tfidf_matrix
        ).flatten()
        
        # Get similarity scores
        sim_scores = list(enumerate(sim_scores))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top recommendations (excluding the book itself)
        sim_scores = sim_scores[1:n_recommendations+1]
        
        # Get book IDs and scores
        book_indices = [i[0] for i in sim_scores]
        scores = [i[1] for i in sim_scores]
        
        recommended_books = []
        if self.book_features is not None:
            for idx, score in zip(book_indices, scores):
                if idx < len(self.book_features):  # type: ignore[arg-type]
                    book_id = self.book_features.iloc[idx]['id']  # type: ignore[index]
                    recommended_books.append((book_id, score))
        
        return recommended_books
    
    def save(self, filepath: str):
        """Save the trained model"""
        model_data = {
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'book_features': self.book_features,
            'book_indices': self.book_indices
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        logger.info(f"Content-based model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.tfidf_matrix = model_data['tfidf_matrix']
        self.book_features = model_data['book_features']
        self.book_indices = model_data['book_indices']
        logger.info(f"Content-based model loaded from {filepath}")


class CollaborativeFilteringRecommender:
    def __init__(self):
        self.user_book_matrix = None
        self.user_means = None
        self.book_means = None
        self.global_mean = 0.0
    
    def fit(self, ratings_df: pd.DataFrame):
        """Train the collaborative filtering model using simple matrix factorization"""
        logger.info("Training collaborative filtering recommender...")
        
        # Create user-book matrix
        self.user_book_matrix = ratings_df.pivot_table(
            index='user_id', 
            columns='book_id', 
            values='rating',
            fill_value=0
        )
        
        # Calculate means for bias
        self.global_mean = ratings_df['rating'].mean()
        self.user_means = ratings_df.groupby('user_id')['rating'].mean()
        self.book_means = ratings_df.groupby('book_id')['rating'].mean()
        
        logger.info("Collaborative filtering model trained successfully")
    
    def predict_rating(self, user_id: int, book_id: int) -> float:
        """Predict rating for a user-book pair using user and book biases"""
        if self.user_means is None or self.book_means is None:
            return self.global_mean
        user_bias = self.user_means.get(user_id, 0) - self.global_mean  # type: ignore[union-attr]
        book_bias = self.book_means.get(book_id, 0) - self.global_mean  # type: ignore[union-attr]
        
        # Simple prediction using biases
        predicted_rating = self.global_mean + user_bias + book_bias
        
        # Clamp to rating scale
        return max(1.0, min(5.0, predicted_rating))
    
    def get_user_recommendations(self, user_id: int, book_ids: List[int], n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """Get recommendations for a user"""
        # Predict ratings for all books
        predictions = []
        for book_id in book_ids:
            predicted_rating = self.predict_rating(user_id, book_id)
            predictions.append((book_id, predicted_rating))
        
        # Sort by predicted rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n_recommendations]
    
    def save(self, filepath: str):
        """Save the trained model"""
        model_data = {
            'user_book_matrix': self.user_book_matrix,
            'user_means': self.user_means,
            'book_means': self.book_means,
            'global_mean': self.global_mean
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        logger.info(f"Collaborative filtering model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.user_book_matrix = model_data['user_book_matrix']
        self.user_means = model_data['user_means']
        self.book_means = model_data['book_means']
        self.global_mean = model_data['global_mean']
        logger.info(f"Collaborative filtering model loaded from {filepath}")


class HybridRecommender:
    def __init__(self):
        self.content_model = ContentBasedRecommender()
        self.collaborative_model = CollaborativeFilteringRecommender()
        self.content_weight = 0.4
        self.collaborative_weight = 0.6
    
    def fit(self, books_df: pd.DataFrame, ratings_df: pd.DataFrame):
        """Train both models"""
        self.content_model.fit(books_df)
        if len(ratings_df) > 0:
            self.collaborative_model.fit(ratings_df)
    
    def get_hybrid_recommendations(
        self, 
        user_id: int, 
        user_rated_books: List[int],
        all_book_ids: List[int], 
        n_recommendations: int = 10
    ) -> List[Tuple[int, float]]:
        """Get hybrid recommendations combining both approaches"""
        
        # Filter out books user has already rated
        candidate_books = [bid for bid in all_book_ids if bid not in user_rated_books]
        
        if not candidate_books:
            return []
        
        # Get content-based recommendations based on user's liked books
        content_scores = {}
        if user_rated_books:
            for rated_book in user_rated_books[-5:]:  # Use last 5 rated books
                content_recs = self.content_model.get_recommendations(rated_book, len(candidate_books))
                for book_id, score in content_recs:
                    if book_id in candidate_books:
                        content_scores[book_id] = content_scores.get(book_id, 0) + score
        
        # Normalize content scores
        if content_scores:
            max_content_score = max(content_scores.values())
            content_scores = {bid: score/max_content_score for bid, score in content_scores.items()}
        
        # Get collaborative filtering recommendations
        collaborative_recs = self.collaborative_model.get_user_recommendations(
            user_id, candidate_books, len(candidate_books)
        )
        collaborative_scores = {bid: score/5.0 for bid, score in collaborative_recs}  # Normalize to 0-1
        
        # Combine scores
        hybrid_scores = []
        for book_id in candidate_books:
            content_score = content_scores.get(book_id, 0)
            collaborative_score = collaborative_scores.get(book_id, 0)
            
            hybrid_score = (
                self.content_weight * content_score + 
                self.collaborative_weight * collaborative_score
            )
            
            hybrid_scores.append((book_id, hybrid_score))
        
        # Sort by hybrid score
        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        
        return hybrid_scores[:n_recommendations]
    
    def save(self, models_dir: str):
        """Save both models"""
        os.makedirs(models_dir, exist_ok=True)
        self.content_model.save(os.path.join(models_dir, 'content_model.pkl'))
        self.collaborative_model.save(os.path.join(models_dir, 'collaborative_model.pkl'))
    
    def load(self, models_dir: str):
        """Load both models"""
        content_path = os.path.join(models_dir, 'content_model.pkl')
        collaborative_path = os.path.join(models_dir, 'collaborative_model.pkl')
        
        if os.path.exists(content_path):
            self.content_model.load(content_path)
        
        if os.path.exists(collaborative_path):
            self.collaborative_model.load(collaborative_path)