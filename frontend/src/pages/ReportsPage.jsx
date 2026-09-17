import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileBarChart,
  Upload,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { getVerdictTheme, safeVal } from "../utils/formatters";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { analysis, fileName } = useAnalysis();
  const [showRaw, setShowRaw] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon"><FileBarChart size={48} /></div>
          <h3>No Report Available</h3>
          <p>Analyze an email to generate a forensic investigation report.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} /><span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  const score = analysis.threat_score ?? 0;
  const verdict = analysis.verdict || "UNKNOWN";
  const theme = getVerdictTheme(verdict, score);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fileName || "report").replace(/\.eml$/i, "")}_forensic_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Key findings summary
  const findings = [];
  if (analysis.authentication) {
    const auth = analysis.authentication;
    findings.push({ label: "SPF", value: auth.spf || "N/A", risk: auth.spf === "PASS" ? "clean" : "high" });
    findings.push({ label: "DKIM", value: auth.dkim || "N/A", risk: auth.dkim === "PASS" ? "clean" : "high" });
    findings.push({ label: "DMARC", value: auth.dmarc || "N/A", risk: auth.dmarc === "PASS" ? "clean" : "high" });
  }
  if (analysis.urls) {
    findings.push({ label: "URLs Found", value: analysis.urls.count ?? 0, risk: (analysis.urls.suspicious ?? 0) > 0 ? "high" : "clean" });
  }
  if (analysis.attachments) {
    findings.push({ label: "Attachments", value: analysis.attachments.count ?? 0, risk: (analysis.attachments.suspicious ?? 0) > 0 ? "high" : "clean" });
  }

  const reportSections = [
    { key: "email", label: "Email Metadata", data: analysis.email },
    { key: "authentication", label: "Authentication", data: analysis.authentication },
    { key: "infrastructure", label: "Infrastructure", data: analysis.infrastructure },
    { key: "domain", label: "Domain Intelligence", data: analysis.domain },
    { key: "urls", label: "URL Analysis", data: analysis.urls },
    { key: "attachments", label: "Attachments", data: analysis.attachments },
    { key: "ml", label: "Machine Learning", data: analysis.ml },
    { key: "evidence", label: "Evidence", data: analysis.evidence },
    { key: "positive_evidence", label: "Positive Evidence", data: analysis.positive_evidence },
    { key: "sub_scores", label: "Sub-Scores", data: analysis.sub_scores },
    { key: "forensics", label: "Forensics & OSINT", data: analysis.forensics },
    { key: "correlated_evidence", label: "Correlated Evidence", data: analysis.correlated_evidence },
    { key: "limitations", label: "Limitations", data: analysis.limitations },
  ];

  return (
    <div className="page-container">
      {/* Report Header */}
      <div className="soc-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon"><FileBarChart size={18} /></div>
            <h3>Forensic Investigation Report</h3>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary btn-sm" onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showRaw ? "Structured View" : "Raw JSON"}</span>
            </button>
            <button className="btn-primary btn-sm" onClick={handleDownload}>
              <Download size={14} /><span>Download JSON</span>
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Summary Bar */}
          <div className="report-summary-bar">
            <div className="report-summary-item">
              <FileText size={16} style={{ color: "var(--accent-cyan)" }} />
              <span className="mono-val">{safeVal(fileName, "email.eml")}</span>
            </div>
            <div className="report-summary-item">
              <Shield size={16} style={{ color: theme.color }} />
              <span className={`badge ${theme.badgeClass}`}>{verdict} • {score}/100</span>
            </div>
          </div>

          {/* Key Findings */}
          <div className="report-findings-grid">
            {findings.map((f) => (
              <div key={f.label} className="report-finding-chip">
                <span className="report-finding-label">{f.label}</span>
                <span className={`badge ${f.risk === "clean" ? "badge-clean" : "badge-high"}`} style={{ fontSize: 10 }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Body */}
      {showRaw ? (
        <div className="soc-card">
          <div className="card-body" style={{ padding: 0 }}>
            <pre className="report-json-viewer">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="report-sections">
          {reportSections.map((section) => {
            if (!section.data || (Array.isArray(section.data) && section.data.length === 0)) return null;
            const isExpanded = expandedSections[section.key];
            return (
              <div key={section.key} className="soc-card report-section-card">
                <div
                  className="card-header"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="card-title-group">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <h3 style={{ fontSize: 13 }}>{section.label}</h3>
                  </div>
                  <span className="badge badge-muted" style={{ fontSize: 10 }}>
                    {Array.isArray(section.data)
                      ? `${section.data.length} items`
                      : typeof section.data === "object"
                      ? `${Object.keys(section.data).length} fields`
                      : ""}
                  </span>
                </div>
                {isExpanded && (
                  <div className="card-body" style={{ padding: 0 }}>
                    <pre className="report-json-viewer report-json-section">
                      {JSON.stringify(section.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
