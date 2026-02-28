import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import collegeImg from "../layout/college.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      console.log("🔍 Sending login request...");
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📦 Login response:", data);

      if (data.success) {
        // 🔥 Token aur user save hora hai yah
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("✅ Login successful!");
        console.log("👤 User role:", data.user.role);
        
        // 🔥 IMPORTANT: Redirect with window.location for hard redirect
        if (data.user.role === 'admin') {
          console.log("➡️ Redirecting to admin dashboard...");
          window.location.href = "/admin-dashboard";  // Hard redirect
        } else {
          console.log("➡️ Redirecting to student dashboard...");
          window.location.href = "/dashboard";  // Hard redirect
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

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${collegeImg})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-between px-20">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-bold mb-3">DCE PYQ PORTAL</h1>
          <p className="text-lg opacity-90">
            Previous Year Questions for smarter exams
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl p-8 bg-white shadow-2xl">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">
            Welcome back
          </h2>
          <p className="text-gray-600 mb-6">Login to continue</p>

          {msg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700
              text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-medium">
              Create one
            </Link>
          </p>
          <p className="text-sm text-center mt-2">
            <Link to="/forgot-password" className="text-indigo-600 font-medium">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}