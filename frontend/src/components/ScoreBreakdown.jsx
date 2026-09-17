import React from "react";
import { Sliders, Cpu, Key, Globe, Shield, Link2, Paperclip } from "lucide-react";

const CATEGORY_META = {
  ml: { label: "Machine Learning / NLP", icon: Cpu },
  authentication: { label: "Email Authentication (SPF/DMARC)", icon: Key },
  ip: { label: "IP & Infrastructure Reputation", icon: Globe },
  domain: { label: "Domain Intelligence & Age", icon: Shield },
  url: { label: "URL Threat & Obfuscation", icon: Link2 },
  attachment: { label: "Attachment Risk & Extensions", icon: Paperclip },
};

export default function ScoreBreakdown({ subScores = {}, weightsUsed = {} }) {
  const categories = Object.keys(subScores || {});

  const getScoreColor = (score) => {
    if (score >= 70) return "#ef4444";
    if (score >= 40) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="soc-card" style={{ height: "100%" }}>
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Sliders size={20} />
          </div>
          <h3>Multi-Vector Scoring Breakdown</h3>
        </div>
        <span className="badge badge-muted">Composite Weights</span>
      </div>

      <div className="card-body">
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 18 }}>
          Each investigative signal contributes to the final threat calculation according to calibrated dynamic weights:
        </p>

        {categories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {categories.map((key) => {
              const score = subScores[key] ?? 0;
              const weight = weightsUsed[key] !== undefined ? `${Math.round(weightsUsed[key] * 100)}%` : "N/A";
              const meta = CATEGORY_META[key] || { label: key.toUpperCase(), icon: Sliders };
              const Icon = meta.icon;
              const barColor = getScoreColor(score);

              return (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 600 }}>
                      <Icon size={15} style={{ color: "var(--accent-cyan)" }} />
                      <span>{meta.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Weight: {weight}
                      </span>
                      <span style={{ fontWeight: 700, color: barColor, minWidth: 32, textAlign: "right" }}>
                        {score}/100
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      height: 8,
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, score))}%`,
                        height: "100%",
                        background: barColor,
                        borderRadius: 9999,
                        transition: "width 0.8s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Scoring sub-components not available in report.
          </p>
        )}
      </div>
    </div>
  );
}
