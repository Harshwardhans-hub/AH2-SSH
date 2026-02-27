import React from "react";
import { useParams, Link } from "react-router-dom";
import { careerRoadmaps } from "../data/careerRoadmaps";
import "./CareerDetail.css";

function CareerDetail() {
  const { careerName } = useParams();
  const career = careerRoadmaps[careerName];

  if (!career) {
    return (
      <div className="career-detail-container">
        <h2>Career Not Found</h2>
        <p>The career path you're looking for doesn't exist.</p>
        <Link to="/student-dashboard/career" className="back-link">← Back to Career Hub</Link>
      </div>
    );
  }

  return (
    <div className="career-detail-container">
      <div className="career-detail-header">
        <Link to="/student-dashboard/career" className="back-link">← Back to Career Hub</Link>
        <h2>{career.title}</h2>
        <p>{career.description}</p>
      </div>

      {/* Skills Section */}
      {career.skills && (
        <div className="skills-section">
          <h3>🛠️ Key Skills</h3>
          <div className="skills-tags">
            {career.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Section */}
      {career.roadmap && (
        <div className="roadmap-section">
          <h3>🗺️ Learning Roadmap</h3>
          <div className="roadmap-timeline">
            {career.roadmap.map((step, idx) => (
              <div key={idx} className="roadmap-item">
                <div className="roadmap-step-indicator">{idx + 1}</div>
                <div className="roadmap-content">
                  <h4>Step {idx + 1}</h4>
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Section - Links to external websites */}
      {career.resources && (
        <div className="resources-section">
          <h3>📚 Recommended Resources</h3>
          <div className="resources-grid">
            {career.resources.map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-card"
              >
                <span className="resource-icon">🔗</span>
                <div className="resource-info">
                  <h4>{resource.name}</h4>
                  <p className="resource-url">{resource.url}</p>
                </div>
                <span className="resource-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerDetail;
