import sqlite3

conn = sqlite3.connect('bookdb.sqlite3')
cursor = conn.cursor()

print('Admins table columns:')
cursor.execute('PRAGMA table_info(admins)')
rows = cursor.fetchall()
if rows:
    for row in rows:
        print(f'  {row[1]} ({row[2]})')
else:
    print('  Table does not exist!')

conn.close()
