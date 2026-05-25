import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Globe,
  UserCheck,
} from "lucide-react";

import "../../styles/Privacy.css";

const privacySections = [
  {
    icon: Database,
    title: "Information We Collect",
    text: "FACTIFY may collect account information, submitted content, platform usage activity, and interaction data to improve user experience and platform performance.",
  },
  {
    icon: ShieldCheck,
    title: "How We Use Information",
    text: "Collected information is used to improve fake news detection accuracy, manage accounts, provide support, maintain security, and enhance platform features.",
  },
  {
    icon: Lock,
    title: "Data Protection",
    text: "We apply reasonable security measures to protect stored information against unauthorized access, misuse, alteration, or disclosure.",
  },
  {
    icon: Globe,
    title: "Third-Party Services",
    text: "Some platform functionality may depend on trusted third-party services such as analytics, hosting, notifications, and infrastructure providers.",
  },
  {
    icon: UserCheck,
    title: "User Rights",
    text: "Users may request corrections, updates, or deletion of personal information where applicable under relevant privacy policies and regulations.",
  },
];

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-glow privacy-glow-1"></div>
      <div className="privacy-glow privacy-glow-2"></div>

      <div className="privacy-container">
        {/* HERO */}
        <div className="privacy-hero">
          <div className="privacy-badge">
            <ShieldCheck size={14} />
            Privacy Policy
          </div>

          <h1>Your privacy matters</h1>

          <p>
            FACTIFY is committed to protecting user data and maintaining
            transparency about how information is collected, stored, and used
            across the platform.
          </p>
        </div>

        {/* CONTENT */}
        <div className="privacy-panel">
          {privacySections.map((section, index) => {
            const Icon = section.icon;

            return (
              <div className="privacy-section" key={index}>
                <div className="privacy-icon-box">
                  <Icon size={22} />
                </div>

                <div className="privacy-content">
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="privacy-footer">
          <p>
            By using FACTIFY, you agree to the collection and use of
            information in accordance with this privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;