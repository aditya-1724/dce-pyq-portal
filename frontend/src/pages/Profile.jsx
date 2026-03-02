import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingFavorite, setEditingFavorite] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFavorite, setNewFavorite] = useState({ subjectId: '', title: '', type: 'Sessional' });
  const [profilePic, setProfilePic] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const userFromStorage = JSON.parse(localStorage.getItem("user"));

  // Load user data from localStorage immediately
  useEffect(() => {
    if (userFromStorage) {
      setUserData(userFromStorage);
    }
  }, [userFromStorage]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/profile", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("👤 Profile API response:", data);
      
      if (data.success) {
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSubjects = useCallback(async () => {
    if (!userData?.branch || !userData?.semester) {
      console.log("⏳ Waiting for user data...");
      return;
    }
    
    try {
      console.log("🔍 Fetching subjects from API...");
      const res = await fetch(
        `https://dce-pyq-portal-production.up.railway.app/subjects/${userData.branch}/${userData.semester}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log("📥 Subjects received:", data);
      
      if (Array.isArray(data)) {
        setSubjects(data);
        console.log("✅ Subjects set in state:", data.length);
      } else {
        console.log("❌ Unexpected response format:", data);
        setSubjects([]);
      }
    } catch (error) {
      console.error("❌ Error fetching subjects:", error);
      setSubjects([]);
    }
  }, [userData?.branch, userData?.semester, token]);

  const fetchFavorites = useCallback(async () => {
    setFavorites([
      { 
        id: 1, 
        title: "Data Structures Sessional 2023", 
        subject: "Data Structures", 
        subjectId: 1,
        type: "Sessional",
        addedOn: "2024-02-20"
      },
      { 
        id: 2, 
        title: "Algorithms University PYQ 2022", 
        subject: "Algorithms", 
        subjectId: 2,
        type: "University",
        addedOn: "2024-02-18"
      },
    ]);
  }, []);

  const loadProfilePic = useCallback(() => {
    const savedPic = localStorage.getItem("profile_pic");
    if (savedPic) {
      setProfilePic(savedPic);
    }
  }, []);

  // Initial setup
  useEffect(() => {
    if (!token || !userFromStorage) {
      navigate("/");
      return;
    }
    
    fetchUserProfile();
    fetchFavorites();
    loadProfilePic();
  }, [token, userFromStorage, navigate, fetchUserProfile, fetchFavorites, loadProfilePic]);

  // Fetch subjects when userData is available
  useEffect(() => {
    if (userData?.branch && userData?.semester) {
      console.log("📚 Fetching subjects for:", userData.branch, userData.semester);
      fetchSubjects();
    }
  }, [userData?.branch, userData?.semester, fetchSubjects]);

  // ==================== HANDLERS ====================
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem("profile_pic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    localStorage.removeItem("profile_pic");
  };

  const handleAddFavorite = () => {
    if (newFavorite.subjectId && newFavorite.title) {
      const selectedSubject = subjects.find(s => s.id === parseInt(newFavorite.subjectId));
      const favorite = {
        id: Date.now(),
        title: newFavorite.title,
        subject: selectedSubject?.subject_name,
        subjectId: newFavorite.subjectId,
        type: newFavorite.type,
        addedOn: new Date().toISOString().split('T')[0]
      };
      setFavorites([...favorites, favorite]);
      setNewFavorite({ subjectId: '', title: '', type: 'Sessional' });
      setShowAddForm(false);
    }
  };

  const handleEditFavorite = (favorite) => {
    setEditingFavorite({ ...favorite });
  };

  const handleSaveFavorite = () => {
    if (editingFavorite) {
      const updatedFavorites = favorites.map(f => 
        f.id === editingFavorite.id ? editingFavorite : f
      );
      setFavorites(updatedFavorites);
      setEditingFavorite(null);
    }
  };

  const handleDeleteFavorite = (id) => {
    if (window.confirm("Remove from favorites?")) {
      const updatedFavorites = favorites.filter(f => f.id !== id);
      setFavorites(updatedFavorites);
    }
  };

  const handleCancelEdit = () => {
    setEditingFavorite(null);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject?.subject_name || '';
  };

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ==================== UPGRADE FUNCTIONS ====================
  const checkEligibility = () => {
    if (!userData) return { eligible: false, message: "" };
    if (userData.semester >= 8) return { eligible: false, message: "Final semester completed" };
    
    const joinDate = new Date(userData.created_at);
    const now = new Date();
    
    const monthsPassed = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                        (now.getMonth() - joinDate.getMonth());
    
    const eligibleSemester = 1 + Math.floor(monthsPassed / 6);
    
    if (eligibleSemester > userData.semester) {
      return { 
        eligible: true, 
        message: `Semester ${userData.semester + 1} is now available!`,
        nextSemester: userData.semester + 1
      };
    } else {
      const nextDate = new Date(joinDate);
      nextDate.setMonth(joinDate.getMonth() + (6 * userData.semester));
      
      return { 
        eligible: false, 
        message: `Semester ${userData.semester + 1} available from ${nextDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      };
    }
  };

  const handleUpgrade = async () => {
    if (userData.semester >= 8) {
      alert("You've completed all semesters! 🎓");
      return;
    }
    
    try {
      const res = await fetch("https://dce-pyq-portal-production.up.railway.app/upgrade-semester", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          currentSemester: userData.semester
        })
      });
      
      const data = await res.json();
      if (data.success) {
        const updatedUser = { 
          ...userData, 
          semester: data.newSemester,
          year: data.newYear,
          last_upgraded: new Date().toISOString()
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        alert(`✅ Upgraded to Semester ${data.newSemester}!`);
      } else {
        alert(data.message || "Upgrade failed");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    }
  };

  if (loading && !userData) {
    return (
      <div className="profile-container">
        <div className="loader">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="profile-header glass-effect text-center p-6 md:p-8 mb-6 rounded-2xl">
        <div className="profile-pic-container w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 relative">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white/30" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
              {userData?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          
          <div className="absolute bottom-0 right-0 flex gap-1">
            <label htmlFor="profile-pic-input" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition border border-white/30">
              📷
              <input type="file" id="profile-pic-input" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
            </label>
            {profilePic && (
              <button onClick={removeProfilePic} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition border border-white/30">
                ❌
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{formatName(userData?.name) || 'User'}</h1>
        <p className="text-xs md:text-sm text-white/60 mb-4">{userData?.role?.toUpperCase() || 'STUDENT'}</p>
        
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-lg md:text-xl font-bold text-yellow-400 mr-2">{favorites.length}</span>
            <span className="text-xs md:text-sm text-white/70">Favorites</span>
          </div>
        </div>
      </div>

      {/* User Info Cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3">
          <span className="text-xl md:text-2xl">📚</span>
          <div>
            <div className="text-xs text-white/50">Branch</div>
            <div className="text-sm md:text-base font-semibold text-white">{userData?.branch || 'N/A'}</div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3">
          <span className="text-xl md:text-2xl">📅</span>
          <div>
            <div className="text-xs text-white/50">Year</div>
            <div className="text-sm md:text-base font-semibold text-white">{userData?.year || 'N/A'}</div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3">
          <span className="text-xl md:text-2xl">📖</span>
          <div>
            <div className="text-xs text-white/50">Semester</div>
            <div className="text-sm md:text-base font-semibold text-white">{userData?.semester || 'N/A'}</div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3">
          <span className="text-xl md:text-2xl">🆔</span>
          <div>
            <div className="text-xs text-white/50">Roll No</div>
            <div className="text-sm md:text-base font-semibold text-white">{userData?.roll_number || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* UPGRADE SECTION */}
      {userData?.semester < 8 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6">
          <h3 className="text-white font-semibold mb-3 text-base md:text-lg">📅 Semester Progress</h3>
          
          {(() => {
            const eligibility = checkEligibility();
            return (
              <>
                <p className="text-white/70 text-xs md:text-sm mb-4">{eligibility.message}</p>
                
                {eligibility.eligible ? (
                  <button
                    onClick={handleUpgrade}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <span>⬆️</span>
                    Upgrade to Semester {eligibility.nextSemester}
                  </button>
                ) : (
                  <div className="w-full py-3 bg-gray-600/50 text-gray-400 rounded-lg font-semibold text-center cursor-not-allowed text-sm md:text-base">
                    ⏳ Waiting for next semester
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Favorites Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">
            <span className="text-xl">⭐</span> My Favorites
          </h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm transition"
          >
            {showAddForm ? '✕ Cancel' : '+ Add'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white/5 rounded-lg p-4 mb-4 space-y-3">
            <select 
              value={newFavorite.subjectId} 
              onChange={(e) => setNewFavorite({...newFavorite, subjectId: e.target.value})} 
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.subject_name}</option>
              ))}
            </select>
            
            <input 
              type="text" 
              placeholder="Paper Title" 
              value={newFavorite.title} 
              onChange={(e) => setNewFavorite({...newFavorite, title: e.target.value})} 
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
            />
            
            <select 
              value={newFavorite.type} 
              onChange={(e) => setNewFavorite({...newFavorite, type: e.target.value})} 
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
            >
              <option value="Sessional">Sessional</option>
              <option value="PreUniversity">Pre-University</option>
              <option value="University">University</option>
            </select>
            
            <button onClick={handleAddFavorite} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">
              Add to Favorites
            </button>
          </div>
        )}
        
        {favorites.length === 0 ? (
          <p className="text-white/50 text-center py-8 text-sm">No favorites yet</p>
        ) : (
          <div className="space-y-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white/5 rounded-lg p-3 md:p-4">
                {editingFavorite?.id === favorite.id ? (
                  <div className="space-y-2">
                    <select 
                      value={editingFavorite.subjectId} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, subjectId: e.target.value})} 
                      className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                    >
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.subject_name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      value={editingFavorite.title} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, title: e.target.value})} 
                      className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                    />
                    <select 
                      value={editingFavorite.type} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, type: e.target.value})} 
                      className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                    >
                      <option value="Sessional">Sessional</option>
                      <option value="PreUniversity">Pre-University</option>
                      <option value="University">University</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleSaveFavorite} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm">Save</button>
                      <button onClick={handleCancelEdit} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm md:text-base truncate">{favorite.title}</p>
                        <p className="text-white/50 text-xs md:text-sm mt-1">
                          {favorite.subject} • {favorite.type}
                        </p>
                        <p className="text-white/30 text-xs mt-1">Added: {favorite.addedOn}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEditFavorite(favorite)} className="p-2 bg-blue-600/20 hover:bg-blue-600 rounded-lg text-white">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteFavorite(favorite.id)} className="p-2 bg-red-600/20 hover:bg-red-600 rounded-lg text-white">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;