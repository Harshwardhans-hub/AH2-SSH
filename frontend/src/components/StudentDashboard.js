import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { FaUser, FaUsers, FaBriefcase, FaFileAlt, FaCalendar, FaLaptop, FaInfoCircle, FaClipboardList, FaRobot } from "react-icons/fa";

import StudentHome from "./StudentHome";
import Profile from "./Profile";
import CommunityNew from "./CommunityNew";
import Career from "./Career";
import CareerSuggestion from "./CareerSuggestion";
import CareerDetail from "./CareerDetail";
import JobsInternshipsPage from "./JobsInternshipsPage";
import ChatBox from "./ChatBox";
import Events from "./Events";
import Documents from "./Documents";
import About from "./About";
import ApplicationTracker from "./ApplicationTracker";

import ResumeAnalyzer from "./ResumeAnalyzer";
import AIChatbot from "./AIChatbot";
import { useBackground } from "../context/BackgroundContext";

function StudentDashboard() {
  const location = useLocation();
  const { changeBackground, backgrounds, currentBackground } = useBackground();

  useEffect(() => {
    // Change background based on current route
    const path = location.pathname.split('/').pop() || 'home';
    const pageMap = {
      '': 'home',
      'student-dashboard': 'home',
      'profile': 'profile',
      'community': 'community',
      'career': 'career',
      'jobs': 'jobs',
      'events': 'events',
      'documents': 'documents',
      'about': 'about',
      'applications': 'jobs',
      'recommended': 'jobs',
    };
    changeBackground(pageMap[path] || 'home');
  }, [location, changeBackground]);

  return (
    <>
      <div
        className="dashboard dashboard-with-background"
        style={{
          backgroundImage: `url(${backgrounds[currentBackground]})`,
        }}
      >
        {/* Sidebar */}
        <aside className="sidebar glass-sidebar">
          <Link to="/student-dashboard" className="menu-item">
            <span>🏠</span> <span>Home</span>
          </Link>
          <Link to="/student-dashboard/profile" className="menu-item">
            <FaUser /> <span>Profile</span>
          </Link>
          <Link to="/student-dashboard/applications" className="menu-item">
            <FaClipboardList /> <span>Applications</span>
          </Link>

          <Link to="/student-dashboard/community" className="menu-item">
            <FaUsers /> <span>Community</span>
          </Link>
          <Link to="/student-dashboard/career" className="menu-item">
            <FaBriefcase /> <span>Career Guidance</span>
          </Link>
          <Link to="/student-dashboard/jobs" className="menu-item">
            <FaLaptop /> <span>Jobs & Internships</span>
          </Link>
          <Link to="/student-dashboard/resume-analyzer" className="menu-item">
            <FaRobot /> <span>Resume Analyzer</span>
          </Link>
          <Link to="/student-dashboard/events" className="menu-item">
            <FaCalendar /> <span>Events</span>
          </Link>
          <Link to="/student-dashboard/documents" className="menu-item">
            <FaFileAlt /> <span>Documents</span>
          </Link>
          <Link to="/student-dashboard/about" className="menu-item">
            <FaInfoCircle /> <span>About Us</span>
          </Link>
        </aside>

        {/* Main Content */}
        <main className="main-content glass-content">
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/applications" element={<ApplicationTracker />} />

            <Route path="/community" element={<CommunityNew />} />
            <Route path="/career" element={<Career />} />
            <Route path="/career/:careerName" element={<CareerDetail />} />
            <Route path="/career-suggestions" element={<CareerSuggestion />} />
            <Route path="/jobs" element={<JobsInternshipsPage />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/chat" element={<ChatBox />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </main>
      </div>

      {/* AI Chatbot - outside dashboard div so position:fixed works correctly */}
      <AIChatbot />
    </>
  );
}

export default StudentDashboard;
