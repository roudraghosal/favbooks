"""
Social Media Sticker Generation Service
Generates Instagram-ready animated stickers for user achievements
"""
from io import BytesIO
import base64
from typing import Optional, Dict, Any
import json
from datetime import datetime
import os


class StickerGenerator:
    """Generate social media stickers for achievements"""
    
    # Instagram Story dimensions
    INSTAGRAM_STORY_WIDTH = 1080
    INSTAGRAM_STORY_HEIGHT = 1920
    
    # Sticker dimensions (centered in story)
    STICKER_WIDTH = 900
    STICKER_HEIGHT = 900
    
    # Color schemes for different badges
    COLOR_SCHEMES = {
        "verified_explorer": {
            "bg": [(76, 35, 186), (99, 102, 241)],  # Purple gradient
            "accent": (253, 224, 71),  # Yellow
            "text": (255, 255, 255)
        },
        "reading_streak": {
            "bg": [(220, 38, 38), (239, 68, 68)],  # Red gradient
            "accent": (255, 237, 213),
            "text": (255, 255, 255)
        },
        "genre_master": {
            "bg": [(5, 150, 105), (16, 185, 129)],  # Green gradient
            "accent": (254, 240, 138),
            "text": (255, 255, 255)
        },
        "quiz_champion": {
            "bg": [(37, 99, 235), (59, 130, 246)],  # Blue gradient
            "accent": (253, 224, 71),
            "text": (255, 255, 255)
        },
        "challenge_winner": {
            "bg": [(219, 39, 119), (236, 72, 153)],  # Pink gradient
            "accent": (254, 240, 138),
            "text": (255, 255, 255)
        },
        "default": {
            "bg": [(107, 114, 128), (156, 163, 175)],  # Gray gradient
            "accent": (254, 202, 202),
            "text": (255, 255, 255)
        }
    }
    
    def __init__(self):
        """Initialize sticker generator"""
        # Defer importing Pillow until needed. This allows the backend to
        # start even if Pillow isn't installed. _ensure_pil() will try to
        # import PIL and set up fonts when generating stickers.
        self._pil_checked = False
        self._pil_available = False
        self.Image = None
        self.ImageDraw = None
        self.ImageFont = None
        self.ImageFilter = None
        self.title_font = None
        self.subtitle_font = None
        self.stats_font = None
        self.label_font = None

    def _ensure_pil(self):
        """Lazy import PIL and initialize fonts. Sets _pil_available flag."""
        if self._pil_checked:
            return
        self._pil_checked = True
        try:
            from PIL import Image as PILImage, ImageDraw as PILImageDraw, ImageFont as PILImageFont, ImageFilter as PILImageFilter  # type: ignore[import-not-found]
            self.Image = PILImage  # type: ignore[assignment]
            self.ImageDraw = PILImageDraw  # type: ignore[assignment]
            self.ImageFont = PILImageFont  # type: ignore[assignment]
            self.ImageFilter = PILImageFilter  # type: ignore[assignment]
            self._pil_available = True
            # Try to load nicer fonts, fall back to default if unavailable
            try:
                self.title_font = self.ImageFont.truetype("arial.ttf", 80)
                self.subtitle_font = self.ImageFont.truetype("arial.ttf", 50)
                self.stats_font = self.ImageFont.truetype("arialbd.ttf", 60)
                self.label_font = self.ImageFont.truetype("arial.ttf", 35)
            except Exception:
                self.title_font = self.ImageFont.load_default()
                self.subtitle_font = self.ImageFont.load_default()
                self.stats_font = self.ImageFont.load_default()
                self.label_font = self.ImageFont.load_default()
        except ImportError:
            # Pillow is not installed; mark as unavailable. Caller should
            # handle this case gracefully (e.g., return an error message).
            self._pil_available = False
    
    def generate_badge_sticker(
        self,
        username: str,
        badge_type: str,
        milestone_value: int,
        milestone_type: str,
        avatar_url: Optional[str] = None,
        unlocked_at: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Generate a badge sticker for social media sharing
        
        Args:
            username: User's display name
            badge_type: Type of badge (verified_explorer, reading_streak, etc.)
            milestone_value: Value of milestone (e.g., 10 books, 5 day streak)
            milestone_type: Type of milestone (books_read, streak_days, etc.)
            avatar_url: Optional user avatar URL
            unlocked_at: When the badge was unlocked
            
        Returns:
            Dict with base64 encoded image and metadata
        """
        # Ensure PIL is available and fonts are loaded
        self._ensure_pil()
        if not self._pil_available:
            # Return a graceful error payload rather than raising ImportError
            return {
                "error": "Pillow (PIL) is not installed in the backend environment.",
                "message": "Install the 'Pillow' package to enable sticker generation.",
                "metadata": {
                    "badge_type": badge_type,
                    "milestone_value": milestone_value,
                    "milestone_type": milestone_type,
                    "generated_at": datetime.now().isoformat()
                }
            }

        # Create base image (Instagram Story size)
        img = self.Image.new('RGB', (self.INSTAGRAM_STORY_WIDTH, self.INSTAGRAM_STORY_HEIGHT), (255, 255, 255))  # type: ignore[union-attr]
        draw = self.ImageDraw.Draw(img)  # type: ignore[union-attr]
        
        # Calculate sticker position (centered)
        sticker_x = (self.INSTAGRAM_STORY_WIDTH - self.STICKER_WIDTH) // 2
        sticker_y = (self.INSTAGRAM_STORY_HEIGHT - self.STICKER_HEIGHT) // 2
        
        # Get color scheme
        colors = self.COLOR_SCHEMES.get(badge_type, self.COLOR_SCHEMES["default"])
        
        # Draw gradient background for sticker area
        self._draw_gradient_rounded_rectangle(
            draw,
            (sticker_x, sticker_y, sticker_x + self.STICKER_WIDTH, sticker_y + self.STICKER_HEIGHT),
            colors["bg"][0],
            colors["bg"][1],
            radius=50
        )
        
        # Draw badge icon (star/trophy shape)
        self._draw_badge_icon(draw, sticker_x + self.STICKER_WIDTH // 2, sticker_y + 180, colors["accent"])
        
        # Draw title text
        title_text = self._get_badge_title(badge_type)
        title_bbox = draw.textbbox((0, 0), title_text, font=self.title_font)
        title_width = title_bbox[2] - title_bbox[0]
        draw.text(
            (sticker_x + (self.STICKER_WIDTH - title_width) // 2, sticker_y + 350),
            title_text,
            fill=colors["text"],
            font=self.title_font
        )
        
        # Draw username
        username_text = f"@{username}"
        username_bbox = draw.textbbox((0, 0), username_text, font=self.subtitle_font)
        username_width = username_bbox[2] - username_bbox[0]
        draw.text(
            (sticker_x + (self.STICKER_WIDTH - username_width) // 2, sticker_y + 460),
            username_text,
            fill=colors["accent"],
            font=self.subtitle_font
        )
        
        # Draw milestone stats
        stats_text = self._format_milestone_stats(milestone_value, milestone_type)
        stats_bbox = draw.textbbox((0, 0), stats_text, font=self.stats_font)
        stats_width = stats_bbox[2] - stats_bbox[0]
        draw.text(
            (sticker_x + (self.STICKER_WIDTH - stats_width) // 2, sticker_y + 600),
            stats_text,
            fill=colors["accent"],
            font=self.stats_font
        )
        
        # Draw subtitle
        subtitle_text = self._get_milestone_label(milestone_type)
        subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=self.label_font)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        draw.text(
            (sticker_x + (self.STICKER_WIDTH - subtitle_width) // 2, sticker_y + 690),
            subtitle_text,
            fill=colors["text"],
            font=self.label_font
        )
        
        # Draw date
        if unlocked_at:
            date_text = unlocked_at.strftime("%B %d, %Y")
            date_bbox = draw.textbbox((0, 0), date_text, font=self.label_font)
            date_width = date_bbox[2] - date_bbox[0]
            draw.text(
                (sticker_x + (self.STICKER_WIDTH - date_width) // 2, sticker_y + 780),
                date_text,
                fill=colors["text"],
                font=self.label_font
            )
        
        # Add decorative confetti
        self._draw_confetti(draw, sticker_x, sticker_y, self.STICKER_WIDTH, self.STICKER_HEIGHT, colors["accent"])
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG", quality=95)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "image": f"data:image/png;base64,{img_base64}",
            "width": self.INSTAGRAM_STORY_WIDTH,
            "height": self.INSTAGRAM_STORY_HEIGHT,
            "format": "png",
            "metadata": {
                "badge_type": badge_type,
                "milestone_value": milestone_value,
                "milestone_type": milestone_type,
                "generated_at": datetime.now().isoformat()
            }
        }
    
    def _draw_gradient_rounded_rectangle(self, draw, bbox, color1, color2, radius=20):
        """Draw a rounded rectangle with gradient"""
        x1, y1, x2, y2 = bbox
        
        # Draw gradient
        for i, y in enumerate(range(y1, y2)):
            # Calculate color interpolation
            ratio = (y - y1) / (y2 - y1)
            r = int(color1[0] + (color2[0] - color1[0]) * ratio)
            g = int(color1[1] + (color2[1] - color1[1]) * ratio)
            b = int(color1[2] + (color2[2] - color1[2]) * ratio)
            
            # Draw line with rounded edges at top/bottom
            if y == y1 or y == y2 - 1:
                continue  # Skip for now, will draw rounded corners
            draw.line([(x1, y), (x2, y)], fill=(r, g, b), width=1)
        
        # Draw rounded corners (simplified)
        draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=color1)
        draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=color1)
        draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=color2)
        draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=color2)
    
    def _draw_badge_icon(self, draw, center_x, center_y, color):
        """Draw a star/trophy badge icon"""
        # Draw a star shape
        radius = 80
        points = []
        for i in range(10):
            angle = (i * 36 - 90) * 3.14159 / 180
            r = radius if i % 2 == 0 else radius // 2
            x = center_x + r * 0.86602540378  # cos approximation
            y = center_y + r * 0.5  # sin approximation
            points.append((x, y))
        
        # Draw filled star
        draw.polygon(points, fill=color, outline=color)
        
        # Draw inner circle
        inner_radius = 30
        draw.ellipse(
            [center_x - inner_radius, center_y - inner_radius,
             center_x + inner_radius, center_y + inner_radius],
            fill=(255, 255, 255)
        )
    
    def _draw_confetti(self, draw, x, y, width, height, color):
        """Draw decorative confetti elements"""
        import random
        random.seed(42)  # Consistent pattern
        
        for _ in range(30):
            cx = x + random.randint(50, width - 50)
            cy = y + random.randint(50, height - 50)
            size = random.randint(5, 15)
            
            # Random confetti shapes
            shape = random.choice(['circle', 'square', 'triangle'])
            
            # Vary opacity
            confetti_color = (color[0], color[1], color[2])
            
            if shape == 'circle':
                draw.ellipse([cx, cy, cx + size, cy + size], fill=confetti_color)
            elif shape == 'square':
                draw.rectangle([cx, cy, cx + size, cy + size], fill=confetti_color)
            else:  # triangle
                draw.polygon([(cx, cy + size), (cx + size // 2, cy), (cx + size, cy + size)], fill=confetti_color)
    
    def _get_badge_title(self, badge_type: str) -> str:
        """Get display title for badge type"""
        titles = {
            "verified_explorer": "Verified Book Explorer",
            "reading_streak": "Reading Streak Master",
            "genre_master": "Genre Master",
            "quiz_champion": "Quiz Champion",
            "challenge_winner": "Challenge Winner",
            "book_collector": "Book Collector",
            "review_expert": "Review Expert",
            "early_bird": "Early Bird Reader",
            "night_owl": "Night Owl Reader",
            "speed_reader": "Speed Reader"
        }
        return titles.get(badge_type, "Achievement Unlocked")
    
    def _format_milestone_stats(self, value: int, milestone_type: str) -> str:
        """Format milestone statistics"""
        return str(value)
    
    def _get_milestone_label(self, milestone_type: str) -> str:
        """Get label for milestone type"""
        labels = {
            "books_read": "Books Read",
            "reviews_written": "Reviews Written",
            "streak_days": "Day Streak",
            "quiz_score": "Quiz Score",
            "challenges_completed": "Challenges Completed",
            "genres_explored": "Genres Explored",
            "ratings_given": "Ratings Given",
            "wishlist_size": "Books in Wishlist"
        }
        return labels.get(milestone_type, "Achievement")


# Singleton instance
sticker_generator = StickerGenerator()

