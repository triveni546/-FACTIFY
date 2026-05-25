import React from "react";

import {
  LayoutDashboard,
  FileText,
  Network,
  History,
  User,
  Settings as SettingsIcon,
  Info,
  ShieldCheck,
  SearchCheck,
  Users,
  Globe,
  Brain,
  ArrowRight,
  Sparkles,
  Radar,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/About.css";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
  { icon: History, label: "History", path: "/history" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
  { icon: Info, label: "About", path: "/about" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Credibility Detection",
    text: "Smart credibility scoring using source patterns and content signals.",
  },
  {
    icon: SearchCheck,
    title: "Source Verification",
    text: "Inspect article origins and identify suspicious source activity.",
  },
  {
    icon: Radar,
    title: "Threat Monitoring",
    text: "Track misinformation spread and detect risky article clusters.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    text: "Visual reports and metrics for engagement and detection activity.",
  },
];

const steps = [
  {
    number: "01",
    title: "Collect Articles",
    text: "Users submit suspicious articles or links for analysis.",
  },
  {
    number: "02",
    title: "Analyze Signals",
    text: "The system reviews credibility indicators and source history.",
  },
  {
    number: "03",
    title: "Visualize Results",
    text: "Interactive charts and reports help explain the findings.",
  },
  {
    number: "04",
    title: "Take Action",
    text: "Users can identify misinformation and respond confidently.",
  },
];

const modules = [
  {
    icon: Brain,
    title: "AI Detection Engine",
    text: "Processes article credibility and misinformation signals.",
  },
  {
    icon: Globe,
    title: "Network Mapping",
    text: "Visualizes source relationships and activity patterns.",
  },
  {
    icon: Users,
    title: "User Monitoring",
    text: "Tracks engagement, reports, and investigation history.",
  },
];

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFeatureNavigation = (title) => {
    if (title === "Credibility Detection") {
      navigate("/dashboard");
    }

    if (title === "Source Verification") {
      navigate("/network-analysis");
    }

    if (title === "Threat Monitoring") {
      navigate("/articles");
    }

    if (title === "Analytics Dashboard") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
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

      {/* MAIN */}
      <main className="main-content">
        {/* HERO */}
        <section className="about-hero-v2">
          <div className="about-hero-overlay"></div>

          <div className="about-hero-left">
            <div className="about-mini-badge">
              <Sparkles size={14} />
              Smart Fake News Detection
            </div>

            <h1>
              Discover Truth <br />
              Through Intelligent Analysis
            </h1>

            <p>
              FACTIFY helps users detect misinformation, verify sources, analyze
              article credibility, and monitor suspicious content through a
              modern AI-powered dashboard experience.
            </p>

            <div className="about-hero-buttons">
              <button
                className="download-btn"
                type="button"
                onClick={() => {
                  document.getElementById("core-features")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Explore Features
                <ArrowRight size={16} />
              </button>

              <button
                className="about-secondary-btn"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="about-hero-right">
            <div className="hero-glow-card">
              <div className="hero-circle"></div>

              <div className="hero-card-content">
                <div className="hero-card-icon">
                  <ShieldCheck size={24} />
                </div>

                <h3>AI Detection Active</h3>

                <p>Real-time monitoring and misinformation tracking enabled.</p>

                <div className="hero-status-row">
                  <span className="status-dot"></span>
                  System Running Normally
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="about-section" id="core-features">
          <div className="section-heading">
            <h3>Core Features</h3>
            <p>Everything needed for misinformation monitoring.</p>
          </div>

          <div className="about-feature-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div className="feature-card-v2" key={index}>
                  <div className="feature-icon-box-v2">
                    <Icon size={22} />
                  </div>

                  <h4>{feature.title}</h4>

                  <p>{feature.text}</p>

                  <button
                    className="feature-link-btn"
                    type="button"
                    onClick={() => handleFeatureNavigation(feature.title)}
                  >
                    Learn More
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="about-section">
          <div className="section-heading">
            <h3>How FACTIFY Works</h3>
            <p>Simple workflow for article investigation and detection.</p>
          </div>

          <div className="workflow-grid">
            {steps.map((step, index) => (
              <div className="workflow-card" key={index}>
                <div className="workflow-number">{step.number}</div>

                <h4>{step.title}</h4>

                <p>{step.text}</p>

                <CheckCircle2 size={18} className="workflow-check" />
              </div>
            ))}
          </div>
        </section>

        {/* MODULES */}
        <section className="about-section">
          <div className="section-heading">
            <h3>Platform Modules</h3>
            <p>Main intelligent systems powering FACTIFY.</p>
          </div>

          <div className="modules-grid">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <div className="module-card" key={index}>
                  <div className="module-icon">
                    <Icon size={24} />
                  </div>

                  <h4>{module.title}</h4>

                  <p>{module.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;