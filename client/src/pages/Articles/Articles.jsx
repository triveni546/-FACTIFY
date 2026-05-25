import React, { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  Search,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../styles/Dashboard.css";
import { historyApi } from "../../api/client.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
];

const Articles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    historyApi
      .list()
      .then((data) => {
        setArticles(
          data.map((item) => ({
            id: item.id || String(item._id).slice(-6),
            title: item.url,
            source:
              item.trustedSources?.[0] ||
              item.suspiciousSources?.[0] ||
              item.inputType ||
              "text",
            status: item.result,
            date: item.date || new Date(item.createdAt).toLocaleDateString(),
          })),
        );
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const filteredArticles = useMemo(() => {
    const query = search.toLowerCase();
    return articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(query) ||
        article.source?.toLowerCase().includes(query) ||
        article.status?.toLowerCase().includes(query),
    );
  }, [articles, search]);

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
            <h1>ARTICLES</h1>
            <p>Review analyzed articles and their credibility results.</p>
          </div>

          <div className="filter-select-wrap">
            <input
              type="text"
              placeholder="Search articles..."
              className="filter-select"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="filter-icon" />
          </div>
        </header>

        <section className="table-card">
          <h3>Analyzed Articles</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {!isLoggedIn ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      <Link to="/login">Log in</Link> to view your analyzed
                      articles.
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Loading articles...
                    </td>
                  </tr>
                ) : filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.id}</td>
                      <td>{article.title}</td>
                      <td>{article.source}</td>
                      <td>
                        <span
                          className={`badge ${article.status.toLowerCase()}`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td>{article.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No articles yet. <Link to="/">Analyze content</Link> on
                      the home page.
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

export default Articles;
