# WhichBook+ Setup Guide

## Overview
WhichBook+ is a comprehensive book discovery platform with:
- **Mood-based discovery**: 8 slider system to find books by emotion
- **World map exploration**: Interactive 3D globe showing books by country
- **Creator portal**: Writers can upload quotes, poetry, and stories
- **Admin moderation**: Review content and handle Flipkart publishing requests
- **Traditional recommendations**: Existing ML-based book suggestions

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose[cryptography] passlib[bcrypt] python-multipart numpy
```

Optional (for file handling):
```bash
pip install PyPDF2 python-docx
```

### 2. Run Database Migration

Create all WhichBook+ tables:
```bash
python migrate_whichbook.py
```

### 3. Populate Sample Data

Add sample mood books, countries, admin, and creator accounts:
```bash
python seed_whichbook_data.py
```

This will create:
- 10 sample mood books from different countries
- 15 countries for world map
- Admin account: `admin@whichbook.com` / `admin123`
- Creator account: `jane@example.com` / `creator123`

### 4. Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Mood Discovery
- `POST /api/mood/recommend` - Get book recommendations based on mood sliders
- `GET /api/mood/books` - List all mood books (with country filter)
- `GET /api/mood/books/{id}` - Get book details
- `POST /api/mood/books` - Create new mood book (admin)
- `GET /api/mood/worldmap/countries` - Get countries for map
- `GET /api/mood/worldmap/books-by-country` - Get statistics by country
- `POST /api/mood/auto-tag-mood` - Auto-generate mood vector from description

### Creator Portal
- `POST /api/creator/register` - Register new creator
- `POST /api/creator/login` - Creator login
- `GET /api/creator/me` - Get current creator profile
- `POST /api/creator/upload` - Upload text content (quote/poem/story)
- `POST /api/creator/upload-file` - Upload PDF/DOC file
- `GET /api/creator/dashboard` - Get creator's content
- `GET /api/creator/content` - Get all approved content (public)
- `GET /api/creator/content/{id}` - Get content details
- `POST /api/creator/publish-request` - Request Flipkart publishing
- `POST /api/creator/like` - Like content
- `POST /api/creator/comment` - Comment on content
- `GET /api/creator/comments/{id}` - Get content comments

### Admin Panel
- `POST /api/admin/login` - Admin login
- `GET /api/admin/pending-content` - Get content awaiting approval
- `POST /api/admin/review-content` - Approve/reject content
- `GET /api/admin/flipkart-requests` - Get all publishing requests
- `POST /api/admin/flipkart-requests/{id}/update-status` - Update request status
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/content/search` - Search content

## Mood Vector System

Each book has an 8-dimensional mood vector (0-10 scale):
1. **happy** ↔️ **sad**
2. **calm** ↔️ **thrilling**
3. **dark** ↔️ **funny**
4. **emotional** ↔️ **optimistic**

Example mood vectors:
- **Gone Girl**: `[2, 6, 3, 9, 9, 3, 7, 2]` - Dark, thrilling psychological thriller
- **The Hitchhiker's Guide**: `[8, 1, 4, 7, 2, 10, 4, 8]` - Happy, funny sci-fi comedy
- **Norwegian Wood**: `[3, 8, 7, 2, 5, 2, 9, 3]` - Sad, calm, emotional love story

## Testing the API

### 1. Get Mood Recommendations

```bash
curl -X POST http://localhost:8000/api/mood/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "mood": {
      "happy": 8,
      "sad": 2,
      "calm": 6,
      "thrilling": 7,
      "dark": 2,
      "funny": 9,
      "emotional": 4,
      "optimistic": 8
    },
    "filters": {
      "complexity_min": 1,
      "complexity_max": 7
    },
    "limit": 5
  }'
```

### 2. Get Books by Country

```bash
curl http://localhost:8000/api/mood/books?country=Japan
```

### 3. Register Creator

```bash
curl -X POST http://localhost:8000/api/creator/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Writer",
    "email": "john@example.com",
    "username": "john_writes",
    "password": "password123",
    "bio": "Aspiring poet and storyteller"
  }'
```

### 4. Upload Content

```bash
curl -X POST http://localhost:8000/api/creator/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Poem",
    "category": "poem",
    "content_text": "Roses are red, violets are blue..."
  }'
```

### 5. Admin Review Content

```bash
curl -X POST http://localhost:8000/api/admin/review-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "content_id": 1,
    "action": "approve",
    "admin_comment": "Great content!"
  }'
```

## Next Steps: Frontend

To complete WhichBook+, you need to create:

1. **Frontend Templates** (Jinja2 + Tailwind CSS):
   - `index.html` - Mood sliders interface
   - `worldmap.html` - 3D globe visualization (Three.js/Plotly)
   - `creator_upload.html` - Creator upload form
   - `creator_dashboard.html` - Creator content management
   - `admin_dashboard.html` - Admin moderation panel
   - `book.html` - Book detail page
   - `about.html` - About page

2. **3D World Map** (Three.js or Plotly):
   - Interactive globe showing book counts by country
   - Click countries to filter books
   - Heatmap visualization

3. **Character & Plot Filters**:
   - Add character types and plot elements to database
   - Create filtering API endpoints

4. **Bestsellers Module**:
   - Weekly/Monthly/All-time lists
   - API endpoints for bestseller lists

## Database Schema

### New Tables
- `mood_books` - Books with mood vectors and geographic data
- `creators` - Writer accounts
- `creator_content` - Uploaded quotes/poems/stories
- `content_comments` - Comments on creator content
- `content_likes` - Likes on creator content
- `admins` - Admin users for moderation
- `bestseller_lists` - Curated book lists
- `world_map_countries` - Country data for map visualization

## Security Notes

⚠️ **Important**: The current implementation uses simplified authentication. For production:

1. Implement proper JWT token validation in all protected routes
2. Add role-based access control (RBAC)
3. Implement rate limiting
4. Add file upload validation and virus scanning
5. Set up HTTPS
6. Configure proper CORS origins
7. Add input sanitization
8. Implement email verification for creators
9. Set up email notifications for Flipkart requests

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Troubleshooting

### Import Errors
If you see `ModuleNotFoundError`, make sure you're in the backend directory and all dependencies are installed.

### Database Errors
If tables don't exist, run the migration script:
```bash
python migrate_whichbook.py
```

### Type Errors
The codebase uses type ignore comments for SQLAlchemy Column operations. This is intentional and safe.

## Contributing

To extend WhichBook+:

1. **Add new mood dimensions**: Update `MoodVector` schema in `schemas/whichbook.py`
2. **Add content categories**: Extend `category` field in `CreatorContent` model
3. **Add publishing platforms**: Extend beyond Flipkart in publishing request system
4. **Add AI features**: Implement smarter auto-tagging using NLP models

## License

This project is part of the Bookify platform.
