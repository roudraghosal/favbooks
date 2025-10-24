"""
Admin routes for content moderation and Flipkart publishing requests
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import update
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, create_access_token
from backend.app.models.whichbook import Admin, CreatorContent
from backend.app.schemas.whichbook import AdminLogin, AdminContentReview

router = APIRouter()


# Helper function to get current admin
async def get_current_admin(db: Session = Depends(get_db)) -> Admin:
    """Get current authenticated admin"""
    # TODO: Implement proper JWT authentication
    admin = db.query(Admin).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not admin.is_active:  # type: ignore[attr-defined]
        raise HTTPException(status_code=403, detail="Admin account is inactive")
    return admin


@router.post("/login")
async def admin_login(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    """Admin login endpoint"""
    admin = db.query(Admin).filter(Admin.email == login_data.email).first()
    
    if not admin or not verify_password(login_data.password, admin.hashed_password):  # type: ignore[arg-type]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not admin.is_active:  # type: ignore[attr-defined]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": admin.email,  # type: ignore[attr-defined]
            "type": "admin",
            "is_super": admin.is_super_admin  # type: ignore[attr-defined]
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,  # type: ignore[attr-defined]
            "username": admin.username,  # type: ignore[attr-defined]
            "email": admin.email,  # type: ignore[attr-defined]
            "is_super_admin": admin.is_super_admin  # type: ignore[attr-defined]
        }
    }


@router.get("/pending-content")
async def get_pending_content(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all content pending approval"""
    query = db.query(CreatorContent).filter(
        CreatorContent.approved == False,  # noqa: E712
        CreatorContent.rejected == False  # noqa: E712
    )
    
    if category:
        query = query.filter(CreatorContent.category == category)
    
    content = query.order_by(
        CreatorContent.created_at.asc()
    ).offset(skip).limit(limit).all()
    
    return content


@router.post("/review-content")
async def review_content(
    review_data: AdminContentReview,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Approve or reject creator content"""
    content = db.query(CreatorContent).filter(
        CreatorContent.id == review_data.content_id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if review_data.action == "approve":
        stmt = update(CreatorContent).where(
            CreatorContent.id == review_data.content_id
        ).values(
            approved=True,
            rejected=False,
            admin_id=current_admin.id,  # type: ignore[attr-defined]
            admin_comment=review_data.admin_comment,
            reviewed_at=datetime.now()
        )
        db.execute(stmt)
        db.commit()
        
        return {"message": "Content approved successfully"}
        
    elif review_data.action == "reject":
        stmt = update(CreatorContent).where(
            CreatorContent.id == review_data.content_id
        ).values(
            approved=False,
            rejected=True,
            admin_id=current_admin.id,  # type: ignore[attr-defined]
            admin_comment=review_data.admin_comment,
            reviewed_at=datetime.now()
        )
        db.execute(stmt)
        db.commit()
        
        return {"message": "Content rejected"}
        
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )


@router.get("/flipkart-requests")
async def get_flipkart_requests(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all Flipkart publishing requests"""
    query = db.query(CreatorContent).filter(
        CreatorContent.publish_request == True  # noqa: E712
    )
    
    if status_filter:
        query = query.filter(CreatorContent.publish_request_status == status_filter)
    
    requests = query.order_by(
        CreatorContent.publish_request_date.desc()
    ).offset(skip).limit(limit).all()
    
    return requests


@router.post("/flipkart-requests/{content_id}/update-status")
async def update_flipkart_request_status(
    content_id: int,
    new_status: str,
    admin_notes: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update status of Flipkart publishing request"""
    valid_statuses = ['pending', 'under_review', 'approved', 'rejected', 'published']
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    content = db.query(CreatorContent).filter(
        CreatorContent.id == content_id,
        CreatorContent.publish_request == True  # noqa: E712
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Publishing request not found")
    
    stmt = update(CreatorContent).where(
        CreatorContent.id == content_id
    ).values(
        publish_request_status=new_status,
        admin_id=current_admin.id,  # type: ignore[attr-defined]
        admin_comment=admin_notes
    )
    db.execute(stmt)
    db.commit()
    
    # TODO: Send email notification to creator
    
    return {
        "message": f"Request status updated to {new_status}",
        "content_id": content_id,
        "new_status": new_status
    }


@router.get("/dashboard/stats")
async def get_admin_dashboard_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin"""
    pending_content = db.query(CreatorContent).filter(
        CreatorContent.approved == False,  # noqa: E712
        CreatorContent.rejected == False  # noqa: E712
    ).count()
    
    approved_content = db.query(CreatorContent).filter(
        CreatorContent.approved == True  # noqa: E712
    ).count()
    
    rejected_content = db.query(CreatorContent).filter(
        CreatorContent.rejected == True  # noqa: E712
    ).count()
    
    flipkart_pending = db.query(CreatorContent).filter(
        CreatorContent.publish_request == True,  # noqa: E712
        CreatorContent.publish_request_status == 'pending'
    ).count()
    
    flipkart_approved = db.query(CreatorContent).filter(
        CreatorContent.publish_request == True,  # noqa: E712
        CreatorContent.publish_request_status == 'approved'
    ).count()
    
    return {
        "pending_content": pending_content,
        "approved_content": approved_content,
        "rejected_content": rejected_content,
        "flipkart_pending": flipkart_pending,
        "flipkart_approved": flipkart_approved
    }


@router.get("/content/search")
async def search_content(
    query: str,
    category: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Search content by title or creator name"""
    search_query = db.query(CreatorContent)
    
    if category:
        search_query = search_query.filter(CreatorContent.category == category)
    
    # Search in title and content_text
    search_query = search_query.filter(
        (CreatorContent.title.ilike(f"%{query}%")) |  # type: ignore[attr-defined]
        (CreatorContent.content_text.ilike(f"%{query}%"))  # type: ignore[attr-defined]
    )
    
    results = search_query.all()
    
    return results
