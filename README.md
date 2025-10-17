# BookHub - AI-Powered Book Recommendation System

BookHub is a full-stack book recommendation platform that uses machine learning to provide personalized book suggestions. Built with FastAPI, React, and PostgreSQL, it features a Spotify-inspired design and includes both content-based and collaborative filtering recommendation algorithms.

## 🌟 Features

### Core Features
- **AI-Powered Recommendations**: Hybrid recommendation system combining content-based and collaborative filtering
- **Smart Search**: Real-time book search with autocomplete and advanced filters
- **User Management**: JWT-based authentication with admin and user roles
- **Wishlist & Ratings**: Personal book management and rating system
- **Audio Previews**: Built-in audio player for book previews
- **Responsive Design**: Spotify-inspired UI that works on all devices

### Admin Features
- **Book Management**: Full CRUD operations for books
- **User Analytics**: Track user engagement and reading patterns
- **Model Management**: Retrain recommendation models with new data

### Technical Features
- **RESTful API**: Well-documented FastAPI backend
- **Real-time Updates**: Live search suggestions and recommendations
- **Scalable Architecture**: Docker-based microservices
- **ML Pipeline**: Automated model training and deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   PostgreSQL    │
│                 │    │                 │    │    Database     │
│  • UI Components│    │  • API Routes   │    │                 │
│  • State Mgmt   │◄──►│  • Auth System  │◄──►│  • User Data    │
│  • Routing      │    │  • ML Service   │    │  • Book Data    │
│  • Auth Context │    │  • Data Models  │    │  • Ratings      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   ML Pipeline   │
                       │                 │
                       │  • TF-IDF       │
                       │  • SVD/ALS      │
                       │  • Hybrid Model │
                       │  • Auto-retrain │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-recommendation-system
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Initialize sample data**
   ```bash
   # Generate sample books and ratings
   docker-compose exec backend python ml/sample_data.py
   
   # Train initial ML models
   docker-compose exec backend python ml/train.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   # Install PostgreSQL and create database
   createdb bookdb
   
   # Set DATABASE_URL in .env
   DATABASE_URL=postgresql://username:password@localhost/bookdb
   ```

5. **Run migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |

### Book Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Get books with filtering/pagination |
| GET | `/books/{id}` | Get specific book |
| POST | `/books` | Create book (admin only) |
| PUT | `/books/{id}` | Update book (admin only) |
| DELETE | `/books/{id}` | Delete book (admin only) |
| GET | `/books/search` | Search books with autocomplete |
| GET | `/books/surprise` | Get random high-rated books |

### Recommendation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommend/{user_id}` | Get user recommendations |
| POST | `/recommend/retrain` | Trigger model retraining |

### Rating & Wishlist Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ratings` | Create/update rating |
| GET | `/ratings/user/{user_id}` | Get user ratings |
| POST | `/wishlist` | Add to wishlist |
| GET | `/wishlist` | Get user wishlist |
| DELETE | `/wishlist/{book_id}` | Remove from wishlist |

## 🤖 Machine Learning Pipeline

### Recommendation Algorithm

The system uses a hybrid approach combining:

1. **Content-Based Filtering**
   - TF-IDF vectorization of book descriptions and genres
   - Cosine similarity for finding similar books
   - Handles cold-start problem for new users

2. **Collaborative Filtering**
   - SVD (Singular Value Decomposition) for matrix factorization
   - Predicts user ratings for unrated books
   - Learns from user behavior patterns

3. **Hybrid Scoring**
   - Weighted combination of both approaches
   - Configurable weights (default: 40% content, 60% collaborative)
   - Fallback to popular books for edge cases

### Model Training

```bash
# Train models with current data
python ml/train.py

# Force retrain regardless of data changes
python ml/train.py --force

# Set custom threshold for auto-retraining
python ml/train.py --threshold 50
```

### Sample Data Generation

```bash
# Generate sample books and ratings
python ml/sample_data.py
```

## 🎨 Frontend Features

### Pages

- **Home**: Featured books, personalized recommendations, trending books
- **Search**: Advanced search with filters and real-time suggestions
- **Book Details**: Detailed book information with audio preview
- **Library**: User's wishlist and reading history
- **Admin Panel**: Book management and analytics (admin only)

### Components

- **BookCard**: Reusable book display component with hover effects
- **Navbar**: Responsive navigation with search integration
- **Layout**: Consistent page layout with header and footer
- **Auth Forms**: Login and registration with form validation

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Spotify-inspired Design**: Dark theme with green accents
- **Responsive Grid**: Adaptive book grid layout
- **Smooth Animations**: Hover effects and transitions

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost/bookdb
SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
```

### Docker Configuration

- **Backend**: Python 3.11 with FastAPI and ML libraries
- **Frontend**: Node.js build with Nginx serving
- **Database**: PostgreSQL 15 with persistent storage
- **Redis**: Optional caching layer

## 🚀 Deployment

### Render Deployment

1. **Backend on Render**
   ```bash
   # Build Command
   pip install -r requirements.txt
   
   # Start Command
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Frontend on Vercel**
   ```bash
   # Build Command
   npm run build
   
   # Output Directory
   build
   ```

### Docker Production

```bash
# Build and run with production config
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
# Using Cypress
npm run test:e2e
```

## 📈 Performance Optimization

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for frequent data access
- **Pagination**: Efficient data loading with limit/offset
- **Background Tasks**: Async model training and data processing

### Frontend
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Optimization**: Tree shaking and minification
- **CDN**: Static asset delivery via CDN

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure password storage
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Pydantic models for API validation
- **SQL Injection Prevention**: SQLAlchemy ORM protection

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature-name`
3. **Commit changes**: `git commit -am 'Add feature'`
4. **Push to branch**: `git push origin feature-name`
5. **Submit pull request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript formatting
- Write tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: FastAPI, PostgreSQL, ML Pipeline
- **Frontend Development**: React, Tailwind CSS, UI/UX
- **DevOps**: Docker, CI/CD, Deployment
- **Data Science**: Recommendation algorithms, Model training

## 🙏 Acknowledgments

- **Spotify**: Design inspiration
- **The Movie Database**: API structure inspiration
- **Scikit-learn**: Machine learning algorithms
- **FastAPI**: Modern Python web framework
- **React**: Frontend framework

---

**BookHub** - Discover your next favorite book with AI! 📚✨