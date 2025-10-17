import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

# Sample book data
SAMPLE_BOOKS = [
    {
        'title': 'The Silent Patient',
        'author': 'Alex Michaelides',
        'description': 'A psychological thriller about a woman who refuses to speak after allegedly murdering her husband.',
        'genres': 'thriller mystery psychological',
        'publication_year': 2019,
        'price': 12.99
    },
    {
        'title': 'Educated',
        'author': 'Tara Westover',
        'description': 'A memoir about a woman who grows up in a survivalist family and eventually earns a PhD from Cambridge.',
        'genres': 'memoir biography education',
        'publication_year': 2018,
        'price': 14.99
    },
    {
        'title': 'Where the Crawdads Sing',
        'author': 'Delia Owens',
        'description': 'A mystery novel about a young girl growing up alone in the marshes of North Carolina.',
        'genres': 'mystery drama coming-of-age',
        'publication_year': 2018,
        'price': 13.99
    },
    {
        'title': 'The Seven Husbands of Evelyn Hugo',
        'author': 'Taylor Jenkins Reid',
        'description': 'A reclusive Hollywood icon reveals her life story to an unknown journalist.',
        'genres': 'historical-fiction romance drama',
        'publication_year': 2017,
        'price': 11.99
    },
    {
        'title': 'Atomic Habits',
        'author': 'James Clear',
        'description': 'A guide to building good habits and breaking bad ones through small changes.',
        'genres': 'self-help productivity psychology',
        'publication_year': 2018,
        'price': 16.99
    },
    {
        'title': 'The Midnight Library',
        'author': 'Matt Haig',
        'description': 'A novel about a library between life and death where every book is a different life you could have lived.',
        'genres': 'fantasy philosophy fiction',
        'publication_year': 2020,
        'price': 13.99
    },
    {
        'title': 'Klara and the Sun',
        'author': 'Kazuo Ishiguro',
        'description': 'A story told from the perspective of an artificial friend observing the world.',
        'genres': 'science-fiction literary-fiction drama',
        'publication_year': 2021,
        'price': 15.99
    },
    {
        'title': 'The Four Winds',
        'author': 'Kristin Hannah',
        'description': 'A historical novel about a woman during the Great Depression who must choose between fighting for the land she loves or leaving it all behind.',
        'genres': 'historical-fiction drama family',
        'publication_year': 2021,
        'price': 14.99
    },
    {
        'title': 'Project Hail Mary',
        'author': 'Andy Weir',
        'description': 'A science fiction novel about a man who wakes up alone on a spaceship with no memory of how he got there.',
        'genres': 'science-fiction adventure thriller',
        'publication_year': 2021,
        'price': 16.99
    },
    {
        'title': 'The Guest List',
        'author': 'Lucy Foley',
        'description': 'A murder mystery set during a wedding on a remote island off the coast of Ireland.',
        'genres': 'mystery thriller suspense',
        'publication_year': 2020,
        'price': 12.99
    },
    {
        'title': 'Circe',
        'author': 'Madeline Miller',
        'description': 'A retelling of Greek mythology from the perspective of the witch Circe.',
        'genres': 'mythology fantasy historical-fiction',
        'publication_year': 2018,
        'price': 13.99
    },
    {
        'title': 'The Vanishing Half',
        'author': 'Brit Bennett',
        'description': 'A novel about twin sisters who choose to live in different worlds, one black and one white.',
        'genres': 'literary-fiction drama family',
        'publication_year': 2020,
        'price': 14.99
    },
    {
        'title': 'Dune',
        'author': 'Frank Herbert',
        'description': 'A science fiction epic about politics, religion, and ecology on the desert planet Arrakis.',
        'genres': 'science-fiction epic adventure',
        'publication_year': 1965,
        'price': 15.99
    },
    {
        'title': 'The Psychology of Money',
        'author': 'Morgan Housel',
        'description': 'A collection of insights about the psychology behind financial decisions.',
        'genres': 'finance psychology self-help',
        'publication_year': 2020,
        'price': 17.99
    },
    {
        'title': 'Normal People',
        'author': 'Sally Rooney',
        'description': 'A novel about the complex relationship between two Irish teenagers as they navigate love and friendship.',
        'genres': 'literary-fiction romance coming-of-age',
        'publication_year': 2018,
        'price': 12.99
    },
    {
        'title': 'The Song of Achilles',
        'author': 'Madeline Miller',
        'description': 'A retelling of the Iliad from the perspective of Patroclus, Achilles\' companion.',
        'genres': 'mythology historical-fiction romance',
        'publication_year': 2011,
        'price': 13.99
    },
    {
        'title': 'Becoming',
        'author': 'Michelle Obama',
        'description': 'The memoir of the former First Lady of the United States.',
        'genres': 'memoir biography politics',
        'publication_year': 2018,
        'price': 18.99
    },
    {
        'title': 'The Alchemist',
        'author': 'Paulo Coelho',
        'description': 'A philosophical novel about a young shepherd who travels from Spain to Egypt in search of treasure.',
        'genres': 'philosophy adventure fiction',
        'publication_year': 1988,
        'price': 10.99
    },
    {
        'title': 'Big Little Lies',
        'author': 'Liane Moriarty',
        'description': 'A novel about three women whose seemingly perfect lives unravel to the point of murder.',
        'genres': 'mystery drama contemporary',
        'publication_year': 2014,
        'price': 12.99
    },
    {
        'title': 'The Handmaid\'s Tale',
        'author': 'Margaret Atwood',
        'description': 'A dystopian novel about a totalitarian society where women are subjugated.',
        'genres': 'dystopian science-fiction feminist',
        'publication_year': 1985,
        'price': 14.99
    }
]


