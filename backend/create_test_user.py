"""
Create test admin user for login
"""
from app.core.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

db = SessionLocal()

try:
    # Check if user exists
    existing = db.query(User).filter(User.email == 'admin@bookapp.com').first()
    
    if existing:
        print(f"✅ User already exists:")
        print(f"   Email: {existing.email}")
        print(f"   Username: {existing.username}")
        print(f"   Is Admin: {existing.is_admin}")
    else:
        print("❌ User does not exist. Creating...")
        
        new_user = User(
            email='admin@bookapp.com',
            username='admin',
            hashed_password=get_password_hash('admin123'),
            is_admin=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ User created successfully!")
        print(f"   Email: {new_user.email}")
        print(f"   Username: {new_user.username}")
        print(f"   Password: admin123")
        print(f"   Is Admin: {new_user.is_admin}")
    
    print("\n📊 All users in database:")
    all_users = db.query(User).all()
    for user in all_users:
        print(f"   - {user.email} ({user.username}) - Admin: {user.is_admin}")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    db.rollback()
finally:
    db.close()

