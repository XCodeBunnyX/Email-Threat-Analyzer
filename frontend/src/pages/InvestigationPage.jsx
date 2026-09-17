import React from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Clock, AlertTriangle } from "lucide-react";
import ThreatScore from "../components/ThreatScore";
import ScoreBreakdown from "../components/ScoreBreakdown";
import EmailOverview from "../components/EmailOverview";
import AuthenticationCard from "../components/AuthenticationCard";
import EvidencePanel from "../components/EvidencePanel";
import InfrastructureCard from "../components/InfrastructureCard";
import IPIntelligence from "../components/IPIntelligence";
import DomainIntelligence from "../components/DomainIntelligence";
import URLAnalysis from "../components/URLAnalysis";
import AttachmentAnalysis from "../components/AttachmentAnalysis";
import MLAnalysis from "../components/MLAnalysis";
import OSINTIntelligence from "../components/OSINTIntelligence";
import ForensicIntelligence from "../components/ForensicIntelligence";
import EvidenceCorrelationMap from "../components/EvidenceCorrelationMap";
import { getVerdictTheme, safeVal, formatDate } from "../utils/formatters";
import { useAnalysis } from "../context/AnalysisContext";

export default function InvestigationPage() {
  const navigate = useNavigate();
  const { analysis, fileName } = useAnalysis();

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={48} />
          </div>
          <h3>No Active Investigation</h3>
          <p>Upload and analyze a suspicious email to view the full forensic investigation report.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} />
            <span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  const score = analysis.threat_score ?? 0;
  const verdict = analysis.verdict || "UNKNOWN";
  const theme = getVerdictTheme(verdict, score);

  const email = analysis.email || {};
  const auth = analysis.authentication || {};
  const infra = analysis.infrastructure || {};
  const domain = analysis.domain || {};
  const urls = analysis.urls || {};
  const atts = analysis.attachments || {};
  const ml = analysis.ml || {};
  const evidence = analysis.evidence || [];
  const positiveEvidence = analysis.positive_evidence || [];
  const forensicAnomalies = analysis.forensic_anomalies || [];
  const correlatedEvidence = analysis.correlated_evidence || [];
  const subScores = analysis.sub_scores || {};
  const weightsUsed = analysis.weights_used || {};
  const forensics = analysis.forensics || {};
  const phishtank = forensics.phishtank || null;
  const osint = forensics.osint || null;
  const limitations = analysis.limitations || [];

  return (
    <div className="page-container">
      {/* Investigation Header */}
      <div className="investigation-header">
        <div className="investigation-meta">
          <div className="meta-chip">
            <FileText size={15} style={{ color: "var(--accent-cyan)" }} />
            <span className="mono-val" style={{ fontWeight: 700 }}>
              {safeVal(fileName, "email.eml")}
            </span>
          </div>
          {email.date && (
            <div className="meta-chip">
              <Clock size={15} style={{ color: "var(--text-muted)" }} />
              <span>{formatDate(email.date)}</span>
            </div>
          )}
        </div>
        <span className={`badge ${theme.badgeClass}`} style={{ fontSize: 13, padding: "5px 12px" }}>
          {verdict} • {score}/100
        </span>
      </div>

      {/* Row 1: Threat Score & Multi-Vector Breakdown */}
      <div className="dashboard-grid-1-2">
        <ThreatScore score={score} verdict={verdict} evidence={evidence} />
        <ScoreBreakdown subScores={subScores} weightsUsed={weightsUsed} />
      </div>

      {/* Row 2: Evidence Correlation Flow */}
      <EvidenceCorrelationMap analysis={analysis} />

      {/* Row 3: Email Envelope & Authentication */}
      <div className="dashboard-grid-2">
        <EmailOverview email={email} replyToDiffers={infra.reply_to_differs} />
        <AuthenticationCard authentication={auth} />
      </div>

      {/* Row 4: Evidence & Risk Factors */}
      <EvidencePanel
        evidence={evidence}
        positiveEvidence={positiveEvidence}
        forensicAnomalies={forensicAnomalies}
        correlatedEvidence={correlatedEvidence}
      />

      {/* Row 5: Infrastructure & IP Intelligence */}
      <InfrastructureCard infrastructure={infra} />
      <IPIntelligence
        ipRecords={infra.ip_records}
        geolocation={infra.geolocation}
        publicIps={infra.public_ips}
      />

      {/* Row 6: Domain & Forensic History */}
      <div className="dashboard-grid-2">
        <DomainIntelligence domain={domain} />
        <ForensicIntelligence forensics={forensics} />
      </div>

      {/* Row 7: Content Intelligence (URLs & Attachments) */}
      <div className="dashboard-grid-2">
        <URLAnalysis urls={urls} phishtank={phishtank} />
        <AttachmentAnalysis attachments={atts} />
      </div>

      {/* Row 8: Machine Learning & Passive OSINT */}
      <div className="dashboard-grid-2">
        <MLAnalysis ml={ml} />
        <OSINTIntelligence osint={osint} />
      </div>

      {/* Footer Limitations */}
      {limitations.length > 0 && (
        <div className="soc-card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon" style={{ color: "var(--text-muted)" }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Forensic Scope &amp; Technical Limitations
              </h3>
            </div>
          </div>
          <div className="card-body" style={{ padding: "14px 20px" }}>
            <ul style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 4 }}>
              {limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
