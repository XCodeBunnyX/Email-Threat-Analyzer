import React, { useState, useEffect } from "react";
import { Shield, CheckCircle2, Cpu } from "lucide-react";

const SCAN_STEPS = [
  "Parsing RFC 5322 headers and MIME structure...",
  "Verifying SPF, DKIM, and DMARC cryptographic alignment...",
  "Extracting candidate relay hops and mail infrastructure...",
  "Conducting static URL inspection and PhishTank lookup...",
  "Analyzing attachments for disguised executables & macros...",
  "Correlating cross-vector indicators and scoring threat model...",
  "Gemini AI is analyzing email content & threat indicators...",
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <div className="scanner-circle">
        <Shield size={44} className="scanner-inner-icon" />
      </div>

      <h3 style={{ fontSize: 20, color: "#fff", fontWeight: 700, marginBottom: 6 }}>
        Forensic Threat Pipeline Active
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
        Executing multi-layered email forensics and OSINT threat intelligence correlation...
      </p>

      <div className="scanner-steps">
        {SCAN_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className={`scanner-step-item ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} style={{ color: "var(--color-clean)", flexShrink: 0 }} />
              ) : (
                <Cpu
                  size={16}
                  style={{
                    color: isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
