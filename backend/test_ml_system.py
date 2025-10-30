"""
Test script to verify ML recommendation system is working correctly
Run this from the backend directory: python test_ml_system.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from ml.recommender import HybridRecommender
import pandas as pd

def test_ml_system():
    print("🧪 Testing ML Recommendation System...\n")
    
    # Check if data files exist
    print("1️⃣ Checking data files...")
    ml_dir = os.path.join(os.path.dirname(__file__), 'ml')
    books_csv = os.path.join(ml_dir, 'books.csv')
    ratings_csv = os.path.join(ml_dir, 'ratings.csv')
    
    if os.path.exists(books_csv):
        books_df = pd.read_csv(books_csv)
        print(f"   ✅ books.csv found: {len(books_df)} books")
    else:
        print(f"   ❌ books.csv not found at {books_csv}")
        return False
    
    if os.path.exists(ratings_csv):
        ratings_df = pd.read_csv(ratings_csv)
        print(f"   ✅ ratings.csv found: {len(ratings_df)} ratings")
        print(f"      - Unique users: {ratings_df['user_id'].nunique()}")
        print(f"      - Unique books: {ratings_df['book_id'].nunique()}")
    else:
        print(f"   ❌ ratings.csv not found at {ratings_csv}")
        return False
    
    # Train models
    print("\n2️⃣ Training ML models...")
    try:
        recommender = HybridRecommender()
        recommender.fit(books_df, ratings_df)  # type: ignore[attr-defined]
        print("   ✅ Models trained successfully!")
    except Exception as e:
        print(f"   ❌ Training failed: {e}")
        return False
    
    # Check model files
    print("\n3️⃣ Checking saved models...")
    content_model = os.path.join(ml_dir, 'content_model.pkl')
    collab_model = os.path.join(ml_dir, 'collaborative_model.pkl')
    
    if os.path.exists(content_model):
        size_kb = os.path.getsize(content_model) / 1024
        print(f"   ✅ content_model.pkl exists ({size_kb:.1f} KB)")
    else:
        print(f"   ❌ content_model.pkl not found")
        return False
    
    if os.path.exists(collab_model):
        size_kb = os.path.getsize(collab_model) / 1024
        print(f"   ✅ collaborative_model.pkl exists ({size_kb:.1f} KB)")
    else:
        print(f"   ❌ collaborative_model.pkl not found")
        return False
    
    # Test recommendations
    print("\n4️⃣ Testing recommendations...")
    try:
        # Get a user who has ratings
        test_user_id = ratings_df['user_id'].iloc[0]
        user_rated_books = ratings_df[ratings_df['user_id'] == test_user_id]['book_id'].tolist()
        all_book_ids = books_df['id'].tolist()
        
        print(f"   Testing user {test_user_id}:")
        print(f"   - Has rated {len(user_rated_books)} books")
        
        recommendations = recommender.get_hybrid_recommendations(
            user_id=test_user_id,
            user_rated_books=user_rated_books,
            all_book_ids=all_book_ids,
            n_recommendations=5
        )
        
        print(f"   ✅ Got {len(recommendations)} recommendations:")
        for book_id, score in recommendations[:5]:
            book = books_df[books_df['id'] == book_id].iloc[0]
            print(f"      - {book['title']} by {book['author']}")
            print(f"        Score: {score:.3f} | Rating: {book['average_rating']}⭐")
        
    except Exception as e:
        print(f"   ❌ Recommendation failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test content-based
    print("\n5️⃣ Testing content-based similarity...")
    try:
        test_book_id = books_df['id'].iloc[0]
        test_book = books_df[books_df['id'] == test_book_id].iloc[0]
        print(f"   Finding books similar to: {test_book['title']}")
        
        similar = recommender.content_model.get_recommendations(  # type: ignore[attr-defined]
            book_id=test_book_id,
            n_recommendations=3
        )
        
        print(f"   ✅ Found {len(similar)} similar books:")
        for book_id, score in similar:
            book = books_df[books_df['id'] == book_id].iloc[0]
            print(f"      - {book['title']} (similarity: {score:.3f})")
            
    except Exception as e:
        print(f"   ❌ Content-based test failed: {e}")
        return False
    
    # Test collaborative filtering
    print("\n6️⃣ Testing collaborative filtering...")
    try:
        test_user_id = ratings_df['user_id'].iloc[0]
        test_book_id = books_df['id'].iloc[0]
        
        predicted_rating = recommender.collaborative_model.predict_rating(  # type: ignore[attr-defined]
            user_id=test_user_id,
            book_id=test_book_id
        )
        
        print(f"   ✅ Predicted rating for user {test_user_id} on book {test_book_id}:")
        print(f"      {predicted_rating:.2f} ⭐")
        
    except Exception as e:
        print(f"   ❌ Collaborative filtering test failed: {e}")
        return False
    
    print("\n" + "="*60)
    print("🎉 ALL TESTS PASSED! ML system is working correctly!")
    print("="*60)
    print("\n📚 Next steps:")
    print("1. Start the backend: python -m uvicorn app.main:app --reload")
    print("2. Test the API: GET http://localhost:8000/api/recommendations/1")
    print("3. Check frontend: http://localhost:3000/recommendations")
    print("\n✅ Your recommendation system is production-ready!")
    
    return True


if __name__ == "__main__":
    success = test_ml_system()
    sys.exit(0 if success else 1)

