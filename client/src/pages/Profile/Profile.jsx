import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  History,
  User,
  Flame,
  CalendarDays,
  Activity,
  Clock3,
  Edit3,
  Save,
  Camera,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Dashboard.css";
import "../../styles/Profile.css";
import { userApi, historyApi } from "../../api/client.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
  { icon: History, label: "History", path: "/history" },
  { icon: User, label: "Profile", path: "/profile" },
];

const getValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sortHistoryByLatest = (historyData = []) => {
  return [...historyData].sort((a, b) => {
    const aDate = getValidDate(a.createdAt || a.date)?.getTime() || 0;
    const bDate = getValidDate(b.createdAt || b.date)?.getTime() || 0;
    return bDate - aDate;
  });
};

const buildWeeklyActivity = (historyData = []) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));

    return {
      label: days[date.getDay()],
      dateKey: date.toDateString(),
      fullDate: date,
      count: 0,
    };
  });

  historyData.forEach((item) => {
    const rawDate = item.createdAt || item.date;
    const parsedDate = getValidDate(rawDate);
    if (!parsedDate) return;

    parsedDate.setHours(0, 0, 0, 0);
    const itemDateKey = parsedDate.toDateString();

    const matchedDay = weekly.find((day) => day.dateKey === itemDateKey);
    if (matchedDay) {
      matchedDay.count += 1;
    }
  });

  return weekly;
};

