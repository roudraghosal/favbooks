# 🎨 Dynamic Social Media Sticker System

## Overview

A complete social media sticker generation system that automatically creates Instagram-ready animated stickers when users unlock achievements in the book recommendation app.

## ✨ Features

### 🏆 Achievement System

**10 Badge Types:**
- 🔖 **Verified Book Explorer** - Read 10 books, write 5 reviews, or maintain a 7-day streak
- 🔥 **Reading Streak Master** - Maintain a 30-day reading streak
- 📚 **Genre Master** - Explore 5 different genres and read 15 books
- 🏆 **Quiz Champion** - Score 90%+ on quizzes
- ⭐ **Challenge Winner** - Complete 3 reading challenges
- 📖 **Book Collector** - Read 50 books total
- ✍️ **Review Expert** - Write 25 book reviews
- 🌅 **Early Bird Reader** - Read in the morning hours
- 🌙 **Night Owl Reader** - Read late at night
- ⚡ **Speed Reader** - Complete books quickly

**8 Milestone Types:**
- Books Read
- Reviews Written
- Reading Streak Days
- Quiz Scores
- Challenges Completed
- Genres Explored
- Ratings Given
- Wishlist Size

### 📱 Sticker Features

#### Automatic Generation
- **Instagram Story Optimized**: 1080x1920px perfect for Instagram Stories
- **Gradient Backgrounds**: Beautiful color schemes for each badge type
- **Badge Icons**: Custom star/trophy designs
- **User Personalization**: Includes username and achievement details
- **Confetti Effects**: Decorative celebratory elements

#### Social Sharing
- **Multi-Platform**: Instagram, WhatsApp, Twitter, Facebook
- **One-Click Download**: Download stickers as PNG images
- **Share Tracking**: Track downloads and shares per sticker
- **Copy-Paste Messages**: Pre-formatted social media captions

#### Mobile Optimization
- Correct resolution for Instagram Stories (1080x1920px)
- High-quality PNG format (95% quality)
- Base64 encoding for easy transfer
- Graceful fallback for missing user data

## 🚀 API Endpoints

### Achievement Stats
```
GET /achievements/stats
```
Get comprehensive user statistics (books read, streak, reviews, etc.)

**Response:**
```json
{
  "books_read": 15,
  "reviews_written": 8,
  "streak_days": 12,
  "quiz_score": 85,
  "challenges_completed": 2,
  "genres_explored": 4,
  "ratings_given": 15,
  "wishlist_size": 23
}
```

### User Achievements
```
GET /achievements/achievements
```
Get all unlocked achievements for the current user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "badge_type": "verified_explorer",
    "milestone_type": "books_read",
    "milestone_value": 10,
    "unlocked_at": "2025-10-08T10:30:00Z",
    "is_shared": true,
    "share_count": 5
  }
]
```

### Check for New Achievements
```
POST /achievements/achievements/check
```
Manually check if user has unlocked new achievements.

**Response:**
```json
{
  "newly_unlocked": 2,
  "achievements": [
    {
      "id": 1,
      "badge_type": "verified_explorer",
      "milestone_type": "books_read",
      "milestone_value": 10
    }
  ]
}
```

### Achievement Progress
```
GET /achievements/progress
```
Get detailed progress towards all achievements.

**Response:**
```json
{
  "stats": { ... },
  "achievements": [ ... ],
  "progress": {
    "verified_explorer": {
      "unlocked": false,
      "unlocked_at": null,
      "requirements": {
        "books_read": {
          "current": 8,
          "required": 10,
          "percentage": 80
        }
      }
    }
  },
  "streak": {
    "current_streak": 5,
    "longest_streak": 12,
    "last_activity_date": "2025-10-08T09:00:00Z"
  }
}
```

### Generate Sticker
```
POST /achievements/stickers/generate
Body: {
  "achievement_id": 1,
  "platform": "instagram"
}
```
Generate a social media sticker for an achievement.

**Response:**
```json
{
  "id": 1,
  "sticker_type": "badge",
  "sticker_url": null,
  "image_data": "data:image/png;base64,iVBORw0KG...",
  "width": 1080,
  "height": 1920,
  "format": "png",
  "metadata": {
    "badge_type": "verified_explorer",
    "milestone_value": 10,
    "milestone_type": "books_read",
    "generated_at": "2025-10-08T10:35:00Z"
  },
  "download_count": 0,
  "created_at": "2025-10-08T10:35:00Z"
}
```

### Download Sticker
```
POST /achievements/stickers/{sticker_id}/download
```
Track sticker download.

### Share Sticker
```
POST /achievements/stickers/{sticker_id}/share
Body: {
  "sticker_id": 1,
  "platform": "instagram"
}
```
Track sticker share and get platform-specific share message.

**Response:**
```json
{
  "success": true,
  "share_url": null,
  "message": "🎉 I just unlocked a new badge on BookRecommender! Check out my achievement! #BookRecommender #Reading"
}
```

### Reading Challenges
```
GET /achievements/challenges
```
Get all active reading challenges.

```
POST /achievements/challenges/{challenge_id}/join
```
Join a reading challenge.

```
GET /achievements/challenges/my
```
Get user's active challenges.

### Quizzes
```
GET /achievements/quizzes
```
Get all available quizzes.

```
POST /achievements/quizzes/attempt
Body: {
  "quiz_id": 1,
  "score": 85
}
```
Submit a quiz attempt.

## 🎨 Frontend Components

### AchievementsDashboard
Main dashboard page showing:
- User statistics (books read, streak, reviews, achievements count)
- Unlocked achievements with "Generate Sticker" buttons
- Progress bars for locked achievements
- Real-time achievement checking

### AchievementNotification
Pop-up notification when achievements are unlocked:
- Animated confetti effects
- Badge icon and details
- "Share on Social Media" button
- Auto-dismisses after 10 seconds

### Sticker Preview Modal
Full-screen modal for viewing and sharing stickers:
- Large sticker preview
- Download button
- Platform-specific share buttons (Instagram, WhatsApp, Twitter)
- Share message copy functionality
- Instagram optimization tips

## 🔄 Automatic Tracking

Achievements are automatically checked when users:
1. **Rate a book** - Triggers streak update and achievement check
2. **Write a review** - Updates review count
3. **Complete a quiz** - Records score and checks quiz achievements
4. **Join/complete challenges** - Updates challenge progress

## 📊 Database Schema

### user_achievements
```sql
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    badge_type VARCHAR NOT NULL,
    milestone_type VARCHAR NOT NULL,
    milestone_value INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### user_streaks
