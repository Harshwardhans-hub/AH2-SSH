import React, { useEffect, useState } from "react";
import api from "../api";
import "./JobsInternshipsPage.css";

function JobsInternshipsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, fulltime, internship
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    api.get("/jobs")
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs from backend:", err);
        setLoading(false);
      });
  }, []);

  // Format posted date to relative time
  const timeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    const posted = new Date(dateStr);
    const now = new Date();
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return posted.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const posted = new Date(dateStr);
    const now = new Date();
    return (now - posted) < 86400000 * 2; // within 2 days
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filter === "all" ||
      (filter === "internship" && job.type?.toLowerCase().includes("intern")) ||
      (filter === "fulltime" && !job.type?.toLowerCase().includes("intern"));

    const matchesLocation =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesType && matchesLocation;
  });

  // Extract unique locations for filter dropdown
  const uniqueLocations = [...new Set(
    jobs
      .map((j) => {
        const loc = j.location || "";
        // Extract city name
        const parts = loc.split(",");
        return parts[0]?.trim();
      })
      .filter(Boolean)
  )].sort().slice(0, 20);

  return (
    <div className="jobs-container">
      {/* Hero Header */}
      <div className="jobs-header">
        <h2>💼 Job & Internship Marketplace</h2>
        <p className="jobs-subtitle">
          Live opportunities scraped in real-time — {jobs.length} positions available
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="jobs-controls">
        <div className="jobs-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="jobs-search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>

        <div className="jobs-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({filteredJobs.length})
            </button>
            <button
              className={`filter-tab ${filter === "fulltime" ? "active" : ""}`}
              onClick={() => setFilter("fulltime")}
            >
              🏢 Full-time
            </button>
            <button
              className={`filter-tab ${filter === "internship" ? "active" : ""}`}
              onClick={() => setFilter("internship")}
            >
              🎓 Internships
            </button>
          </div>

          <select
            className="location-filter"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">📍 All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="jobs-loading">
          <div className="spinner"></div>
          <p>Fetching the latest opportunities from multiple sources...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="jobs-empty">
          <p>No jobs match your filters. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredJobs.length > 0 && (
        <p className="results-count">
          Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> opportunities
        </p>
      )}

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {filteredJobs.map((job) => (
          <div key={job.id} className={`job-card ${isNew(job.postedDate) ? "new-job" : ""}`}>
            <div className="job-card-header">
              <span className="job-type-badge">
                {job.type?.toLowerCase().includes("intern") ? "🎓 Internship" : "🏢 Full-time"}
              </span>
              {isNew(job.postedDate) && (
                <span className="new-badge">NEW</span>
              )}
            </div>

            <div className="job-info">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">🏢 {job.company}</p>

              <div className="job-meta">
                <span className="meta-item">
                  📍 {job.location || "Remote"}
                </span>
                <span className="meta-item">
                  💰 {job.salary || "Competitive"}
                </span>
                <span className="meta-item">
                  🕒 {timeAgo(job.postedDate)}
                </span>
              </div>

              {job.postedDate && (
                <p className="job-posted-date">
                  Posted: {new Date(job.postedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </p>
              )}

              <div className="job-footer">
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="apply-btn">
                  Apply Now →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsInternshipsPage;
