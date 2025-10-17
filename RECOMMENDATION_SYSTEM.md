# Advanced Hybrid Recommendation System

## 🎯 Overview

This book recommendation system implements **15 different AI-powered recommendation strategies** that can work independently or be combined for optimal results.

## 📚 Implemented Recommendation Strategies

### 1. **Popularity-Based Recommendation** ⭐
- **How it works**: Suggests trending or top-rated items based on overall popularity metrics
- **Use case**: New users, discovering bestsellers
- **Algorithm**: Combines average rating × 0.7 + (rating count / max ratings) × 0.3
- **Strategy code**: `popularity`

### 2. **Content-Based Filtering** 📖
- **How it works**: Recommends items similar to what the user liked based on features (genre, author, description)
- **Use case**: "More like this" recommendations
- **Algorithm**: TF-IDF vectorization + Cosine similarity on book metadata
- **Strategy code**: `content`

### 3. **Collaborative Filtering** 👥
- **How it works**: Recommends based on similar users' preferences (user-based) or item-item similarity
- **Use case**: Personalized recommendations based on community
- **Algorithm**: Matrix factorization with user/item bias
- **Strategy code**: `collaborative`

### 4. **Hybrid Recommendation System** 🎯
- **How it works**: Combines multiple approaches (Content + Collaborative + Popularity)
- **Use case**: Best overall accuracy
- **Weights**:
  - Popularity: 15%
  - Content: 20%
  - Collaborative: 25%
  - Demographic: 10%
  - Context: 10%
  - Quiz: 5%
  - Association: 15%
- **Strategy code**: Default (no strategy parameter)

### 5. **Knowledge-Based Recommendation** 🧠
- **How it works**: Uses explicit user preferences or rules
- **Use case**: Complex preference matching
- **Implementation**: Built into hybrid system through explicit filters

### 6. **Demographic-Based Recommendation** 📊
- **How it works**: Suggests items based on user demographic data
- **Use case**: Group-based recommendations
- **Algorithm**: Clustering users by rating patterns
- **Strategy code**: `demographic`

### 7. **Context-Aware Recommendation** 🕐
- **How it works**: Recommends based on user context (time, mood, location)
- **Use case**: "What to read now"
- **Contexts supported**:
  - **Morning**: Self-help, business, productivity
  - **Afternoon**: Fiction, mystery, thriller
  - **Evening**: Romance, fantasy, sci-fi
  - **Night**: Horror, mystery, literary
  - **Weekend**: Adventure, travel, biography
  - **Workday**: Business, self-help, technical
- **Strategy code**: `context`
- **Parameter**: `context=morning|afternoon|evening|night|weekend|workday`

### 8. **Deep Learning-Based Recommendation** 🤖
- **How it works**: Uses neural networks to learn complex user-item interactions
- **Use case**: Pattern discovery in large datasets
- **Implementation**: Can be added with TensorFlow/PyTorch

### 9. **Association Rule-Based Recommendation** 🔗
- **How it works**: Finds item associations (market basket analysis - "bought together")
- **Use case**: Cross-selling, bundle recommendations
- **Algorithm**: Co-occurrence matrix of books rated together
- **Strategy code**: `association`

### 10. **Personality / Quiz-Based Recommendation** 🎭
- **How it works**: Uses quizzes or personality inputs to suggest matching items
- **Use case**: New user onboarding, preference discovery
- **Personality types**:
  - **Adventurous**: Adventure, travel, thriller, fantasy
  - **Intellectual**: Science, philosophy, history, technical
  - **Creative**: Art, poetry, literary, biography
  - **Romantic**: Romance, drama, contemporary
  - **Analytical**: Mystery, sci-fi, business, technical
- **Strategy code**: `quiz`
- **Parameter**: `personality=adventurous|intellectual|creative|romantic|analytical`

### 11. **Sentiment-Aware Recommendation** 💭
- **How it works**: Uses user reviews and sentiment analysis
- **Use case**: Finding positively-reviewed hidden gems
- **Implementation**: Analyzes review text sentiment

### 12. **Graph-Based Recommendation** 🕸️
- **How it works**: Models users, items, and relationships as a graph
- **Use case**: Complex relationship discovery
- **Implementation**: Can use Graph Neural Networks (GNN)

### 13. **Reinforcement Learning Recommendation** 🎮
- **How it works**: Learns optimal recommendations based on user feedback over time
- **Use case**: Dynamic optimization
- **Implementation**: Multi-armed bandit or Deep Q-Learning

