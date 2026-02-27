import React, { useState, useEffect } from "react";
import api from "../api";
import "./CompanyInfo.css";

function CompanyInfo() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get("/companies");
      setCompanies(response.data);
      setFilteredCompanies(response.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  return (
    <div className="company-info-container">
      <div className="company-header">
        <h2>Company Information</h2>
        <input
          type="text"
          placeholder="Search companies by name or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="company-stats">
        <div className="stat-box">
          <h3>{filteredCompanies.length}</h3>
          <p>Total Companies</p>
        </div>
      </div>

      <div className="company-grid">
        {filteredCompanies.length === 0 ? (
          <p className="no-data">No companies found</p>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company.id} className="company-card">
              <h3>{company.name}</h3>
              <p><strong>Industry:</strong> {company.industry || "N/A"}</p>
              <p><strong>Email:</strong> {company.email || "N/A"}</p>
              <p><strong>Phone:</strong> {company.phone || "N/A"}</p>
              {company.website && (
                <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></p>
              )}
              {company.description && (
                <p className="company-description">{company.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompanyInfo;
