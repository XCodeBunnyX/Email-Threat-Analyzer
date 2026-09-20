import React, { useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
  Globe,
  UserX,
  ListChecks,
} from "lucide-react";

export default function GeminiAnalysisCard({ gemini = null }) {
  const [expandedExplanation, setExpandedExplanation] = useState(false);

  if (!gemini || gemini.available === false) {
    const reason = gemini?.reason || "AI analysis is currently unconfigured or unavailable.";
    return (
      <div className="soc-card gemini-card" style={{ borderColor: "rgba(168, 85, 247, 0.2)" }}>
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#c084fc" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Gemini AI Intelligence Layer
                <span className="badge badge-muted" style={{ fontSize: 10, padding: "2px 8px" }}>
                  AI Offline
                </span>
              </h3>
            </div>
          </div>
          <span className="badge badge-muted">Analysis Unavailable</span>
        </div>
        <div className="card-body" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "var(--text-muted)", fontSize: 13 }}>
            <Info size={18} style={{ color: "var(--accent-blue)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>{reason}</p>
              <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.75 }}>
                The deterministic forensic and threat analysis engines remain fully operational. To enable
                AI contextual reasoning, configure <code>GEMINI_API_KEY</code> in <code>backend/.env</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const classification = (gemini.classification || "suspicious").toUpperCase();
  const riskLevel = (gemini.risk_level || "low").toUpperCase();
  const confidence = gemini.confidence ?? 0;

  const getClassificationBadge = (cls) => {
    switch (cls) {
      case "PHISHING":
      case "MALICIOUS":
        return { class: "badge-critical", color: "var(--color-critical)", icon: ShieldAlert };
      case "SUSPICIOUS":
        return { class: "badge-high", color: "var(--color-high)", icon: AlertTriangle };
      case "BENIGN":
        return { class: "badge-clean", color: "var(--color-clean)", icon: ShieldCheck };
      default:
        return { class: "badge-muted", color: "var(--text-muted)", icon: Info };
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "var(--color-critical)";
      case "HIGH":
        return "var(--color-high)";
      case "MEDIUM":
        return "var(--color-medium)";
      case "LOW":
        return "var(--accent-cyan)";
      case "NONE":
        return "var(--color-clean)";
      default:
        return "var(--text-muted)";
    }
  };

  const badgeInfo = getClassificationBadge(classification);
  const BadgeIcon = badgeInfo.icon;

  const threatIndicators = gemini.threat_indicators || [];
  const socialEngIndicators = gemini.social_engineering_indicators || [];
  const suspiciousUrls = gemini.suspicious_urls || [];
  const suspiciousDomains = gemini.suspicious_domains || [];
  const recommendedActions = gemini.recommended_actions || [];

  return (
    <div
      className="soc-card gemini-card"
      style={{
        borderColor: "rgba(168, 85, 247, 0.35)",
        background: "linear-gradient(180deg, rgba(168, 85, 247, 0.04) 0%, rgba(10, 14, 26, 0.6) 100%)",
        boxShadow: "0 4px 20px rgba(168, 85, 247, 0.08)",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div className="card-header" style={{ borderBottom: "1px solid rgba(168, 85, 247, 0.15)" }}>
        <div className="card-title-group">
          <div
            className="card-icon"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(59, 130, 246, 0.2))",
              color: "#c084fc",
              border: "1px solid rgba(168, 85, 247, 0.4)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 10 }}>
              Gemini AI Contextual Security Analysis
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#d8b4fe",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                {gemini.model_used || "Gemini Flash"}
              </span>
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Contextual reasoning, intent breakdown, and behavioral email analysis
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`badge ${badgeInfo.class}`} style={{ fontSize: 12, padding: "5px 12px" }}>
            <BadgeIcon size={14} style={{ marginRight: 5, verticalAlign: "text-bottom" }} />
            {classification}
          </span>
        </div>
      </div>

      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Metric Summary Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              AI Assessment
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: badgeInfo.color, marginTop: 4 }}>
              {classification}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Risk Level
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: getRiskColor(riskLevel), marginTop: 4 }}>
              {riskLevel}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              AI Confidence
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 4 }}>
              {confidence}%
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {gemini.summary && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              color: "#f3e8ff",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: "#d8b4fe", display: "block", marginBottom: 4, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Executive Assessment
            </strong>
            {gemini.summary}
          </div>
        )}

        {/* Detailed Explanation / Reasoning */}
        {gemini.explanation && (
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
            <div
              onClick={() => setExpandedExplanation(!expandedExplanation)}
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} style={{ color: "#c084fc" }} />
                Contextual Reasoning &amp; Evidence Analysis
              </div>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {expandedExplanation ? "Collapse" : "Read Full Explanation"}
                {expandedExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxHeight: expandedExplanation ? "none" : "110px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {gemini.explanation.split("\n\n").map((para, idx) => (
                <p key={idx} style={{ margin: "0 0 10px 0" }}>
                  {para}
                </p>
              ))}
              {!expandedExplanation && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 45,
                    background: "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Threat Indicators Table */}
        {threatIndicators.length > 0 && (
          <div>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: 10 }}>
              Specific Threat Indicators ({threatIndicators.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {threatIndicators.map((item, idx) => {
                const sev = (item.severity || "medium").toUpperCase();
                const sevColor = sev === "HIGH" ? "var(--color-critical)" : sev === "MEDIUM" ? "var(--color-medium)" : "var(--accent-cyan)";
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 3,
                        color: sevColor,
                        border: `1px solid ${sevColor}`,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {sev}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#fff", fontSize: 13, display: "block" }}>{item.indicator}</strong>
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.evidence}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Engineering & Deception Grid */}
        {(socialEngIndicators.length > 0 || suspiciousUrls.length > 0 || suspiciousDomains.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {socialEngIndicators.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--color-medium)" }}>
                  <UserX size={16} />
                  <strong style={{ fontSize: 13 }}>Social Engineering Tactics</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                  {socialEngIndicators.map((se, idx) => (
                    <li key={idx}>{se}</li>
                  ))}
                </ul>
              </div>
            )}

            {(suspiciousUrls.length > 0 || suspiciousDomains.length > 0) && (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--color-high)" }}>
                  <Globe size={16} />
                  <strong style={{ fontSize: 13 }}>Suspicious Infrastructure Identified</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suspiciousDomains.map((dom, idx) => (
                    <div key={idx} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <Globe size={13} style={{ color: "var(--text-muted)" }} />
                      <span className="mono-val" style={{ color: "var(--color-high)" }}>{dom}</span>
                    </div>
                  ))}
                  {suspiciousUrls.map((u, idx) => (
                    <div key={idx} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, wordBreak: "break-all" }}>
                      <Link2 size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span className="mono-val" style={{ color: "var(--color-high)" }}>{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommended Actions */}
        {recommendedActions.length > 0 && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              background: "rgba(0, 240, 255, 0.04)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--accent-cyan)" }}>
              <ListChecks size={16} />
              <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                SOC Analyst Recommended Actions
              </strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recommendedActions.map((action, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text-primary)" }}>
                  <CheckCircle2 size={14} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: 2 }} />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
