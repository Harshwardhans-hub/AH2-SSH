import React, { useState } from "react";
import api from "../api";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

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
        if (!file || !jobDescription.trim()) {
            setError("Please provide both a resume and a job description.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobDescription", jobDescription);

        try {
            const response = await api.post("/resume/analyze", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return "#27ae60";
        if (score >= 60) return "#f39c12";
        if (score >= 45) return "#e67e22";
        return "#e74c3c";
    };

    const getDecisionClass = (decision) => {
        if (!decision) return "";
        const d = decision.toLowerCase();
        if (d.includes("strong")) return "strong-match";
        if (d.includes("good")) return "good-match";
        if (d.includes("partial")) return "partial-match";
        return "needs-improvement";
    };

    return (
        <div className="analyzer-container">
            <div className="analyzer-header">
                <h2>🤖 AI Resume ATS Analyzer</h2>
                <p>Professional ATS scoring with keyword analysis, section detection, and actionable improvements.</p>
            </div>

            <div className="analyzer-content">
                <div className="input-section">
                    <div className="form-group">
                        <label>📄 Upload Resume (PDF, DOCX, TXT)</label>
                        <div className="file-upload-area">
                            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} id="resume-upload" />
                            <label htmlFor="resume-upload" className="file-label">
                                {file ? `✅ ${file.name}` : "Click to upload or drag & drop"}
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>📋 Job Description</label>
                        <textarea
                            rows="8"
                            placeholder="Paste the complete Job Description here...&#10;&#10;Include: Required skills, responsibilities, qualifications, and preferred experience."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {error && <p className="error-msg">❌ {error}</p>}

                    <button
                        className="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading || !file || !jobDescription}
                    >
                        {loading ? (
                            <span className="btn-loading">
                                <span className="btn-spinner"></span> Analyzing Resume...
                            </span>
                        ) : (
                            "🔍 Analyze ATS Compatibility"
                        )}
                    </button>
                </div>

                {/* ===== RESULTS ===== */}
                {result && (
                    <div className="result-section">
                        {/* Overall Score */}
                        <div className={`result-hero ${getDecisionClass(result.decision)}`}>
                            <div className="score-circle" style={{ borderColor: getScoreColor(result.score) }}>
                                <span className="score-number" style={{ color: getScoreColor(result.score) }}>
                                    {result.score}
                                </span>
                                <span className="score-label">ATS Score</span>
                            </div>
                            <div className="result-hero-info">
                                <h3 className={`decision-badge ${getDecisionClass(result.decision)}`}>
                                    {result.decision}
                                </h3>
                                <p className="result-feedback">{result.feedback}</p>
                                {result.aiPowered && (
                                    <span className="ai-badge">🧠 AI-Enhanced Analysis</span>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Cards */}
                        {result.breakdown && (
                            <div className="breakdown-section">
                                <h3>📊 Score Breakdown</h3>
                                <div className="breakdown-grid">
                                    {Object.values(result.breakdown).map((item, i) => (
                                        <div key={i} className="breakdown-card">
                                            <div className="breakdown-header">
                                                <span className="breakdown-label">{item.label}</span>
                                                <span className="breakdown-weight">{item.weight}</span>
                                            </div>
                                            <div className="breakdown-bar-container">
                                                <div
                                                    className="breakdown-bar"
                                                    style={{
                                                        width: `${item.score}%`,
                                                        background: getScoreColor(item.score)
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="breakdown-footer">
                                                <span className="breakdown-score" style={{ color: getScoreColor(item.score) }}>
                                                    {item.score}%
                                                </span>
                                                <span className="breakdown-detail">{item.detail}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Keywords Analysis */}
                        <div className="keywords-section">
                            <h3>🔑 Keyword Analysis</h3>
                            <div className="keywords-grid">
                                {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                                    <div className="keyword-group">
                                        <h4 className="keyword-title matched">✅ Matched Keywords ({result.matchedKeywords.length})</h4>
                                        <div className="keyword-tags">
                                            {result.matchedKeywords.map((kw, i) => (
                                                <span key={i} className="keyword-tag matched">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {result.missingKeywords && result.missingKeywords.length > 0 && (
                                    <div className="keyword-group">
                                        <h4 className="keyword-title missing">❌ Missing Keywords ({result.missingKeywords.length})</h4>
                                        <div className="keyword-tags">
                                            {result.missingKeywords.map((kw, i) => (
                                                <span key={i} className="keyword-tag missing">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resume Stats */}
                        <div className="stats-section">
                            <h3>📋 Resume Stats</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-icon">📝</span>
                                    <span className="stat-value">{result.formatting?.wordCount || 0}</span>
                                    <span className="stat-label">Words</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-icon">📄</span>
                                    <span className="stat-value">{result.formatting?.pages || 1}</span>
                                    <span className="stat-label">Est. Pages</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-icon">•</span>
                                    <span className="stat-value">{result.formatting?.bullets || 0}</span>
                                    <span className="stat-label">Bullet Points</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-icon">📈</span>
                                    <span className="stat-value">{result.formatting?.metrics || 0}</span>
                                    <span className="stat-label">Quantified Results</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Check */}
                        {result.contactInfo && (
                            <div className="contact-check-section">
                                <h3>📧 Contact Info Check</h3>
                                <div className="contact-check-grid">
                                    {Object.entries(result.contactInfo).map(([key, found]) => (
                                        <div key={key} className={`contact-item ${found ? "found" : "missing"}`}>
                                            <span>{found ? "✅" : "❌"}</span>
                                            <span className="contact-type">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Improvements */}
                        {result.improvements && result.improvements.length > 0 && (
                            <div className="improvements-section">
                                <h3>💡 Improvement Suggestions</h3>
                                <div className="improvements-list">
                                    {result.improvements.map((tip, i) => (
                                        <div key={i} className="improvement-item">
                                            <span className="improvement-number">{i + 1}</span>
                                            <p>{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sections Detected */}
                        {result.sectionsDetected && (
                            <div className="sections-check">
                                <h3>📂 Resume Sections</h3>
                                <div className="sections-tags">
                                    {result.sectionsDetected.map((s, i) => (
                                        <span key={i} className="section-tag found">{s}</span>
                                    ))}
                                    {result.sectionsMissing && result.sectionsMissing.map((s, i) => (
                                        <span key={`m-${i}`} className="section-tag missing">{s} (missing)</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResumeAnalyzer;
