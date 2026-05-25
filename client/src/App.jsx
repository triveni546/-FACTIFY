import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Articles from "./pages/Articles/Articles";
import NetworkAnalysis from "./pages/NetworkAnalysis/NetworkAnalysis";
import History from "./pages/History/History";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const checkToken = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", checkToken);
    window.addEventListener("focus", checkToken);
    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("focus", checkToken);
    };
  }, []);

  return (
    <>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        {/* Home is public for everyone */}
        <Route path="/" element={<Home token={token} setToken={setToken} />} />

        {/* Public routes: redirect to home if already logged in */}
        <Route
          path="/register"
          element={
            !token ? (
              <Register setToken={setToken} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            !token ? <Login setToken={setToken} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/forgot-password"
          element={
            !token ? <ForgotPassword /> : <Navigate to="/" replace />
          }
        />
        <Route path="/articles" element={<Articles />} />
        <Route path="/network-analysis" element={<NetworkAnalysis />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/about" element={<About />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
