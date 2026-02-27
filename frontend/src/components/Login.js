import React, { useState } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import api from "../api";
import "./Login.css";

function Login({ onLogin }) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCollegeRole, setIsCollegeRole] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // ===== SYNC WITH BACKEND (Common for all auth methods) =====
  const syncWithBackend = async (firebaseUser, role, extraData = {}) => {
    const response = await api.post("/auth/firebase-login", {
      name: firebaseUser.displayName || extraData.name || firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      photoURL: firebaseUser.photoURL || null,
      role: role,
      ...extraData,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    onLogin();
  };

  // ===== LOGIN WITH EMAIL/PASSWORD (Firebase) =====
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Firebase authenticates the user
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);

      // Sync with our backend to get profile + JWT
      await syncWithBackend(result.user, selectedRole);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== REGISTER WITH EMAIL/PASSWORD (Firebase) =====
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (selectedRole === "student" && (!newFullName || !newEmail || !newCollege || !newPassOutYear || !newPassword)) {
      setError("Please fill all required fields for student registration!");
      setIsLoading(false);
      return;
    }

    if (selectedRole === "college" && (!newFullName || !newEmail || !newCollege || !newDepartment || !newPassword)) {
      setError("Please fill all required fields for college registration!");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Create account in Firebase
      const result = await createUserWithEmailAndPassword(auth, newEmail, newPassword);

      // Update Firebase profile with the name
      await updateProfile(result.user, { displayName: newFullName });

      // Sync with backend — pass all the extra profile data
      const extraData = {
        name: newFullName,
        college: newCollege,
      };

      if (selectedRole === "student") {
        extraData.pass_out_year = parseInt(newPassOutYear);
      }

      if (selectedRole === "college") {
        extraData.department = newDepartment;
        extraData.phone = newPhone;
      }

      await syncWithBackend(result.user, selectedRole, extraData);

      alert(`✅ Account created successfully! Welcome, ${newFullName}!`);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== GOOGLE SIGN-IN (Firebase) =====
  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Sync with our backend
      await syncWithBackend(result.user, selectedRole);
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Add localhost to Firebase authorized domains.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-brand-header">
        <h1>Hack-2-Hire</h1>
        <p>Your AI-Powered Gateway to Careers</p>
      </div>
      <div className="login-main-card">
        {/* Left Illustration */}
        <div className="login-illustration">
          <img src="/login_illustration.png" alt="Hack-2-Hire Illustration" />
        </div>

        {/* Right Form Panel */}
        {!isCreatingAccount ? (
          <div className="login-form-panel">
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

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ width: "100%" }}>
              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="login-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
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
              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* Google Sign-In */}
            <button
              className="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </button>

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
                  <input type="text" placeholder="Full Name" value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="login-input-group">
                  <input type="email" placeholder="Email" value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="login-input-group">
                  <input type="text" placeholder={selectedRole === "college" ? "College/Institution Name" : "College Name"}
                    value={newCollege} onChange={(e) => setNewCollege(e.target.value)} required disabled={isLoading} />
                </div>

                {selectedRole === "student" && (
                  <div className="login-input-group">
                    <input type="number" placeholder="Pass Out Year" value={newPassOutYear}
                      onChange={(e) => setNewPassOutYear(e.target.value)} required disabled={isLoading} />
                  </div>
                )}

                {selectedRole === "college" && (
                  <>
                    <div className="login-input-group">
                      <input type="text" placeholder="Department" value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="login-input-group">
                      <input type="tel" placeholder="Phone Number (Optional)" value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)} disabled={isLoading} />
                    </div>
                  </>
                )}

                <div className="login-input-group">
                  <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 characters)"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isLoading} />
                  <button type="button" className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? "Creating Account..." : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* Google Sign-Up */}
            <button
              className="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
            </button>

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
