import React, { useState, useEffect } from "react";
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
  }, []);

  // Fetch subjects when userData is available
  useEffect(() => {
    if (userData?.branch && userData?.semester) {
      console.log("📚 Fetching subjects for:", userData.branch, userData.semester);
      fetchSubjects();
    }
  }, [userData]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/profile", {
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
  };

  const fetchSubjects = async () => {
    if (!userData?.branch || !userData?.semester) {
      console.log("⏳ Waiting for user data...");
      return;
    }
    
    try {
      console.log("🔍 Fetching subjects from API...");
      const res = await fetch(
        `http://127.0.0.1:5000/subjects/${userData.branch}/${userData.semester}`,
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
  };

  const fetchFavorites = async () => {
    // Mock data - replace with actual API
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
  };

  const loadProfilePic = () => {
    const savedPic = localStorage.getItem("profile_pic");
    if (savedPic) {
      setProfilePic(savedPic);
    }
  };

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

  // 👇 UPGRADE FUNCTIONS
  const checkEligibility = () => {
    if (!userData) return { eligible: false, message: "" };
    if (userData.semester >= 8) return { eligible: false, message: "Final semester completed" };
    
    const joinDate = new Date(userData.created_at);
    const now = new Date();
    
    // Months since joining
    const monthsPassed = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                        (now.getMonth() - joinDate.getMonth());
    
    // Each semester = 6 months
    const eligibleSemester = 1 + Math.floor(monthsPassed / 6);
    
    if (eligibleSemester > userData.semester) {
      return { 
        eligible: true, 
        message: `Semester ${userData.semester + 1} is now available!`,
        nextSemester: userData.semester + 1
      };
    } else {
      // Calculate next available date
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
      const res = await fetch("http://127.0.0.1:5000/upgrade-semester", {
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
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header glass-effect">
        <div className="profile-pic-container">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-avatar">
              {userData?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          
          <div className="profile-pic-actions">
            <label htmlFor="profile-pic-input" className="pic-upload-btn">
              📷
              <input type="file" id="profile-pic-input" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} />
            </label>
            {profilePic && (
              <button onClick={removeProfilePic} className="pic-remove-btn">❌</button>
            )}
          </div>
        </div>

        <h1 className="profile-name">{formatName(userData?.name) || 'User'}</h1>
        <p className="profile-role">{userData?.role?.toUpperCase() || 'STUDENT'}</p>
        
        <div className="profile-stats-mini">
          <div className="stat-mini">
            <span className="stat-mini-value">{favorites.length}</span>
            <span className="stat-mini-label">Favorites</span>
          </div>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="info-cards-grid">
        <div className="info-card glass-effect">
          <div className="info-icon">📚</div>
          <div className="info-content">
            <span className="info-label">Branch</span>
            <span className="info-value">{userData?.branch || 'N/A'}</span>
          </div>
        </div>
        
        <div className="info-card glass-effect">
          <div className="info-icon">📅</div>
          <div className="info-content">
            <span className="info-label">Year</span>
            <span className="info-value">{userData?.year || 'N/A'}</span>
          </div>
        </div>
        
        <div className="info-card glass-effect">
          <div className="info-icon">📖</div>
          <div className="info-content">
            <span className="info-label">Semester</span>
            <span className="info-value">{userData?.semester || 'N/A'}</span>
          </div>
        </div>
        
        <div className="info-card glass-effect">
          <div className="info-icon">🆔</div>
          <div className="info-content">
            <span className="info-label">Roll Number</span>
            <span className="info-value">{userData?.roll_number || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 👇 UPGRADE SECTION */}
      {userData?.semester < 8 && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-semibold mb-2">📅 Semester Progress</h3>
          
          {(() => {
            const eligibility = checkEligibility();
            return (
              <>
                <p className="text-white/70 text-sm mb-3">{eligibility.message}</p>
                
                {eligibility.eligible ? (
                  <button
                    onClick={handleUpgrade}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span>⬆️</span>
                    Upgrade to Semester {eligibility.nextSemester}
                  </button>
                ) : (
                  <div className="w-full py-3 bg-gray-600/50 text-gray-400 rounded-lg font-semibold text-center cursor-not-allowed">
                    ⏳ Waiting for next semester
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Favorites Section */}
      <div className="activity-section glass-effect">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">⭐</span>
            My Favorites
          </h2>
          <button className="add-favorite-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancel' : '+ Add Favorite'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-favorite-form">
            <select 
              value={newFavorite.subjectId} 
              onChange={(e) => setNewFavorite({...newFavorite, subjectId: e.target.value})} 
              className="form-input"
            >
              <option value="">Select Subject</option>
              {subjects.length === 0 ? (
                <option value="" disabled>Loading subjects...</option>
              ) : (
                subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))
              )}
            </select>
            
            <input 
              type="text" 
              placeholder="Paper Title" 
              value={newFavorite.title} 
              onChange={(e) => setNewFavorite({...newFavorite, title: e.target.value})} 
              className="form-input" 
            />
            
            <select 
              value={newFavorite.type} 
              onChange={(e) => setNewFavorite({...newFavorite, type: e.target.value})} 
              className="form-input"
            >
              <option value="Sessional">Sessional</option>
              <option value="PreUniversity">Pre-University</option>
              <option value="University">University</option>
            </select>
            
            <button onClick={handleAddFavorite} className="save-btn">Add to Favorites</button>
          </div>
        )}
        
        {favorites.length === 0 ? (
          <p className="no-data">No favorites yet. Click "Add Favorite" to add some!</p>
        ) : (
          <div className="papers-list">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="paper-item glass-card">
                {editingFavorite?.id === favorite.id ? (
                  <div className="edit-favorite-form">
                    <select 
                      value={editingFavorite.subjectId} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, subjectId: e.target.value, subject: getSubjectName(e.target.value)})} 
                      className="edit-input"
                    >
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.subject_name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      value={editingFavorite.title} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, title: e.target.value})} 
                      className="edit-input" 
                    />
                    <select 
                      value={editingFavorite.type} 
                      onChange={(e) => setEditingFavorite({...editingFavorite, type: e.target.value})} 
                      className="edit-input"
                    >
                      <option value="Sessional">Sessional</option>
                      <option value="PreUniversity">Pre-University</option>
                      <option value="University">University</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={handleSaveFavorite} className="save-btn">Save</button>
                      <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="paper-info">
                      <span className="paper-title">{favorite.title}</span>
                      <span className="paper-subject">{favorite.subject} • {favorite.type}</span>
                      <span className="paper-date">Added: {favorite.addedOn}</span>
                    </div>
                    <div className="paper-actions">
                      <button className="edit-btn-small" onClick={() => handleEditFavorite(favorite)}>✏️</button>
                      <button className="delete-btn-small" onClick={() => handleDeleteFavorite(favorite.id)}>🗑️</button>
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