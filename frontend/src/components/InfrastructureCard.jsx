import React, { useState } from "react";
import { Server, Network, ChevronDown, ChevronUp, Cpu, Info } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function InfrastructureCard({ infrastructure = {} }) {
  const [expandedHop, setExpandedHop] = useState(null);

  const hops = infrastructure.chronological_hops || [];
  const fp = infrastructure.client_fingerprint || null;
  const timeline = infrastructure.timeline_analysis || null;

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Network size={20} />
          </div>
          <h3>Infrastructure Intelligence &amp; Relay Path</h3>
        </div>
        <span className="badge badge-muted">
          {hops.length} Observable Hop(s)
        </span>
      </div>

      <div className="card-body">
        {/* Key Metrics Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Primary Observed Relay IP
            </span>
            <div className="mono-val" style={{ marginTop: 4, color: "var(--accent-cyan)" }}>
              {safeVal(infrastructure.upstream_relay_ip, "Not Identified")}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              X-Originating-IP Header
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(infrastructure.x_originating_ip, "Not Specified")}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Sender Agent / X-Mailer
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(infrastructure.x_mailer, "Not Specified")}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Timeline Delta Status
            </span>
            <div style={{ marginTop: 4, fontWeight: 700, color: timeline?.status === "consistent" ? "var(--color-clean)" : "var(--color-medium)" }}>
              {safeVal(timeline?.status?.toUpperCase(), "CONSISTENT")}
            </div>
          </div>
        </div>

        {/* Infrastructure Observations Note */}
        {infrastructure.infrastructure_note && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(56, 189, 248, 0.05)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 18,
            }}
          >
            <strong style={{ color: "var(--accent-cyan)" }}>Infrastructure Observation: </strong>
            {infrastructure.infrastructure_note}
          </div>
        )}

        {/* Chronological Hops Table */}
        <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Server size={15} />
          Chronological Relay Path
        </h4>

        {hops.length > 0 ? (
          <div className="soc-table-container" style={{ marginBottom: 18 }}>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Hop</th>
                  <th>Receiving Host (by)</th>
                  <th>Originating Host (from)</th>
                  <th>IP Address</th>
                  <th>Provenance</th>
                  <th>Confidence</th>
                  <th>Header Detail</th>
                </tr>
              </thead>
              <tbody>
                {hops.map((h, idx) => {
                  const isOpen = expandedHop === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr>
                        <td>
                          <span style={{ fontWeight: 800, color: h.is_upstream_origin ? "var(--color-clean)" : "var(--text-muted)" }}>
                            #{h.hop_number || idx + 1}
                            {h.is_upstream_origin && " (Origin)"}
                          </span>
                        </td>
                        <td>
                          <span className="mono-val" style={{ fontSize: 11.5 }}>
                            {safeVal(h.by_host)}
                          </span>
                        </td>
                        <td>
                          <span className="mono-val" style={{ fontSize: 11.5 }}>
                            {safeVal(h.from_host)}
                          </span>
                        </td>
                        <td>
                          <span className="mono-val" style={{ fontSize: 12, color: h.is_private ? "var(--text-muted)" : "var(--accent-cyan)" }}>
                            {safeVal(h.ip)}
                            {h.is_private && " (Private)"}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-muted" style={{ fontSize: 10 }}>
                            {safeVal(h.provenance)}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: h.confidence === "high" ? "var(--color-clean)" : "var(--color-medium)",
                              textTransform: "uppercase",
                            }}
                          >
                            {safeVal(h.confidence)}
                          </span>
                        </td>
                        <td>
                          {h.raw ? (
                            <button
                              type="button"
                              onClick={() => setExpandedHop(isOpen ? null : idx)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--accent-cyan)",
                                fontSize: 11,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              {isOpen ? "Hide" : "Raw"}
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>-</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={7} style={{ background: "rgba(0,0,0,0.5)", padding: 12 }}>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-mono)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                              {h.raw}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>No observable relay hops parsed.</p>
        )}

        {/* Client Fingerprint */}
        {fp && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid var(--border-card)",
              borderRadius: 8,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h5 style={{ fontSize: 13, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <Cpu size={15} style={{ color: "var(--accent-cyan)" }} />
                Sender Environment Fingerprinting
              </h5>
              <span className="badge badge-medium">
                {safeVal(fp.mailer_category, "Automated Tool")}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-primary)", marginBottom: 6 }}>
              {fp.fingerprint_summary}
            </p>
            {fp.charset_disclaimer && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                {fp.charset_disclaimer}
              </p>
            )}
          </div>
        )}

        {/* Forensic Scope Disclaimer */}
        <div className="disclaimer-banner">
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Forensic Scope Boundary: </strong>
            {safeVal(
              infrastructure.forensic_scope,
              "Physical attribution is outside the scope of email-header analysis and may require additional evidence and lawful investigative processes."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
