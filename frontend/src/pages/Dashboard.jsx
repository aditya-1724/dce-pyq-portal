import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom"; 
import collegeImage from "../layout/college.jpg";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);  
  const [downloadedCount, setDownloadedCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentPapers, setRecentPapers] = useState([]);
  const [showSection, setShowSection] = useState(null); // 'recent', 'favorites', 'analytics'
  const sectionRef = useRef(null);

  // Fetch subjects function
  const fetchSubjects = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/subjects/${user.branch}/${user.semester}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Load subjects on mount
  useEffect(() => {
    if (user?.branch && user?.semester) {
      fetchSubjects();
    }
  }, [user?.branch, user?.semester]);

  useEffect(() => {
    const savedCount = localStorage.getItem(`downloaded_${user?.id || 'guest'}`);
    if (savedCount) {
      setDownloadedCount(parseInt(savedCount));
    }
  }, [user?.id]);

  // Handle subject selection from sidebar
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedType(null);
    setSelectedYear(null);
    setPapers([]);
    setFilteredPapers([]);
    setYears([]);
    setActiveSection("subjectView");
  };

  // Fetch papers by type
  const fetchPapers = async (type) => {
    setLoading(true);
    setSelectedType(type);
    setSelectedYear(null);
    
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/pyqs/${selectedSubject.id}/${user.branch}/${user.semester}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data.success) {
        const typePapers = data.papers.filter(paper => paper.type === type);
        setPapers(typePapers);
        setFilteredPapers(typePapers);
        
        const uniqueYears = [...new Set(typePapers.map(p => {
          if (p.year) {
            return p.year;
          }
          return "Unknown";
        }))].filter(y => y !== "Unknown").sort().reverse();
        
        setYears(uniqueYears);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Track paper view
  const trackPaperView = (paper) => {
    const recentPapers = JSON.parse(localStorage.getItem('recent_papers') || '[]');
    
    const newRecent = [
      {
        id: paper.id,
        title: paper.title,
        subject: paper.subject_name || selectedSubject?.subject_name,
        type: paper.type,
        viewedAt: new Date().toISOString()
      },
      ...recentPapers.filter(p => p.id !== paper.id)
    ].slice(0, 5);
    
    localStorage.setItem('recent_papers', JSON.stringify(newRecent));
    setRecentPapers(newRecent);
  };

  // Filter papers by year
  const filterByYear = (year) => {
    setSelectedYear(year);
    if (year === "all") {
      setFilteredPapers(papers);
    } else {
      const filtered = papers.filter(p => p.year === year);
      setFilteredPapers(filtered);
    }
  };

  // Preview - New tab mein open
  const handlePreview = (fileUrl, paper) => {
    trackPaperView(paper);
    const fullUrl = `http://127.0.0.1:5000/uploads/${fileUrl}`;
    window.open(fullUrl, '_blank');
  };
  
  // Download - Backend se force download
  const handleDownload = (fileUrl, fileName, paper) => {
    trackPaperView(paper);
    const downloadUrl = `http://127.0.0.1:5000/download/${fileUrl}`;
    console.log("📥 Force downloading:", downloadUrl);
    window.location.href = downloadUrl;
    
    const newCount = downloadedCount + 1;
    setDownloadedCount(newCount);
    localStorage.setItem(`downloaded_${user?.id || 'guest'}`, newCount.toString());
  };

  // Handle back button
  const handleBack = () => {
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedYear(null);
    setPapers([]);
    setFilteredPapers([]);
    setYears([]);
    setActiveSection("dashboard");
  };

  // Show recent papers
  const showRecentPapers = (papers) => {
    setRecentPapers(papers);
    setShowRecentModal(true);
  };

  // Show analytics
  const showAnalytics = () => {
    const downloaded = parseInt(localStorage.getItem(`downloaded_${user?.id || 'guest'}`) || '0');
    const recent = JSON.parse(localStorage.getItem('recent_papers') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    alert(`
📊 Your Progress:
📥 Total Downloads: ${downloaded}
🔥 Recent Views: ${recent.length}
⭐ Favorites: ${favorites.length}
📚 Total Subjects: ${subjects.length}
    `);
  };

  // Format name
  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render content based on state
  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="content-section">
          <div className="welcome-section">
            <div className="user-badge">🎓 Student Dashboard</div>
            <h1 className="welcome-title">
              Welcome back, {formatName(user?.name)}! 👋
            </h1>
            
            <div className="user-info-detailed">
              <div className="info-chip">
                <span className="info-chip-icon">📚</span>
                <div className="info-chip-content">
                  <span className="info-chip-label">Branch</span>
                  <span className="info-chip-value">{user?.branch?.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="info-chip">
                <span className="info-chip-icon">📅</span>
                <div className="info-chip-content">
                  <span className="info-chip-label">Year</span>
                  <span className="info-chip-value">{user?.year}</span>
                </div>
              </div>
              
              <div className="info-chip">
                <span className="info-chip-icon">📖</span>
                <div className="info-chip-content">
                  <span className="info-chip-label">Semester</span>
                  <span className="info-chip-value">{user?.semester}</span>
                </div>
              </div>
              
              <div className="info-chip">
                <span className="info-chip-icon">🆔</span>
                <div className="info-chip-content">
                  <span className="info-chip-label">Roll Number</span>
                  <span className="info-chip-value">{user?.roll_number}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card-modern">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{subjects.length}</div>
              <div className="stat-label">Total Subjects</div>
            </div>
            
            <div className="stat-card-modern">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{downloadedCount}</div>
              <div className="stat-label">Papers Downloaded</div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="quick-access">
            <h3 className="quick-access-title text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Quick Access
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Recent Activity */}
              <div 
                className="access-item bg-white/5 hover:bg-blue-600/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 border border-white/10 hover:border-blue-500"
                onClick={() => {
                  setShowSection('recent');
                  setTimeout(() => {
                    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <span className="text-3xl block mb-2">🔥</span>
                <span className="text-sm font-medium block">Recent</span>
                <span className="text-xs text-white/50">Last viewed</span>
              </div>
              
              {/* Favorites */}
              <div 
                className="access-item bg-white/5 hover:bg-yellow-600/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 border border-white/10 hover:border-yellow-500"
                onClick={() => {
                  setShowSection('favorites');
                  setTimeout(() => {
                    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <span className="text-3xl block mb-2">⭐</span>
                <span className="text-sm font-medium block">Favorites</span>
                <span className="text-xs text-white/50">Bookmarked</span>
              </div>
              
              {/* Analytics */}
              <div 
                className="access-item bg-white/5 hover:bg-purple-600/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 border border-white/10 hover:border-purple-500"
                onClick={() => {
                  setShowSection('analytics');
                  setTimeout(() => {
                    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <span className="text-3xl block mb-2">📊</span>
                <span className="text-sm font-medium block">Analytics</span>
                <span className="text-xs text-white/50">Your stats</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSubject) {
      return (
        <div className="content-section">
          <button onClick={handleBack} className="back-btn">
            ← Back to Dashboard
          </button>
          
          <h2 className="section-title">{selectedSubject.subject_name}</h2>
          <p className="subject-info">
            {user?.branch} - Semester {user?.semester}
          </p>

          <div className="options-grid">
            <button
              onClick={() => fetchPapers("Sessional")}
              className={`option-btn sessional ${selectedType === "Sessional" ? "active" : ""}`}
            >
              📝 Sessional
            </button>
            <button
              onClick={() => fetchPapers("PreUniversity")}
              className={`option-btn pre ${selectedType === "PreUniversity" ? "active" : ""}`}
            >
              📚 Pre-University
            </button>
            <button
              onClick={() => fetchPapers("University")}
              className={`option-btn uni ${selectedType === "University" ? "active" : ""}`}
            >
              🎓 University PYQ
            </button>
          </div>

          {selectedType && years.length > 0 && (
            <div className="years-section">
              <h3 className="years-title">📅 Available Years</h3>
              <div className="years-list">
                <button
                  onClick={() => filterByYear("all")}
                  className={`year-btn ${selectedYear === null ? "active" : ""}`}
                >
                  All Years
                </button>
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => filterByYear(year)}
                    className={`year-btn ${selectedYear === year ? "active" : ""}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedType && (
            <div className="papers-section">
              <h3 className="papers-title">
                {selectedType === "Sessional" ? "Sessional Papers" :
                 selectedType === "PreUniversity" ? "Pre-University Papers" :
                 "University PYQs"}
                {selectedYear && ` - ${selectedYear}`}
                <span className="papers-count">({filteredPapers.length})</span>
              </h3>

              {loading ? (
                <div className="loader">Loading papers...</div>
              ) : filteredPapers.length === 0 ? (
                <p className="no-data">
                  No {selectedType} papers available for this subject
                  {selectedYear ? ` in ${selectedYear}` : ""}
                </p>
              ) : (
                <div className="papers-list">
                  {filteredPapers.map((paper) => {
                    const extension = paper.file_url?.split('.').pop().toUpperCase();
                    
                    return (
                      <div key={paper.id} className="paper-item">
                        <div className="paper-info">
                          <span className="paper-title">{paper.title}</span>
                          {paper.year && (
                            <span className="paper-year">{paper.year}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(paper.file_url, paper)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            👁️ Preview
                          </button>
                          <button
                            onClick={() => handleDownload(paper.file_url, paper.title, paper)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="content-section">
        <div className="welcome-section">
          <div className="user-badge">🎓 Student Dashboard</div>
          <h1 className="welcome-title">
            Welcome back, {formatName(user?.name)}! 👋
          </h1>
          
          <div className="user-info-detailed">
            <div className="info-chip">
              <span className="info-chip-icon">📚</span>
              <div className="info-chip-content">
                <span className="info-chip-label">Branch</span>
                <span className="info-chip-value">{user?.branch?.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="info-chip">
              <span className="info-chip-icon">📅</span>
              <div className="info-chip-content">
                <span className="info-chip-label">Year</span>
                <span className="info-chip-value">{user?.year}</span>
              </div>
            </div>
            
            <div className="info-chip">
              <span className="info-chip-icon">📖</span>
              <div className="info-chip-content">
                <span className="info-chip-label">Semester</span>
                <span className="info-chip-value">{user?.semester}</span>
              </div>
            </div>
            
            <div className="info-chip">
              <span className="info-chip-icon">🆔</span>
              <div className="info-chip-content">
                <span className="info-chip-label">Roll Number</span>
                <span className="info-chip-value">{user?.roll_number}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card-modern">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Total Subjects</div>
          </div>
          
          <div className="stat-card-modern">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{downloadedCount}</div>
            <div className="stat-label">Papers Downloaded</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onSubjectSelect={handleSubjectSelect}
      />

      <div className="flex-1 overflow-y-auto relative">
        <div 
          className="fixed inset-0 -z-10"
          style={{ 
            backgroundImage: `url(${collegeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        <div className="relative z-10 min-h-screen p-8 bg-black/30 backdrop-blur-md text-white">
          {renderContent()}
          
          {/* Dynamic Content Section - Recent, Favorites, Analytics */}
          <div ref={sectionRef} className="mt-8 space-y-6">
            {/* Recent Activity Section */}
            {showSection === 'recent' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 animate-fadeIn">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🔥</span> Recent Activity
                  <button 
                    onClick={() => setShowSection(null)}
                    className="ml-auto text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Hide
                  </button>
                </h3>
                
                {recentPapers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPapers.map((paper, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-blue-500 transition cursor-pointer"
                        onClick={() => {
                          if (paper.file_url) {
                            window.open(`http://127.0.0.1:5000/uploads/${paper.file_url}`, '_blank');
                          }
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="text-white font-medium">{paper.title}</p>
                            <p className="text-white/50 text-sm">{paper.subject} • {paper.type}</p>
                            <p className="text-white/30 text-xs mt-1">{new Date(paper.viewedAt).toLocaleString()}</p>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300">👁️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Section */}
            {showSection === 'favorites' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 animate-fadeIn">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⭐</span> My Favorites
                  <button 
                    onClick={() => setShowSection(null)}
                    className="ml-auto text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Hide
                  </button>
                </h3>
                
                {JSON.parse(localStorage.getItem('favorites') || '[]').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">No favorites yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {JSON.parse(localStorage.getItem('favorites') || '[]').map((fav, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-white font-medium">{fav.title}</p>
                        <p className="text-white/50 text-sm">{fav.subject} • {fav.type}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Section */}
            {showSection === 'analytics' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 animate-fadeIn">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Your Analytics
                  <button 
                    onClick={() => setShowSection(null)}
                    className="ml-auto text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Hide
                  </button>
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <span className="text-3xl text-blue-400">{downloadedCount}</span>
                    <p className="text-white/60 text-sm">Downloads</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <span className="text-3xl text-orange-400">{recentPapers.length}</span>
                    <p className="text-white/60 text-sm">Recent Views</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <span className="text-3xl text-yellow-400">
                      {JSON.parse(localStorage.getItem('favorites') || '[]').length}
                    </span>
                    <p className="text-white/60 text-sm">Favorites</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <span className="text-3xl text-green-400">{subjects.length}</span>
                    <p className="text-white/60 text-sm">Subjects</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Papers Modal */}
      {showRecentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">🔥 Recent Activity</h3>
              <button
                onClick={() => setShowRecentModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {recentPapers.length === 0 ? (
              <p className="text-white/60 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentPapers.map((paper, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer hover:border-blue-500 transition"
                    onClick={() => {
                      setShowRecentModal(false);
                      if (paper.file_url) {
                        window.open(`http://127.0.0.1:5000/uploads/${paper.file_url}`, '_blank');
                      }
                    }}
                  >
                    <p className="text-white font-medium">{paper.title}</p>
                    <p className="text-white/50 text-sm mt-1">
                      {paper.subject} • {paper.type}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(paper.viewedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => {
                localStorage.removeItem('recent_papers');
                setRecentPapers([]);
                setShowRecentModal(false);
              }}
              className="mt-4 w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition"
            >
              Clear History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;