const formatActivityTime = (value) => {
  const parsed = getValidDate(value);
  if (!parsed) return "Unknown time";

  return parsed.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [stats, setStats] = useState({ total: 0, fake: 0, real: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const [tempProfile, setTempProfile] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setSaveError("");

      const [profileData, historyResponse] = await Promise.all([
        userApi.getProfile(),
        historyApi.list(),
      ]);

      const userProfile = {
        name: profileData?.user?.name || "",
        email: profileData?.user?.email || "",
        bio: profileData?.user?.bio || "",
      };

      setProfile(userProfile);
      setTempProfile(userProfile);

      const historyList = Array.isArray(historyResponse)
        ? historyResponse
        : Array.isArray(historyResponse?.history)
        ? historyResponse.history
        : [];

      const sortedHistory = sortHistoryByLatest(historyList);

      const total = sortedHistory.length;
      const fake = sortedHistory.filter((h) => h.result === "Fake").length;
      const real = sortedHistory.filter((h) => h.result === "Real").length;

      setStats({ total, fake, real });

      setRecentActivities(
        sortedHistory.slice(0, 5).map((item, index) => {
          const preview =
            item.content?.trim() ||
            item.url?.trim() ||
            "Analysis entry";

          return {
            id: item._id || `${index}-${preview}`,
            title:
              preview.length > 72 ? `${preview.slice(0, 72)}...` : preview,
            time: formatActivityTime(item.createdAt || item.date),
            status: item.result || "Uncertain",
            confidence:
              typeof item.confidence === "number"
                ? `${item.confidence}%`
                : null,
          };
        })
      );

      setActivityData(buildWeeklyActivity(sortedHistory));
    } catch (error) {
      console.log(error);
      setSaveError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const handleChange = (e) => {
    setTempProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleDeleteImage = () => {
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }
    setProfileImage(null);
  };

  const saveProfile = async () => {
    try {
      setSaveError("");
      setSaveSuccess("");

      const data = await userApi.updateProfile({
        name: tempProfile.name,
        email: tempProfile.email,
        bio: tempProfile.bio,
      });

      const updated = {
        name: data?.user?.name || "",
        email: data?.user?.email || "",
        bio: data?.user?.bio || "",
      };

      setProfile(updated);
      setTempProfile(updated);

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          _id: data?.user?._id,
          name: data?.user?.name,
          email: data?.user?.email,
        })
      );

      setIsEditing(false);
      setSaveSuccess("Profile updated successfully");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (error) {
      setSaveError(error.message || "Failed to save profile");
    }
  };

  const cancelEdit = () => {
    setTempProfile(profile);
    setIsEditing(false);
    setSaveError("");
  };

  const getStatusClass = (status) => {
    if (status === "Fake") return "fake";
    if (status === "Uncertain") return "moderate";
    return "real";
  };

  const activeDays = Math.min(stats.total, 365);
  const streak = useMemo(() => {
    return activityData.reduce((sum, day) => sum + day.count, 0);
  }, [activityData]);

  const maxActivity = useMemo(() => {
    return Math.max(...activityData.map((day) => day.count), 1);
  }, [activityData]);

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
            <h1>PROFILE</h1>
            <p>Track your account activity and manage profile details.</p>
          </div>

          {!isEditing ? (
            <button
              className="download-btn"
              onClick={() => setIsEditing(true)}
              type="button"
              disabled={loading}
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="delete-btn" onClick={cancelEdit} type="button">
                Cancel
              </button>
              <button
                className="download-btn"
                onClick={saveProfile}
                type="button"
              >
                <Save size={16} />
                <span>Save Profile</span>
              </button>
            </div>
          )}
        </header>

        {saveSuccess && <div className="settings-success">{saveSuccess}</div>}
        {saveError && <div className="settings-error">{saveError}</div>}

        <section className="profile-summary-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="User profile"
                    className="profile-avatar-img"
                  />
                ) : (
                  <User size={34} />
                )}
              </div>

              <label
                htmlFor="profile-upload"
                className="camera-upload-btn"
                title="Upload profile photo"
              >
                <Camera size={16} />
              </label>

              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </div>

            {profileImage && isEditing && (
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleDeleteImage}
              >
                Delete Image
              </button>
            )}
          </div>

          <div className="profile-summary-info">
            {loading ? (
              <p>Loading profile...</p>
            ) : isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={tempProfile.name}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="Enter your name"
                />

                <input
                  type="email"
                  name="email"
                  value={tempProfile.email}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="Enter your email"
                />

                <textarea
                  name="bio"
                  value={tempProfile.bio}
                  onChange={handleChange}
                  className="profile-textarea"
                  placeholder="Write your bio..."
                  rows="4"
                />
              </>
            ) : (
              <>
                <h2>{profile.name || "User Name"}</h2>
                <p>{profile.email || "user@example.com"}</p>
                <div className="profile-bio">
                  {profile.bio ||
                    "Fake news analyst passionate about digital truth and misinformation detection."}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="stats-grid profile-stats-grid">
          <div className="stat-card profile-stat-card">
            <div className="stat-icon-box cyan">
              <Activity size={20} />
            </div>
            <div className="profile-stat-body">
              <div className="stat-label">Total Analyses</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-change positive">
                From your account history
              </div>
            </div>
          </div>

          <div className="stat-card profile-stat-card">
            <div className="stat-icon-box orange">
              <Flame size={20} />
            </div>
            <div className="profile-stat-body">
              <div className="stat-label">Fake Detected</div>
              <div className="stat-value">{stats.fake}</div>
              <div className="stat-change positive">Misinformation flagged</div>
            </div>
          </div>

          <div className="stat-card profile-stat-card">
            <div className="stat-icon-box green">
              <CalendarDays size={20} />
            </div>
            <div className="profile-stat-body">
              <div className="stat-label">Credible Results</div>
              <div className="stat-value">{stats.real}</div>
              <div className="stat-change positive">
                {activeDays} total checks
              </div>
            </div>
          </div>
        </section>

        <section className="profile-charts-grid">
          <div className="profile-chart-card glass-panel activity-overview-card">
            <div className="chart-card-header">
              <div>
                <h3>Activity Overview</h3>
                <span className="chart-subtitle">
                  {streak > 0
                    ? `${streak} analyses in the last 7 days`
                    : "Start analyzing content to see your weekly trend"}
                </span>
              </div>
              <div className="activity-overview-stat">
                <BarChart3 size={18} />
                <span>{stats.total} total</span>
              </div>
            </div>

            <div className="activity-chart-wrap">
              {activityData.length > 0 ? (
                <>
                  <div className="activity-chart-grid-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="activity-bars">
                    {activityData.map((day) => {
                      const barHeight =
                        day.count === 0
                          ? 8
                          : Math.max(28, (day.count / maxActivity) * 140);

                      return (
                        <div className="activity-bar-item" key={day.dateKey}>
                          <div className="activity-bar-value">
                            {day.count}
                          </div>
                          <div className="activity-bar-track">
                            <div
                              className={`activity-bar-fill ${
                                day.count === 0 ? "is-empty" : ""
                              }`}
                              style={{ height: `${barHeight}px` }}
                              title={`${day.label}: ${day.count} analysis${
                                day.count !== 1 ? "es" : ""
                              }`}
                            />
                          </div>
                          <span className="activity-bar-label">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="activity-empty-state">
                  <Activity size={28} />
                  <p>No analyses yet. Run your first check from the home page.</p>
                </div>
              )}
            </div>
          </div>

          <div className="profile-chart-card glass-panel recent-activity-card">
            <div className="chart-card-header">
              <div>
                <h3>Recent Activity</h3>
                <span className="chart-subtitle">Your latest fact checks</span>
              </div>
              {recentActivities.length > 0 && (
                <button
                  type="button"
                  className="view-history-link"
                  onClick={() => navigate("/history")}
                >
                  View all
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <div className="recent-activity-list activity-timeline">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <button
                    type="button"
                    className="recent-activity-item timeline-item"
                    key={activity.id}
                    onClick={() => navigate("/history")}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <div className="timeline-marker">
                      <div
                        className={`activity-icon status-${getStatusClass(activity.status)}`}
                      >
                        <Clock3 size={16} />
                      </div>
                    </div>

                    <div className="activity-content timeline-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.time}</p>
                      {activity.confidence && (
                        <span className="activity-meta">
                          Risk score: {activity.confidence}
                        </span>
                      )}
                    </div>

                    <span
                      className={`badge timeline-badge ${getStatusClass(activity.status)}`}
                    >
                      {activity.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="activity-empty-state compact">
                  <Clock3 size={24} />
                  <p>No recent activity yet.</p>
                  <button
                    type="button"
                    className="view-history-link inline"
                    onClick={() => navigate("/")}
                  >
                    Analyze content
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;