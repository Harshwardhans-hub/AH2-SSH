import React, { useState } from "react";
import api from "../api";
import "./Login.css";

function Login({ onLogin }) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCollegeRole, setIsCollegeRole] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");

  // Create account states
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newPassOutYear, setNewPassOutYear] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const selectedRole = isCollegeRole ? "college" : "student";

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
        role: selectedRole,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin();
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  // Create account submit
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedRole === "student" && (!newFullName || !newEmail || !newCollege || !newPassOutYear || !newPassword)) {
      setError("Please fill all required fields for student registration!");
      return;
    }

    if (selectedRole === "college" && (!newFullName || !newEmail || !newCollege || !newDepartment || !newPassword)) {
      setError("Please fill all required fields for college registration!");
      return;
    }

    try {
      const payload = {
        name: newFullName,
        email: newEmail,
        role: selectedRole,
        password: newPassword,
        college: newCollege,
      };

      if (selectedRole === "student") {
        payload.pass_out_year = parseInt(newPassOutYear);
      }

      if (selectedRole === "college") {
        payload.department = newDepartment;
        payload.phone = newPhone;
      }

      await api.post("/auth/register", payload);

      alert(`✅ ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} account created successfully!`);
      setIsCreatingAccount(false);
      setNewFullName("");
      setNewEmail("");
      setNewCollege("");
      setNewPassOutYear("");
      setNewDepartment("");
      setNewPhone("");
      setNewPassword("");
      setError("");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-main-card">
        {/* Left Illustration */}
        <div className="login-illustration">
          <img
            src="/login_illustration.png"
            alt="Hack-2-Hire Illustration"
          />
        </div>

        {/* Right Form Panel */}
        {!isCreatingAccount ? (
          <div className="login-form-panel">
            {/* Logo */}
            <div className="login-logo">
              <span className="login-logo-icon">⚡</span>
              <h2>Hack-2-Hire</h2>
            </div>

            {/* Role Toggle */}
            <div className="role-toggle-wrapper">
              <span
                className={`role-toggle-label ${!isCollegeRole ? "active-label" : ""}`}
                onClick={() => setIsCollegeRole(false)}
              >
                Student
              </span>
              <label className="role-toggle">
                <input
                  type="checkbox"
                  checked={isCollegeRole}
                  onChange={(e) => setIsCollegeRole(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span
                className={`role-toggle-label ${isCollegeRole ? "active-label" : ""}`}
                onClick={() => setIsCollegeRole(true)}
              >
                College/Admin
              </span>
            </div>

            {/* Error */}
            {error && <div className="login-error">{error}</div>}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ width: "100%" }}>
              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email or Username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button type="submit" className="login-submit-btn">
                Login
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="login-signup-link">
              New to Hack-2-Hire?{" "}
              <span onClick={() => { setIsCreatingAccount(true); setError(""); }}>
                Sign Up
              </span>
            </p>
          </div>
        ) : (
          /* Sign Up Form */
          <div className="signup-form-panel">
            <div className="login-logo">
              <span className="login-logo-icon">⚡</span>
              <h2>Hack-2-Hire</h2>
            </div>

            {/* Role Toggle */}
            <div className="role-toggle-wrapper">
              <span
                className={`role-toggle-label ${!isCollegeRole ? "active-label" : ""}`}
                onClick={() => setIsCollegeRole(false)}
              >
                Student
              </span>
              <label className="role-toggle">
                <input
                  type="checkbox"
                  checked={isCollegeRole}
                  onChange={(e) => setIsCollegeRole(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span
                className={`role-toggle-label ${isCollegeRole ? "active-label" : ""}`}
                onClick={() => setIsCollegeRole(true)}
              >
                College/Admin
              </span>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleCreateAccountSubmit} style={{ width: "100%" }}>
              <div className="signup-form-fields">
                <div className="login-input-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="login-input-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="login-input-group">
                  <input
                    type="text"
                    placeholder={selectedRole === "college" ? "College/Institution Name" : "College Name"}
                    value={newCollege}
                    onChange={(e) => setNewCollege(e.target.value)}
                    required
                  />
                </div>

                {selectedRole === "student" && (
                  <div className="login-input-group">
                    <input
                      type="number"
                      placeholder="Pass Out Year"
                      value={newPassOutYear}
                      onChange={(e) => setNewPassOutYear(e.target.value)}
                      required
                    />
                  </div>
                )}

                {selectedRole === "college" && (
                  <>
                    <div className="login-input-group">
                      <input
                        type="text"
                        placeholder="Department"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        required
                      />
                    </div>
                    <div className="login-input-group">
                      <input
                        type="tel"
                        placeholder="Phone Number (Optional)"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="login-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn">
                Register as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </button>
            </form>

            <p className="login-signup-link">
              Already have an account?{" "}
              <span onClick={() => { setIsCreatingAccount(false); setError(""); }}>
                Login
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
