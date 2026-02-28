import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./login/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Pyqs from "./pages/Pyqs";
import Subjects from "./pages/Subjects";
//import { ThemeProvider } from "./context/ThemeContext";  // ✅ Import sahi hai
import Profile from "./pages/Profile";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyOTP from './pages/VerifyOTP';

function App() {
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.reload();
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    //<ThemeProvider>  for dark mode
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ADMIN ROUTE */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* PROTECTED ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pyqs" element={<Pyqs />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    //</ThemeProvider>  aage kabhi add kerunga 
  );
}

export default App;