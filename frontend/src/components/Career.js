import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { careerRoadmaps } from "../data/careerRoadmaps";
import "./Career.css";

// Convert dict to list
const allCareers = Object.keys(careerRoadmaps).map(key => ({
  title: careerRoadmaps[key].title,
  description: careerRoadmaps[key].description,
  link: "/career/" + key
}));

function Career() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(allCareers);

  const handleSuggest = async (e) => {
    e.preventDefault();
    if (!skills || !interests) return;
    setLoading(true);
    try {
      const res = await api.post("/career/suggest", { skills, interests });
      setSuggestions([
        {
          title: res.data.title,
          description: res.data.description + " (AI Recommended)",
          link: "/career/" + res.data.title.toLowerCase().replace(/ /g, "-")
        },
        ...allCareers
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="career-container">
      <h2 className="career-heading">Personalized Career Guidance</h2>
      <p className="career-subtitle">
        Enter your skills and interests to get a personalized AI career suggestion.
      </p>

      <div className="career-form">
        <form onSubmit={handleSuggest}>
          <input
            type="text"
            placeholder="E.g. JavaScript, React, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <input
            type="text"
            placeholder="E.g. Building UI, Analyzing Data"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <button type="submit" disabled={loading} className="suggest-btn">
            {loading ? "Analyzing..." : "Get Suggestion"}
          </button>
        </form>
      </div>

      <div className="career-grid">
        {suggestions.map((career, idx) => (
          <div key={idx} className="career-card" style={idx === 0 && suggestions.length > 2 ? { border: '2px solid #6366f1', background: '#e0e7ff' } : {}}>
            <h3>{career.title} {idx === 0 && suggestions.length > 2 && "✨"}</h3>
            <p>{career.description}</p>
            <Link to={career.link || "#"}>
              <button className="explore-btn">Explore</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Career;
