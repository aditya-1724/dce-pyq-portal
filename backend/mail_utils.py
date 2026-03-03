# mail_utils.py
import random
import os
import smtplib
import pymysql
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# Gmail SMTP Settings
GMAIL_USER = os.environ.get('GMAIL_USER', 'dceguportal@gmail.com')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', 'szdd ziad yfvh okyj')

print(f"📧 Gmail configured for: {GMAIL_USER}")
print(f"🔑 App Password loaded: {'YES' if GMAIL_APP_PASSWORD else 'NO'}")

def generate_otp():
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp, name):
    """Gmail SMTP se OTP bhejo"""
    
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("❌ Gmail credentials not set!")
        return False
    
    try:
        # Email content with beautiful HTML template
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
                    <br>
                    
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version for email clients that don't support HTML
        text_content = f"""
        DCE PYQ Portal - Email Verification
        
        Hello {name},
        
        Your OTP for email verification is: {otp}
        
        This OTP is valid for 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        © 2026 DCE PYQ Portal
        
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = "🔐 Your OTP for DCE PYQ Portal Verification"
        
        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send via Gmail SMTP
        print(f"📤 Sending OTP to {to_email}...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD.replace(' ', ''))  # Remove spaces if any
        server.send_message(msg)
        server.quit()
        
        print(f"✅ OTP sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Gmail error: {e}")
        return False

def save_otp_to_db(email, otp):
    """Save OTP to database with expiry"""
    db = None
    cursor = None
    try:
        db = pymysql.connect(
            host=os.environ.get('MYSQLHOST', 'localhost'),
            user=os.environ.get('MYSQLUSER', 'root'),
            password=os.environ.get('MYSQLPASSWORD', 'adi24niki'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=int(os.environ.get('MYSQLPORT', 3306)),
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=10
        )
        cursor = db.cursor()
        
        # Delete any existing OTP for this email
        cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
        
        # Save new OTP with 10 minutes expiry
        expiry = datetime.now() + timedelta(minutes=10)
        cursor.execute("""
            INSERT INTO otp_verification (email, otp, expires_at)
            VALUES (%s, %s, %s)
        """, (email, otp, expiry))
        
        db.commit()
        print(f"✅ OTP saved to DB for {email} (expires at {expiry})")
        return True
        
    except Exception as e:
        print(f"❌ Database save error: {e}")
        if db:
            db.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

def verify_otp_from_db(email, user_otp):
    """Verify OTP from database"""
    db = None
    cursor = None
    try:
        db = pymysql.connect(
            host=os.environ.get('MYSQLHOST', 'localhost'),
            user=os.environ.get('MYSQLUSER', 'root'),
            password=os.environ.get('MYSQLPASSWORD', 'adi24niki'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=int(os.environ.get('MYSQLPORT', 3306)),
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=10
        )
        cursor = db.cursor()
        
        # Check if OTP exists and not expired
        cursor.execute("""
            SELECT * FROM otp_verification 
            WHERE email = %s AND otp = %s AND expires_at > NOW()
        """, (email, user_otp))
        
        result = cursor.fetchone()
        
        if result:
            # Delete OTP after successful verification
            cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
            db.commit()
            print(f"✅ OTP verified successfully for {email}")
            return True
        else:
            # Check if OTP exists but expired
            cursor.execute("""
                SELECT * FROM otp_verification 
                WHERE email = %s AND otp = %s
            """, (email, user_otp))
            expired_result = cursor.fetchone()
            
            if expired_result:
                print(f"⚠️ OTP expired for {email}")
                # Delete expired OTP
                cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
                db.commit()
            else:
                print(f"❌ Invalid OTP for {email}")
            
            return False
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

def cleanup_expired_otps():
    """Clean up expired OTPs (call this periodically)"""
    db = None
    cursor = None
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
        
        cursor.execute("DELETE FROM otp_verification WHERE expires_at <= NOW()")
        deleted = cursor.rowcount
        db.commit()
        
        if deleted > 0:
            print(f"🧹 Cleaned up {deleted} expired OTPs")
        
    except Exception as e:
        print(f"❌ Cleanup error: {e}")
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()