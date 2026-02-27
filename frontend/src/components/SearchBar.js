import React from "react";
import { FaEnvelope } from "react-icons/fa";
import "./SearchBar.css";

function SearchBar() {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="🔍 Search alumni, communities, jobs..."
      />
      <button className="search-btn">Search</button>

      {/* Inbox Button */}
      <button className="inbox-btn">
        <FaEnvelope /> Inbox
      </button>
    </div>
  );
}

export default SearchBar;
