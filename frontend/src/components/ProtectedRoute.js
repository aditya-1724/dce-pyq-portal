import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  console.log("🔍 Checking student access...");
  
  const token = localStorage.getItem("access_token");
  console.log("Token:", token ? "✅ Present" : "❌ Missing");
  
  if (!token) {
    console.log("⛔ No token, redirecting to login");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Student access granted");
  return children;
};

export default ProtectedRoute;