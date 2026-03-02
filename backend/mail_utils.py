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
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fc;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 500px;
                margin: 30px auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .content {{
                padding: 30px;
                text-align: center;
            }}
            .greeting {{
                font-size: 18px;
                color: #1f2937;
                margin-bottom: 20px;
            }}
            .otp-container {{
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                font-size: 36px;
                font-weight: 800;
                padding: 20px;
                border-radius: 12px;
                letter-spacing: 8px;
                margin: 25px 0;
                display: inline-block;
                min-width: 200px;
            }}
            .validity {{
                color: #6b7280;
                font-size: 14px;
                margin-top: 20px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }}
            .footer {{
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                color: #64748b;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📚 DCE PYQ Portal</div>
                <div style="font-size: 14px; opacity: 0.9;">Delhi College of Engineering</div>
            </div>
            <div class="content">
                <div class="greeting">Hello {name},</div>
                <div style="color: #1f2937; margin-bottom: 20px;">
                    Welcome to DCE PYQ Portal! Please verify your email address using the OTP below:
                </div>
                <div class="otp-container">
                    {otp}
                </div>
                <div style="color: #475569; margin-top: 10px;">
                    This OTP is valid for 10 minutes
                </div>
                <div class="validity">
                    If you didn't request this, please ignore this email.
                </div>
            </div>
            <div class="footer">
                © 2026 DCE PYQ Portal. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    payload = {
        "from": "DCE PYQ <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "🔐 Your OTP for DCE PYQ Portal",
        "html": html_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        if response.status_code == 200:
            print(f"✅ OTP sent to {to_email}")
            return True
        else:
            print(f"❌ Resend error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Resend exception: {e}")
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