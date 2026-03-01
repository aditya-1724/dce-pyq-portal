import os
import io
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
import dns.resolver
import re
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image
import mysql.connector
from mysql.connector import Error
import time

# Import mail functions
from mail_utils import generate_otp, send_otp_email, save_otp_to_db, verify_otp_from_db

app = Flask(__name__)
CORS(app)

# ==================== JWT CONFIGURATION ====================
app.config['JWT_SECRET_KEY'] = 'dce-pyq-portal-secret-key-2026-32bytes!!'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ==================== DATABASE CONNECTION ====================
class Database:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="adi24niki",
                database="college_pyq"
            )
            print("✅ Database connected successfully")
        except Error as e:
            print(f"❌ Database connection error: {e}")
            time.sleep(2)
            self.connect()  # Retry
    
    def get_cursor(self, dictionary=True):
        try:
            # Check if connection is alive
            if not self.connection.is_connected():
                self.connect()
            return self.connection.cursor(dictionary=dictionary)
        except Error as e:
            print(f"❌ Connection lost, reconnecting...")
            self.connect()
            return self.connection.cursor(dictionary=dictionary)
    
    def commit(self):
        if self.connection and self.connection.is_connected():
            self.connection.commit()
    
    def rollback(self):
        if self.connection and self.connection.is_connected():
            self.connection.rollback()

# Create global database instance
db = Database()

# ==================== UPLOAD FOLDER ====================
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==================== EMAIL VALIDATION ====================
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    try:
        domain = email.split('@')[1]
        mx_records = dns.resolver.resolve(domain, 'MX')
        if len(mx_records) > 0:
            return True, "Valid email"
        else:
            return False, "Email domain does not exist"
    except dns.resolver.NXDOMAIN:
        return False, "Email domain does not exist"
    except dns.resolver.NoAnswer:
        return False, "Email domain has no mail server"
    except Exception as e:
        print(f"Domain check error: {e}")
        return False, "Could not verify email domain"

# ==================== SUBJECT ROUTES ====================
@app.route("/subjects", methods=["GET"])
@jwt_required()
def get_all_subjects():
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT * FROM subjects ORDER BY branch, semester, subject_name")
        subjects = cursor.fetchall()
        return jsonify(subjects), 200
    except Exception as e:
        print("🔥 GET SUBJECTS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/subjects/<branch>/<int:semester>", methods=["GET"])
@jwt_required()
def get_subjects(branch, semester):
    cursor = None
    try:
        current_user = get_jwt_identity()
        print(f"👤 User ID: {current_user} accessing subjects for {branch} Sem {semester}")
        
        cursor = db.get_cursor()
        cursor.execute(
            "SELECT * FROM subjects WHERE branch=%s AND semester=%s ORDER BY subject_name",
            (branch, semester)
        )
        subjects = cursor.fetchall()
        return jsonify(subjects), 200
    except Exception as e:
        print("🔥 FILTER SUBJECTS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/subjects/count", methods=["GET"])
@jwt_required()
def get_unique_subjects_count():
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT COUNT(DISTINCT subject_name) as count FROM subjects")
        result = cursor.fetchone()
        return jsonify({"success": True, "count": result['count']}), 200
    except Exception as e:
        print("🔥 COUNT ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/add-subject", methods=["POST"])
