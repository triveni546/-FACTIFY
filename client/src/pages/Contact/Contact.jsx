import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  MessageSquare,
} from "lucide-react";

import "../../styles/Contact.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setSuccessMessage(data.message || "Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      setErrorMessage(
        error.message || "Could not send message. Is the server running?"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-glow contact-glow-1"></div>
      <div className="contact-glow contact-glow-2"></div>

      <div className="contact-container">
        {/* HEADER */}
        <div className="contact-header">
          <div className="contact-badge">
            
            Contact us
          </div>

          <h1>We’d love to hear from you</h1>

          <p>
            Need help, support, or partnership information? Reach out to our
            team and we’ll respond as quickly as possible.
          </p>
        </div>

        {/* GRID */}
        <div className="contact-grid">
          {/* LEFT FORM */}
          <div className="contact-card">
            <div className="card-title-row">
              <h2>Send a message</h2>
              <p>Our team usually replies within 24 hours.</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Subject</label>

                <input
                  type="text"
                  name="subject"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Message/Feedback</label>

                <textarea
                  rows="6"
                  name="message"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              <button
                type="submit"
                className="contact-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="btn-loader"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT INFO */}
          <div className="contact-card contact-info-card">
            <div className="card-title-row">
              <h2>Contact information</h2>
              <p>Reach out through any of the following channels.</p>
            </div>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <h4>Email</h4>
                  <p>dasaritriveni9@gmail.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <h4>Phone</h4>
                  <p>+91 81431 87471</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <h4>Location</h4>
                  <p>Vizag, Visakhapatnam, India</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <h4>Support Hours</h4>
                  <p>Monday - Friday • 9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;