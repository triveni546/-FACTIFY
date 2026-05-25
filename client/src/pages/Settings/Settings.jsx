import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  History,
  User,
  Settings as SettingsIcon,
  Bell,
  Lock,
  ShieldCheck,
  Save,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Settings.css";
import { userApi } from "../../api/client.js";
import {
  requestNotificationPermission,
  isPushSupported,
} from "../../utils/pushNotifications.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
  { icon: History, label: "History", path: "/history" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
];

const defaultSettings = {
  fullName: "",
  email: "",
  darkMode: true,
  emailAlerts: true,
  pushNotifications: false,
  twoFactorAuth: false,
  loginAlerts: true,
};

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          userApi.getProfile(),
          userApi.getSettings(),
        ]);

        const dbSettings = settingsData?.settings || profileData?.user?.settings || {};

        setSettings({
          fullName: profileData?.user?.name || "",
          email: profileData?.user?.email || "",
          darkMode: dbSettings.darkMode !== false,
          emailAlerts: dbSettings.emailAlerts !== false,
          pushNotifications: Boolean(dbSettings.pushNotifications),
          twoFactorAuth: Boolean(dbSettings.twoFactorAuth),
          loginAlerts: dbSettings.loginAlerts !== false,
        });
      } catch (error) {
        console.log(error);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [settings.darkMode]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (name === "pushNotifications" && checked) {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        setErrorMessage(
          permission === "unsupported"
            ? "This browser does not support notifications."
            : "Notification permission was denied. Enable it in browser settings."
        );
        return;
      }
    }

    setSettings((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setErrorMessage("");

      await Promise.all([
        userApi.updateProfile({
          name: settings.fullName,
          email: settings.email,
        }),
        userApi.updateSettings({
          emailAlerts: settings.emailAlerts,
          pushNotifications: settings.pushNotifications,
          twoFactorAuth: settings.twoFactorAuth,
          loginAlerts: settings.loginAlerts,
          darkMode: settings.darkMode,
        }),
      ]);

      localStorage.setItem(
        "factify-settings",
        JSON.stringify({
          darkMode: settings.darkMode,
          pushNotifications: settings.pushNotifications,
        })
      );

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            name: settings.fullName,
            email: settings.email,
          })
        );
      }

      setSavedMessage("Settings saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to save settings");
    }
  };

  const submitPasswordChange = async () => {
    try {
      setErrorMessage("");
      await userApi.changePassword(passwordForm);
      setSavedMessage("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update password");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>FACTIFY</h2>
          <p>Fake news intelligence</p>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
                type="button"
              >
                <span className="nav-icon-wrap" aria-hidden="true">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1>SETTINGS</h1>
            <p>Manage your account</p>
          </div>

          <button className="download-btn" onClick={handleSave} type="button">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </header>

        {savedMessage && <div className="settings-success">{savedMessage}</div>}
        {errorMessage && <div className="settings-error">{errorMessage}</div>}

        <section className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-header">
              <User size={18} />
              <h3>Account Settings</h3>
            </div>

            <div className="settings-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={settings.fullName}
                onChange={handleChange}
                className="profile-input"
              />
            </div>

            <div className="settings-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="profile-input"
              />
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <Bell size={18} />
              <h3>Notifications</h3>
            </div>

            <div className="toggle-row">
              <div>
                <h4>Email Alerts</h4>
                <p>Email when fake or high-risk content is detected.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="emailAlerts"
                  checked={settings.emailAlerts}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <h4>Push Notifications</h4>
                <p>
                  Browser alert after analysis completes
                  {!isPushSupported() ? " (not supported in this browser)" : ""}.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                  disabled={!isPushSupported()}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <ShieldCheck size={18} />
              <h3>Security</h3>
            </div>

            <div className="toggle-row">
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>6-digit OTP by email required at login.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <h4>Login Alerts</h4>
                <p>Email when a new device or IP signs in.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="loginAlerts"
                  checked={settings.loginAlerts}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button
              className="delete-btn"
              type="button"
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>

            {showPasswordForm && (
              <form
                className="settings-form-group"
                autoComplete="on"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="profile-input"
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="profile-input"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="profile-input"
                  autoComplete="new-password"
                />
                <button
                  className="download-btn"
                  type="button"
                  onClick={submitPasswordChange}
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
