import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Link2,
  Crosshair,
  ArrowRight,
  Upload,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { getVerdictTheme, formatDate } from "../utils/formatters";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { history } = useAnalysis();

  // Compute aggregate stats from history
  const totalAnalyzed = history.length;
  const highRiskCount = history.filter((h) => h.score >= 70).length;
  const totalSuspiciousUrls = history.reduce((sum, h) => sum + (h.suspiciousUrls || 0), 0);
  const totalIOCs = history.reduce((sum, h) => sum + (h.iocCount || 0), 0);

  const stats = [
    {
      label: "Emails Analyzed",
      value: totalAnalyzed,
      icon: Mail,
      color: "var(--accent-cyan)",
      bg: "rgba(0, 240, 255, 0.08)",
      border: "rgba(0, 240, 255, 0.2)",
    },
    {
      label: "High Risk Detected",
      value: highRiskCount,
      icon: ShieldAlert,
      color: "var(--color-high)",
      bg: "var(--color-high-bg)",
      border: "var(--color-high-border)",
    },
    {
      label: "Suspicious URLs",
      value: totalSuspiciousUrls,
      icon: Link2,
      color: "var(--color-medium)",
      bg: "var(--color-medium-bg)",
      border: "var(--color-medium-border)",
    },
    {
      label: "Extracted IOCs",
      value: totalIOCs,
      icon: Crosshair,
      color: "var(--accent-blue)",
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.25)",
    },
  ];

  return (
    <div className="page-container">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ background: stat.bg, borderColor: stat.border }}
          >
            <div className="stat-card-icon" style={{ color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-card-data">
              <span className="stat-card-value" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Activity size={48} />
          </div>
          <h3>No Investigations Yet</h3>
          <p>
            Upload a suspicious <code>.eml</code> file to start your first
            forensic email investigation.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("/analyze")}
          >
            <Upload size={16} />
            <span>Analyze Your First Email</span>
          </button>
        </div>
      ) : (
        <div className="soc-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Activity size={18} />
              </div>
              <h3>Recent Investigations</h3>
            </div>
            <button
              className="btn-primary btn-sm"
              onClick={() => navigate("/analyze")}
            >
              <Upload size={14} />
              <span>New Analysis</span>
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="soc-table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Verdict</th>
                    <th>Score</th>
                    <th>URLs</th>
                    <th>Attachments</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => {
                    const theme = getVerdictTheme(item.verdict, item.score);
                    return (
                      <tr key={item.id}>
                        <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                          {String(idx + 1).padStart(2, "0")}
                        </td>
                        <td>
                          <span className="mono-val">{item.fileName}</span>
                        </td>
                        <td>
                          <span className={`badge ${theme.badgeClass}`}>
                            {item.verdict}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: theme.color }}>
                            {item.score}/100
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                          {item.urlCount ?? 0}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                          {item.attachmentCount ?? 0}
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {formatDate(item.date)}
                        </td>
                        <td>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => navigate("/investigation")}
                            title="View investigation"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
