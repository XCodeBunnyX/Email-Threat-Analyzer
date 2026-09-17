import React from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Upload, AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";
import URLAnalysis from "../components/URLAnalysis";
import { useAnalysis } from "../context/AnalysisContext";

export default function URLIntelligencePage() {
  const navigate = useNavigate();
  const { analysis } = useAnalysis();

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon"><Link2 size={48} /></div>
          <h3>No URL Data Available</h3>
          <p>Analyze an email to extract and evaluate embedded URLs.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} /><span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  const urls = analysis.urls || {};
  const forensics = analysis.forensics || {};
  const phishtank = forensics.phishtank || null;

  const totalUrls = urls.count ?? 0;
  const suspiciousCount = urls.suspicious ?? 0;
  const phishtankVerified = phishtank?.verified_phishing_count ?? 0;
  const cleanCount = totalUrls - suspiciousCount;

  const stats = [
    { label: "Total URLs", value: totalUrls, icon: Link2, color: "var(--accent-cyan)", bg: "rgba(0, 240, 255, 0.08)", border: "rgba(0, 240, 255, 0.2)" },
    { label: "Suspicious", value: suspiciousCount, icon: AlertTriangle, color: "var(--color-high)", bg: "var(--color-high-bg)", border: "var(--color-high-border)" },
    { label: "PhishTank Verified", value: phishtankVerified, icon: ExternalLink, color: "var(--color-medium)", bg: "var(--color-medium-bg)", border: "var(--color-medium-border)" },
    { label: "Clean", value: cleanCount, icon: ShieldCheck, color: "var(--color-clean)", bg: "var(--color-clean-bg)", border: "var(--color-clean-border)" },
  ];

  return (
    <div className="page-container">
      {/* Summary Cards */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card" style={{ background: stat.bg, borderColor: stat.border }}>
            <div className="stat-card-icon" style={{ color: stat.color }}><stat.icon size={22} /></div>
            <div className="stat-card-data">
              <span className="stat-card-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reuse existing URLAnalysis component */}
      <URLAnalysis urls={urls} phishtank={phishtank} />
    </div>
  );
}
