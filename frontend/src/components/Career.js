import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { careerRoadmaps } from "../data/careerRoadmaps";
import "./Career.css";
import { FaUpload, FaSpinner, FaCheckCircle, FaLightbulb, FaRoad, FaExternalLinkAlt, FaBriefcase, FaGraduationCap, FaChartBar, FaArrowRight } from "react-icons/fa";

// Static career cards
const allCareers = Object.keys(careerRoadmaps).map(key => ({
  title: careerRoadmaps[key].title,
  description: careerRoadmaps[key].description,
  link: "/student-dashboard/career/" + key
}));

function Career() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("roadmap");
  const [expandedAlt, setExpandedAlt] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(ext)) {
        setError("Please upload a PDF, DOCX, or TXT file.");
        setFile(null);
      } else {
        setError("");
        setFile(selected);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await api.post("/career/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setError("");
    setActiveTab("roadmap");
    setExpandedAlt(null);
  };

  const getMatchColor = (pct) => {
    if (pct >= 70) return "#10b981";
    if (pct >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="career-container">
      <h2 className="career-heading">🗺️ AI Career Guidance</h2>
      <p className="career-subtitle">
        Upload your resume and get a personalized career roadmap powered by AI analysis.
      </p>

      {/* ===== UPLOAD SECTION ===== */}
      {!analysisResult && (
        <div className="resume-upload-section">
          <div className="upload-card">
            <div className="upload-card-header">
              <FaUpload className="upload-icon" />
              <h3>Upload Your Resume</h3>
              <p>We'll analyze your skills, experience, and education to suggest the best career path for you.</p>
            </div>

            <div className="file-upload-zone" onClick={() => document.getElementById('career-resume-upload').click()}>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                id="career-resume-upload"
                style={{ display: 'none' }}
              />
              {file ? (
                <div className="file-selected">
                  <FaCheckCircle className="file-ok-icon" />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="file-placeholder">
                  <span className="upload-emoji">📄</span>
                  <span>Click to upload PDF, DOCX, or TXT</span>
                  <span className="upload-hint">Drag & drop also supported</span>
                </div>
              )}
            </div>

            {error && <p className="upload-error">❌ {error}</p>}

            <button
              className="analyze-career-btn"
              onClick={handleAnalyze}
              disabled={loading || !file}
            >
              {loading ? (
                <span className="btn-loading-content">
                  <FaSpinner className="spinning" /> Analyzing your resume...
                </span>
              ) : (
                <span>🤖 Generate Career Roadmap</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===== ANALYSIS RESULTS ===== */}
      {analysisResult && (
        <div className="career-analysis-results">
          {/* Profile Summary */}
          <div className="profile-summary-card">
            <div className="profile-header">
              <div className="profile-left">
                <h3>📋 Your Profile Analysis</h3>
                <div className="profile-badges">
                  <span className="exp-badge">
                    <FaBriefcase /> {analysisResult.studentProfile.experienceLevel}
                  </span>
                  {analysisResult.studentProfile.education.length > 0 && (
                    <span className="edu-badge">
                      <FaGraduationCap /> {analysisResult.studentProfile.education[0]}
                    </span>
                  )}
                  <span className="skills-badge">
                    <FaChartBar /> {analysisResult.studentProfile.skillsFound.length} skills detected
                  </span>
                </div>
              </div>
              <button className="reset-btn" onClick={handleReset}>
                ↺ Upload New Resume
              </button>
            </div>

            {/* Skills Found */}
            <div className="skills-found-section">
              <h4>🛠️ Skills Detected in Your Resume</h4>
              <div className="skills-tags-grid">
                {Object.entries(analysisResult.studentProfile.skillsByCategory)
                  .filter(([, skills]) => skills.length > 0)
                  .map(([category, skills]) => (
                    <div key={category} className="skill-category-group">
                      <span className="category-label">{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="category-skills">
                        {skills.map((skill, i) => (
                          <span key={i} className="skill-pill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Primary Career Match */}
          <div className="primary-career-card">
            <div className="primary-header">
              <div className="primary-icon">{analysisResult.primaryCareer.icon}</div>
              <div className="primary-info">
                <span className="best-match-tag">⭐ Best Match</span>
                <h3>{analysisResult.primaryCareer.title}</h3>
                <p>{analysisResult.primaryCareer.description}</p>
              </div>
              <div className="match-circle" style={{ borderColor: getMatchColor(analysisResult.primaryCareer.matchPercentage) }}>
                <span className="match-pct" style={{ color: getMatchColor(analysisResult.primaryCareer.matchPercentage) }}>
                  {analysisResult.primaryCareer.matchPercentage}%
                </span>
                <span className="match-label">Match</span>
              </div>
            </div>

            <div className="salary-range">
              💰 Expected Salary: <strong>{analysisResult.primaryCareer.salaryRange}</strong>
            </div>

            {/* Tabs */}
            <div className="career-tabs">
              <button className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
                <FaRoad /> Roadmap
              </button>
              <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                <FaExternalLinkAlt /> Resources
              </button>
              <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
                <FaCheckCircle /> Skills Matched
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'roadmap' && (
              <div className="tab-content">
                <div className="roadmap-level-badge">
                  📊 Roadmap Level: <strong>{analysisResult.primaryCareer.roadmapLevel}</strong> (based on your experience)
                </div>
                <div className="roadmap-steps">
                  {analysisResult.primaryCareer.recommendedRoadmap.map((step, idx) => (
                    <div key={idx} className="roadmap-step">
                      <div className="step-number">{idx + 1}</div>
                      <div className="step-content">
                        <p>{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="tab-content">
                <div className="resources-list">
                  {analysisResult.primaryCareer.resources.map((resource, idx) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                      <span className="resource-icon-small">🔗</span>
                      <div>
                        <h4>{resource.name}</h4>
                        <p>{resource.url}</p>
                      </div>
                      <FaExternalLinkAlt className="external-icon" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="tab-content">
                <div className="matched-skills-list">
                  <h4>✅ Skills from your resume that match this career:</h4>
                  <div className="skill-match-tags">
                    {analysisResult.primaryCareer.matchedWith.map((skill, i) => (
                      <span key={i} className="matched-skill-tag">{skill}</span>
                    ))}
                  </div>
                  {analysisResult.primaryCareer.matchedWith.length === 0 && (
                    <p className="no-skills-msg">No direct skill matches found. Consider adding relevant skills to your resume.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alternative Careers */}
          {analysisResult.alternativeCareers.length > 0 && (
            <div className="alternative-careers-section">
              <h3>🔄 Alternative Career Paths</h3>
              <div className="alt-careers-grid">
                {analysisResult.alternativeCareers.map((career, idx) => (
                  <div key={idx} className={`alt-career-card ${expandedAlt === idx ? 'expanded' : ''}`}>
                    <div className="alt-career-header" onClick={() => setExpandedAlt(expandedAlt === idx ? null : idx)}>
                      <span className="alt-icon">{career.icon}</span>
                      <div className="alt-info">
                        <h4>{career.title}</h4>
                        <p>{career.description}</p>
                      </div>
                      <div className="alt-match" style={{ color: getMatchColor(career.matchPercentage) }}>
                        {career.matchPercentage}%
                      </div>
                    </div>
                    {expandedAlt === idx && (
                      <div className="alt-expanded-content">
                        <div className="alt-salary">💰 {career.salaryRange}</div>
                        <div className="alt-roadmap">
                          <h5>📍 Recommended Steps ({career.roadmapLevel}):</h5>
                          {career.recommendedRoadmap.map((step, i) => (
                            <div key={i} className="alt-step">
                              <span className="alt-step-num">{i + 1}</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="alt-resources">
                          <h5>📚 Resources:</h5>
                          {career.resources.map((r, i) => (
                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="alt-resource-link">
                              {r.name} <FaExternalLinkAlt />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Career Scores */}
          <div className="all-scores-section">
            <h3>📊 Your Match Across All Careers</h3>
            <div className="scores-bars">
              {analysisResult.allPathsScored.map((path, idx) => (
                <div key={idx} className="score-bar-row">
                  <span className="score-bar-icon">{path.icon}</span>
                  <span className="score-bar-title">{path.title}</span>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${Math.max(path.matchPercentage, 5)}%`,
                        background: getMatchColor(path.matchPercentage)
                      }}
                    ></div>
                  </div>
                  <span className="score-bar-pct" style={{ color: getMatchColor(path.matchPercentage) }}>
                    {path.matchPercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="tips-section">
            <h3><FaLightbulb /> Pro Tips to Improve Your Profile</h3>
            <div className="tips-list">
              {analysisResult.tips.map((tip, idx) => (
                <div key={idx} className="tip-card">
                  <span className="tip-number">{idx + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== STATIC CAREER GRID (always visible below) ===== */}
      <div className="career-explore-section">
        <h3>🧭 Explore Career Paths</h3>
        <p className="explore-subtitle">Browse all available career paths with detailed roadmaps and resources.</p>
        <div className="career-grid">
          {allCareers.map((career, idx) => (
            <div key={idx} className="career-card">
              <h3>{career.title}</h3>
              <p>{career.description}</p>
              <Link to={career.link || "#"}>
                <button className="explore-btn">
                  Explore <FaArrowRight />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Career;
