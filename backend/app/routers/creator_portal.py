"""
API routes for Creator Portal
Writers can upload quotes, poetry, short stories
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.whichbook import Creator, CreatorContent, ContentComment, ContentLike
from backend.app.models import User
from backend.app.schemas.whichbook import (
    CreatorCreate, CreatorLogin, CreatorResponse,
    CreatorContentCreate, CreatorContentResponse,
    PublishToFlipkartRequest,
    CommentCreate, CommentResponse,
    LikeCreate
)

router = APIRouter()

# File upload directory
UPLOAD_DIR = "uploads/creator_content"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Helper function to get current creator (simplified - enhance with JWT later)
async def get_current_creator(db: Session = Depends(get_db)) -> Creator:
    # TODO: Implement proper JWT authentication
    # For now, return a mock creator for demonstration
    creator = db.query(Creator).first()
    if not creator:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return creator


@router.post("/register", response_model=CreatorResponse, status_code=status.HTTP_201_CREATED)
async def register_creator(
    creator_data: CreatorCreate,
    db: Session = Depends(get_db)
):
    """Register a new creator account"""
    # Check if email or username already exists
    existing = db.query(Creator).filter(
        (Creator.email == creator_data.email) | (Creator.username == creator_data.username)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email or username already registered"
        )
    
    # Create new creator
    hashed_password = get_password_hash(creator_data.password)
    new_creator = Creator(
        name=creator_data.name,
        email=creator_data.email,
        username=creator_data.username,
        hashed_password=hashed_password,
        bio=creator_data.bio
    )
    
    db.add(new_creator)
    db.commit()
    db.refresh(new_creator)
    
    return new_creator


@router.post("/login")
async def login_creator(
    login_data: CreatorLogin,
    db: Session = Depends(get_db)
):
    """Login for creators"""
    creator = db.query(Creator).filter(Creator.email == login_data.email).first()
    
    if not creator or not verify_password(login_data.password, str(creator.hashed_password)):  # type: ignore[arg-type]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": creator.email, "type": "creator"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "creator": CreatorResponse.from_orm(creator)
    }


@router.get("/me", response_model=CreatorResponse)
async def get_current_creator_profile(
    current_creator: Creator = Depends(get_current_creator)
):
    """Get current creator's profile"""
    return current_creator


@router.post("/upload", response_model=CreatorContentResponse, status_code=status.HTTP_201_CREATED)
async def upload_content(
    content_data: CreatorContentCreate,
    current_creator: Creator = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    """Upload a quote, poem, or short story"""
    if content_data.category not in ['quote', 'poem', 'short_story', 'book_excerpt']:
        raise HTTPException(
            status_code=400,
            detail="Invalid category. Must be: quote, poem, short_story, or book_excerpt"
        )
    
    new_content = CreatorContent(
        creator_id=current_creator.id,
        title=content_data.title,
        category=content_data.category,
        content_text=content_data.content_text
    )
    
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    return new_content


@router.post("/upload-file")
async def upload_content_file(
    title: str,
    category: str,
    file: UploadFile = File(...),
    current_creator: Creator = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    """Upload a PDF or text file"""
    # Validate file type
    allowed_extensions = ['.pdf', '.txt', '.doc', '.docx']
    file_ext = os.path.splitext(file.filename or '')[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{current_creator.id}_{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create content record
    new_content = CreatorContent(
        creator_id=current_creator.id,
        title=title,
        category=category,
        file_path=file_path
    )
    
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    return {
        "message": "File uploaded successfully",
        "content_id": new_content.id,
        "file_path": file_path
    }


@router.get("/dashboard", response_model=List[CreatorContentResponse])
async def get_creator_dashboard(
    current_creator: Creator = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    """Get all content uploaded by current creator"""
    content = db.query(CreatorContent).filter(
        CreatorContent.creator_id == current_creator.id
    ).order_by(
        CreatorContent.created_at.desc()
    ).all()
    
    return content


@router.get("/content", response_model=List[CreatorContentResponse])
async def get_all_approved_content(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all approved creator content (public)"""
    query = db.query(CreatorContent).filter(CreatorContent.approved == True)  # noqa: E712
    
    if category:
        query = query.filter(CreatorContent.category == category)
    
    content = query.order_by(
        CreatorContent.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return content


@router.get("/content/{content_id}", response_model=CreatorContentResponse)
async def get_content_detail(
    content_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed view of a specific content piece"""
    content = db.query(CreatorContent).filter(CreatorContent.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Increment view count
    content.views_count += 1  # type: ignore[operator]
    db.commit()
    
    return content


@router.post("/publish-request")
async def request_flipkart_publishing(
    request_data: PublishToFlipkartRequest,
    current_creator: Creator = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    """Request to publish content on Flipkart"""
    content = db.query(CreatorContent).filter(
        CreatorContent.id == request_data.content_id,
        CreatorContent.creator_id == current_creator.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if not content.approved:  # type: ignore[attr-defined]
        raise HTTPException(
            status_code=400,
            detail="Content must be approved before requesting publication"
        )
    
    content.publish_request = True  # type: ignore[assignment]
    content.publish_request_date = datetime.now()  # type: ignore[assignment]
    content.publish_request_status = 'pending'  # type: ignore[assignment]
    
    db.commit()
    
    # TODO: Send email notification to admin
    
    return {
        "message": "Publication request submitted successfully",
        "content_id": content.id,  # type: ignore[attr-defined]
        "status": "pending"
    }


# Engagement routes
@router.post("/like")
async def like_content(
    like_data: LikeCreate,
    db: Session = Depends(get_db)
):
    """Like a piece of content (requires user authentication)"""
    # TODO: Get current user from JWT
    user_id = 1  # Mock user ID
    
    # Check if already liked
    existing_like = db.query(ContentLike).filter(
        ContentLike.content_id == like_data.content_id,
        ContentLike.user_id == user_id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        content = db.query(CreatorContent).filter(CreatorContent.id == like_data.content_id).first()
        if content:
            content.likes_count -= 1  # type: ignore[operator]
        db.commit()
        return {"message": "Content unliked", "liked": False}
    else:
        # Like
        new_like = ContentLike(
            content_id=like_data.content_id,
            user_id=user_id
        )
        db.add(new_like)
        
        content = db.query(CreatorContent).filter(CreatorContent.id == like_data.content_id).first()
        if content:
            content.likes_count += 1  # type: ignore[operator]
        
        db.commit()
        return {"message": "Content liked", "liked": True}


@router.post("/comment", response_model=CommentResponse)
async def add_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db)
):
    """Add a comment to content"""
    # TODO: Get current user from JWT
    user_id = 1  # Mock user ID
    
    new_comment = ContentComment(
        content_id=comment_data.content_id,
        user_id=user_id,
        comment_text=comment_data.comment_text
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


@router.get("/comments/{content_id}", response_model=List[CommentResponse])
async def get_content_comments(
    content_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a content piece"""
    comments = db.query(ContentComment).filter(
        ContentComment.content_id == content_id
    ).order_by(
        ContentComment.created_at.desc()
    ).all()
    
    return comments
