import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Login.css";
import { authApi } from "../../api/client.js";

const ForgotPassword = () => {
  const [step, setStep] = useState("email");
  const [devResetCode, setDevResetCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetCode("");

    try {
      const email = form.email.trim();
      if (!email) {
        setError("Email is required");
        return;
      }

      const data = await authApi.forgotPassword({ email });
      if (data.devResetCode) setDevResetCode(data.devResetCode);
      setStep("reset");
      setMessage(
        data.message ||
          "If an account exists, enter the reset code below.",
      );
    } catch (err) {
      setError(err.message || "Could not request reset code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await authApi.resetPassword({
        email: form.email.trim(),
        resetCode: form.resetCode.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(data.message || "Password reset successfully");
      setStep("done");
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card glass forgot-password-card">
        <div className="auth-card-header">
          <span className="eyebrow">Account recovery</span>
          <h2>Forgot password</h2>
          <p>
            {step === "email"
              ? "Enter your email to receive a 6-digit reset code."
              : step === "reset"
                ? "Enter the code and your new password."
                : "You can now sign in with your new password."}
          </p>
        </div>

        {devResetCode && (
          <div className="dev-reset-code-auth">
            <strong>Development code:</strong> {devResetCode}
            <span>Valid for 15 minutes</span>
          </div>
        )}

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        {step === "email" && (
          <form
            className="auth-form"
            onSubmit={requestCode}
            noValidate
            autoComplete="on"
            name="forgot-password-email"
          >
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <div className="input-wrap">
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>
            <button className="auth-btn" disabled={loading} type="submit">
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form
            className="auth-form"
            onSubmit={resetPassword}
            noValidate
            autoComplete="on"
            name="forgot-password-reset"
          >
            <div className="form-group">
              <label htmlFor="forgot-reset-email">Email</label>
              <div className="input-wrap">
                <input
                  id="forgot-reset-email"
                  type="email"
                  name="email"
                  value={form.email}
                  readOnly
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="forgot-reset-code">Reset code</label>
              <div className="input-wrap">
                <input
                  id="forgot-reset-code"
                  type="text"
                  name="resetCode"
                  placeholder="6-digit code"
                  value={form.resetCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="forgot-new-password">New password</label>
              <div className="input-wrap">
                <input
                  id="forgot-new-password"
                  type="password"
                  name="newPassword"
                  placeholder="At least 6 characters"
                  value={form.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="forgot-confirm-password">Confirm password</label>
              <div className="input-wrap">
                <input
                  id="forgot-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="forgot-form-actions">
              <button
                className="auth-btn secondary"
                type="button"
                onClick={() => {
                  setStep("email");
                  setDevResetCode("");
                }}
              >
                Back
              </button>
              <button className="auth-btn" disabled={loading} type="submit">
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <Link className="auth-btn auth-btn-link" to="/login">
            Go to login
          </Link>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
