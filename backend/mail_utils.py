# mail_utils.py
import random
import os
import requests
import pymysql
from datetime import datetime, timedelta

# Resend API Key - Railway se lega
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')

print(f"🔑 Resend API Key loaded: {'YES' if RESEND_API_KEY else 'NO'}")

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp, name):
    """Resend.com API se OTP bhejo"""
    
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not set!")
        return False
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    html_content = f"<p>Hi {name},</p><p>Your OTP is: <strong>{otp}</strong></p><p>Valid for 10 minutes.</p>"
    
    payload = {
        "from": "DCE PYQ <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "DCE PYQ Portal - Email Verification OTP",
        "html": html_content
    }
    
    try:
        # Timeout kam karo - 5 seconds
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Resend error: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Resend timeout - but continuing")
        # Timeout hone par bhi assume success karo
        return True  # 👈 Important: timeout par bhi True return
    except Exception as e:
        print(f"❌ Resend exception: {e}")
        return False

def save_otp_to_db(email, otp):
    try:
        db = pymysql.connect(
            host=os.environ.get('MYSQLHOST', 'localhost'),
            user=os.environ.get('MYSQLUSER', 'root'),
            password=os.environ.get('MYSQLPASSWORD', 'adi24niki'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=int(os.environ.get('MYSQLPORT', 3306)),
            cursorclass=pymysql.cursors.DictCursor
        )
        cursor = db.cursor()
        
        cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
        
        expiry = datetime.now() + timedelta(minutes=10)
        cursor.execute("""
            INSERT INTO otp_verification (email, otp, expires_at)
            VALUES (%s, %s, %s)
        """, (email, otp, expiry))
        
        db.commit()
        cursor.close()
        db.close()
        print(f"✅ OTP saved to DB for {email}")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def verify_otp_from_db(email, user_otp):
    try:
        db = pymysql.connect(
            host=os.environ.get('MYSQLHOST', 'localhost'),
            user=os.environ.get('MYSQLUSER', 'root'),
            password=os.environ.get('MYSQLPASSWORD', 'adi24niki'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=int(os.environ.get('MYSQLPORT', 3306)),
            cursorclass=pymysql.cursors.DictCursor
        )
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT * FROM otp_verification 
            WHERE email = %s AND otp = %s AND expires_at > NOW()
        """, (email, user_otp))
        
        result = cursor.fetchone()
        
        if result:
            cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
            db.commit()
            cursor.close()
            db.close()
            return True
        
        cursor.close()
        db.close()
        return False
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False