import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Register.css";
import { authApi } from "../../api/client.js";

const Register = ({ setToken }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "", api: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.fullName.trim()) err.fullName = "Full name is required";
    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      err.email = "Invalid email format";
    }
    if (!formData.password) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Minimum 6 characters required";
    }
    if (!formData.confirmPassword) {
      err.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms) {
      err.agreeTerms =
        "You must agree to the Terms & Conditions and Privacy Policy";
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    setSuccess("");
    setErrors({});

    try {
      await authApi.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const apiMessage =
        error.data?.message ||
        error.message ||
        "Server error. Is the backend running on port 5000?";

      setErrors({ api: apiMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card glass">
        <div className="register-card-header">
          <span className="eyebrow">Create Account</span>
          <h2>Register</h2>
          <p>Join Fake News Detection system and analyze news using AI.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <div
              className={`input-wrap ${errors.fullName ? "input-error" : ""}`}
            >
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className={`input-wrap ${errors.email ? "input-error" : ""}`}>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div
              className={`input-wrap ${errors.password ? "input-error" : ""}`}
            >
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div
              className={`input-wrap ${errors.confirmPassword ? "input-error" : ""}`}
            >
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="terms-check-wrap">
            <label className="terms-check">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <Link to="/terms">Terms & Conditions</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </label>

            {errors.agreeTerms && (
              <span className="error-text">{errors.agreeTerms}</span>
            )}
          </div>

          {errors.api && <div className="error-box">{errors.api}</div>}
          {success && <div className="success-box">{success}</div>}

          <button
            className="register-btn"
            disabled={loading || !formData.agreeTerms}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="register-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Register;
