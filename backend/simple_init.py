import sys
sys.path.insert(0, '.')
from app.core.database import Base, engine
from app.models import User, Genre, Book

print("Creating tables...")
Base.metadata.create_all(bind=engine)

import sqlite3
conn = sqlite3.connect('bookify.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()

print('\nTables created:')
for t in tables:
    print(f'  - {t[0]}')

cursor.execute('PRAGMA table_info(users)')
columns = cursor.fetchall()

print('\nUsers table columns:')
for col in columns:
    print(f'  - {col[1]} ({col[2]})')

conn.close()
