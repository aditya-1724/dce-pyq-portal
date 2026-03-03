import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import collegeImg from "../layout/college.jpg";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    year: "",
    semester: "",
    rollNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" }); // 👈 Changed to object
  const [loading, setLoading] = useState(false);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const navigate = useNavigate();

  // Semester options based on year
  useEffect(() => {
    if (formData.year) {
      const yearNum = parseInt(formData.year);
      if (yearNum === 1) {
        setSemesterOptions([1, 2]);
      } else if (yearNum === 2) {
        setSemesterOptions([3, 4]);
      } else if (yearNum === 3) {
        setSemesterOptions([5, 6]);
      } else if (yearNum === 4) {
        setSemesterOptions([7, 8]);
      }
    } else {
      setSemesterOptions([]);
    }
    setFormData(prev => ({ ...prev, semester: "" }));
  }, [formData.year]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateRollNumber = (roll) => {
    const rollStr = String(roll);
    return /^2\d{4}$/.test(rollStr);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.branch) newErrors.branch = "Please select branch";
    if (!formData.year) newErrors.year = "Please select year";
    if (!formData.semester) newErrors.semester = "Please select semester";
    if (!formData.rollNumber) {
      newErrors.rollNumber = "Roll number is required";
    } else if (!/^\d+$/.test(formData.rollNumber)) {
      newErrors.rollNumber = "Roll number must contain only numbers";
    } else if (!validateRollNumber(formData.rollNumber)) {
      newErrors.rollNumber = "Roll number must be 5 digits starting with 2 (e.g., 2XXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      console.log("📤 Sending signup request:", formData);
      
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rollNumber: parseInt(formData.rollNumber)
        }),
      });

      const data = await res.json();
      console.log("📦 Backend response:", data); // 👈 CHECK THIS IN CONSOLE

      if (data.success) {
        // ✅ Success - redirect to OTP
        setMsg({ 
          type: "success", 
          text: "Account created! Redirecting to OTP verification..." 
        });
        setTimeout(() => {
          navigate("/verify-otp", { 
            state: { 
              email: formData.email,
              message: "OTP sent to your email! Please verify."
            } 
          });
        }, 1500);
      } else {
        // ❌ Error from backend
        setMsg({ 
          type: "error", 
          text: data.message || "Signup failed. Please try again." 
        });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setMsg({ 
        type: "error", 
        text: "Failed to connect to server. Please check your internet connection." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${collegeImg})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-20 py-8 md:py-0">
        
        <div className="text-white max-w-md text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">DCE PYQ PORTAL</h1>
          <p className="text-sm md:text-lg opacity-90 px-4 md:px-0">
            Dronacharya College of Engineering
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl p-5 md:p-8 bg-white shadow-2xl max-h-[85vh] overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900">
            Create Account
          </h2>

          {/* Message Display - with proper styling */}
          {msg.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Name Field */}
            <div>
              <label className="text-xs md:text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="text-xs md:text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs md:text-sm text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Branch Field */}
            <div>
              <label className="text-xs md:text-sm text-gray-600">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                  errors.branch ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Branch</option>
                <option value="CSIT">CSIT</option>
                <option value="CSE">CSE</option> 
                <option value="IOT">IOT</option> 
                <option value="ME">ME</option> 
                <option value="R&A">R&A</option> 
                <option value="ECS">ECS</option> 
                <option value="ECE">ECE</option> 
                <option value="EEE">EEE</option> 
                <option value="AI&ML">AI&ML</option>
              </select>
              {errors.branch && (
                <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
              )}
            </div>

            {/* Year & Semester Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs md:text-sm text-gray-600">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.year ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Year</option>
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                </select>
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="text-xs md:text-sm text-gray-600">Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  disabled={!formData.year}
                  className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.semester ? 'border-red-500' : ''
                  } ${!formData.year ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Sem</option>
                  {semesterOptions.map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
                )}
              </div>
            </div>

            {/* Roll Number Field */}
            <div>
              <label className="text-xs md:text-sm text-gray-600">Roll Number (5 digits starting with 2)</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g., 20123"
                maxLength="5"
                className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                  errors.rollNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.rollNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
              )}
              {formData.rollNumber && !errors.rollNumber && (
                <p className="text-green-600 text-xs mt-1">✓ Valid roll number</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700
              text-white py-3 rounded-lg font-medium transition disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-xs md:text-sm text-center mt-5 text-gray-500">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-600 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}