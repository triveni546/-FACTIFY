import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Home from "../pages/Home/Home";

import "../styles/AppRoutes.css";

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper (login/register only when NOT logged in)
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

// Pages
const About = () => (
  <div className="page-section">
    <h2>About</h2>
    <p>This page explains the fake news detection platform.</p>
  </div>
);

const Dashboard = () => (
  <div className="page-section">
    <h2>Dashboard</h2>
    <p>This page shows insights, analysis history, and AI results.</p>
  </div>
);

const Settings = () => (
  <div className="page-section">
    <h2>Settings</h2>
    <p>This page lets users change preferences and theme behavior.</p>
  </div>
);

const Login = () => (
  <div className="page-section">
    <h2>Login</h2>
    <p>Users can log in to access saved analyses and account tools.</p>
  </div>
);

const Register = () => (
  <div className="page-section">
    <h2>Register</h2>
    <p>New users can create an account here.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />

        <Routes>
          {/* Default route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Public pages (only when NOT logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
