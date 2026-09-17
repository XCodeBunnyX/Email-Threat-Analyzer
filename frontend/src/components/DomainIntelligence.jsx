import React from "react";
import { Shield, AlertTriangle, Calendar, Building, Bug } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function DomainIntelligence({ domain = {} }) {
  const isMalicious = domain.reputation === "malicious" || domain.risk_score >= 70;
  const isSuspicious = domain.reputation === "suspicious" || (domain.risk_score >= 40 && domain.risk_score < 70);

  const repClass = isMalicious
    ? "badge-high"
    : isSuspicious
    ? "badge-medium"
    : domain.reputation === "clean"
    ? "badge-clean"
    : "badge-muted";

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Shield size={20} />
          </div>
          <h3>Domain Intelligence &amp; Reputation</h3>
        </div>
        <span className={`badge ${repClass}`}>
          {safeVal(domain.reputation?.toUpperCase(), "UNKNOWN")}
        </span>
      </div>

      <div className="card-body">
        {/* Domain name banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid var(--border-card)",
            borderRadius: 8,
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Investigated Sender Domain
            </span>
            <div className="mono-val" style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {safeVal(domain.domain)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {domain.risk_score !== undefined && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Domain Risk</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: isMalicious ? "var(--color-high)" : isSuspicious ? "var(--color-medium)" : "var(--color-clean)" }}>
                  {domain.risk_score}/100
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Typosquatting Alert if detected */}
        {domain.is_typosquat && (
          <div className="disclaimer-banner warning" style={{ marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Typosquatting Detected: </strong>
              This domain closely mimics legitimate brand target: <code>{domain.typosquat_target}</code>.
            </div>
          </div>
        )}

        {/* Domain Attributes Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={13} /> Domain Age
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: domain.age_days < 30 ? "var(--color-high)" : "#fff", marginTop: 4 }}>
              {domain.age_days !== undefined && domain.age_days !== null ? `${domain.age_days} days old` : "Unknown Age"}
              {domain.age_days < 30 && (
                <span style={{ fontSize: 11, color: "var(--color-high)", marginLeft: 6, fontWeight: 600 }}>
                  (Newly Registered)
                </span>
              )}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Building size={13} /> Registrar
            </span>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 4 }}>
              {safeVal(domain.registrar, "Unavailable")}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Bug size={13} /> VirusTotal Detections
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: domain.virustotal_flags > 0 ? "var(--color-high)" : "var(--color-clean)", marginTop: 4 }}>
              {domain.virustotal_flags !== undefined ? `${domain.virustotal_flags} security vendor(s) flagged` : "No flags"}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>
              TLD Risk Level
            </span>
            <div style={{ fontSize: 14, fontWeight: 600, color: domain.is_suspicious_tld ? "var(--color-high)" : "var(--color-clean)", marginTop: 4 }}>
              {domain.is_suspicious_tld ? "High-Risk TLD" : "Standard / Low Risk TLD"}
            </div>
          </div>
        </div>

        {/* Categories */}
        {domain.categories && domain.categories.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
              Threat Categories
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {domain.categories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--color-high)",
                    fontWeight: 700,
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reasons */}
        {domain.reasons && domain.reasons.length > 0 && (
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
              Investigative Observations
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {domain.reasons.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: "var(--text-primary)",
                    padding: "6px 10px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 6,
                    borderLeft: "3px solid var(--accent-cyan)",
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
