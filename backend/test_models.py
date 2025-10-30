"""
Test if models are imported correctly
"""
from app.core.database import Base, engine

print("Checking Base metadata...")
print(f"Number of tables in metadata: {len(Base.metadata.tables)}")
print("\nTables found in metadata:")
for table_name in Base.metadata.tables.keys():
    print(f"  - {table_name}")

print("\nImporting models...")
from app.models import User, Genre, Book, Rating, Wishlist

print(f"\nAfter importing models:")
print(f"Number of tables in metadata: {len(Base.metadata.tables)}")
print("\nTables found in metadata:")
for table_name, table in Base.metadata.tables.items():
    print(f"  - {table_name}")
    for column in table.columns:
        print(f"      • {column.name} ({column.type})")

print("\nCreating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created!")

