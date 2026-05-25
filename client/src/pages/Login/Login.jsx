import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../styles/Login.css";
import { authApi } from "../../api/client.js";

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSessionToken, setOtpSessionToken] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", api: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      err.email = "Invalid email format";
    if (!formData.password) err.password = "Password is required";
    return err;
  };

  const finishLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setSuccess("Login successful! Redirecting...");

    const redirectTo = location.state?.from?.pathname || "/";
    setTimeout(() => navigate(redirectTo, { replace: true }), 1200);
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
      const data = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (data.requiresOtp) {
        setStep("otp");
        setOtpSessionToken(data.otpSessionToken);
        setDevOtp(data.devOtp || "");
        setSuccess(data.message || "Enter the verification code sent to your email.");
        return;
      }

      finishLogin(data);
    } catch (error) {
      setErrors({
        api:
          error.message || "Server error. Is the backend running on port 5000?",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      if (!otp.trim() || otp.trim().length !== 6) {
        setErrors({ otp: "Enter the 6-digit code" });
        return;
      }

      const data = await authApi.verifyOtp({
        email: formData.email,
        otp: otp.trim(),
        otpSessionToken,
      });

      finishLogin(data);
    } catch (error) {
      setErrors({
        api: error.message || "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card glass">
        <div className="auth-card-header">
          <span className="eyebrow">Welcome Back</span>
          <h2>{step === "otp" ? "Verify Login" : "Login"}</h2>
          <p>
            {step === "otp"
              ? "Enter the 6-digit code sent to your email to complete sign-in."
              : "Sign in to access your dashboard and analysis history."}
          </p>
        </div>

        {step === "credentials" ? (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email</label>
              <div className={`input-wrap ${errors.email ? "input-error" : ""}`}>
                <input
                  type="email"
                  name="email"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div
                className={`input-wrap ${errors.password ? "input-error" : ""}`}
              >
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {errors.api && <div className="error-box">{errors.api}</div>}
            {success && <div className="success-box">{success}</div>}

            <button className="auth-btn" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="auth-footer forgot-link-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>

            <p className="auth-footer">
              Don’t have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
            {devOtp && (
              <div className="dev-reset-code-auth">
                <strong>Development OTP:</strong> {devOtp}
              </div>
            )}

            <div className="form-group">
              <label>Verification code</label>
              <div className={`input-wrap ${errors.otp ? "input-error" : ""}`}>
                <input
                  type="text"
                  name="otp"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              {errors.otp && <span className="error-text">{errors.otp}</span>}
            </div>

            {errors.api && <div className="error-box">{errors.api}</div>}
            {success && <div className="success-box">{success}</div>}

            <div className="forgot-form-actions">
              <button
                className="auth-btn secondary"
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setOtpSessionToken("");
                  setDevOtp("");
                  setSuccess("");
                }}
              >
                Back
              </button>
              <button className="auth-btn" disabled={loading} type="submit">
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default Login;
