import { useState } from "react";
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
  const [errors, setErrors] = useState({});  // 👈 Errors ke liye
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Error clear karo jab user type kare
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Email validate karo
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Form validate karo
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format (e.g., name@example.com)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.branch) {
      newErrors.branch = "Please select branch";
    }

    if (!formData.year) {
      newErrors.year = "Please select year";
    }

    if (!formData.semester) {
      newErrors.semester = "Please select semester";
    }

    if (!formData.rollNumber) {
      newErrors.rollNumber = "Roll number is required";
    } else if (!/^\d+$/.test(formData.rollNumber)) {  // 👈 Sirf numbers check
      newErrors.rollNumber = "Roll number must contain only numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pehle form validate karo
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rollNumber: parseInt(formData.rollNumber)  // Number bhejo
        }),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/verify-otp", { 
          state: { 
            email: formData.email,
            message: "Account created! Please verify your email with OTP."
          } 
        });
      } else {
        setMsg(data.message || "Signup failed");
      }
    } catch (error) {
      setMsg("Failed to connect to server");
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

      <div className="relative z-10 h-screen flex items-center justify-between px-20">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-bold mb-3">DCE PYQ PORTAL</h1>
          <p className="text-lg opacity-90">
            Previous Year Questions for smarter exams
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl p-8 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">
            Create Account
          </h2>

          {msg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Branch Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
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

            {/* Year Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.year ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year && (
                <p className="text-red-500 text-xs mt-1">{errors.year}</p>
              )}
            </div>

            {/* Semester Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.semester ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
              )}
            </div>

            {/* Roll Number Field - Sirf Numbers */}
            <div className="mb-6">
              <label className="text-sm text-gray-600">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your Roll Number"
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                  errors.rollNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.rollNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700
              text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-500">
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