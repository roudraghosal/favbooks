# 🧪 Testing the Social Media Sticker System

## Quick Test Checklist

### ✅ Phase 1: Backend Testing

#### 1. Check Server Health
```bash
# Test if backend is running
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

#### 2. Test API Docs
- Open: http://localhost:8000/docs
- Should see all `/achievements/*` endpoints
- Look for:
  - GET /achievements/stats
  - GET /achievements/achievements
  - POST /achievements/stickers/generate
  - And 12 more endpoints

#### 3. Test Database Tables
```bash
cd backend
python -c "from app.core.database import engine; from sqlalchemy import inspect; print([table for table in inspect(engine).get_table_names() if 'achievement' in table or 'streak' in table or 'challenge' in table or 'quiz' in table or 'sticker' in table])"
```
Expected output: List of achievement-related tables

### ✅ Phase 2: Frontend Testing

#### 1. Check Achievements Page Access
- Go to: http://localhost:3000
- Login with your account
- Look for "Achievements" link in navbar
- Click it

**Expected Result:**
- Page loads without errors
- Shows achievement dashboard
- Displays user stats (books, streak, reviews, achievements)

#### 2. Verify Console
- Open browser DevTools (F12)
- Check Console tab
- Should see NO red errors
- May see API calls to `/achievements/stats`, `/achievements/progress`, etc.

### ✅ Phase 3: Achievement Unlocking

#### Test Scenario: Unlock Your First Achievement

**Steps:**
1. Go to home page
2. Browse books (or click "Browse Books")
3. Click on a book
4. Rate it (give 1-5 stars)
5. Optionally write a review
6. Click submit

**What Happens Behind the Scenes:**
- Rating saved ✅
- Reading streak updated ✅
- Achievements checked automatically ✅
- If you hit a milestone (e.g., 10 books), achievement unlocks! 🎉

**To Speed Up Testing:**
Rate 10 books quickly to unlock "Verified Book Explorer"

#### Check Achievement Status
1. Go to http://localhost:3000/achievements
2. Click "Check for New Achievements" button
3. Should see popup if anything unlocked

### ✅ Phase 4: Sticker Generation

#### Test Sticker Creation

**Prerequisites:**
- Must have at least 1 unlocked achievement

**Steps:**
1. Go to Achievements page
2. Find an unlocked achievement card
3. Click "Generate Sticker" button
4. Wait 2-3 seconds

**Expected Result:**
- Modal opens with sticker preview
- Sticker shows:
  - Your username
  - Badge icon (emoji)
  - Achievement title
  - Milestone value
  - Date unlocked
  - Gradient background
  - Confetti effects
- Download button visible
- Share buttons visible (Instagram, WhatsApp, Twitter)

### ✅ Phase 5: Download & Share

#### Test Download
1. In sticker modal, click "Download Sticker"
2. Check your downloads folder
3. File should be named: `achievement-[badge-type]-[timestamp].png`
4. Open the PNG file

**Expected:**
- 1080 x 1920 pixels
- High quality image
- All text readable
- Gradient background visible

#### Test Share Buttons
1. Click "Instagram" button
2. Should see alert with instructions
3. Message copied to clipboard
4. Paste somewhere to verify

Repeat for WhatsApp and Twitter buttons.

### ✅ Phase 6: Progress Tracking

#### Test Progress Bars

**View Progress:**
1. Go to Achievements page
2. Scroll to "Achievement Progress" section
3. Should see locked achievements with progress bars

**Example Progress:**
```
Genre Master
  Genres Explored: 3/5 (60%)
  ████████░░ 60%
  
  Books Read: 12/15 (80%)
  ████████░░ 80%
```

**Test Progress Update:**
1. Note current progress (e.g., 8/10 books)
2. Rate one more book
3. Go back to Achievements page
4. Click "Check for New Achievements"
5. Progress should update (9/10 books)

### ✅ Phase 7: Challenges & Quizzes

#### Test Challenges
1. Go to Achievements page
2. Look for challenges section (or navigate via API: http://localhost:8000/achievements/challenges)
3. Should see 5 pre-loaded challenges:
   - Book Explorer Challenge
   - 30-Day Reading Streak
   - Genre Explorer
   - Review Master
   - Book Collector

**Join a Challenge:**
1. Click "Join Challenge" (if UI implemented)
2. Or test via API:
```bash
curl -X POST http://localhost:8000/achievements/challenges/1/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Quizzes
**View Available Quizzes:**
```bash
curl http://localhost:8000/achievements/quizzes
```

**Submit Quiz Attempt:**
```bash
curl -X POST http://localhost:8000/achievements/quizzes/attempt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"quiz_id": 1, "score": 95}'
```

Should unlock Quiz Champion if score >= 90!

### ✅ Phase 8: Streak Testing

#### Test Reading Streak

**Day 1:**
1. Rate a book today
2. Check streak: http://localhost:3000/achievements
3. Should show: Current Streak: 1 day

**Day 2:**
1. Rate a book tomorrow
2. Streak increments: Current Streak: 2 days

**Skip a Day:**
1. Don't rate anything for 24+ hours
2. Rate a book after gap
3. Streak resets: Current Streak: 1 day

**Unlock Streak Master:**
- Maintain streak for 30 consecutive days
- Achievement unlocks automatically!

### ✅ Phase 9: API Testing

#### Test with Postman/Thunder Client

**1. Get User Stats**
```
GET http://localhost:8000/achievements/stats
Authorization: Bearer YOUR_TOKEN
```

Expected Response:
```json
{
  "books_read": 15,
  "reviews_written": 8,
  "streak_days": 5,
  "quiz_score": 0,
  "challenges_completed": 0,
  "genres_explored": 3,
  "ratings_given": 15,
  "wishlist_size": 12
}
```

**2. Get Achievements**
```
GET http://localhost:8000/achievements/achievements
Authorization: Bearer YOUR_TOKEN
```

**3. Generate Sticker**
```
POST http://localhost:8000/achievements/stickers/generate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "achievement_id": 1,
  "platform": "instagram"
}
```

Response includes base64 image!

### ✅ Phase 10: Error Handling

#### Test Error Cases

**1. Unauthenticated Access**
```bash
curl http://localhost:8000/achievements/stats
```
Expected: 401 Unauthorized

**2. Invalid Achievement ID**
```bash
curl -X POST http://localhost:8000/achievements/stickers/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"achievement_id": 99999, "platform": "instagram"}'
```
Expected: 404 Not Found

**3. Missing Required Fields**
```bash
curl -X POST http://localhost:8000/achievements/quizzes/attempt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quiz_id": 1}'
```
Expected: 422 Validation Error

## 🎯 Success Criteria

### Backend ✅
- [ ] All 15 API endpoints responding
- [ ] Database tables created
- [ ] Sample challenges loaded (5)
- [ ] Sample quizzes loaded (3)
- [ ] Sticker generation working
- [ ] No server errors in logs

### Frontend ✅
- [ ] Achievements page loads
- [ ] Stats displayed correctly
- [ ] Progress bars showing
- [ ] Sticker modal opens
- [ ] Download works
- [ ] No console errors

### Features ✅
- [ ] Achievements auto-unlock on book rating
- [ ] Reading streak updates daily
- [ ] Progress tracking accurate
- [ ] Sticker generation < 3 seconds
- [ ] Downloaded stickers are 1080x1920px
- [ ] Share buttons functional

## 🐛 Common Issues & Fixes

### Issue: Achievements page shows no data
**Fix:**
1. Check if logged in
2. Rate some books first
3. Click "Check for New Achievements"

### Issue: Sticker generation fails
**Fix:**
1. Check browser console for errors
2. Verify Pillow is installed: `pip show Pillow`
3. Check backend logs for errors

### Issue: Downloaded sticker is corrupted
**Fix:**
1. Check file size (should be 500KB-1MB)
2. Try different browser
3. Regenerate sticker

### Issue: Progress bars not updating
**Fix:**
1. Hard refresh page (Ctrl+Shift+R)
2. Click "Check for New Achievements"
3. Check database connection

## 📊 Test Data

### Quick Achievement Unlock

To quickly test the system:

**Option 1: Modify Thresholds (Testing Only)**
Edit `milestone_tracker.py` temporarily:
```python
MILESTONE_THRESHOLDS = {
    BadgeType.VERIFIED_EXPLORER: {
        MilestoneType.BOOKS_READ: 3,  # Changed from 10
        ...
    }
}
```

**Option 2: Create Test Data**
```python
# backend/create_test_achievements.py
from app.core.database import SessionLocal
from app.models.achievements import UserAchievement, BadgeType, MilestoneType

db = SessionLocal()
achievement = UserAchievement(
    user_id=1,  # Your user ID
    badge_type=BadgeType.VERIFIED_EXPLORER,
    milestone_type=MilestoneType.BOOKS_READ,
    milestone_value=10
)
db.add(achievement)
db.commit()
```

## 🎉 Final Checklist

Before considering testing complete:

- [ ] Rated at least 10 books
- [ ] Unlocked at least 1 achievement
- [ ] Generated at least 1 sticker
- [ ] Downloaded a sticker successfully
- [ ] Verified sticker dimensions (1080x1920)
- [ ] Tested on mobile (responsive)
- [ ] Checked all console logs (no errors)
- [ ] Tested API endpoints with Postman
- [ ] Verified database records created
- [ ] Tested share button functionality

## 🚀 Performance Testing

### Sticker Generation Speed
- Should complete in < 3 seconds
- Measure: Open DevTools → Network tab
- Generate sticker, check request time

### Page Load Times
- Achievements page: < 2 seconds
- Sticker preview: < 1 second
- API responses: < 500ms

### Concurrent Users
- Test multiple browsers/accounts
- All should work independently
- No conflicts in achievement unlocking

---

## 📝 Test Report Template

```
Test Date: _____________
Tester: ________________

Backend:
- Server Running: ☐ Yes ☐ No
- API Endpoints: ☐ All Working ☐ Some Issues
- Database Tables: ☐ Created ☐ Missing

Frontend:
- Page Loads: ☐ Yes ☐ No
- Stats Display: ☐ Correct ☐ Incorrect
- Sticker Modal: ☐ Opens ☐ Doesn't Open

Features:
- Achievement Unlock: ☐ Working ☐ Not Working
- Sticker Generation: ☐ Working ☐ Not Working
- Download: ☐ Working ☐ Not Working
- Share: ☐ Working ☐ Not Working

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Status: ☐ PASS ☐ FAIL

Notes:
_________________________________
_________________________________
```

---

**Happy Testing! 🧪✨**

If everything passes, you have a fully functional Social Media Sticker System! 🎉
