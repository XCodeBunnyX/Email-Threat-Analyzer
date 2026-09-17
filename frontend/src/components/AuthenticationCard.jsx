import React, { useState } from "react";
import { Key, CheckCircle, XCircle, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getAuthBadge } from "../utils/formatters";

export default function AuthenticationCard({ authentication = {} }) {
  const [expanded, setExpanded] = useState({
    spf: false,
    dkim: false,
    dmarc: false,
  });

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusIcon = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PASS") return <CheckCircle size={18} style={{ color: "var(--color-clean)" }} />;
    if (s === "FAIL") return <XCircle size={18} style={{ color: "var(--color-high)" }} />;
    if (s === "SOFTFAIL") return <AlertCircle size={18} style={{ color: "var(--color-medium)" }} />;
    return <HelpCircle size={18} style={{ color: "var(--text-muted)" }} />;
  };

  const records = [
    {
      key: "spf",
      label: "SPF",
      fullName: "Sender Policy Framework",
      status: authentication.spf,
      detail: authentication.spf_detail,
      desc: "Specifies which IP addresses are authorized to send email on behalf of the domain.",
    },
    {
      key: "dkim",
      label: "DKIM",
      fullName: "DomainKeys Identified Mail",
      status: authentication.dkim,
      detail: authentication.dkim_detail,
      desc: "Validates cryptographic digital signature confirming email authenticity and integrity.",
    },
    {
      key: "dmarc",
      label: "DMARC",
      fullName: "Domain-based Message Authentication",
      status: authentication.dmarc,
      detail: authentication.dmarc_detail,
      desc: "Specifies policy (none, quarantine, reject) and reporting when SPF or DKIM fails.",
    },
  ];

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Key size={20} />
          </div>
          <h3>Email Authentication Analysis</h3>
        </div>
        <span className="badge badge-muted">Cryptographic Proof</span>
      </div>

      <div className="card-body">
        {/* Authentication Summary */}
        {authentication.summary && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <strong style={{ color: "var(--accent-cyan)", fontSize: 12, textTransform: "uppercase" }}>
              Summary:
            </strong>
            <span style={{ color: "var(--text-primary)" }}>{authentication.summary}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {records.map((r) => {
            const badge = getAuthBadge(r.status);
            const isDetailOpen = expanded[r.key];

            return (
              <div
                key={r.key}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border-card)",
                  borderRadius: 10,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{r.label}</span>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.fullName}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {getStatusIcon(r.status)}
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                    {r.desc}
                  </p>
                </div>

                <div>
                  {r.detail ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggle(r.key)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--accent-cyan)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: 0,
                        }}
                      >
                        {isDetailOpen ? (
                          <>
                            Hide Raw Detail <ChevronUp size={12} />
                          </>
                        ) : (
                          <>
                            View Raw Detail <ChevronDown size={12} />
                          </>
                        )}
                      </button>
                      {isDetailOpen && (
                        <pre
                          style={{
                            marginTop: 8,
                            padding: "8px 10px",
                            background: "rgba(0,0,0,0.5)",
                            borderRadius: 6,
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-mono)",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {r.detail}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      No raw detail string provided
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
