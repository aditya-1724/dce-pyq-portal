import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileBg from "../layout/college.jpg";
import {
  FaHome,
  FaBook,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaFileAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

const Sidebar = ({ activeSection, setActiveSection, onSubjectSelect }) => {
  const [openSubjects, setOpenSubjects] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");
  const studentName = user?.name || "Student";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (openSubjects && user?.branch && user?.semester) {
      fetchSubjects();
    }
  }, [openSubjects]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://dce-pyq-portal-production.up.railway.app/subjects/${user.branch}/${user.semester}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
    setIsMobileOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (section) => activeSection === section;

  return (
    <>
      {/* Mobile Header with Hamburger Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10">
        <h2 className="text-xl font-bold text-white">DCE Portal</h2>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition"
        >
          {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static top-0 left-0 z-50
          w-64 h-screen
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          text-white shadow-2xl overflow-hidden flex flex-col
        `}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${profileBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/0 backdrop-blur-md"></div>
        
        <div className="relative z-10 p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2 text-white drop-shadow-lg hidden md:block">DCE Portal</h2>
          <p className="text-sm mb-6 text-white/80 mt-12 md:mt-0">👋 {studentName}</p>

          {/* Dashboard */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-all
              ${isActive("dashboard") 
                ? 'bg-white/20 backdrop-blur-sm border border-white/20' 
                : 'hover:bg-white/10 text-white/90'}`}
            onClick={() => handleNavClick("/dashboard")}
          >
            <FaHome /> Dashboard
          </div>

          {/* Subjects Dropdown */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2
              hover:bg-white/10
              text-white/90 transition-all"
            onClick={() => setOpenSubjects(!openSubjects)}
          >
            <FaBook /> Subjects
            <FaChevronDown className={`ml-auto transition-transform ${openSubjects ? 'rotate-180' : ''}`} />
          </div>

          {/* Subjects List */}
          <div className={`ml-4 space-y-1 overflow-hidden transition-all ${openSubjects ? 'max-h-96' : 'max-h-0'}`}>
            {loading ? (
              <div className="p-2 text-sm text-white/70">Loading subjects...</div>
            ) : subjects.length === 0 ? (
              <div className="p-2 text-sm text-white/70">No subjects found</div>
            ) : (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer
                    hover:bg-white/10
                    text-white/80 text-sm transition-all"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <FaFileAlt className="text-xs" /> {subject.subject_name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 p-6 pt-0 space-y-2 border-t border-white/10">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
              ${isActive("profile") 
                ? 'bg-white/20 backdrop-blur-sm border border-white/20' 
                : 'hover:bg-white/10 text-white/90'}`}
            onClick={() => handleNavClick("/profile")}
          >
            <FaUser /> Profile
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer
              hover:bg-red-600/80 hover:text-white
              text-white/90 transition-all"
            onClick={() => {
              localStorage.clear();
              window.location.replace("/");
            }}
          >
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;