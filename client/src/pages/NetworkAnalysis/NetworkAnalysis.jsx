import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, FileText, Network, Activity } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../styles/Dashboard.css";
import { historyApi } from "../../api/client.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
];

function buildNetworkNodes(history) {
  const domainMap = new Map();

  history.forEach((item) => {
    const sources = [
      ...(item.suspiciousSources || []),
      ...(item.trustedSources || []),
    ];

    sources.forEach((source) => {
      const existing = domainMap.get(source) || {
        id: source,
        source,
        connections: 0,
        fakeHits: 0,
        realHits: 0,
      };

      existing.connections += 1;
      if (item.result === "Fake") existing.fakeHits += 1;
      if (item.result === "Real") existing.realHits += 1;

      domainMap.set(source, existing);
    });
  });

  return [...domainMap.values()]
    .map((node, index) => {
      const riskScore = node.fakeHits / Math.max(node.connections, 1);
      let cluster = "Moderate";
      if (riskScore >= 0.6) cluster = "High Risk";
      else if (node.realHits > node.fakeHits) cluster = "Verified";

      return {
        id: `NET-${String(index + 1).padStart(2, "0")}`,
        source: node.source,
        cluster,
        connections: node.connections * 12 + 20,
        spreadRate: `${Math.round(riskScore * 100)}%`,
      };
    })
    .slice(0, 12);
}

const NetworkAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nodeData, setNodeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    historyApi
      .list()
      .then((data) => setNodeData(buildNetworkNodes(data)))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const riskCount = useMemo(
    () => nodeData.filter((node) => node.cluster === "High Risk").length,
    [nodeData],
  );

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
            <h1>NETWORK ANALYSIS</h1>
            <p>Track source clusters and misinformation spread patterns.</p>
          </div>
        </header>

        <section className="table-card">
          <h3>Source Network Map</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Cluster</th>
                  <th>Connections</th>
                  <th>Spread Rate</th>
                </tr>
              </thead>
              <tbody>
                {!isLoggedIn ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      <Link to="/login">Log in</Link> to view network analysis
                      from your history.
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Loading network data...
                    </td>
                  </tr>
                ) : nodeData.length > 0 ? (
                  nodeData.map((node) => (
                    <tr key={node.id}>
                      <td>{node.id}</td>
                      <td>{node.source}</td>
                      <td>
                        <span
                          className={`badge ${
                            node.cluster === "High Risk"
                              ? "fake"
                              : node.cluster === "Verified"
                                ? "real"
                                : "moderate"
                          }`}
                        >
                          {node.cluster}
                        </span>
                      </td>
                      <td>{node.connections}</td>
                      <td>{node.spreadRate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No network data yet. Analyze articles with source URLs on{" "}
                      <Link to="/">Home</Link>.
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

export default NetworkAnalysis;