def create_sample_data():
    """Create sample books and ratings data"""
    
    # Create books dataframe
    books_data = []
    for i, book in enumerate(SAMPLE_BOOKS, 1):
        books_data.append({
            'id': i,
            'title': book['title'],
            'author': book['author'],
            'description': book['description'],
            'genres': book['genres'],
            'publication_year': book['publication_year'],
            'price': book['price'],
            'isbn': f'978-{random.randint(1000000000, 9999999999)}',
            'cover_image_url': f'https://example.com/covers/book_{i}.jpg',
            'audio_preview_url': f'https://example.com/audio/book_{i}_preview.mp3'
        })
    
    books_df = pd.DataFrame(books_data)
    
    # Create ratings data
    ratings_data = []
    rating_id = 1
    
    # Generate ratings for multiple users
    num_users = 50
    for user_id in range(1, num_users + 1):
        # Each user rates 5-15 books
        num_ratings = random.randint(5, 15)
        rated_books = random.sample(range(1, len(SAMPLE_BOOKS) + 1), num_ratings)
        
        for book_id in rated_books:
            # Generate realistic ratings (skewed towards higher ratings)
            rating = np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.1, 0.15, 0.35, 0.35])
            
            # Generate review text occasionally
            review = None
            if random.random() < 0.3:  # 30% chance of having a review
                reviews = [
                    "Great book, really enjoyed it!",
                    "Couldn't put it down.",
                    "Not my cup of tea.",
                    "Amazing storytelling.",
                    "Well written but slow paced.",
                    "Highly recommend!",
                    "Disappointing ending.",
                    "Beautiful prose.",
                    "Thought-provoking.",
                    "Page-turner!"
                ]
                review = random.choice(reviews)
            
            # Generate creation date (within last 2 years)
            days_ago = random.randint(0, 730)
            created_at = datetime.now() - timedelta(days=days_ago)
            
            ratings_data.append({
                'id': rating_id,
                'user_id': user_id,
                'book_id': book_id,
                'rating': float(rating),
                'review': review,
                'created_at': created_at.isoformat()
            })
            rating_id += 1
    
    ratings_df = pd.DataFrame(ratings_data)
    
    # Calculate average ratings for books
    avg_ratings = ratings_df.groupby('book_id')['rating'].agg(['mean', 'count']).reset_index()
    avg_ratings.columns = ['id', 'average_rating', 'rating_count']
    avg_ratings['average_rating'] = avg_ratings['average_rating'].round(2)
    
    # Merge average ratings back to books
    books_df = books_df.merge(avg_ratings, on='id', how='left')
    books_df['average_rating'] = books_df['average_rating'].fillna(0.0)
    books_df['rating_count'] = books_df['rating_count'].fillna(0)
    
    # Save to CSV files
    data_dir = os.path.dirname(__file__)
    books_file = os.path.join(data_dir, 'books.csv')
    ratings_file = os.path.join(data_dir, 'ratings.csv')
    
    books_df.to_csv(books_file, index=False)
    ratings_df.to_csv(ratings_file, index=False)
    
    print(f"Created sample data:")
    print(f"- {len(books_df)} books saved to {books_file}")
    print(f"- {len(ratings_df)} ratings saved to {ratings_file}")
    
    return books_df, ratings_df


if __name__ == "__main__":
    create_sample_data()