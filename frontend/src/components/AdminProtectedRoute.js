import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  console.log("🔍 Checking admin access...");
  
  const token = localStorage.getItem("access_token");
  console.log("Token:", token ? "✅ Present" : "❌ Missing");
  
  const userStr = localStorage.getItem("user");
  console.log("User string:", userStr);
  
  if (!token || !userStr) {
    console.log("⛔ No token/user, redirecting to login");
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    console.log("User role:", user.role);
    
    if (user.role !== 'admin') {
      console.log("⛔ Not admin, redirecting to student dashboard");
      return <Navigate to="/dashboard" replace />;
    }

    console.log("✅ Admin access granted");
    return children;
  } catch (error) {
    console.log("⛔ Error parsing user, clearing storage");
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
};

export default AdminProtectedRoute;