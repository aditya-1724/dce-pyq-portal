import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Pyqs() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const subjectId = searchParams.get("subjectId");
  const subjectName = searchParams.get("subjectName");
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("access_token");

  const paperTypes = ["all", "Sessional", "PreUniversity", "University"];

  // 👇 FETCH PAPERS FUNCTION - useCallback mein wrap kiya
  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://dce-pyq-portal-production.up.railway.app/pyqs/${subjectId}/${user.branch}/${user.semester}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await res.json();
      
      if (data.success) {
        setPapers(data.papers || []);
        setFilteredPapers(data.papers || []);
      } else {
        setPapers([]);
        setFilteredPapers([]);
        setError("No papers found");
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      setError("Failed to load papers");
    } finally {
      setLoading(false);
    }
  }, [subjectId, user?.branch, user?.semester, token]); // 👈 dependencies

  // 👇 USE EFFECT - dependencies sahi kiya
  useEffect(() => {
    if (!token || !user) {
      navigate("/");
      return;
    }
    if (!subjectId) {
      navigate("/subjects");
      return;
    }
    fetchPapers();
  }, [subjectId, token, user, navigate, fetchPapers]);

  // Filter by type and search
  useEffect(() => {
    let filtered = papers;
    
    if (selectedType !== "all") {
      filtered = filtered.filter(paper => paper.type === selectedType);
    }
    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paper.year && paper.year.toString().includes(searchTerm))
      );
    }
    
    setFilteredPapers(filtered);
  }, [selectedType, searchTerm, papers]);

  const handlePreview = (fileUrl) => {
    const fullUrl = `https://dce-pyq-portal-production.up.railway.app/uploads/${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  const handleDownload = (fileUrl, fileName) => {
    const fullUrl = `https://dce-pyq-portal-production.up.railway.app/download/${fileUrl}`;
    window.location.href = fullUrl;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/subjects")}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          ← Back to Subjects
        </button>
      </div>

      {/* Subject Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{decodeURIComponent(subjectName || '')}</h1>
        <p className="text-white/60">
          {user?.branch} - Semester {user?.semester}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search papers by title or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-500 transition"
          />
          <span className="absolute left-3 top-3 text-white/50">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {paperTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {type === 'all' ? 'All Papers' : type}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
          <p className="text-white/60 text-lg">📄 No papers found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2">{paper.title}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                      {paper.type}
                    </span>
                    {paper.year && (
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">
                        {paper.year}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(paper.file_url)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => handleDownload(paper.file_url)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}