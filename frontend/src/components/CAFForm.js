import React, { useState, useEffect } from "react";
import api from "../api";
import "./CAFForm.css";

function CAFForm() {
  const [cafForms, setCafForms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    job_role: "",
    job_description: "",
    eligibility_criteria: "",
    salary_package: "",
    application_deadline: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchCAFForms();
  }, []);

  const fetchCAFForms = async () => {
    try {
      const response = await api.get(`/caf-forms?college_id=${user.id}`);
      setCafForms(response.data);
    } catch (err) {
      console.error("Error fetching CAF forms:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingForm) {
        await api.put(`/caf-forms/${editingForm.id}`, { ...formData, status: editingForm.status });
        alert("✅ CAF Form updated successfully!");
      } else {
        await api.post("/caf-forms", { ...formData, college_id: user.id });
        alert("✅ CAF Form created successfully!");
      }
      
      resetForm();
      fetchCAFForms();
    } catch (err) {
      console.error("Error saving CAF form:", err);
      alert("❌ Failed to save CAF form");
    }
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setFormData({
      company_name: form.company_name,
      company_email: form.company_email || "",
      company_phone: form.company_phone || "",
      job_role: form.job_role,
      job_description: form.job_description || "",
      eligibility_criteria: form.eligibility_criteria || "",
      salary_package: form.salary_package || "",
      application_deadline: form.application_deadline ? form.application_deadline.split('T')[0] : "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this CAF form?")) {
      try {
        await api.delete(`/caf-forms/${id}`);
        alert("✅ CAF Form deleted successfully!");
        fetchCAFForms();
      } catch (err) {
        console.error("Error deleting CAF form:", err);
        alert("❌ Failed to delete CAF form");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      company_email: "",
      company_phone: "",
      job_role: "",
      job_description: "",
      eligibility_criteria: "",
      salary_package: "",
      application_deadline: "",
    });
    setIsCreating(false);
    setEditingForm(null);
  };

  return (
    <div className="caf-form-container">
      <div className="caf-header">
        <h2>Company Application Forms (CAF)</h2>
        <button 
          className="btn-primary" 
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : "+ Create New CAF"}
        </button>
      </div>

      {isCreating && (
        <div className="caf-form-card">
          <h3>{editingForm ? "Edit CAF Form" : "Create New CAF Form"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Email</label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Phone</label>
                <input
                  type="tel"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Job Role *</label>
                <input
                  type="text"
                  name="job_role"
                  value={formData.job_role}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Eligibility Criteria</label>
              <textarea
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Salary Package</label>
                <input
                  type="text"
                  name="salary_package"
                  value={formData.salary_package}
                  onChange={handleInputChange}
                  placeholder="e.g., 5-7 LPA"
                />
              </div>
              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingForm ? "Update" : "Create"} CAF Form
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="caf-list">
        <h3>Your CAF Forms</h3>
        {cafForms.length === 0 ? (
          <p className="no-data">No CAF forms created yet. Click "Create New CAF" to get started.</p>
        ) : (
          <div className="caf-cards">
            {cafForms.map((form) => (
              <div key={form.id} className="caf-card">
                <div className="caf-card-header">
                  <h4>{form.company_name}</h4>
                  <span className={`status-badge ${form.status}`}>{form.status}</span>
                </div>
                <p><strong>Job Role:</strong> {form.job_role}</p>
                <p><strong>Salary:</strong> {form.salary_package || "Not specified"}</p>
                <p><strong>Deadline:</strong> {form.application_deadline ? new Date(form.application_deadline).toLocaleDateString() : "Not specified"}</p>
                <div className="caf-card-actions">
                  <button className="btn-edit" onClick={() => handleEdit(form)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(form.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CAFForm;
