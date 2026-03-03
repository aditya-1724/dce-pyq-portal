import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import collegeImg from "../layout/college.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Email/Password Login (Tumhara existing code)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      console.log("🔍 Sending login request...");
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📦 Login response:", data);

      if (data.success) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("✅ Login successful!");
        console.log("👤 User role:", data.user.role);
        
        if (data.user.role === 'admin') {
          console.log("➡️ Redirecting to admin dashboard...");
          window.location.href = "/admin-dashboard";
        } else {
          console.log("➡️ Redirecting to student dashboard...");
          window.location.href = "/dashboard";
        }
      } else {
        if (data.requires_verification) {
          console.log("📧 Verification required");
          navigate("/verify-otp", { 
            state: { 
              email: data.email,
              message: "Please verify your email first"
            } 
          });
        } else {
          setMsg(data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);

      // Google user ko backend bhejo
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
          picture: decoded.picture
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("✅ Google Login successful!");
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setMsg(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMsg("Failed to login with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google Login Error Handler
  const handleGoogleError = () => {
    console.log("Google Login Failed");
    setMsg("Google login failed. Please try again.");
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${collegeImg})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-20 py-8 md:py-0">
        
        <div className="text-white max-w-md text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">DCE PYQ PORTAL</h1>
          <p className="text-base md:text-lg opacity-90 px-4 md:px-0">
            Previous Year Questions for smarter exams
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl p-6 md:p-8 bg-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6">Login to continue</p>

          {msg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {msg}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700
              text-white py-3 rounded-lg font-medium transition disabled:opacity-50 text-sm md:text-base mb-4"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              size="large"
              text="signin_with"
              disabled={loading || googleLoading}
            />
          </div>

          {googleLoading && (
            <p className="text-sm text-center mt-3 text-gray-600">
              Processing Google login...
            </p>
          )}

          <p className="text-xs md:text-sm text-center mt-5 text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-medium">
              Create one
            </Link>
          </p>
          <p className="text-xs md:text-sm text-center mt-2">
            <Link to="/forgot-password" className="text-indigo-600 font-medium">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}