// frontend/src/pages/VerifyOTP.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import collegeImg from "../layout/college.jpg";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [msg, setMsg] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;
  const successMsg = location.state?.message;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setMsg("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (data.success) {
        setMsg("✅ Email verified successfully!");
        setTimeout(() => {
          navigate("/");
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

  const handleResend = async () => {
    setCanResend(false);
    setTimer(60);
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:5000/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMsg("✅ New OTP sent to your email!");
      } else {
        setMsg("❌ " + data.message);
        setCanResend(true);
      }
    } catch (error) {
      setMsg("❌ Failed to connect to server");
      setCanResend(true);
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
            Verify your email to continue
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl p-8 bg-white shadow-2xl">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">
            Verify Email
          </h2>

          {successMsg && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {successMsg}
            </div>
          )}

          {msg && (
            <div className={`mb-4 text-sm p-3 rounded-lg ${
              msg.includes("✅") 
                ? "text-green-600 bg-green-50" 
                : "text-red-600 bg-red-50"
            }`}>
              {msg}
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Enter the 6-digit OTP sent to<br />
            <span className="font-semibold">{email}</span>
          </p>

          <div className="flex justify-between gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700
            text-white py-3 rounded-lg font-medium transition disabled:opacity-50 mb-4"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-indigo-600 hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-500">
                Resend OTP in {timer} seconds
              </p>
            )}
          </div>

          <p className="text-sm text-center mt-5 text-gray-500">
            <Link to="/signup" className="text-indigo-600 font-medium">
              ← Back to Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}