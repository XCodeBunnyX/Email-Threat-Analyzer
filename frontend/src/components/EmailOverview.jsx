import React from "react";
import { Mail, AlertTriangle } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function EmailOverview({ email = {}, replyToDiffers = false }) {
  const toList = Array.isArray(email.to) ? email.to.join(", ") : email.to;

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Mail size={20} />
          </div>
          <h3>Email Envelope &amp; Header Metadata</h3>
        </div>
        <span className="badge badge-muted">RFC 5322</span>
      </div>

      <div className="card-body">
        {replyToDiffers && (
          <div
            className="disclaimer-banner warning"
            style={{ marginBottom: 18, borderLeftWidth: 4, borderLeftColor: "var(--color-medium)" }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Header Anomaly Detected:</strong> The <code>Reply-To</code> address differs from the stated <code>From</code> address. This pattern is frequently utilized in BEC (Business Email Compromise) and credential harvesting campaigns to divert victim replies.
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {/* Subject */}
          <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Subject
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {safeVal(email.subject, "(No Subject)")}
            </div>
          </div>

          {/* From */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Stated From
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(email.from)}
            </div>
          </div>

          {/* Sender Email */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Sender Email
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(email.sender_email)}
            </div>
          </div>

          {/* Sender Domain */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Sender Domain
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(email.sender_domain)}
            </div>
          </div>

          {/* Reply-To */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Reply-To
            </span>
            <div
              className="mono-val"
              style={{
                marginTop: 4,
                color: replyToDiffers ? "var(--color-medium)" : "var(--text-mono)",
                borderColor: replyToDiffers ? "var(--color-medium-border)" : "rgba(255,255,255,0.05)",
              }}
            >
              {safeVal(email.reply_to, "(None specified)")}
            </div>
          </div>

          {/* To */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Recipient(s)
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(toList)}
            </div>
          </div>

          {/* Date */}
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Header Date
            </span>
            <div className="mono-val" style={{ marginTop: 4 }}>
              {safeVal(email.date)}
            </div>
          </div>

          {/* Message ID */}
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Message-ID
            </span>
            <div className="mono-val" style={{ marginTop: 4, wordBreak: "break-all" }}>
              {safeVal(email.message_id)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
