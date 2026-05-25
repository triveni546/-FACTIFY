import React from "react";
import {
  FileCheck,
  ShieldAlert,
  UserCheck,
  RefreshCcw,
  Ban,
} from "lucide-react";

import "../../styles/Terms.css";

const termsSections = [
  {
    icon: FileCheck,
    title: "Acceptance of Terms",
    text: "By accessing or using FACTIFY, users agree to comply with these terms, platform policies, and all applicable regulations.",
  },
  {
    icon: ShieldAlert,
    title: "Permitted Use",
    text: "FACTIFY may be used for lawful analysis, misinformation monitoring, article verification, and educational or research purposes only.",
  },
  {
    icon: UserCheck,
    title: "User Responsibilities",
    text: "Users are responsible for submitted content, account activity, and maintaining the confidentiality of their login credentials.",
  },
  {
    icon: RefreshCcw,
    title: "Platform Availability",
    text: "We may update, suspend, or modify parts of the platform at any time to improve reliability, security, and service performance.",
  },
  {
    icon: Ban,
    title: "Limitation of Liability",
    text: "FACTIFY provides AI-powered analytical insights for informational purposes and does not guarantee absolute accuracy or uninterrupted service.",
  },
];

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-glow terms-glow-1"></div>
      <div className="terms-glow terms-glow-2"></div>

      <div className="terms-container">
        {/* HERO */}
        <div className="terms-hero">
          <div className="terms-badge">
            <FileCheck size={14} />
            Terms & Conditions
          </div>

          <h1>Terms for using FACTIFY</h1>

          <p>
            Please read these terms carefully before using FACTIFY and its
            fake news detection services.
          </p>
        </div>

        {/* TERMS PANEL */}
        <div className="terms-panel">
          {termsSections.map((section, index) => {
            const Icon = section.icon;

            return (
              <div className="terms-section" key={index}>
                <div className="terms-icon-box">
                  <Icon size={22} />
                </div>

                <div className="terms-content">
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="terms-footer">
          <p>
            By continuing to use FACTIFY, you acknowledge and agree to these
            terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;