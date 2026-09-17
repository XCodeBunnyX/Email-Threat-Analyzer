import React, { useState } from "react";
import { AlertOctagon, CheckCircle2, ShieldAlert, Terminal } from "lucide-react";

export default function EvidencePanel({
  evidence = [],
  positiveEvidence = [],
  forensicAnomalies = [],
  _correlatedEvidence = [],
}) {
  const [filter, setFilter] = useState("all"); // all | risk | positive | anomalies

  const filteredEvidence = evidence.filter((e) => {
    if (filter === "risk") return e.impact === "HIGH" || e.impact === "CRITICAL" || e.status === "FAIL" || e.status === "MALICIOUS";
    return true;
  });

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon" style={{ color: "var(--accent-cyan)" }}>
            <AlertOctagon size={20} />
          </div>
          <h3>Correlated Evidence &amp; Risk Factors</h3>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={`sample-btn ${filter === "all" ? "active" : ""}`}
            style={{
              background: filter === "all" ? "rgba(56, 189, 248, 0.2)" : "transparent",
              color: filter === "all" ? "#fff" : "var(--text-secondary)",
              borderColor: filter === "all" ? "var(--accent-cyan)" : "var(--border-subtle)",
            }}
            onClick={() => setFilter("all")}
          >
            All Evidence ({evidence.length + positiveEvidence.length})
          </button>
          <button
            type="button"
            className={`sample-btn ${filter === "risk" ? "active" : ""}`}
            style={{
              background: filter === "risk" ? "rgba(239, 68, 68, 0.2)" : "transparent",
              color: filter === "risk" ? "#fff" : "var(--text-secondary)",
              borderColor: filter === "risk" ? "var(--color-high)" : "var(--border-subtle)",
            }}
            onClick={() => setFilter("risk")}
          >
            High Risk ({evidence.filter(e => e.impact === "HIGH" || e.status === "MALICIOUS").length})
          </button>
          <button
            type="button"
            className={`sample-btn ${filter === "positive" ? "active" : ""}`}
            style={{
              background: filter === "positive" ? "rgba(16, 185, 129, 0.2)" : "transparent",
              color: filter === "positive" ? "#fff" : "var(--text-secondary)",
              borderColor: filter === "positive" ? "var(--color-clean)" : "var(--border-subtle)",
            }}
            onClick={() => setFilter("positive")}
          >
            Clean Signals ({positiveEvidence.length})
          </button>
          {forensicAnomalies.length > 0 && (
            <button
              type="button"
              className={`sample-btn ${filter === "anomalies" ? "active" : ""}`}
              style={{
                background: filter === "anomalies" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                color: filter === "anomalies" ? "#fff" : "var(--text-secondary)",
                borderColor: filter === "anomalies" ? "var(--accent-indigo)" : "var(--border-subtle)",
              }}
              onClick={() => setFilter("anomalies")}
            >
              Anomalies ({forensicAnomalies.length})
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Risk Evidence Items */}
        {filter !== "positive" && filter !== "anomalies" && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={16} style={{ color: "var(--color-high)" }} />
              Threat Signals &amp; Risk Evidence
            </h4>
            {filteredEvidence.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredEvidence.map((item, idx) => {
                  const isHigh = item.impact === "HIGH" || item.status === "MALICIOUS" || item.status === "FAIL";
                  const borderCol = isHigh ? "var(--color-high-border)" : "var(--color-medium-border)";
                  const accentCol = isHigh ? "var(--color-high)" : "var(--color-medium)";

                  return (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: `1px solid ${borderCol}`,
                        borderLeft: `4px solid ${accentCol}`,
                        borderRadius: 8,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "rgba(255, 255, 255, 0.06)",
                              color: "#fff",
                            }}
                          >
                            {item.signal}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: accentCol,
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {item.explanation}
                        </p>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: isHigh ? "var(--color-high-bg)" : "var(--color-medium-bg)",
                          border: `1px solid ${borderCol}`,
                          color: accentCol,
                          flexShrink: 0,
                        }}
                      >
                        {item.impact || "SIGNAL"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No adverse threat signals recorded.</p>
            )}
          </div>
        )}

        {/* Positive / Mitigating Evidence */}
        {(filter === "all" || filter === "positive") && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={16} style={{ color: "var(--color-clean)" }} />
              Mitigating &amp; Clean Evidence Signals
            </h4>
            {positiveEvidence.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {positiveEvidence.map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid var(--color-clean-border)",
                      borderLeft: "4px solid var(--color-clean)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-clean)", textTransform: "uppercase" }}>
                        [{pos.signal}] {pos.status}
                      </span>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2 }}>
                        {pos.explanation}
                      </p>
                    </div>
                    <span className="badge badge-clean" style={{ flexShrink: 0 }}>
                      POSITIVE
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No mitigating clean signals recorded.</p>
            )}
          </div>
        )}

        {/* Forensic Anomalies */}
        {(filter === "all" || filter === "anomalies") && forensicAnomalies.length > 0 && (
          <div>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Terminal size={16} style={{ color: "var(--accent-cyan)" }} />
              Forensic Environmental Fingerprints &amp; Anomalies
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {forensicAnomalies.map((ano, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid var(--border-card)",
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-cyan)" }}>
                      {ano.source}
                    </span>
                    <span className="badge badge-muted">
                      {ano.evidence_class || "HEURISTIC"}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-primary)" }}>
                    {ano.finding}
                  </p>
                  {ano.details?.charset_disclaimer && (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                      Note: {ano.details.charset_disclaimer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
