import sqlite3

conn = sqlite3.connect('bookdb.sqlite3')
cursor = conn.cursor()

print('Books with cover images:')
books = cursor.execute('SELECT id, title, author, cover_image_url FROM books LIMIT 10').fetchall()
for b in books:
    cover_status = "✅ HAS COVER" if b[3] else "❌ NO COVER"
    print(f'{cover_status} - ID: {b[0]}, Title: {b[1][:40]}, URL: {b[3][:60] if b[3] else "NULL"}...')

# Check total counts
total = cursor.execute('SELECT COUNT(*) FROM books').fetchone()[0]
with_covers = cursor.execute('SELECT COUNT(*) FROM books WHERE cover_image_url IS NOT NULL AND cover_image_url != ""').fetchone()[0]

print(f'\nTotal books: {total}')
print(f'Books with covers: {with_covers}')
print(f'Books without covers: {total - with_covers}')

conn.close()

