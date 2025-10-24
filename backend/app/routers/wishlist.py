from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models import Wishlist, Book, User
from backend.app.schemas import WishlistCreate, Wishlist as WishlistSchema

router = APIRouter()


@router.post("/", response_model=WishlistSchema)
async def add_to_wishlist(
    wishlist_item: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if book exists
    book = db.query(Book).filter(Book.id == wishlist_item.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Check if already in wishlist
    existing_item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.book_id == wishlist_item.book_id
        )
        .first()
    )
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already in wishlist"
        )
    
    # Add to wishlist
    db_wishlist = Wishlist(
        user_id=current_user.id,
        book_id=wishlist_item.book_id
    )
    
    db.add(db_wishlist)
    db.commit()
    db.refresh(db_wishlist)
    
    return db_wishlist


@router.get("/", response_model=List[WishlistSchema])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist_items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )
    return wishlist_items


@router.delete("/{book_id}")
async def remove_from_wishlist(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist_item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.book_id == book_id
        )
        .first()
    )
    
    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found in wishlist"
        )
    
    db.delete(wishlist_item)
    db.commit()
    
    return {"message": "Book removed from wishlist"}