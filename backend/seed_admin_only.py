"""
Fresh script to seed admin only - bypasses any cached imports
"""
import sys
# Clear any cached app modules before importing
for key in list(sys.modules.keys()):
    if 'app.' in key:
        del sys.modules[key]

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.whichbook import Admin
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Check Admin model has correct columns
        print(f"Admin columns: {[c.name for c in Admin.__table__.columns]}")
        
        # Check if admin already exists
        existing = db.query(Admin).filter(Admin.username == "admin").first()
        if existing:
            print("✅ Admin already exists")
            return
        
        # Create new admin
        admin = Admin(
            username="admin",
            email="admin@whichbook.com",
            hashed_password=get_password_hash("admin123"),
            is_super_admin=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        print("✅ Admin account created (admin@whichbook.com / admin123)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