@jwt_required()
def add_subject():
    cursor = None
    try:
        data = request.get_json()
        subject_name = data.get("subject_name")
        branch = data.get("branch")
        semester = data.get("semester")

        if not all([subject_name, branch, semester]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        cursor = db.get_cursor()
        cursor.execute(
            "SELECT id FROM subjects WHERE subject_name=%s AND branch=%s AND semester=%s",
            (subject_name, branch, semester)
        )
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Subject already exists"}), 409

        cursor.execute(
            "INSERT INTO subjects (subject_name, branch, semester) VALUES (%s, %s, %s)",
            (subject_name, branch, semester)
        )
        db.commit()
        return jsonify({"success": True, "message": "Subject added successfully"}), 201
    except Exception as e:
        print("🔥 ADD SUBJECT ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/delete-subject/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_subject(id):
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT id FROM pyqs WHERE subject_id=%s", (id,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Cannot delete subject with existing PYQs"}), 400
        
        cursor.execute("DELETE FROM subjects WHERE id=%s", (id,))
        db.commit()
        return jsonify({"success": True, "message": "Subject deleted successfully"}), 200
    except Exception as e:
        print("🔥 DELETE SUBJECT ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

# ==================== PYQ ROUTES ====================
@app.route("/pyqs/<int:subject_id>/<branch>/<int:semester>", methods=["GET"])
@jwt_required()
def get_pyqs(subject_id, branch, semester):
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("""
            SELECT p.*, s.subject_name 
            FROM pyqs p
            JOIN subjects s ON p.subject_id = s.id
            WHERE p.subject_id=%s AND p.branch=%s AND p.semester=%s
            ORDER BY p.uploaded_at DESC
        """, (subject_id, branch, semester))
        
        papers = cursor.fetchall()
        
        # FIX: Sirf filename bhejo (path nahi)
        for paper in papers:
            if paper['file_url']:
                filename = paper['file_url'].split('/')[-1]
                paper['file_url'] = filename
                print(f"✅ Sending filename: {filename}")

        return jsonify({"success": True, "papers": papers}), 200
    except Exception as e:
        print("🔥 GET PYQS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/pyqs/all", methods=["GET"])
@jwt_required()
def get_all_pyqs():
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("""
            SELECT p.*, s.subject_name 
            FROM pyqs p
            JOIN subjects s ON p.subject_id = s.id
            ORDER BY p.uploaded_at DESC
        """)
        
        papers = cursor.fetchall()
        
        for paper in papers:
            if paper['file_url']:
                paper['file_url'] = f"/uploads/{paper['file_url']}"
        
        return jsonify({"success": True, "papers": papers}), 200
    except Exception as e:
        print("🔥 GET ALL PYQS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

from PIL import Image

@app.route("/upload-pyq", methods=["POST"])
@jwt_required()
def upload_pyq():
    cursor = None
    try:
        subject_id = request.form.get("subject_id")
        paper_type = request.form.get("type")
        title = request.form.get("title")
        branch = request.form.get("branch")
        semester = request.form.get("semester")
        year = request.form.get("year")
        file = request.files.get("file")

        if not all([subject_id, paper_type, branch, semester, year, file]):
            return jsonify({"success": False, "message": "All fields except title are required"}), 400

        cursor = db.get_cursor()
        cursor.execute("SELECT subject_name FROM subjects WHERE id=%s", (subject_id,))
        subject_data = cursor.fetchone()
        
        if not subject_data:
            return jsonify({"success": False, "message": "Subject not found"}), 404
            
        subject_name = subject_data["subject_name"]
        
        if not title:
            title = f"{subject_name} {paper_type} {year}"

        # 👇 FIX: Special characters ko underscore se replace karo, remove mat karo
        # Replace spaces with underscore, keep other characters
        subject_name_clean = subject_name.replace(" ", "_")
        # Only remove characters that are truly problematic for filenames
        subject_name_clean = re.sub(r'[<>:"/\\|?*]', '', subject_name_clean)  # Windows reserved chars
        
        # Get original file extension
        original_filename = file.filename
        file_extension = original_filename.split('.')[-1].lower()
        
        # Allowed extensions
        image_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
        doc_extensions = {'pdf', 'doc', 'docx'}
        blocked_extensions = {'zip', 'rar', '7z', 'mp4', 'mp3', 'avi', 'mov', 'exe', 'msi'}

        if file_extension in blocked_extensions:
            return jsonify({"success": False, "message": f"❌ {file_extension.upper()} files are not allowed."}), 400

        if file_extension not in image_extensions and file_extension not in doc_extensions:
            return jsonify({"success": False, "message": "❌ Unsupported file type."}), 400

        # Save original file temporarily
        temp_path = os.path.join(app.config["UPLOAD_FOLDER"], f"temp_{original_filename}")
        file.save(temp_path)
        
        # Final filename (always PDF) - with original special chars
        pdf_filename = f"{branch}_Sem{semester}_{subject_name_clean}_{paper_type}_{year}.pdf"
        pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], pdf_filename)
        
        if file_extension in doc_extensions:
            if file_extension in ['doc', 'docx']:
                convert_docx_to_pdf(temp_path, pdf_path)
            else:
                os.rename(temp_path, pdf_path)
        elif file_extension in image_extensions:
            convert_image_to_pdf(temp_path, pdf_path)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

        # Save to database
        cursor.execute("""
            INSERT INTO pyqs (subject_id, branch, semester, type, title, year, file_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (subject_id, branch, semester, paper_type, title, year, pdf_filename))
        
        db.commit()
        
        return jsonify({"success": True, "message": "File uploaded successfully!"}), 201
        
    except Exception as e:
        print("🔥 UPLOAD ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

def convert_image_to_pdf(image_path, pdf_path):
    """Convert image to PDF"""
    try:
        image = Image.open(image_path)
        # Convert RGBA to RGB if needed
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            # Paste image using alpha channel as mask
            if image.mode == 'RGBA':
                rgb_image.paste(image, mask=image.split()[3])
            else:
                rgb_image.paste(image)
            rgb_image.save(pdf_path, 'PDF', resolution=100.0)
        else:
            image.save(pdf_path, 'PDF', resolution=100.0)
        print(f"✅ Converted image {image_path} to PDF {pdf_path}")
    except Exception as e:
        print(f"❌ Image conversion error: {e}")
        raise e

@app.route("/delete-pyq/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_pyq(id):
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT file_url FROM pyqs WHERE id=%s", (id,))
        pyq = cursor.fetchone()
        
        if pyq and pyq['file_url']:
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], pyq['file_url'])
            if os.path.exists(file_path):
                os.remove(file_path)
        
        cursor.execute("DELETE FROM pyqs WHERE id=%s", (id,))
        db.commit()
        return jsonify({"success": True, "message": "PYQ deleted successfully"}), 200
    except Exception as e:
        print("🔥 DELETE PYQ ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

# ==================== DOWNLOAD ROUTE ====================
@app.route("/download/<path:filename>")
def download_file(filename):
    try:
        # Don't use secure_filename - it removes special chars like '+'
        # Just do basic path traversal check
        if '..' in filename or filename.startswith('/'):
            return jsonify({"success": False, "message": "Invalid filename"}), 400
            
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        
        print(f"📁 Looking for file: {file_path}")
        print(f"📂 File exists? {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            return jsonify({"success": False, "message": "File not found"}), 404
            
        return send_from_directory(
            app.config["UPLOAD_FOLDER"], 
            filename, 
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print("🔥 DOWNLOAD ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== AUTHENTICATION ROUTES ====================
@app.route("/signup", methods=["POST"])
def signup():
    cursor = None
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        branch = data.get("branch")
        year = data.get("year")
        semester = data.get("semester")
        roll_number = data.get("rollNumber")

        if not all([name, email, password, branch, year, semester, roll_number]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        is_valid, message = validate_email(email)
        if not is_valid:
            return jsonify({"success": False, "message": message}), 400

        try:
            roll_number = int(roll_number)
            if roll_number <= 0:
                return jsonify({"success": False, "message": "Roll number must be positive"}), 400
        except ValueError:
            return jsonify({"success": False, "message": "Roll number must be a number"}), 400

        cursor = db.get_cursor()
        
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email already exists"}), 409

        cursor.execute("SELECT id FROM users WHERE roll_number=%s AND branch=%s AND year=%s", 
                      (roll_number, branch, year))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Roll number already exists for this branch/year"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        cursor.execute("""
            INSERT INTO users 
            (name, email, password, branch, year, semester, roll_number, role, is_verified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'student', false)
        """, (name, email, hashed_password, branch, year, semester, roll_number))
        
        db.commit()

        otp = generate_otp()
        if send_otp_email(email, otp, name):
            save_otp_to_db(email, otp)
            return jsonify({
                "success": True, 
                "message": "Account created! Please verify your email with OTP.",
                "email": email
            }), 201
        else:
            return jsonify({
                "success": False, 
                "message": "Failed to send OTP. Please try again."
            }), 500

    except Exception as e:
        print("🔥 SIGNUP ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    cursor = None
    try:
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            return jsonify({"success": False, "message": "Email and OTP required"}), 400

        if verify_otp_from_db(email, otp):
            cursor = db.get_cursor()
            cursor.execute("UPDATE users SET is_verified = true WHERE email = %s", (email,))
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Email verified successfully! You can now login."
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Invalid or expired OTP"
            }), 400

    except Exception as e:
        print("🔥 OTP VERIFY ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/resend-otp", methods=["POST"])
def resend_otp():
    cursor = None
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"success": False, "message": "Email required"}), 400

        cursor = db.get_cursor()
        cursor.execute("SELECT name FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "Email not found"}), 404

        otp = generate_otp()
        if send_otp_email(email, otp, user['name']):
            save_otp_to_db(email, otp)
            return jsonify({
                "success": True,
                "message": "OTP resent successfully"
            }), 200
        else:
            return jsonify({"success": False, "message": "Failed to send OTP"}), 500

    except Exception as e:
        print("🔥 RESEND OTP ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/login", methods=["POST"])
def login():
    cursor = None
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password required"}), 400

        cursor = db.get_cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        if not bcrypt.check_password_hash(user['password'], password):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        if user.get('role') == 'admin':
            access_token = create_access_token(
                identity=str(user['id']),
                additional_claims={
                    'email': user['email'],
                    'role': user['role'],
                    'name': user['name'],
                    'branch': user.get('branch', ''),
                    'semester': user.get('semester', '')
                }
            )
            
            user.pop('password', None)
            
            return jsonify({
                "success": True,
                "message": "Admin login successful",
                "user": user,
                "access_token": access_token,
                "redirect": "/admin-dashboard"
            }), 200

        if not user.get('is_verified'):
            return jsonify({
                "success": False,
                "message": "Please verify your email first",
                "requires_verification": True,
                "email": email
            }), 403

        access_token = create_access_token(
            identity=str(user['id']),
            additional_claims={
                'email': user['email'],
                'role': user['role'],
                'name': user['name'],
                'branch': user.get('branch', ''),
                'semester': user.get('semester', '')
            }
        )
        
        user.pop('password', None)
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user,
            "access_token": access_token,
            "redirect": "/dashboard"
        }), 200

    except Exception as e:
        print("🔥 LOGIN ERROR:", e)
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    cursor = None
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"success": False, "message": "Email required"}), 400

        cursor = db.get_cursor()
        cursor.execute("SELECT name FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "Email not found"}), 404

        otp = generate_otp()
        if send_otp_email(email, otp, user['name']):
            save_otp_to_db(email, otp)
            return jsonify({
                "success": True,
                "message": "OTP sent to your email",
                "email": email
            }), 200
        else:
            return jsonify({"success": False, "message": "Failed to send OTP"}), 500

    except Exception as e:
        print("🔥 FORGOT PASSWORD ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/reset-password-with-otp", methods=["POST"])
def reset_password_with_otp():
    cursor = None
    try:
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")
        new_password = data.get("newPassword")

        if not all([email, otp, new_password]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        if verify_otp_from_db(email, otp):
            cursor = db.get_cursor()
            hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Password updated successfully! You can now login."
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Invalid or expired OTP"
            }), 400

    except Exception as e:
        print("🔥 RESET PASSWORD ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()
@app.route("/upgrade-semester", methods=["POST"])
@jwt_required()
def upgrade_semester():
    cursor = None
    try:
        data = request.get_json()
        user_id = data.get("userId")
        current_semester = data.get("currentSemester")
        
        # Get user's joining date
        cursor = db.get_cursor()
        cursor.execute("SELECT created_at, semester FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        # Calculate eligibility
        join_date = user['created_at']
        current_date = datetime.now()
        
        # Months since joining
        months_passed = (current_date.year - join_date.year) * 12 + (current_date.month - join_date.month)
        
        # Each semester = 6 months
        eligible_semester = 1 + (months_passed // 6)
        
        if eligible_semester <= current_semester:
            return jsonify({
                "success": False, 
                "message": f"Semester {current_semester + 1} will be available from {get_next_semester_date(join_date, current_semester)}"
            }), 400
            
        if current_semester >= 8:
            return jsonify({"success": False, "message": "Already in final semester"}), 400
            
        new_semester = current_semester + 1
        new_year = (new_semester + 1) // 2
        
        cursor.execute(
            "UPDATE users SET semester = %s, year = %s, last_upgraded = NOW() WHERE id = %s",
            (new_semester, new_year, user_id)
        )
        db.commit()
        
        return jsonify({
            "success": True, 
            "message": f"Welcome to Semester {new_semester}!",
            "newSemester": new_semester,
            "newYear": new_year
        }), 200
        
    except Exception as e:
        print("🔥 UPGRADE ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

def get_next_semester_date(join_date, current_semester):
    """Calculate when next semester starts"""
    next_semester_start = join_date + timedelta(days=180 * current_semester)
    return next_semester_start.strftime("%B %Y")

@app.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    cursor = None
    try:
        current_user_id = get_jwt_identity()
        
        cursor = db.get_cursor()
        cursor.execute("""
            SELECT id, name, email, branch, year, semester, roll_number, role, created_at, is_verified
            FROM users WHERE id=%s
        """, (current_user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        return jsonify({"success": True, "user": user}), 200
        
    except Exception as e:
        print("🔥 PROFILE ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        if cursor:
            cursor.close()

# ==================== ADMIN ROUTES ====================
@app.route("/admin/stats", methods=["GET"])
@jwt_required()
def get_admin_stats():
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM subjects")
        total_subjects = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM pyqs")
        total_pyqs = cursor.fetchone()['total']
        
        cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5")
        recent_users = cursor.fetchall()
        
        return jsonify({"success": True, "stats": {
            "total_users": total_users,
            "total_subjects": total_subjects,
            "total_pyqs": total_pyqs,
            "recent_users": recent_users
        }}), 200
        
    except Exception as e:
        print("🔥 ADMIN STATS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT id, name, email, branch, year, semester, role, created_at, is_verified FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        return jsonify({"success": True, "users": users}), 200
        
    except Exception as e:
        print("🔥 GET USERS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

@app.route("/delete-user/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    cursor = None
    try:
        current_user_id = get_jwt_identity()
        if int(current_user_id) == id:
            return jsonify({"success": False, "message": "Cannot delete your own account"}), 400
        
        cursor = db.get_cursor()
        cursor.execute("DELETE FROM users WHERE id=%s", (id,))
        db.commit()
        
        return jsonify({"success": True, "message": "User deleted successfully"}), 200
        
    except Exception as e:
        print("🔥 DELETE USER ERROR:", e)
        db.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()

# ==================== FILE SERVING ====================
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    try:
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    except Exception as e:
        print("🔥 FILE SERVE ERROR:", e)
        return jsonify({"success": False, "message": "File not found"}), 404

# ==================== HEALTH CHECK ====================
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200

# ==================== ERROR HANDLERS ====================
@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({"success": False, "message": "Authorization required"}), 401

@jwt.invalid_token_loader
def invalid_token_response(callback):
    return jsonify({"success": False, "message": "Invalid token"}), 422

@jwt.expired_token_loader
def expired_token_response(jwt_header, jwt_payload):
    return jsonify({"success": False, "message": "Token has expired"}), 401

# ==================== MAIN ====================
if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 10000))  # Render ka PORT use karo, nahi to 5000
    app.run(host='0.0.0.0', port=port, debug=False)  # debug=False rakhna production mein