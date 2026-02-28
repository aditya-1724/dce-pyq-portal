import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import collegeImage from "../layout/college.jpg";

export default function AdminDashboard() {
  const [subjectName, setSubjectName] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [paperType, setPaperType] = useState("");
  const [file, setFile] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uniqueSubjectsCount, setUniqueSubjectsCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [year, setYear] = useState(""); 

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if admin
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate("/");
    }
  }, [navigate]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/subjects", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
        setTotalEntries(data.length);
        console.log(`✅ ${data.length} subjects loaded`);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchUniqueSubjectsCount = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/subjects/count", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUniqueSubjectsCount(data.count);
        console.log(`✅ Unique subjects: ${data.count}`);
      }
    } catch (error) {
      console.error("Error fetching unique count:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchSubjects();
    fetchUniqueSubjectsCount();
  }, []);

  // Filter subjects based on branch & semester
  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      const filtered = subjects.filter(
        (sub) =>
          sub.branch === selectedBranch &&
          sub.semester === parseInt(selectedSemester)
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedBranch, selectedSemester, subjects]);

  // Add Subject
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("http://127.0.0.1:5000/add-subject", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject_name: subjectName, branch, semester }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "✅ Subject added successfully!" });
        setSubjectName("");
        setBranch("");
        setSemester("");
        fetchSubjects();
        fetchUniqueSubjectsCount();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to add subject" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  // Upload Paper - WITHOUT TITLE
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedBranch || !selectedSemester || !paperType || !year || !file) {
      setMessage({ type: "error", text: "Please fill all fields!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("subject_id", selectedSubject);
    formData.append("branch", selectedBranch);
    formData.append("semester", selectedSemester);
    formData.append("type", paperType);
    formData.append("year", year);
    formData.append("file", file);

    // Auto-generate title from selection
    const selectedSubjectObj = subjects.find(s => s.id === parseInt(selectedSubject));
    const autoTitle = `${selectedSubjectObj?.subject_name || 'Paper'} ${paperType} ${year}`;
    formData.append("title", autoTitle);
    try {
      const res = await fetch("http://127.0.0.1:5000/upload-pyq", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "✅ Paper uploaded successfully!" });
        setSelectedSubject("");
        setPaperType("");
        setYear("");
        setFile(null);
        document.getElementById('file-input').value = '';
      } else {
        setMessage({ type: "error", text: data.message || "Upload failed!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server!" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen">
      <div 
        className="fixed inset-0 -z-10"
        style={{ 
          backgroundImage: `url(${collegeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Panel 👑</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm transition"
            >
              Logout
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg backdrop-blur-md ${
              message.type === "success" 
                ? "bg-green-600/20 border border-green-500/50 text-green-400" 
                : "bg-red-600/20 border border-red-500/50 text-red-400"
            }`}>
              {message.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-blue-400">{uniqueSubjectsCount || '0'}</div>
              <div className="text-white/80 text-sm mt-1">Total Subjects</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400">{totalEntries || '0'}</div>
              <div className="text-white/80 text-sm mt-1">Subjects Branch Wise</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-white/80 text-sm mt-1">Papers</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Subject Section */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6">➕ Add New Subject</h2>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Subject Name" 
                  value={subjectName} 
                  onChange={(e) => setSubjectName(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-500 transition" 
                />
                
                <select 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Branch</option>
                  <option value="CSIT">CSIT</option>
                  <option value="CSE">CSE</option>
                  <option value="IOT">IOT</option>
                  <option value="ME">ME</option>
                  <option value="R&A">R&A</option>
                  <option value="ECS">ECS</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="AI&ML">AI&ML</option>
                </select>
                
                <select 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Subject"}
                </button>
              </form>
            </div>

            {/* Upload PYQ Section - WITHOUT TITLE INPUT */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6">📤 Upload PYQ</h2>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <select 
                  value={selectedBranch} 
                  onChange={(e) => setSelectedBranch(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Branch</option>
                  <option value="CSIT">CSIT</option>
                  <option value="CSE">CSE</option>
                  <option value="IOT">IOT</option>
                  <option value="ME">ME</option>
                  <option value="R&A">R&A</option>
                  <option value="ECS">ECS</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="AI&ML">AI&ML</option>
                </select>
                
                <select 
                  value={selectedSemester} 
                  onChange={(e) => setSelectedSemester(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Subject</option>
                  {filteredSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                  ))}
                </select>
                
                <select 
                  value={paperType} 
                  onChange={(e) => setPaperType(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white backdrop-blur-sm focus:border-blue-500 transition"
                >
                  <option value="">Select Paper Type</option>
                  <option value="Sessional">📝 Sessional</option>
                  <option value="PreUniversity">📚 Pre-University</option>
                  <option value="University">🎓 University</option>
                </select>
                
                {/* Year Input */}
                <input
                  type="number"
                  placeholder="Year (e.g., 2023)"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2000"
                  max="2030"
                  required
                  className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-500 transition"
                />
                
                <input 
                  id="file-input"
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  required 
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition" 
                />
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload PYQ"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}