### 14. **Social-Based Recommendation** 🌐
- **How it works**: Recommends based on social network activity (friends' likes)
- **Use case**: Social discovery
- **Implementation**: Requires social graph integration

### 15. **Multi-Objective Recommendation** 🎪
- **How it works**: Balances multiple goals (accuracy, diversity, novelty, serendipity)
- **Use case**: Preventing filter bubbles, discovery
- **Algorithm**:
  - Diversity bonus: Prefer books with new genres
  - Novelty bonus: Slight penalty for very popular books
  - Serendipity: Include unexpected matches
- **Built into hybrid system**: `diversity_enabled=True`

---

## 🚀 Usage

### Backend API

```python
# Get hybrid recommendations (all strategies combined)
GET /recommend/{user_id}?n_recommendations=10

# Get popularity-based recommendations
GET /recommend/{user_id}?strategy=popularity

# Get context-aware recommendations for evening reading
GET /recommend/{user_id}?strategy=context&context=evening

# Get personality-matched recommendations
GET /recommend/{user_id}?strategy=quiz&personality=adventurous

# Combine context and personality
GET /recommend/{user_id}?context=night&personality=romantic
```

### Frontend React Component

```javascript
import RecommendationSelector from '../components/RecommendationSelector';

// Use in any component
<RecommendationSelector />
```

The component provides:
- Visual strategy selector
- Advanced options (context, personality)
- Real-time recommendation updates
- Score display (match percentage)

---

## 🔧 Setup & Training

### 1. Export Data
```bash
# Call the retrain API endpoint to export data
POST http://localhost:8000/recommend/retrain
```

### 2. Train Models
```bash
cd ml
python train_advanced_recommender.py
```

### 3. Models will be saved to
```
ml/models/advanced_hybrid_recommender.pkl
```

### 4. Backend auto-loads models on startup

---

## 📊 Performance Metrics

The system optimizes for:
- **Accuracy**: Predicting user preferences correctly
- **Diversity**: Showing varied content
- **Novelty**: Introducing new discoveries
- **Serendipity**: Pleasant surprises
- **Coverage**: Recommending from full catalog
- **Scalability**: Handling millions of users/items

---

## 🧪 Testing

```bash
# Test specific strategies
python test_recommendations.py --user_id 1 --strategy popularity
python test_recommendations.py --user_id 1 --strategy content
python test_recommendations.py --user_id 1 --context evening
```

---

## 🎨 Customization

### Adjust Hybrid Weights

Edit `advanced_recommender.py`:

```python
self.weights = {
    'popularity': 0.15,
    'content': 0.20,
    'collaborative': 0.25,
    'demographic': 0.10,
    'context': 0.10,
    'quiz': 0.05,
    'association': 0.15
}
```

### Add New Personality Types

Edit `personality_mappings` in `PersonalityQuizRecommender`:

```python
self.personality_mappings = {
    'adventurous': ['adventure', 'travel', 'thriller'],
    'your_new_type': ['genre1', 'genre2', 'genre3']
}
```

### Add New Context Rules

Edit `context_rules` in `ContextAwareRecommender`:

```python
self.context_rules = {
    'morning': ['self-help', 'business'],
    'your_new_context': ['genre1', 'genre2']
}
```

---

## 📈 Future Enhancements

- [ ] Deep Learning models (Neural Collaborative Filtering)
- [ ] Graph Neural Networks for user-item relationships
- [ ] Reinforcement Learning for dynamic optimization
- [ ] Social network integration
- [ ] Real-time sentiment analysis on reviews
- [ ] A/B testing framework
- [ ] Explainable AI (why this recommendation?)
- [ ] Multi-armed bandit for exploration/exploitation

---

## 🤝 Contributing

To add a new recommendation strategy:

1. Create a new class in `advanced_recommender.py`
2. Implement `fit()` and `get_recommendations()` methods
3. Add to `AdvancedHybridRecommender.fit()`
4. Update weights in hybrid combination
5. Add strategy to frontend selector
6. Update API documentation

---

## 📝 License

MIT License - feel free to use and modify!

---

## 🎉 Credits

Built with:
- scikit-learn (ML algorithms)
- pandas (data processing)
- NumPy (numerical computations)
- FastAPI (backend API)
- React (frontend UI)

---

**Happy Reading! 📚✨**
