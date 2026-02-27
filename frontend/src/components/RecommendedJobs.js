import React, { useState, useEffect } from "react";
import api from "../api";
import "./RecommendedJobs.css";

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch student profile
      const profileRes = await api.get(`/student-profile/${user.id}`);
      setStudentProfile(profileRes.data);

      // Fetch all jobs
      const jobsRes = await api.get("/jobs");
      
      // Calculate match scores and sort
      const jobsWithScores = jobsRes.data.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, profileRes.data),
      })).sort((a, b) => b.matchScore - a.matchScore);

      setJobs(jobsWithScores);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const calculateMatchScore = (job, profile) => {
    let score = 50; // Base score

    if (!profile || !profile.skills) return score;

    // Match based on skills
    const jobSkills = (job.requirements || "").toLowerCase();
    const studentSkills = (profile.skills || "").toLowerCase().split(",");

    studentSkills.forEach(skill => {
      if (jobSkills.includes(skill.trim())) {
        score += 10;
      }
    });

    // Match based on course
    if (profile.course && job.requirements) {
      if (job.requirements.toLowerCase().includes(profile.course.toLowerCase())) {
        score += 15;
      }
    }

    // Cap at 100
    return Math.min(score, 100);
  };

  const handleApply = async (jobId, companyName, role) => {
    try {
      await api.post("/applications", {
        student_id: user.id,
        company_name: companyName,
        role: role,
        status: "applied",
      });
      alert("✅ Application submitted successfully!");
    } catch (err) {
      console.error("Error applying:", err);
      alert("❌ Failed to submit application");
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  };

  if (loading) {
    return <div className="loading">Loading recommendations...</div>;
  }

  if (!studentProfile || !studentProfile.skills || studentProfile.profile_completion < 50) {
    return (
      <div className="recommended-jobs">
        <div className="incomplete-profile">
          <div className="incomplete-icon">📝</div>
          <h2>Complete Your Profile</h2>
          <p>Complete your profile to get AI-based job recommendations tailored for you.</p>
          <div className="profile-requirements">
            <h4>Required Information:</h4>
            <ul>
              <li>✓ Skills and expertise</li>
              <li>✓ Course/Degree information</li>
              <li>✓ Resume upload</li>
              <li>✓ Career preferences</li>
            </ul>
          </div>
          <button 
            className="btn-complete-profile"
            onClick={() => window.location.href = '/student-dashboard/profile'}
          >
            Complete Profile Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommended-jobs">
      <div className="recommendations-header">
        <h2>Recommended For You</h2>
        <p>Based on your skills, course, and previous applications</p>
      </div>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No job recommendations available at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="company-logo">🏢</div>
                <div className="match-badge" style={{ background: getMatchColor(job.matchScore) }}>
                  {job.matchScore}% Match
                </div>
              </div>
              
              <h3>{job.title}</h3>
              <p className="company-name">Company ID: {job.company_id}</p>
              
              <div className="job-details">
                <div className="detail-item">
                  <span className="icon">💼</span>
                  <span>{job.job_type || "Full-time"}</span>
                </div>
                <div className="detail-item">
                  <span className="icon">📍</span>
                  <span>{job.location || "Remote"}</span>
                </div>
                <div className="detail-item">
                  <span className="icon">💰</span>
                  <span>{job.salary || "Competitive"}</span>
                </div>
              </div>

              <p className="job-description">
                {job.description ? job.description.substring(0, 120) + "..." : "No description available"}
              </p>

              <div className="job-requirements">
                <strong>Requirements:</strong>
                <p>{job.requirements ? job.requirements.substring(0, 100) + "..." : "Not specified"}</p>
              </div>

              <button 
                className="btn-apply"
                onClick={() => handleApply(job.id, `Company ${job.company_id}`, job.title)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedJobs;
