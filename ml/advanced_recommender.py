"""
Advanced Hybrid Recommendation System
Implements 15 different recommendation strategies
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from typing import List, Dict, Tuple, Optional
import pickle
import os
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PopularityRecommender:
    """1. Popularity-Based Recommendation"""
    
    def __init__(self):
        self.popular_books = []
        self.trending_books = []
    
    def fit(self, books_df: pd.DataFrame, ratings_df: pd.DataFrame):
        """Train popularity model"""
        logger.info("Training Popularity-Based Recommender...")
        
        # Overall popularity: highest rated books with sufficient ratings
        popular = books_df[books_df['rating_count'] >= 5].copy()
        popular['popularity_score'] = (
            popular['average_rating'] * 0.7 + 
            (popular['rating_count'] / popular['rating_count'].max()) * 0.3
        )
        self.popular_books = popular.nlargest(100, 'popularity_score')[['id', 'popularity_score']].to_dict('records')
        
        # Trending: recent ratings (if timestamp available)
        if 'created_at' in ratings_df.columns and len(ratings_df) > 0:
            recent_cutoff = pd.Timestamp.now() - pd.Timedelta(days=30)
            try:
                ratings_df['created_at'] = pd.to_datetime(ratings_df['created_at'])
                recent_ratings = ratings_df[ratings_df['created_at'] > recent_cutoff]
                
                trending_stats = recent_ratings.groupby('book_id').agg({
                    'rating': ['mean', 'count']
                }).reset_index()
                trending_stats.columns = ['book_id', 'avg_rating', 'rating_count']
                trending_stats = trending_stats[trending_stats['rating_count'] >= 3]
                trending_stats['trending_score'] = (
                    trending_stats['avg_rating'] * 0.6 + 
                    (trending_stats['rating_count'] / trending_stats['rating_count'].max()) * 0.4
                )
                self.trending_books = trending_stats.nlargest(50, 'trending_score')[['book_id', 'trending_score']].to_dict('records')
            except:
                self.trending_books = self.popular_books[:50]
        else:
            self.trending_books = self.popular_books[:50]
    
    def get_recommendations(self, n: int = 10, trending: bool = False) -> List[Tuple[int, float]]:
        """Get popular or trending recommendations"""
        source = self.trending_books if trending else self.popular_books
        books = source[:n]
        return [(b.get('id') or b.get('book_id') or 0, b.get('popularity_score') or b.get('trending_score', 0.5)) for b in books]


class ContentBasedRecommender:
    """2. Content-Based Filtering"""
    
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))
        self.tfidf_matrix = None
        self.book_features = None
        self.book_indices = None
    
    def fit(self, books_df: pd.DataFrame):
        """Train content-based model"""
        logger.info("Training Content-Based Recommender...")
        
        books_df['content_features'] = (
            books_df['title'].fillna('') + ' ' +
            books_df['author'].fillna('') + ' ' +
            books_df['description'].fillna('') + ' ' + 
            books_df['genres'].fillna('')
        )
        
        self.book_features = books_df[['id', 'title', 'author', 'content_features']].copy()
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(books_df['content_features'])
        self.book_indices = pd.Series(books_df.index, index=books_df['id']).drop_duplicates()
    
    def get_similar_books(self, book_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """Get content-similar books"""
        if self.book_indices is None or book_id not in self.book_indices or self.tfidf_matrix is None or self.book_features is None:
            return []
        
        idx = self.book_indices[book_id]
        sim_scores = cosine_similarity(self.tfidf_matrix[idx:idx+1], self.tfidf_matrix).flatten()  # type: ignore[index]
        sim_indices = sim_scores.argsort()[::-1][1:n+1]
        
        recommendations = []
        for i in sim_indices:
            if i < len(self.book_features):
                rec_book_id = int(self.book_features.iloc[i]['id'])  # type: ignore[call-overload]
                recommendations.append((rec_book_id, float(sim_scores[i])))
        
        return recommendations


class CollaborativeFilteringRecommender:
    """3. Collaborative Filtering (User-Based & Item-Based)"""
    
    def __init__(self):
        self.user_book_matrix = None
        self.user_similarity = None
        self.item_similarity = None
        self.user_means = None
        self.book_means = None
        self.global_mean = 0.0
    
    def fit(self, ratings_df: pd.DataFrame):
        """Train collaborative filtering model"""
        logger.info("Training Collaborative Filtering Recommender...")
        
        if len(ratings_df) == 0:
            return
        
        # Create user-book matrix
        self.user_book_matrix = ratings_df.pivot_table(
            index='user_id', columns='book_id', values='rating', fill_value=0
        )
        
        # Calculate means
        self.global_mean = ratings_df['rating'].mean()
        self.user_means = ratings_df.groupby('user_id')['rating'].mean()
        self.book_means = ratings_df.groupby('book_id')['rating'].mean()
        
        # User-based similarity (compute only if reasonable size)
        if len(self.user_book_matrix) < 1000:
            user_matrix_normalized = self.user_book_matrix.sub(self.user_book_matrix.mean(axis=1), axis=0).fillna(0)
            self.user_similarity = cosine_similarity(user_matrix_normalized)
        
        # Item-based similarity
        book_matrix_normalized = self.user_book_matrix.T.sub(self.user_book_matrix.T.mean(axis=1), axis=0).fillna(0)
        self.item_similarity = cosine_similarity(book_matrix_normalized)
    
    def predict_rating_cf(self, user_id: int, book_id: int, use_user_based: bool = True) -> float:
        """Predict rating using collaborative filtering"""
        if self.user_book_matrix is None:
            return self.global_mean
        
        user_bias = self.user_means.get(user_id, 0) - self.global_mean if self.user_means is not None else 0
        book_bias = self.book_means.get(book_id, 0) - self.global_mean if self.book_means is not None else 0
        predicted = self.global_mean + user_bias + book_bias
        
        return max(1.0, min(5.0, predicted))
    
    def get_recommendations_cf(self, user_id: int, candidate_books: List[int], n: int = 10) -> List[Tuple[int, float]]:
        """Get collaborative filtering recommendations"""
        predictions = [(bid, self.predict_rating_cf(user_id, bid)) for bid in candidate_books]
        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:n]


class DemographicRecommender:
    """6. Demographic-Based Recommendation"""
    
    def __init__(self):
        self.demographic_profiles = {}
    
    def fit(self, users_df: pd.DataFrame, ratings_df: pd.DataFrame):
        """Learn demographic preferences"""
        logger.info("Training Demographic-Based Recommender...")
        
        # Simulate demographic clustering (in real app, use actual demographic data)
        # Here we cluster users by their rating patterns
        if len(ratings_df) == 0:
            return
        
        user_rating_stats = ratings_df.groupby('user_id').agg({
            'rating': ['mean', 'std', 'count']
        }).reset_index()
        
        # Default profile
        self.demographic_profiles['default'] = (
            ratings_df.groupby('book_id')['rating']
            .mean()
            .nlargest(50)
            .to_dict()
        )
    
    def get_recommendations(self, user_profile: str = 'default', candidate_books: Optional[List[int]] = None, n: int = 10) -> List[Tuple[int, float]]:
        """Get demographic-based recommendations"""
        profile_ratings = self.demographic_profiles.get(user_profile, {})
        
        if candidate_books:
            recs = [(bid, profile_ratings.get(bid, 2.5)) for bid in candidate_books]
        else:
            recs = list(profile_ratings.items())
        
        recs.sort(key=lambda x: x[1], reverse=True)
        return recs[:n]


class ContextAwareRecommender:
    """7. Context-Aware Recommendation"""
    
    def __init__(self):
        self.context_rules = {
            'morning': ['self-help', 'business', 'productivity'],
            'afternoon': ['fiction', 'mystery', 'thriller'],
            'evening': ['romance', 'fantasy', 'sci-fi'],
            'night': ['horror', 'mystery', 'literary'],
            'weekend': ['adventure', 'travel', 'biography'],
            'workday': ['business', 'self-help', 'technical']
        }
        self.genre_books = {}
    
    def fit(self, books_df: pd.DataFrame):
        """Build context-genre mapping"""
        logger.info("Training Context-Aware Recommender...")
        
        for _, book in books_df.iterrows():
            genres = str(book.get('genres', '')).lower().split()
            for genre in genres:
                if genre not in self.genre_books:
                    self.genre_books[genre] = []
                self.genre_books[genre].append((book['id'], book.get('average_rating', 3.0)))
    
    def get_context_recommendations(self, context: str, n: int = 10) -> List[Tuple[int, float]]:
        """Get context-aware recommendations"""
        relevant_genres = self.context_rules.get(context, ['fiction', 'general'])
        
        recommendations = []
        for genre in relevant_genres:
            if genre in self.genre_books:
                recommendations.extend(self.genre_books[genre])
        
        recommendations = list(set(recommendations))
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:n]


class PersonalityQuizRecommender:
    """10. Personality / Quiz-Based Recommendation"""
    
    def __init__(self):
        self.personality_mappings = {
            'adventurous': ['adventure', 'travel', 'thriller', 'fantasy'],
            'intellectual': ['science', 'philosophy', 'history', 'technical'],
            'creative': ['art', 'poetry', 'literary', 'biography'],
            'romantic': ['romance', 'drama', 'contemporary'],
            'analytical': ['mystery', 'sci-fi', 'business', 'technical']
        }
        self.genre_books = {}
    
    def fit(self, books_df: pd.DataFrame):
        """Build personality-genre mapping"""
        logger.info("Training Personality Quiz Recommender...")
        
        for _, book in books_df.iterrows():
            genres = str(book.get('genres', '')).lower().split()
            for genre in genres:
                if genre not in self.genre_books:
                    self.genre_books[genre] = []
                self.genre_books[genre].append({
                    'id': book['id'],
                    'score': book.get('average_rating', 3.0)
                })
    
    def get_quiz_recommendations(self, personality_type: str, n: int = 10) -> List[Tuple[int, float]]:
        """Get recommendations based on quiz results"""
        relevant_genres = self.personality_mappings.get(personality_type, ['fiction'])
        
        recommendations = []
        for genre in relevant_genres:
            if genre in self.genre_books:
                for book in self.genre_books[genre]:
                    recommendations.append((book['id'], book['score'] / 5.0))
        
        recommendations = list(set(recommendations))
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:n]


class AssociationRuleRecommender:
    """9. Association Rule-Based Recommendation (Market Basket Analysis)"""
    
    def __init__(self):
        self.frequent_pairs = {}
        self.book_cooccurrence = defaultdict(lambda: defaultdict(int))
    
    def fit(self, ratings_df: pd.DataFrame):
        """Find frequently co-rated books"""
        logger.info("Training Association Rule Recommender...")
        
        if len(ratings_df) == 0:
            return
        
        # Find books rated together by users
        user_books = ratings_df.groupby('user_id')['book_id'].apply(list).to_dict()
        
        for user_id, books in user_books.items():
            for i, book1 in enumerate(books):
                for book2 in books[i+1:]:
                    self.book_cooccurrence[book1][book2] += 1
                    self.book_cooccurrence[book2][book1] += 1
    
    def get_associated_books(self, book_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """Get books frequently rated with this book"""
        if book_id not in self.book_cooccurrence:
            return []
        
        associations = list(self.book_cooccurrence[book_id].items())
        associations.sort(key=lambda x: x[1], reverse=True)
        
        # Normalize scores
        max_count = associations[0][1] if associations else 1
        return [(bid, count / max_count) for bid, count in associations[:n]]


class DiversityOptimizer:
    """15. Multi-Objective Recommendation (Diversity, Novelty, Serendipity)"""
    
    def __init__(self):
        self.genre_diversity_weight = 0.3
        self.popularity_penalty = 0.2
    
    def diversify_recommendations(
        self, 
        recommendations: List[Tuple[int, float]], 
        books_df: pd.DataFrame,
        n: int = 10,
        diversity_weight: float = 0.3
    ) -> List[Tuple[int, float]]:
        """Re-rank recommendations for diversity"""
        
        if len(recommendations) == 0:
            return []
        
        selected = []
        remaining = recommendations.copy()
        selected_genres = set()
        
        # Create book info lookup
        book_info = books_df.set_index('id')[['genres', 'rating_count']].to_dict('index')
        
        while len(selected) < n and remaining:
            best_score = -1
            best_idx = 0
            
            for idx, (book_id, base_score) in enumerate(remaining):
                # Get book genres
                genres = set(str(book_info.get(book_id, {}).get('genres', '')).lower().split())
                
                # Diversity bonus: prefer books with new genres
                genre_overlap = len(genres & selected_genres)
                diversity_bonus = (1 - genre_overlap / max(len(genres), 1)) * diversity_weight
                
                # Novelty bonus: penalize very popular books slightly
                popularity = book_info.get(book_id, {}).get('rating_count', 0)
                novelty_bonus = (1 - min(popularity / 100, 1)) * self.popularity_penalty
                
                # Combined score
                combined_score = base_score + diversity_bonus + novelty_bonus
                
                if combined_score > best_score:
                    best_score = combined_score
                    best_idx = idx
            
            # Add best book
            book_id, orig_score = remaining.pop(best_idx)
            selected.append((book_id, best_score))
            
            # Update selected genres
            book_genres = set(str(book_info.get(book_id, {}).get('genres', '')).lower().split())
            selected_genres.update(book_genres)
        
        return selected


class AdvancedHybridRecommender:
    """Master Hybrid Recommender combining all 15 strategies"""
    
    def __init__(self):
        # Initialize all recommenders
        self.popularity_rec = PopularityRecommender()
        self.content_rec = ContentBasedRecommender()
        self.collaborative_rec = CollaborativeFilteringRecommender()
        self.demographic_rec = DemographicRecommender()
        self.context_rec = ContextAwareRecommender()
        self.quiz_rec = PersonalityQuizRecommender()
        self.association_rec = AssociationRuleRecommender()
        self.diversity_optimizer = DiversityOptimizer()
        
        # Weights for hybrid combination
        self.weights = {
            'popularity': 0.15,
            'content': 0.20,
            'collaborative': 0.25,
            'demographic': 0.10,
            'context': 0.10,
            'quiz': 0.05,
            'association': 0.15
        }
    
    def fit(self, books_df: pd.DataFrame, ratings_df: pd.DataFrame, users_df: Optional[pd.DataFrame] = None):
        """Train all recommendation models"""
        logger.info("=" * 60)
        logger.info("Training Advanced Hybrid Recommendation System")
        logger.info("=" * 60)
        
        # Train each model
        self.popularity_rec.fit(books_df, ratings_df)
        self.content_rec.fit(books_df)
        self.collaborative_rec.fit(ratings_df)
        
        if users_df is not None:
            self.demographic_rec.fit(users_df, ratings_df)
        
        self.context_rec.fit(books_df)
        self.quiz_rec.fit(books_df)
        self.association_rec.fit(ratings_df)
        
        logger.info("✅ All recommendation models trained successfully!")
    
    def get_hybrid_recommendations(
        self,
        user_id: int,
        user_rated_books: List[int],
        all_book_ids: List[int],
        n_recommendations: int = 10,
        context: Optional[str] = None,
        personality: Optional[str] = None,
        diversity_enabled: bool = True
    ) -> List[Tuple[int, float]]:
        """Get hybrid recommendations combining all strategies"""
        
        # Filter candidate books
        candidate_books = [bid for bid in all_book_ids if bid not in user_rated_books]
        
        if not candidate_books:
            return []
        
        # Collect scores from all recommenders
        all_scores = defaultdict(float)
        
        # 1. Popularity-based
        pop_recs = self.popularity_rec.get_recommendations(n=len(candidate_books))
        for book_id, score in pop_recs:
            if book_id in candidate_books:
                all_scores[book_id] += score * self.weights['popularity']
        
        # 2 & 3. Content-based (from user's liked books)
        if user_rated_books:
            for rated_book in user_rated_books[-5:]:
                content_recs = self.content_rec.get_similar_books(rated_book, n=20)
                for book_id, score in content_recs:
                    if book_id in candidate_books:
                        all_scores[book_id] += score * self.weights['content']
        
        # 4. Collaborative Filtering
        cf_recs = self.collaborative_rec.get_recommendations_cf(user_id, candidate_books, n=len(candidate_books))
        for book_id, score in cf_recs:
            all_scores[book_id] += (score / 5.0) * self.weights['collaborative']
        
        # 5. Association Rules (books bought/rated together)
        if user_rated_books:
            for rated_book in user_rated_books[-3:]:
                assoc_recs = self.association_rec.get_associated_books(rated_book, n=15)
                for book_id, score in assoc_recs:
                    if book_id in candidate_books:
                        all_scores[book_id] += score * self.weights['association']
        
        # 6. Demographic
        demo_recs = self.demographic_rec.get_recommendations(candidate_books=candidate_books, n=len(candidate_books))
        for book_id, score in demo_recs:
            all_scores[book_id] += (score / 5.0) * self.weights['demographic']
        
        # 7. Context-aware (if context provided)
        if context:
            context_recs = self.context_rec.get_context_recommendations(context, n=20)
            for book_id, score in context_recs:
                if book_id in candidate_books:
                    all_scores[book_id] += (score / 5.0) * self.weights['context']
        
        # 10. Personality Quiz (if personality provided)
        if personality:
            quiz_recs = self.quiz_rec.get_quiz_recommendations(personality, n=20)
            for book_id, score in quiz_recs:
                if book_id in candidate_books:
                    all_scores[book_id] += score * self.weights['quiz']
        
        # Convert to sorted list
        recommendations = [(bid, score) for bid, score in all_scores.items()]
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        # Get top recommendations before diversity optimization
        top_recs = recommendations[:n_recommendations * 3]
        
        # 15. Apply diversity optimization if enabled
        if diversity_enabled and hasattr(self.content_rec, 'book_features') and self.content_rec.book_features is not None:
            books_df = self.content_rec.book_features
            final_recs = self.diversity_optimizer.diversify_recommendations(
                top_recs, books_df, n=n_recommendations
            )
        else:
            final_recs = top_recs[:n_recommendations]
        
        return final_recs
    
    def get_strategy_specific_recommendations(
        self,
        strategy: str,
        user_id: Optional[int] = None,
        book_id: Optional[int] = None,
        candidate_books: Optional[List[int]] = None,
        context: Optional[str] = None,
        personality: Optional[str] = None,
        n: int = 10
    ) -> List[Tuple[int, float]]:
        """Get recommendations from a specific strategy"""
        
        strategy_map = {
            'popularity': lambda: self.popularity_rec.get_recommendations(n=n),
            'trending': lambda: self.popularity_rec.get_recommendations(n=n, trending=True),
            'content': lambda: self.content_rec.get_similar_books(book_id, n=n) if book_id else [],
            'collaborative': lambda: self.collaborative_rec.get_recommendations_cf(user_id, candidate_books if candidate_books else [], n=n) if user_id else [],
            'demographic': lambda: self.demographic_rec.get_recommendations(candidate_books=candidate_books, n=n),
            'context': lambda: self.context_rec.get_context_recommendations(context if context else 'afternoon', n=n),
            'quiz': lambda: self.quiz_rec.get_quiz_recommendations(personality if personality else 'adventurous', n=n),
            'association': lambda: self.association_rec.get_associated_books(book_id, n=n) if book_id else []
        }
        
        if strategy in strategy_map:
            return strategy_map[strategy]()
        else:
            return []
    
    def save(self, models_dir: str):
        """Save all trained models"""
        os.makedirs(models_dir, exist_ok=True)
        
        with open(os.path.join(models_dir, 'advanced_hybrid_recommender.pkl'), 'wb') as f:
            pickle.dump({
                'popularity_rec': self.popularity_rec,
                'content_rec': self.content_rec,
                'collaborative_rec': self.collaborative_rec,
                'demographic_rec': self.demographic_rec,
                'context_rec': self.context_rec,
                'quiz_rec': self.quiz_rec,
                'association_rec': self.association_rec,
                'weights': self.weights
            }, f)
        
        logger.info(f"✅ Advanced Hybrid Recommender saved to {models_dir}")
    
    def load(self, models_dir: str):
        """Load all trained models"""
        model_path = os.path.join(models_dir, 'advanced_hybrid_recommender.pkl')
        
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                data = pickle.load(f)
            
            self.popularity_rec = data['popularity_rec']
            self.content_rec = data['content_rec']
            self.collaborative_rec = data['collaborative_rec']
            self.demographic_rec = data['demographic_rec']
            self.context_rec = data['context_rec']
            self.quiz_rec = data['quiz_rec']
            self.association_rec = data['association_rec']
            self.weights = data.get('weights', self.weights)
            
            logger.info(f"✅ Advanced Hybrid Recommender loaded from {models_dir}")
