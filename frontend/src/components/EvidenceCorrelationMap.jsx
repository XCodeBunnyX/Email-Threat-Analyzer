import React from "react";
import { GitMerge, ArrowRight, ShieldCheck, Globe, Server, Link2, Cpu, Target } from "lucide-react";

export default function EvidenceCorrelationMap({ analysis = {} }) {
  const email = analysis.email || {};
  const auth = analysis.authentication || {};
  const infra = analysis.infrastructure || {};
  const domain = analysis.domain || {};
  const urls = analysis.urls || {};
  const atts = analysis.attachments || {};
  const ml = analysis.ml || {};
  const threatScore = analysis.threat_score ?? 0;
  const verdict = analysis.verdict || "UNKNOWN";

  const authFailed = auth.spf === "FAIL" || auth.dmarc === "FAIL";
  const domainSuspicious = domain.reputation === "malicious" || (domain.age_days !== undefined && domain.age_days < 30);
  const contentSuspicious = (urls.suspicious > 0) || (atts.suspicious > 0);

  const nodes = [
    {
      title: "Sender & Domain",
      icon: Globe,
      status: domainSuspicious ? "FAIL" : "PASS",
      value: email.sender_domain || "Unknown",
      note: domain.age_days ? `${domain.age_days}d old` : "Domain analyzed",
    },
    {
      title: "Authentication",
      icon: ShieldCheck,
      status: authFailed ? "FAIL" : "PASS",
      value: `SPF: ${auth.spf || "N/A"}`,
      note: `DMARC: ${auth.dmarc || "N/A"}`,
    },
    {
      title: "Infrastructure IP",
      icon: Server,
      status: infra.upstream_relay_ip ? "INFO" : "NONE",
      value: infra.upstream_relay_ip || "Relay unknown",
      note: `${(infra.chronological_hops || []).length} hop(s)`,
    },
    {
      title: "Content Vectors",
      icon: Link2,
      status: contentSuspicious ? "FAIL" : "PASS",
      value: `${urls.count || 0} URLs, ${atts.count || 0} Files`,
      note: `${(urls.suspicious || 0) + (atts.suspicious || 0)} suspicious`,
    },
    {
      title: "ML / OSINT",
      icon: Cpu,
      status: ml.model_available ? "PASS" : "INFO",
      value: ml.prediction || "UNKNOWN",
      note: ml.model_available ? "ML Active" : "Heuristic fallback",
    },
    {
      title: "Threat Verdict",
      icon: Target,
      status: threatScore >= 70 ? "CRITICAL" : threatScore >= 40 ? "WARN" : "CLEAN",
      value: `${threatScore}/100`,
      note: verdict,
    },
  ];

  const getNodeColor = (status) => {
    switch (status) {
      case "CRITICAL":
      case "FAIL":
        return { border: "var(--color-high)", bg: "rgba(239, 68, 68, 0.12)", text: "var(--color-high)" };
      case "WARN":
        return { border: "var(--color-medium)", bg: "rgba(245, 158, 11, 0.12)", text: "var(--color-medium)" };
      case "INFO":
        return { border: "var(--accent-cyan)", bg: "rgba(56, 189, 248, 0.12)", text: "var(--accent-cyan)" };
      case "PASS":
      case "CLEAN":
      default:
        return { border: "var(--color-clean)", bg: "rgba(16, 185, 129, 0.12)", text: "var(--color-clean)" };
    }
  };

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <GitMerge size={20} />
          </div>
          <h3>Cross-Vector Evidence Correlation Flow</h3>
        </div>
        <span className="badge badge-muted">Synthesis Pipeline</span>
      </div>

      <div className="card-body">
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>
          Visual mapping of how discrete forensic observations propagate across analysis layers into the final threat assessment:
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {nodes.map((node, idx) => {
            const colors = getNodeColor(node.status);
            const Icon = node.icon;
            const isLast = idx === nodes.length - 1;

            return (
              <React.Fragment key={idx}>
                <div
                  style={{
                    flex: "1 1 140px",
                    minWidth: 140,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: colors.text, fontSize: 12, fontWeight: 700 }}>
                    <Icon size={15} />
                    <span>{node.title}</span>
                  </div>
                  <div className="mono-val" style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {node.value}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {node.note}
                  </span>
                </div>

                {!isLast && (
                  <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "0 2px" }}>
                    <ArrowRight size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
