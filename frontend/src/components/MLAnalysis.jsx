import React from "react";
import { Cpu, ShieldQuestion } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function MLAnalysis({ ml = {} }) {
  const isAvailable = ml.model_available === true;
  const prediction = ml.prediction || "UNKNOWN";

  const getPredictionBadge = (pred) => {
    const p = (pred || "").toUpperCase();
    if (p === "PHISHING" || p === "MALICIOUS") {
      return { class: "badge-high", text: "PHISHING" };
    }
    if (p === "LEGITIMATE" || p === "CLEAN") {
      return { class: "badge-clean", text: "LEGITIMATE" };
    }
    return { class: "badge-muted", text: p || "UNKNOWN" };
  };

  const badge = getPredictionBadge(prediction);

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Cpu size={20} />
          </div>
          <h3>Machine Learning / NLP Phishing Classifier</h3>
        </div>
        <span className={`badge ${isAvailable ? badge.class : "badge-muted"}`}>
          {isAvailable ? badge.text : "ML Model Unavailable"}
        </span>
      </div>

      <div className="card-body">
        {isAvailable ? (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Model Prediction
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: badge.text === "PHISHING" ? "var(--color-high)" : "var(--color-clean)", marginTop: 4 }}>
                  {prediction}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Decision Score / Confidence
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                  {ml.decision_score !== null && ml.decision_score !== undefined
                    ? `${(ml.decision_score * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Classifier Architecture
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-cyan)", marginTop: 4 }}>
                  TF-IDF + Linear SVM
                </div>
              </div>
            </div>

            {ml.note && (
              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {ml.note}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div
              className="disclaimer-banner"
              style={{
                background: "rgba(148, 163, 184, 0.08)",
                borderColor: "rgba(148, 163, 184, 0.25)",
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              <ShieldQuestion size={18} style={{ flexShrink: 0, marginTop: 1, color: "var(--text-muted)" }} />
              <div>
                <strong style={{ color: "#fff" }}>ML Model Unavailable</strong>
                <p style={{ marginTop: 4, fontSize: 12 }}>
                  {safeVal(
                    ml.note,
                    "Machine learning weights are not deployed in this environment. The GmailGuard scoring engine automatically rebalances across remaining forensic vectors (Authentication, IP reputation, Domain age, URL structure, and Attachment flags)."
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-muted)" }}>
              <span>Prediction: <strong style={{ color: "#fff" }}>{prediction}</strong></span>
              <span>•</span>
              <span>Decision Score: <strong style={{ color: "#fff" }}>N/A</strong></span>
              <span>•</span>
              <span>Classifier: <strong style={{ color: "#fff" }}>TF-IDF + SVM (Offline)</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
