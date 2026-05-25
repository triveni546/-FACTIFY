import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  Download,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../styles/Dashboard.css";
import { dashboardApi, historyApi, userApi } from "../../api/client.js";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
];

function buildChartData(history) {
  const counts = Array(12).fill(0);

  history.forEach((item) => {
    if (!item.createdAt) return;
    const month = new Date(item.createdAt).getMonth();
    if (month >= 0 && month <= 11) {
      counts[month] += 1;
    }
  });

  return MONTH_LABELS.map((month, index) => ({
    month,
    articles: counts[index],
  }));
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="analytics-tooltip">
      <div className="analytics-tooltip-label">{label}</div>
      <div className="analytics-tooltip-value">{value}</div>
      <div className="analytics-tooltip-subtitle">
        article{value === 1 ? "" : "s"} analyzed
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    real: 0,
    fake: 0,
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const pieData = useMemo(
    () => [
      { name: "Real News", value: stats.real || 0, color: "#22d3ee" },
      { name: "Fake News", value: stats.fake || 0, color: "#f43f5e" },
    ],
    [stats],
  );

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    const [statsResult, historyResult, profileResult] = await Promise.allSettled([
      dashboardApi.stats(),
      historyApi.list(),
      userApi.getProfile(),
    ]);

    if (statsResult.status === "fulfilled") {
      setStats(
        statsResult.value || {
          total: 0,
          real: 0,
          fake: 0,
        },
      );
    } else {
      console.error("Failed to load dashboard stats:", statsResult.reason);
      setStats({ total: 0, real: 0, fake: 0 });
    }

    if (historyResult.status === "fulfilled") {
      setHistory(Array.isArray(historyResult.value) ? historyResult.value : []);
    } else {
      console.error("Failed to load history:", historyResult.reason);
      setHistory([]);
    }

    if (profileResult.status === "fulfilled") {
      setUser(profileResult.value?.user || null);
    } else {
      console.error("Failed to load profile:", profileResult.reason);
      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const lineData = useMemo(() => buildChartData(history), [history]);

  const filteredTableData = useMemo(() => {
    if (statusFilter === "All") return history;
    return history.filter((item) => item.result === statusFilter);
  }, [statusFilter, history]);

  const hasPieData = pieData.some((item) => item.value > 0);
  const hasLineData = lineData.some((item) => item.articles > 0);

  const peakMonth = useMemo(() => {
    if (!lineData.length) return null;
    return lineData.reduce((max, item) =>
      item.articles > max.articles ? item : max,
    );
  }, [lineData]);

  const handleDownload = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      stats,
      history: filteredTableData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factify-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
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
            <h1>DASHBOARD</h1>
            {user && <p>Welcome, {user.name}</p>}
            <p>Your fake news detection analytics workspace.</p>
          </div>

          <button
            className="download-btn"
            type="button"
            onClick={handleDownload}
            disabled={loading || history.length === 0}
          >
            <Download size={16} />
            <span>DOWNLOAD REPORTS</span>
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Articles Analyzed</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-change positive">Live from your history</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Fake Detected</div>
            <div className="stat-value">{stats.fake}</div>
            <div className="stat-change negative">Flagged as misinformation</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Real News</div>
            <div className="stat-value">{stats.real}</div>
            <div className="stat-change positive">Credible pattern matches</div>
          </div>
        </section>

        <section className="charts-grid">
          <div className="chart-card chart-card-analytics large">
            <div className="chart-card-top">
              <div>
                <div className="chart-kicker">Analytics Signal</div>
                <h3>Articles Analyzed Over Time</h3>
              </div>

              <div className="chart-highlight-pill">
                <TrendingUp size={16} />
                <span>
                  Peak: {peakMonth?.month || "--"} · {peakMonth?.articles || 0}
                </span>
              </div>
            </div>

            <div className="chart-card-subtext">
              Smooth monthly activity tracking with responsive rendering and live hover states.
            </div>

            <div className="chart-container analytics-chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={260}
                initialDimension={{ width: 1, height: 1 }}
              >
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="gridGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#4361ee" stopOpacity={0.04} />
                    </linearGradient>

                    <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4cc9f0" />
                      <stop offset="50%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#4361ee" />
                    </linearGradient>

                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                      <stop offset="45%" stopColor="#22d3ee" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#4361ee" stopOpacity={0.02} />
                    </linearGradient>

                    <filter id="lineOuterGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="
                          1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 18 -7
                        "
                        result="glow"
                      />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="url(#gridGlow)"
                    strokeDasharray="4 8"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#7f8fb3",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    width={38}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#22d3ee",
                      strokeOpacity: 0.35,
                      strokeWidth: 1.5,
                      strokeDasharray: "3 4",
                    }}
                    content={<AnalyticsTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="articles"
                    stroke="url(#lineStroke)"
                    strokeWidth={3}
                    dot={{
                      r: 0,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: "#0b1220",
                      strokeWidth: 3,
                      fill: "#4cc9f0",
                    }}
                    filter="url(#lineOuterGlow)"
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />

                  <Line
                    type="monotone"
                    dataKey="articles"
                    stroke="transparent"
                    fill="url(#areaGlow)"
                    strokeWidth={0}
                  />
                </LineChart>
              </ResponsiveContainer>

              {!loading && !hasLineData && (
                <div className="chart-empty">No analysis history yet.</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Real vs Fake</h3>
            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={240}
                initialDimension={{ width: 1, height: 1 }}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {!loading && !hasPieData && (
                <div className="chart-empty">No stats available yet.</div>
              )}
            </div>

            <div className="legend-box">
              {pieData.map((item) => (
                <div className="legend-item" key={item.name}>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="table-card">
          <div className="table-card-header">
            <h3>Recent Analyses</h3>

            <div className="filter-group">
              <label htmlFor="statusFilter" className="filter-label">
                Filter
              </label>
              <div className="filter-select-wrap">
                <select
                  id="statusFilter"
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Real">Real</option>
                  <option value="Fake">Fake</option>
                  <option value="Uncertain">Uncertain</option>
                </select>
                <ChevronDown size={16} className="filter-icon" />
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Content</th>
                  <th>Date</th>
                  <th>Result</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Loading analyses...
                    </td>
                  </tr>
                ) : filteredTableData.length > 0 ? (
                  filteredTableData.map((row) => (
                    <tr key={row._id}>
                      <td>{row.id || String(row._id).slice(-6)}</td>
                      <td>{row.url}</td>
                      <td>{row.date || new Date(row.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${(row.result || "").toLowerCase()}`}>
                          {row.result}
                        </span>
                      </td>
                      <td>{row.confidence}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No analyses yet. <Link to="/">Analyze content on Home</Link> to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;