```sql
CREATE TABLE user_streaks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### reading_challenges
```sql
CREATE TABLE reading_challenges (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    challenge_type VARCHAR NOT NULL,
    target_value INTEGER NOT NULL,
    duration_days INTEGER,
    reward_badge VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### sticker_generations
```sql
CREATE TABLE sticker_generations (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER,
    sticker_type VARCHAR NOT NULL,
    sticker_url VARCHAR,
    sticker_data TEXT,
    download_count INTEGER DEFAULT 0,
    share_platform VARCHAR,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES user_achievements(id)
);
```

## 🎯 Usage Example

### 1. User Rates 10 Books

```javascript
// Frontend: User rates a book
const response = await api.createRating(bookId, rating, review);

// Backend automatically:
// 1. Updates reading streak
// 2. Checks for new achievements
// 3. Returns newly unlocked achievements

if (response.newly_unlocked_achievements?.length > 0) {
  // Show achievement notification
  showAchievementNotification(response.newly_unlocked_achievements[0]);
}
```

### 2. Generate and Share Sticker

```javascript
// Generate sticker
const sticker = await achievementsAPI.generateSticker(achievementId, 'instagram');

// Download sticker
const link = document.createElement('a');
link.href = sticker.image_data;
link.download = `achievement-${achievementId}.png`;
link.click();

// Share on Instagram
const shareResult = await achievementsAPI.shareSticker(sticker.id, 'instagram');
navigator.clipboard.writeText(shareResult.message);
alert('Message copied! Now upload to Instagram Stories!');
```

### 3. Check Progress

```javascript
// Get achievement progress
const progress = await achievementsAPI.getProgress();

// Display progress bars
Object.entries(progress.progress).forEach(([badgeType, data]) => {
  if (!data.unlocked) {
    Object.entries(data.requirements).forEach(([milestone, info]) => {
      console.log(`${milestone}: ${info.current}/${info.required} (${info.percentage}%)`);
    });
  }
});
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install Pillow
```

### 2. Initialize Achievement Tables

```bash
cd backend
python init_achievements.py
```

### 3. Start Servers

```bash
# Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm start
```

### 4. Access Achievements

Navigate to http://localhost:3000/achievements

## 🎨 Color Schemes

Each badge type has a unique gradient:

- **Verified Explorer**: Purple to Indigo
- **Reading Streak**: Red to Pink
- **Genre Master**: Green to Emerald
- **Quiz Champion**: Blue to Cyan
- **Challenge Winner**: Pink to Rose
- **Book Collector**: Yellow to Amber
- **Review Expert**: Indigo to Purple
- **Early Bird**: Orange to Yellow
- **Night Owl**: Dark Indigo to Purple
- **Speed Reader**: Cyan to Blue

## 📱 Instagram Story Tips

1. **Perfect Sizing**: Stickers are exactly 1080x1920px
2. **High Quality**: 95% PNG quality for crisp images
3. **Ready to Share**: No editing needed
4. **Copy Message**: One-click copy for captions
5. **Professional Look**: Gradient backgrounds and clean design

## 🔐 Security

- **Authentication Required**: All achievement endpoints require login
- **User Ownership**: Users can only generate stickers for their own achievements
- **Rate Limiting**: Prevent abuse of sticker generation
- **Data Validation**: All inputs validated with Pydantic schemas

## 🚀 Future Enhancements

- [ ] Animated GIF stickers with motion effects
- [ ] Video stickers (MP4) for Instagram Stories
- [ ] Custom sticker templates
- [ ] Leaderboards for achievements
- [ ] Social feed of user achievements
- [ ] Badge rarity system
- [ ] Achievement categories and collections
- [ ] Seasonal/limited-time badges
- [ ] Team challenges
- [ ] Achievement trading

## 📞 Support

For issues or questions about the sticker system, please check:
- API documentation at http://localhost:8000/docs
- Database schema in `backend/app/models/achievements.py`
- Frontend components in `frontend/src/pages/AchievementsDashboard.jsx`

---

**Built with ❤️ for book lovers who love to share their achievements!** 📚✨
