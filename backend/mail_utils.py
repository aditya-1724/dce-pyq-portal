# mail_utils.py
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import mysql.connector

# Email configuration (Gmail ke liye)
EMAIL_ADDRESS = "dceguportal@gmail.com"  # 🔴 Apna email daalo
EMAIL_PASSWORD = "zbxj jqde mdvm vvmi"    # 🔴 Gmail App Password daalo

def generate_otp():
    """6-digit OTP generate karo"""
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp, name):
    """OTP bhejo email par"""
    
    # Email content
    subject = "DCE PYQ Portal - Email Verification OTP"
    
    # HTML email template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: auto; background: white; padding: 30px; 
                         border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
            .otp-box {{ background: #2563eb; color: white; font-size: 32px; font-weight: bold;
                       padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;
                       letter-spacing: 8px; }}
            .footer {{ text-align: center; color: #666; margin-top: 30px; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📚 DCE PYQ Portal</div>
                <p>Hi {name},</p>
            </div>
            
            <p>Welcome to DCE PYQ Portal! Please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
                {otp}
            </div>
            
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <div class="footer">
                <p>© 2026 DCE PYQ Portal. All rights reserved.</p>
                <p>Delhi College of Engineering</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    
    # Attach HTML content
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ OTP sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

def save_otp_to_db(email, otp):
    """OTP ko database mein save karo"""
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="adi24niki",
            database="college_pyq"
        )
        cursor = db.cursor()
        
        # Pehle purane OTP delete karo is email ke liye
        cursor.execute("DELETE FROM otp_verification WHERE email = %s", (email,))
        
        # Naya OTP insert karo (10 minute valid)
        expiry = datetime.now() + timedelta(minutes=10)
        cursor.execute("""
            INSERT INTO otp_verification (email, otp, expires_at)
            VALUES (%s, %s, %s)
        """, (email, otp, expiry))
        
        db.commit()
        cursor.close()
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def verify_otp_from_db(email, user_otp):
    """OTP verify karo"""
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="adi24niki",
            database="college_pyq"
        )
        cursor = db.cursor(dictionary=True)
        
        # OTP check karo
        cursor.execute("""
            SELECT * FROM otp_verification 
            WHERE email = %s AND otp = %s AND expires_at > NOW()
        """, (email, user_otp))
        
        result = cursor.fetchone()
        
        if result:
            # OTP valid hai, use delete karo
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