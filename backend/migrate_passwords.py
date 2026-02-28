# migrate_passwords.py
import mysql.connector
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="adi24niki",
    database="college_pyq"
)

cursor = db.cursor(dictionary=True)

# Sab users lao
cursor.execute("SELECT id, password FROM users")
users = cursor.fetchall()

print(f"Total users found: {len(users)}")

migrated = 0
for user in users:
    # Check if password is already hashed (bcrypt hashes are 60 chars long and start with $2b$)
    if not user['password'].startswith('$2b$') and len(user['password']) != 60:
        try:
            # Hash the plain text password
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