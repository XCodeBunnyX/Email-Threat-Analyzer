import React, { useState } from "react";
import { History } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function ForensicIntelligence({ forensics = {} }) {
  const [selectedDomainIdx, setSelectedDomainIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("dns"); // dns | historical_ips | whois | detections

  const domains = forensics.domains || [];
  const currentDomain = domains[selectedDomainIdx] || null;

  if (domains.length === 0) {
    return (
      <div className="soc-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon">
              <History size={20} />
            </div>
            <h3>Forensic History &amp; DNS Records</h3>
          </div>
          <span className="badge badge-muted">No Data</span>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            No deep forensic domain history records available for this email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <History size={20} />
          </div>
          <h3>Forensic History &amp; Infrastructure Churn</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-muted">
            {domains.length} Domain Profile(s)
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Domain Selector */}
        {domains.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {domains.map((d, idx) => (
              <button
                key={idx}
                type="button"
                className="sample-btn"
                style={{
                  background: selectedDomainIdx === idx ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: selectedDomainIdx === idx ? "#fff" : "var(--text-secondary)",
                  borderColor: selectedDomainIdx === idx ? "var(--accent-cyan)" : "var(--border-subtle)",
                }}
                onClick={() => setSelectedDomainIdx(idx)}
              >
                {d.domain}
              </button>
            ))}
          </div>
        )}

        {currentDomain && (
          <div>
            {/* Domain Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Active Forensic Target
                </span>
                <div className="mono-val" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-cyan)", marginTop: 2 }}>
                  {currentDomain.domain}
                </div>
              </div>
              <span className="badge badge-muted">
                Source: {safeVal(currentDomain.data_source, "Demonstration Database")}
              </span>
            </div>

            {/* Sub-Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
              <button
                type="button"
                className="sample-btn"
                style={{
                  background: activeTab === "dns" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeTab === "dns" ? "#fff" : "var(--text-secondary)",
                  borderColor: activeTab === "dns" ? "var(--accent-cyan)" : "transparent",
                }}
                onClick={() => setActiveTab("dns")}
              >
                Current DNS
              </button>
              <button
                type="button"
                className="sample-btn"
                style={{
                  background: activeTab === "historical_ips" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeTab === "historical_ips" ? "#fff" : "var(--text-secondary)",
                  borderColor: activeTab === "historical_ips" ? "var(--accent-cyan)" : "transparent",
                }}
                onClick={() => setActiveTab("historical_ips")}
              >
                Historical IPs ({currentDomain.historical_ips?.length || 0})
              </button>
              <button
                type="button"
                className="sample-btn"
                style={{
                  background: activeTab === "whois" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeTab === "whois" ? "#fff" : "var(--text-secondary)",
                  borderColor: activeTab === "whois" ? "var(--accent-cyan)" : "transparent",
                }}
                onClick={() => setActiveTab("whois")}
              >
                WHOIS History ({currentDomain.whois_history?.length || 0})
              </button>
              <button
                type="button"
                className="sample-btn"
                style={{
                  background: activeTab === "detections" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeTab === "detections" ? "#fff" : "var(--text-secondary)",
                  borderColor: activeTab === "detections" ? "var(--accent-cyan)" : "transparent",
                }}
                onClick={() => setActiveTab("detections")}
              >
                Security Detections ({currentDomain.security_history?.detections?.length || 0})
              </button>
            </div>

            {/* TAB CONTENT: Current DNS */}
            {activeTab === "dns" && (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  {["A", "MX", "NS", "TXT", "AAAA", "CNAME"].map((rtype) => {
                    const records = currentDomain.current_dns?.[rtype] || [];
                    return (
                      <div
                        key={rtype}
                        style={{
                          background: "rgba(15, 23, 42, 0.7)",
                          border: "1px solid var(--border-card)",
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{rtype}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{records.length} record(s)</span>
                        </div>
                        {records.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {records.map((r, rIdx) => (
                              <div key={rIdx} className="mono-val" style={{ fontSize: 11 }}>
                                {r}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>None listed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Historical IPs */}
            {activeTab === "historical_ips" && (
              <div>
                {currentDomain.historical_ips && currentDomain.historical_ips.length > 0 ? (
                  <div className="soc-table-container">
                    <table className="soc-table">
                      <thead>
                        <tr>
                          <th>IP Address</th>
                          <th>First Seen</th>
                          <th>Last Seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDomain.historical_ips.map((h, hIdx) => (
                          <tr key={hIdx}>
                            <td>
                              <span className="mono-val" style={{ color: "var(--accent-cyan)" }}>
                                {h.ip}
                              </span>
                            </td>
                            <td>{safeVal(h.first_seen)}</td>
                            <td>{safeVal(h.last_seen)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No historical IP changes recorded.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: WHOIS History */}
            {activeTab === "whois" && (
              <div>
                {currentDomain.whois_history && currentDomain.whois_history.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentDomain.whois_history.map((w, wIdx) => (
                      <div
                        key={wIdx}
                        style={{
                          background: "rgba(15, 23, 42, 0.7)",
                          border: "1px solid var(--border-card)",
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Registrar:</span>
                            <div style={{ fontWeight: 700, color: "#fff" }}>{safeVal(w.registrar)}</div>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Registered:</span>
                            <div style={{ fontWeight: 600, color: "#fff" }}>{safeVal(w.registered)}</div>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Expires:</span>
                            <div style={{ fontWeight: 600, color: "#fff" }}>{safeVal(w.expires)}</div>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Nameservers:</span>
                            <div style={{ color: "var(--text-secondary)" }}>
                              {w.nameservers?.join(", ") || "Unavailable"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No historical WHOIS entries recorded.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Detections */}
            {activeTab === "detections" && (
              <div>
                {currentDomain.security_history?.detections && currentDomain.security_history.detections.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentDomain.security_history.detections.map((det, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          padding: "10px 14px",
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid var(--color-high-border)",
                          borderRadius: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, color: "var(--color-high)", marginRight: 8 }}>
                            [{det.category}]
                          </span>
                          <span style={{ color: "var(--text-primary)" }}>
                            Reported by: {safeVal(det.provider)}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {safeVal(det.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No security detection events logged.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
