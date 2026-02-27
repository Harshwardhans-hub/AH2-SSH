import React from "react";
import { FaUsers, FaHandshake, FaGraduationCap } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h2 className="about-heading">About Hack-2-Hire</h2>
      <p className="about-description">
        Hack-2-Hire is a vibrant community that bridges the gap between
        students and alumni. Our platform helps you network, explore career
        opportunities, share experiences, and stay updated with alumni events.
      </p>

      <div className="about-features">
        <div className="feature-card">
          <FaUsers className="feature-icon" />
          <h3>Connect</h3>
          <p>Stay connected with fellow alumni and current students.</p>
        </div>
        <div className="feature-card">
          <FaHandshake className="feature-icon" />
          <h3>Collaborate</h3>
          <p>Work together on projects, events, and career initiatives.</p>
        </div>
        <div className="feature-card">
          <FaGraduationCap className="feature-icon" />
          <h3>Grow</h3>
          <p>Enhance your skills and career opportunities through mentorship.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
