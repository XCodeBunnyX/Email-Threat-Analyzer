import React, { useState } from "react";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { safeVal, defangUrl } from "../utils/formatters";

export default function OSINTIntelligence({ osint = null }) {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedItem, setExpandedItem] = useState(null);

  if (!osint) {
    return (
      <div className="soc-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon">
              <Eye size={20} />
            </div>
            <h3>Passive OSINT Threat Intelligence</h3>
          </div>
          <span className="badge badge-muted">Not Available</span>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Passive OSINT threat intelligence not returned for this sample.
          </p>
        </div>
      </div>
    );
  }

  const allIndicators = [
    ...(osint.domains || []),
    ...(osint.ips || []),
    ...(osint.urls || []),
  ];

  const filtered = allIndicators.filter((item) => {
    if (activeTab === "domains") return item.indicator_type === "domain" || item.indicator_type === "sender_domain";
    if (activeTab === "ips") return item.indicator_type === "ip";
    if (activeTab === "urls") return item.indicator_type === "url";
    return true;
  });

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Eye size={20} />
          </div>
          <h3>Passive OSINT Threat Intelligence</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-muted">
            Source: {safeVal(osint.data_source, "Passive Feeds")}
          </span>
          <span className="badge badge-clean">
            {allIndicators.length} Investigated IOCs
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Filter Navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "domains", "ips", "urls"].map((tab) => (
            <button
              key={tab}
              type="button"
              className="sample-btn"
              style={{
                background: activeTab === tab ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--text-secondary)",
                borderColor: activeTab === tab ? "var(--accent-cyan)" : "var(--border-subtle)",
                textTransform: "capitalize",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? `All Indicators (${allIndicators.length})` : tab}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item, idx) => {
              const isOpen = expandedItem === idx;
              const hasObs = item.security_observations && item.security_observations.length > 0;
              const hasRelated = item.related_infrastructure && item.related_infrastructure.length > 0;

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: `1px solid ${hasObs ? "var(--color-high-border)" : "var(--border-card)"}`,
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>
                          {item.indicator_type?.toUpperCase()}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>
                          Feed: {safeVal(item.data_source)}
                        </span>
                        {hasObs && (
                          <span className="badge badge-high" style={{ fontSize: 10 }}>
                            {item.security_observations.length} Security Observation(s)
                          </span>
                        )}
                      </div>
                      <div className="mono-val" style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {item.indicator_type === "url" ? defangUrl(item.indicator) : item.indicator}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedItem(isOpen ? null : idx)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent-cyan)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                      }}
                    >
                      {isOpen ? "Collapse" : "Details"}
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Security Observations if any */}
                  {hasObs && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--color-high)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>
                        Reported Security Observations:
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {item.security_observations.map((obs, oIdx) => (
                          <div
                            key={oIdx}
                            style={{
                              padding: "6px 10px",
                              background: "rgba(239, 68, 68, 0.08)",
                              borderRadius: 6,
                              fontSize: 12,
                              color: "var(--text-primary)",
                              borderLeft: "3px solid var(--color-high)",
                            }}
                          >
                            <span style={{ fontWeight: 700, color: "var(--color-high)", marginRight: 6 }}>
                              [{obs.category}]:
                            </span>
                            {obs.finding || obs.category}
                            {obs.date && (
                              <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8 }}>
                                ({obs.date})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsible Details */}
                  {isOpen && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12 }}>
                      {hasRelated && (
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            Related Infrastructure:
                          </span>
                          <ul style={{ paddingLeft: 16, marginTop: 4, color: "var(--text-secondary)" }}>
                            {item.related_infrastructure.map((rel, rIdx) => (
                              <li key={rIdx}>
                                <strong>{rel.relationship}:</strong> <span className="mono-val" style={{ fontSize: 11 }}>{rel.target}</span> ({rel.source})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.timeline && item.timeline.length > 0 && (
                        <div>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            Historical Chronology:
                          </span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {item.timeline.map((t, tIdx) => (
                              <div key={tIdx} style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                                <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>[{t.date}]</span> {t.event}: <strong style={{ color: "#fff" }}>{t.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No OSINT indicators under this category.</p>
        )}

        {/* Limitations Notice */}
        {osint.limitations && osint.limitations.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
            {osint.limitations.slice(0, 3).map((lim, lIdx) => (
              <p key={lIdx}>• {lim}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
