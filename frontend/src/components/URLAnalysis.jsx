import React, { useState } from "react";
import { Link2, ShieldAlert, ChevronDown, ChevronUp, Database } from "lucide-react";
import { defangUrl, safeVal } from "../utils/formatters";

export default function URLAnalysis({ urls = {}, phishtank = null }) {
  const [expandedUrl, setExpandedUrl] = useState(null);

  const findings = urls.findings || [];
  const ptResults = phishtank?.results || [];

  const getUrlStatusBadge = (finding, ptMatch) => {
    if (ptMatch?.verified || finding.risk_score >= 70 || finding.domain_reputation === "malicious") {
      return { class: "badge-high", text: "MALICIOUS" };
    }
    if (finding.risk_score >= 40 || finding.is_url_shortener || finding.is_ip_url) {
      return { class: "badge-medium", text: "SUSPICIOUS" };
    }
    if (finding.risk_score < 40 && finding.uses_https) {
      return { class: "badge-clean", text: "SAFE" };
    }
    return { class: "badge-muted", text: "UNKNOWN" };
  };

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Link2 size={20} />
          </div>
          <h3>URL Intelligence &amp; Static Threat Analysis</h3>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-muted">
            {urls.count ?? findings.length} URL(s)
          </span>
          {(urls.suspicious > 0 || findings.filter(f => f.risk_score >= 40).length > 0) && (
            <span className="badge badge-high">
              {urls.suspicious ?? findings.filter(f => f.risk_score >= 40).length} Suspicious
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* PhishTank Summary Banner if verified phishing exists */}
        {phishtank && phishtank.verified_phishing_count > 0 ? (
          <div
            className="disclaimer-banner"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.35)",
              color: "var(--color-high)",
              marginBottom: 16,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>PhishTank Intelligence Confirmation: </strong>
              {phishtank.verified_phishing_count} URL(s) matched active, verified phishing campaigns in the PhishTank repository ({phishtank.source}).
            </div>
          </div>
        ) : phishtank ? (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Database size={14} style={{ color: "var(--accent-cyan)" }} />
            <span>PhishTank Database Query: No active matches in verified phishing repository.</span>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
            PhishTank data not available
          </div>
        )}

        {findings.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {findings.map((item, idx) => {
              const ptMatch = ptResults.find((p) => p.url === item.url);
              const badge = getUrlStatusBadge(item, ptMatch);
              const isOpen = expandedUrl === idx;

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-card)",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className={`badge ${badge.class}`}>{badge.text}</span>
                        {ptMatch?.verified && (
                          <span className="badge badge-high" style={{ fontSize: 10 }}>
                            PhishTank ID: {ptMatch.phish_id}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Domain: <strong style={{ color: "#fff" }}>{safeVal(item.domain)}</strong>
                        </span>
                      </div>
                      {/* Defanged Untrusted URL */}
                      <div
                        className="mono-val"
                        style={{
                          fontSize: 12,
                          color: badge.text === "MALICIOUS" ? "var(--color-high)" : badge.text === "SUSPICIOUS" ? "var(--color-medium)" : "var(--text-mono)",
                          wordBreak: "break-all",
                          userSelect: "all",
                        }}
                        title="Defanged URL to prevent accidental click execution"
                      >
                        {defangUrl(item.url)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Static Risk</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: item.risk_score >= 70 ? "var(--color-high)" : item.risk_score >= 40 ? "var(--color-medium)" : "var(--color-clean)" }}>
                          {item.risk_score}/100
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedUrl(isOpen ? null : idx)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--accent-cyan)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Structural Flag Chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {item.is_url_shortener && (
                      <span className="badge badge-medium" style={{ fontSize: 10 }}>URL Shortener Mask</span>
                    )}
                    {item.is_ip_url && (
                      <span className="badge badge-high" style={{ fontSize: 10 }}>Direct IP URL</span>
                    )}
                    {!item.uses_https && (
                      <span className="badge badge-medium" style={{ fontSize: 10 }}>Unencrypted HTTP</span>
                    )}
                    {item.has_suspicious_chars && (
                      <span className="badge badge-medium" style={{ fontSize: 10 }}>Suspicious Path Characters</span>
                    )}
                    {item.display_href_mismatch && (
                      <span className="badge badge-high" style={{ fontSize: 10 }}>Display/Href Anchor Mismatch</span>
                    )}
                    {item.domain_reputation && item.domain_reputation !== "unknown" && (
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>
                        Domain Rep: {item.domain_reputation}
                      </span>
                    )}
                  </div>

                  {/* Expandable Reasons */}
                  {isOpen && item.reasons && item.reasons.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
                        Detection Rationale
                      </span>
                      <ul style={{ paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                        {item.reasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No URLs detected in email body.</p>
        )}

        {/* URL Limitations */}
        {urls.limitations && urls.limitations.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
            {urls.limitations.map((lim, lIdx) => (
              <p key={lIdx}>• {lim}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
