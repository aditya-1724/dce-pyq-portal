import React, { useState, useEffect, useCallback } from "react";  // 👈 useCallback import kiya
import { useNavigate } from "react-router-dom";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("access_token");

  // 👇 FETCH SUBJECTS FUNCTION - useCallback mein wrap kiya
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:5000/subjects/${user.branch}/${user.semester}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await res.json();
      console.log("Subjects data:", data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setSubjects(data);
      } else if (data.success && Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      } else if (data.success && Array.isArray(data)) {
        setSubjects(data);
      } else {
        setSubjects([]);
        setError("No subjects found");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [user?.branch, user?.semester, token]);  // 👈 dependencies

  // 👇 USE EFFECT - dependencies sahi kiya
  useEffect(() => {
    if (!token || !user) {
      navigate("/");
      return;
    }
    fetchSubjects();
  }, [token, user, navigate, fetchSubjects]);

  const handleSubjectClick = (subject) => {
    navigate(`/pyqs?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.subject_name)}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Subjects</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Your Subjects</h1>
      <p className="text-gray-600 mb-6">
        {user?.branch} - Semester {user?.semester}
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-yellow-50 p-8 rounded-lg text-center">
          <p className="text-yellow-700 mb-2">⚠️ No subjects found</p>
          <p className="text-gray-600">
            Please contact admin to add subjects for {user?.branch} Semester {user?.semester}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => handleSubjectClick(subject)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-semibold mb-2">{subject.subject_name}</h3>
              <p className="text-sm text-gray-500">
                {subject.branch} - Sem {subject.semester}
              </p>
              <div className="mt-4 text-blue-600 text-sm">
                View PYQs →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}