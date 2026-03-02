import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import collegeImg from "../layout/college.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMsg("✅ OTP sent to your email!");
        setStep(2);
      } else {
        setMsg("❌ " + data.message);
      }
    } catch (error) {
      setMsg("❌ Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/reset-password-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMsg("✅ Password updated successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMsg("❌ " + data.message);
      }
    } catch (error) {
      setMsg("❌ Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMsg("✅ New OTP sent to your email!");
      } else {
        setMsg("❌ " + data.message);
      }
    } catch (error) {
      setMsg("❌ Failed to connect to server");
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

      {/* 👇 MOBILE FRIENDLY CONTAINER */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-20 py-8 md:py-0">

        {/* LEFT TEXT */}
        <div className="text-white max-w-md text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">DCE PYQ PORTAL</h1>
          <p className="text-sm md:text-lg opacity-90 px-4 md:px-0">
            Previous Year Questions for smarter exams
          </p>
        </div>

        {/* RESET CARD */}
        <div className="w-full max-w-md rounded-2xl p-5 md:p-8 bg-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900">
            {step === 1 ? "Reset Password 🔑" : "Verify OTP"}
          </h2>

          {/* Message Display */}
          {msg && (
            <div className={`mb-4 text-sm p-3 rounded-lg ${
              msg.includes("✅") 
                ? "text-green-600 bg-green-50" 
                : "text-red-600 bg-red-50"
            }`}>
              {msg}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label className="text-xs md:text-sm text-gray-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700
                text-white py-3 rounded-lg font-medium transition disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP + New Password Form */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="text-xs md:text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs md:text-sm text-gray-600">OTP Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="text-xs md:text-sm text-gray-600">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700
                text-white py-3 rounded-lg font-medium transition disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  ← Change Email
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <p className="text-xs md:text-sm text-center mt-5 text-gray-500">
            <Link to="/" className="text-indigo-600 font-medium">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}