# migrate_passwords.py
import os
import pymysql
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# Database connection
db = pymysql.connect(
    host=os.environ.get('MYSQLHOST', 'localhost'),
    user=os.environ.get('MYSQLUSER', 'root'),
    password=os.environ.get('MYSQLPASSWORD', 'adi24niki'),
    database=os.environ.get('MYSQLDATABASE', 'college_pyq'),
    port=int(os.environ.get('MYSQLPORT', 3306)),
    cursorclass=pymysql.cursors.DictCursor
)

cursor = db.cursor()

# Sab users lao
cursor.execute("SELECT id, password FROM users")
users = cursor.fetchall()

print(f"Total users found: {len(users)}")

migrated = 0
for user in users:
    if not user['password'].startswith('$2b$') and len(user['password']) != 60:
        try:
            hashed = bcrypt.generate_password_hash(user['password']).decode('utf-8')
            cursor.execute("UPDATE users SET password=%s WHERE id=%s", (hashed, user['id']))
            migrated += 1
            print(f"Migrated user ID: {user['id']}")
        except Exception as e:
            print(f"Error migrating user {user['id']}: {e}")

db.commit()
print(f"✅ Migration complete! {migrated} passwords updated.")

cursor.close()
db.close()