import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crosshair,
  Globe,
  Link2,
  Mail,
  FileCode,
  Upload,
  Search,
  Copy,
  CheckCheck,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { defangUrl } from "../utils/formatters";

export default function IOCIntelligencePage() {
  const navigate = useNavigate();
  const { analysis } = useAnalysis();
  const [filter, setFilter] = useState("all");
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon"><Crosshair size={48} /></div>
          <h3>No IOC Data Available</h3>
          <p>Analyze an email to extract Indicators of Compromise.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} /><span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  // Extract IOCs from analysis
  const iocs = [];

  // IP Addresses
  const infra = analysis.infrastructure || {};
  if (infra.public_ips) {
    infra.public_ips.forEach((ip) => {
      iocs.push({ type: "ip", value: ip, source: "Infrastructure", risk: "medium" });
    });
  }
  if (infra.upstream_relay_ip) {
    const exists = iocs.some((i) => i.value === infra.upstream_relay_ip);
    if (!exists) {
      iocs.push({ type: "ip", value: infra.upstream_relay_ip, source: "Upstream Relay", risk: "medium" });
    }
  }
  if (infra.x_originating_ip) {
    const exists = iocs.some((i) => i.value === infra.x_originating_ip);
    if (!exists) {
      iocs.push({ type: "ip", value: infra.x_originating_ip, source: "X-Originating-IP", risk: "high" });
    }
  }

  // Domains
  const domain = analysis.domain || {};
  if (domain.domain) {
    iocs.push({
      type: "domain",
      value: domain.domain,
      source: "Sender Domain",
      risk: domain.risk_score >= 50 ? "high" : domain.risk_score >= 20 ? "medium" : "low",
    });
  }

  // URLs
  const urls = analysis.urls || {};
  if (urls.findings) {
    urls.findings.forEach((u) => {
      iocs.push({
        type: "url",
        value: u.url,
        source: "Email Body",
        risk: u.risk_score >= 50 ? "high" : u.risk_score >= 20 ? "medium" : "low",
      });
    });
  }

  // Email Addresses
  const email = analysis.email || {};
  if (email.sender_email) {
    iocs.push({ type: "email", value: email.sender_email, source: "From Header", risk: "info" });
  }
  if (email.reply_to && email.reply_to !== email.sender_email) {
    iocs.push({ type: "email", value: email.reply_to, source: "Reply-To (Mismatch)", risk: "high" });
  }

  // Attachments (file names as indicators)
  const atts = analysis.attachments || {};
  if (atts.findings) {
    atts.findings.forEach((a) => {
      iocs.push({
        type: "file",
        value: a.filename,
        source: "Attachment",
        risk: a.risk_score >= 50 ? "high" : a.risk_score >= 20 ? "medium" : "low",
      });
    });
  }

  const filteredIOCs = filter === "all" ? iocs : iocs.filter((i) => i.type === filter);

  const typeConfig = {
    ip: { icon: Globe, label: "IP Address", color: "var(--accent-blue)" },
    domain: { icon: Globe, label: "Domain", color: "var(--accent-cyan)" },
    url: { icon: Link2, label: "URL", color: "var(--color-medium)" },
    email: { icon: Mail, label: "Email", color: "var(--accent-indigo)" },
    file: { icon: FileCode, label: "File", color: "var(--color-high)" },
  };

  const riskBadge = {
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
    info: "badge-muted",
  };

  const handleCopy = (value, idx) => {
    const text = value.includes("://") ? defangUrl(value) : value;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  // Counts per type
  const counts = {};
  for (const ioc of iocs) {
    counts[ioc.type] = (counts[ioc.type] || 0) + 1;
  }

  return (
    <div className="page-container">
      {/* Summary Cards */}
      <div className="stats-grid">
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <div
            key={type}
            className="stat-card stat-card-clickable"
            style={{
              borderColor: filter === type ? cfg.color : undefined,
              cursor: "pointer",
            }}
            onClick={() => setFilter(filter === type ? "all" : type)}
          >
            <div className="stat-card-icon" style={{ color: cfg.color }}>
              <cfg.icon size={20} />
            </div>
            <div className="stat-card-data">
              <span className="stat-card-value" style={{ color: cfg.color }}>{counts[type] || 0}</span>
              <span className="stat-card-label">{cfg.label}s</span>
            </div>
          </div>
        ))}
      </div>

      {/* IOC Table */}
      <div className="soc-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon"><Crosshair size={18} /></div>
            <h3>Indicators of Compromise ({filteredIOCs.length})</h3>
          </div>
          {filter !== "all" && (
            <button className="btn-secondary btn-sm" onClick={() => setFilter("all")}>
              <Search size={14} /><span>Show All</span>
            </button>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredIOCs.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              No IOCs found for this filter.
            </div>
          ) : (
            <div className="soc-table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Indicator</th>
                    <th>Source</th>
                    <th>Risk</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIOCs.map((ioc, idx) => {
                    const cfg = typeConfig[ioc.type];
                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <cfg.icon size={15} style={{ color: cfg.color }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="mono-val" style={{ fontSize: 12 }}>
                            {ioc.type === "url" ? defangUrl(ioc.value) : ioc.value}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{ioc.source}</td>
                        <td>
                          <span className={`badge ${riskBadge[ioc.risk] || "badge-muted"}`}>
                            {ioc.risk.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary btn-icon"
                            onClick={() => handleCopy(ioc.value, idx)}
                            title="Copy (defanged)"
                          >
                            {copiedIdx === idx ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
