import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Upload, Shield, MapPin } from "lucide-react";
import IPIntelligence from "../components/IPIntelligence";
import { useAnalysis } from "../context/AnalysisContext";

export default function IPIntelligencePage() {
  const navigate = useNavigate();
  const { analysis } = useAnalysis();

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon"><Globe size={48} /></div>
          <h3>No IP Data Available</h3>
          <p>Analyze an email to extract and evaluate IP intelligence.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} /><span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  const infra = analysis.infrastructure || {};
  const publicIps = infra.public_ips || [];
  const ipRecords = infra.ip_records || {};
  const geolocation = infra.geolocation || [];

  // Compute stats
  const totalIps = publicIps.length;
  const countriesSeen = [...new Set(geolocation.map((g) => g.country).filter(Boolean))];

  // Find highest risk IP
  let highestRiskIp = "N/A";
  let highestRisk = -1;
  for (const ip of publicIps) {
    const record = ipRecords[ip] || {};
    const rep = record.reputation_score ?? 0;
    if (rep > highestRisk) {
      highestRisk = rep;
      highestRiskIp = ip;
    }
  }

  const stats = [
    { label: "Public IPs", value: totalIps, icon: Globe, color: "var(--accent-cyan)", bg: "rgba(0, 240, 255, 0.08)", border: "rgba(0, 240, 255, 0.2)" },
    { label: "Countries", value: countriesSeen.length, icon: MapPin, color: "var(--accent-blue)", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.25)" },
    { label: "Highest Risk", value: highestRisk >= 0 ? `${highestRisk}/100` : "N/A", icon: Shield, color: highestRisk >= 50 ? "var(--color-high)" : "var(--color-medium)", bg: highestRisk >= 50 ? "var(--color-high-bg)" : "var(--color-medium-bg)", border: highestRisk >= 50 ? "var(--color-high-border)" : "var(--color-medium-border)" },
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

      {highestRiskIp !== "N/A" && (
        <div className="disclaimer-banner" style={{ marginBottom: 20 }}>
          <Shield size={16} />
          <span>Highest risk IP: <span className="mono-val">{highestRiskIp}</span> — Score: {highestRisk}/100</span>
        </div>
      )}

      {/* Reuse existing IPIntelligence component */}
      <IPIntelligence
        ipRecords={ipRecords}
        geolocation={geolocation}
        publicIps={publicIps}
      />
    </div>
  );
}
