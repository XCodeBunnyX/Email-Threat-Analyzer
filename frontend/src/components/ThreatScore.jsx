import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { getVerdictTheme, safeVal } from "../utils/formatters";

export default function ThreatScore({ score, verdict, evidence = [] }) {
  const numericScore = typeof score === "number" ? score : 0;
  const theme = getVerdictTheme(verdict, numericScore);

  // SVG circular gauge math (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, Math.max(0, numericScore)) / 100) * circumference;

  // Extract top 3-4 decisive reasons from evidence
  const primaryReasons = (evidence || [])
    .filter((e) => e.status !== "CLEAN" && e.status !== "INFO")
    .slice(0, 4);

  return (
    <div className="soc-card" style={{ borderColor: theme.borderColor, height: "100%" }}>
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon" style={{ color: theme.color }}>
            {numericScore >= 70 ? (
              <ShieldAlert size={20} />
            ) : numericScore >= 40 ? (
              <AlertTriangle size={20} />
            ) : (
              <ShieldCheck size={20} />
            )}
          </div>
          <h3>Threat Assessment</h3>
        </div>
        <span className={`badge ${theme.badgeClass}`}>
          {safeVal(verdict, "UNKNOWN")}
        </span>
      </div>

      <div className="card-body threat-gauge-card">
        <div className="gauge-wrapper">
          <svg className="gauge-svg" viewBox="0 0 160 160">
            <circle
              className="gauge-circle-bg"
              cx="80"
              cy="80"
              r={radius}
            />
            <circle
              className="gauge-circle-progress"
              cx="80"
              cy="80"
              r={radius}
              stroke={theme.color}
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="gauge-content">
            <span className="gauge-score" style={{ color: theme.color }}>
              {numericScore}
            </span>
            <span className="gauge-max">/ 100</span>
          </div>
        </div>

        <div
          className="threat-verdict-banner"
          style={{
            background: theme.bgColor,
            border: `1px solid ${theme.borderColor}`,
            color: theme.color,
          }}
        >
          {theme.riskLevel} • {safeVal(verdict, "VERDICT PENDING")}
        </div>

        {/* Explainability / Decisive factors */}
        <div style={{ width: "100%", marginTop: 20, textAlign: "left" }}>
          <h4 style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={14} />
            Decisive Risk Indicators
          </h4>
          {primaryReasons.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {primaryReasons.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderLeft: `3px solid ${theme.color}`,
                    padding: "8px 12px",
                    borderRadius: "0 6px 6px 0",
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                >
                  <strong style={{ color: theme.color, marginRight: 6 }}>
                    [{item.signal}]:
                  </strong>
                  {item.explanation}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--color-clean)",
              }}
            >
              No high-severity anomalous signals identified across headers, authentication, or infrastructure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}