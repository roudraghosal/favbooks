"""
Milestone and Achievement Tracking Service
Automatically tracks user progress and unlocks badges
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, update
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from backend.app.models import User, Rating, Wishlist, Book
from backend.app.models.achievements import (
    UserAchievement, UserStreak, ReadingChallenge, 
    ChallengeParticipation, Quiz, QuizAttempt,
    BadgeType, MilestoneType
)


class MilestoneTracker:
    """Track user milestones and unlock achievements"""
    
    # Milestone thresholds for different badges
    MILESTONE_THRESHOLDS = {
        BadgeType.VERIFIED_EXPLORER: {
            MilestoneType.BOOKS_READ: 10,
            MilestoneType.REVIEWS_WRITTEN: 5,
            MilestoneType.STREAK_DAYS: 7
        },
        BadgeType.READING_STREAK: {
            MilestoneType.STREAK_DAYS: 30
        },
        BadgeType.GENRE_MASTER: {
            MilestoneType.GENRES_EXPLORED: 5,
            MilestoneType.BOOKS_READ: 15
        },
        BadgeType.QUIZ_CHAMPION: {
            MilestoneType.QUIZ_SCORE: 90
        },
        BadgeType.CHALLENGE_WINNER: {
            MilestoneType.CHALLENGES_COMPLETED: 3
        },
        BadgeType.BOOK_COLLECTOR: {
            MilestoneType.BOOKS_READ: 50
        },
        BadgeType.REVIEW_EXPERT: {
            MilestoneType.REVIEWS_WRITTEN: 25
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_and_unlock_achievements(self, user_id: int) -> List[UserAchievement]:
        """
        Check user progress and unlock any new achievements
        
        Returns:
            List of newly unlocked achievements
        """
        newly_unlocked = []
        
        # Get user stats
        stats = self.get_user_stats(user_id)
        
        # Check each badge type
        for badge_type, requirements in self.MILESTONE_THRESHOLDS.items():
            # Skip if already unlocked
            existing = self.db.query(UserAchievement).filter(
                UserAchievement.user_id == user_id,
                UserAchievement.badge_type == badge_type
            ).first()
            
            if existing:
                continue
            
            # Check if all requirements are met
            for milestone_type, threshold in requirements.items():
                if stats.get(milestone_type, 0) >= threshold:
                    # Unlock achievement
                    achievement = self._create_achievement(
                        user_id,
                        badge_type,
                        milestone_type,
                        stats.get(milestone_type, 0)
                    )
                    newly_unlocked.append(achievement)
                    break  # Only need one requirement met for now
        
        return newly_unlocked
    
    def get_user_stats(self, user_id: int) -> Dict[str, int]:
        """Get comprehensive user statistics"""
        stats = {}
        
        # Books read (ratings given)
        stats[MilestoneType.BOOKS_READ] = self.db.query(Rating).filter(
            Rating.user_id == user_id
        ).count()
        
        # Reviews written (ratings with review text)
        stats[MilestoneType.REVIEWS_WRITTEN] = self.db.query(Rating).filter(
            Rating.user_id == user_id,
            Rating.review.isnot(None),
            Rating.review != ""
        ).count()
        
        # Ratings given
        stats[MilestoneType.RATINGS_GIVEN] = stats[MilestoneType.BOOKS_READ]
        
        # Wishlist size
        stats[MilestoneType.WISHLIST_SIZE] = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id
        ).count()
        
        # Current streak
        streak = self.db.query(UserStreak).filter(
            UserStreak.user_id == user_id
        ).first()
        stats[MilestoneType.STREAK_DAYS] = streak.current_streak if streak else 0
        
        # Genres explored (unique genres from rated books)
        rated_books = self.db.query(Rating).filter(
            Rating.user_id == user_id
        ).all()
        genre_ids = set()
        for rating in rated_books:
            book = self.db.query(Book).filter(Book.id == rating.book_id).first()
            if book and book.genres:
                for genre in book.genres:
                    genre_ids.add(genre.id)
        stats[MilestoneType.GENRES_EXPLORED] = len(genre_ids)
        
        # Challenges completed
        stats[MilestoneType.CHALLENGES_COMPLETED] = self.db.query(ChallengeParticipation).filter(
            ChallengeParticipation.user_id == user_id,
            ChallengeParticipation.is_completed == True
        ).count()
        
        # Quiz score (average of passed quizzes)
        quiz_attempts = self.db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.is_passed == True  # noqa: E712
        ).all()
        if quiz_attempts:
            avg_score = sum(int(attempt.score) for attempt in quiz_attempts) / len(quiz_attempts)  # type: ignore[arg-type]
            stats[MilestoneType.QUIZ_SCORE] = int(avg_score)
        else:
            stats[MilestoneType.QUIZ_SCORE] = 0
        
        return stats
    
    def update_reading_streak(self, user_id: int) -> UserStreak:
        """Update user's reading streak based on activity"""
        streak = self.db.query(UserStreak).filter(
            UserStreak.user_id == user_id
        ).first()
        
        today = datetime.now().date()
        
        if not streak:
            # Create new streak
            streak = UserStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_activity_date=datetime.now()
            )
            self.db.add(streak)
        else:
            last_activity = streak.last_activity_date.date() if streak.last_activity_date else None  # type: ignore[union-attr]
            
            if last_activity == today:
                # Already logged activity today
                pass
            elif last_activity == today - timedelta(days=1):
                # Consecutive day - increment streak
                self.db.execute(
                    update(UserStreak)
                    .where(UserStreak.id == streak.id)
                    .values(
                        current_streak=UserStreak.current_streak + 1,
                        last_activity_date=datetime.now()
                    )
                )
                self.db.flush()
                self.db.refresh(streak)
                
                # Update longest streak if needed
                if streak.current_streak > streak.longest_streak:  # type: ignore[operator]
                    self.db.execute(
                        update(UserStreak)
                        .where(UserStreak.id == streak.id)
                        .values(longest_streak=streak.current_streak)
                    )
            else:
                # Streak broken - reset
                self.db.execute(
                    update(UserStreak)
                    .where(UserStreak.id == streak.id)
                    .values(
                        current_streak=1,
                        last_activity_date=datetime.now()
                    )
                )
        
        self.db.commit()
        self.db.refresh(streak)
        
        return streak
    
    def record_quiz_attempt(
        self, 
        user_id: int, 
        quiz_id: int, 
        score: int
    ) -> QuizAttempt:
        """Record a quiz attempt and check for achievements"""
        quiz = self.db.query(Quiz).filter(Quiz.id == quiz_id).first()
        
        if not quiz:
            raise ValueError(f"Quiz {quiz_id} not found")
        
        is_passed = score >= quiz.passing_score
        
        attempt = QuizAttempt(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            is_passed=is_passed
        )
        
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        
        # Check for achievements
        self.check_and_unlock_achievements(user_id)
        
        return attempt
    
    def update_challenge_progress(
        self,
        user_id: int,
        challenge_id: int,
        progress_increment: int = 1
    ) -> ChallengeParticipation:
        """Update progress on a challenge"""
        participation = self.db.query(ChallengeParticipation).filter(
            ChallengeParticipation.user_id == user_id,
            ChallengeParticipation.challenge_id == challenge_id
        ).first()
        
        if not participation:
            # Create new participation
            participation = ChallengeParticipation(
                user_id=user_id,
                challenge_id=challenge_id,
                current_progress=0
            )
            self.db.add(participation)
            self.db.flush()
        
        self.db.execute(
            update(ChallengeParticipation)
            .where(ChallengeParticipation.id == participation.id)
            .values(current_progress=ChallengeParticipation.current_progress + progress_increment)
        )
        self.db.flush()
        self.db.refresh(participation)
        
        # Check if challenge is completed
        challenge = self.db.query(ReadingChallenge).filter(
            ReadingChallenge.id == challenge_id
        ).first()
        
        if challenge and participation.current_progress >= challenge.target_value:  # type: ignore[operator]
            self.db.execute(
                update(ChallengeParticipation)
                .where(ChallengeParticipation.id == participation.id)
                .values(
                    is_completed=True,
                    completed_at=datetime.now()
                )
            )
        
        self.db.commit()
        self.db.refresh(participation)
        
        # Check for achievements
        self.check_and_unlock_achievements(user_id)
        
        return participation
    
    def _create_achievement(
        self,
        user_id: int,
        badge_type: BadgeType,
        milestone_type: MilestoneType,
        milestone_value: int
    ) -> UserAchievement:
        """Create a new achievement for a user"""
        achievement = UserAchievement(
            user_id=user_id,
            badge_type=badge_type,
            milestone_type=milestone_type,
            milestone_value=milestone_value
        )
        
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        
        return achievement
    
    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        """Get all achievements for a user"""
        return self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).order_by(UserAchievement.unlocked_at.desc()).all()
    
    def get_achievement_progress(self, user_id: int) -> Dict[str, Any]:
        """Get user's progress towards all achievements"""
        stats = self.get_user_stats(user_id)
        progress = {}
        
        for badge_type, requirements in self.MILESTONE_THRESHOLDS.items():
            badge_progress = {}
            for milestone_type, threshold in requirements.items():
                current_value = stats.get(milestone_type, 0)
                badge_progress[milestone_type.value] = {
                    "current": current_value,
                    "required": threshold,
                    "percentage": min(100, int((current_value / threshold) * 100))
                }
            
            # Check if unlocked
            unlocked = self.db.query(UserAchievement).filter(
                UserAchievement.user_id == user_id,
                UserAchievement.badge_type == badge_type
            ).first()
            
            progress[badge_type.value] = {
                "badge_type": badge_type.value,
                "unlocked": unlocked is not None,
                "unlocked_at": unlocked.unlocked_at.isoformat() if unlocked else None,
                "requirements": badge_progress
            }
        
        return progress
