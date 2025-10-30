"""
Reset admin user with fresh password
"""
from app.core.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

db = SessionLocal()

try:
    # Delete existing admin user
    existing = db.query(User).filter(User.email == 'admin@bookapp.com').first()
    
    if existing:
        print(f"🗑️  Deleting existing user: {existing.email}")
        db.delete(existing)
        db.commit()
        print("✅ Old user deleted")
    
    # Create fresh admin user
    print("🔧 Creating fresh admin user...")
    new_user = User(
        email='admin@bookapp.com',
        username='admin',
        hashed_password=get_password_hash('admin123'),
        is_admin=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"\n✅ Admin user created successfully!")
    print(f"   Email: admin@bookapp.com")
    print(f"   Password: admin123")
    print(f"   Is Admin: {new_user.is_admin}")
    
    print("\n📊 All users in database:")
    all_users = db.query(User).all()
    for user in all_users:
        print(f"   - {user.email} ({user.username}) - Admin: {user.is_admin}")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

