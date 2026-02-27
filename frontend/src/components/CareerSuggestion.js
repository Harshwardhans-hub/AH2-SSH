import React, { useState } from "react";

function CareerSuggestion() {
  const [skills, setSkills] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSuggest = () => {
    const skillList = skills.toLowerCase();

    let careerOptions = [];

    if (skillList.includes("coding") || skillList.includes("javascript") || skillList.includes("python")) {
      careerOptions.push("Software Developer", "Web Developer", "Data Scientist");
    }
    if (skillList.includes("design") || skillList.includes("creativity")) {
      careerOptions.push("UI/UX Designer", "Graphic Designer", "Product Designer");
    }
    if (skillList.includes("communication") || skillList.includes("english")) {
      careerOptions.push("Marketing Specialist", "HR Manager", "Sales Executive");
    }
    if (skillList.includes("finance") || skillList.includes("math")) {
      careerOptions.push("Financial Analyst", "Accountant", "Investment Banker");
    }
    if (careerOptions.length === 0) {
      careerOptions.push("Try adding more specific skills to get better suggestions.");
    }

    setSuggestions(careerOptions);
  };

  return (
    <div className="card">
      <h2>Career Suggestions</h2>
      <p>Enter your skills below and get personalized career paths.</p>
      <textarea
        placeholder="Write your skills here (e.g., coding, design, communication)..."
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        rows="4"
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
      <br />
      <button
        onClick={handleSuggest}
        style={{
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          background: "#28a745",
          color: "white",
          marginTop: "10px",
          cursor: "pointer"
        }}
      >
        Suggest Careers
      </button>

      {suggestions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Suggested Careers:</h3>
          <ul>
            {suggestions.map((career, index) => (
              <li key={index}>💼 {career}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CareerSuggestion;
