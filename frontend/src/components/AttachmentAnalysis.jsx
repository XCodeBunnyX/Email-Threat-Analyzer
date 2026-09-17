import React from "react";
import { Paperclip, FileText } from "lucide-react";
import { formatBytes, safeVal } from "../utils/formatters";

export default function AttachmentAnalysis({ attachments = {} }) {
  const findings = attachments.findings || [];

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Paperclip size={20} />
          </div>
          <h3>Attachment Intelligence &amp; Payload Inspection</h3>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-muted">
            {attachments.count ?? findings.length} File(s)
          </span>
          {(attachments.suspicious > 0 || findings.filter(f => f.risk_score >= 40).length > 0) && (
            <span className="badge badge-high">
              {attachments.suspicious ?? findings.filter(f => f.risk_score >= 40).length} Suspicious
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        {findings.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {findings.map((att, idx) => {
              const isHigh = att.risk_score >= 70 || att.is_dangerous_extension || att.has_double_extension;
              const isMed = att.risk_score >= 40 && att.risk_score < 70;

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: `1px solid ${isHigh ? "var(--color-high-border)" : "var(--border-card)"}`,
                    borderLeft: `4px solid ${isHigh ? "var(--color-high)" : isMed ? "var(--color-medium)" : "var(--color-clean)"}`,
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: isHigh ? "var(--color-high-bg)" : "rgba(56, 189, 248, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isHigh ? "var(--color-high)" : "var(--accent-cyan)",
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="mono-val" style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                          {safeVal(att.filename)}
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Type: {safeVal(att.content_type)} • Size: {formatBytes(att.size_bytes)} ({att.size_mb ?? 0} MB)
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className={`badge ${isHigh ? "badge-high" : isMed ? "badge-medium" : "badge-clean"}`}>
                        {isHigh ? "MALICIOUS / HIGH RISK" : isMed ? "SUSPICIOUS" : "CLEAN"}
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isHigh ? "var(--color-high)" : "var(--text-secondary)", marginTop: 4 }}>
                        Risk: {att.risk_score ?? 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Threat Flags Chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {att.has_double_extension && (
                      <span className="badge badge-high" style={{ fontSize: 10 }}>
                        Double Extension Disguise
                      </span>
                    )}
                    {att.is_dangerous_extension && (
                      <span className="badge badge-high" style={{ fontSize: 10 }}>
                        Dangerous Extension ({att.extension})
                      </span>
                    )}
                    {att.mime_extension_mismatch && (
                      <span className="badge badge-medium" style={{ fontSize: 10 }}>
                        MIME / Extension Mismatch
                      </span>
                    )}
                    {att.is_macro_enabled && (
                      <span className="badge badge-high" style={{ fontSize: 10 }}>
                        Macro-Enabled Document
                      </span>
                    )}
                    {att.is_archive && (
                      <span className="badge badge-medium" style={{ fontSize: 10 }}>
                        Archive File
                      </span>
                    )}
                    {att.magic_byte_matches && att.magic_byte_matches.length > 0 && (
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>
                        Header: {att.magic_byte_matches.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Detection Reasons */}
                  {att.reasons && att.reasons.length > 0 && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: 6 }}>
                      <ul style={{ paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
                        {att.reasons.map((r, rIdx) => (
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
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No attachments present in email.</p>
        )}
      </div>
    </div>
  );
}
