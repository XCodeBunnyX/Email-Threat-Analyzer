import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, AlertCircle, Sparkles } from "lucide-react";
import { formatBytes } from "../utils/formatters";

export default function EmailUpload({ onFileSelect, onAnalyze, selectedFile, loading, error, onClearFile }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const validateAndSelect = (file) => {
    setLocalError("");
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".eml")) {
      setLocalError("Invalid file type. Only raw email files (.eml) are accepted for forensic analysis.");
      return;
    }

    if (file.size === 0) {
      setLocalError("Uploaded file is empty. Please select a valid .eml file.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const loadSampleEmail = async (filename, displayName) => {
    try {
      setLocalError("");
      const res = await fetch(`/sample_emails/${filename}`);
      if (!res.ok) throw new Error("Could not load sample email");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "message/rfc822" });
      validateAndSelect(file);
    } catch {
      setLocalError(`Failed to load sample: ${displayName}`);
    }
  };

  const activeError = error || localError;

  return (
    <div className="upload-hero">
      <div className="upload-title-area">
        <h2>Forensic Email Investigation</h2>
        <p>Upload a suspicious RFC 5322 (.eml) email file to execute multi-vector threat intelligence and correlation analysis.</p>
      </div>

      <div
        className={`dropzone-container ${isDragActive ? "drag-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".eml"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="dropzone-icon">
          <UploadCloud size={32} />
        </div>

        <div className="dropzone-prompt">
          <h4>Drop your .eml file here</h4>
          <p>or click to browse your local filesystem</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>
      </div>

      {selectedFile && (
        <div className="file-preview-card">
          <div className="file-info">
            <div className="file-icon">
              <FileText size={28} />
            </div>
            <div className="file-details">
              <h5>{selectedFile.name}</h5>
              <span>{formatBytes(selectedFile.size)} • RFC 822 Email Message</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onAnalyze}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Email"}
            </button>
            <button
              type="button"
              className="remove-file-btn"
              onClick={onClearFile}
              title="Remove selected file"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {activeError && (
        <div className="disclaimer-banner warning" style={{ marginTop: 18, textAlign: "left" }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Investigation Notice:</strong> {activeError}
          </div>
        </div>
      )}

      {/* SIH Demonstration Quick-Load Samples */}
      <div className="sample-emails-bar">
        <div className="sample-title">
          <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
          <span>SIH Judge Quick-Demos:</span>
        </div>
        <div className="sample-buttons">
          <button
            type="button"
            className="sample-btn"
            onClick={() => loadSampleEmail("phishing_bank.eml", "HDFC Phishing")}
          >
            <span style={{ color: "var(--color-high)", fontWeight: "bold" }}>●</span>
            HDFC Bank Phishing (High Risk)
          </button>
          <button
            type="button"
            className="sample-btn"
            onClick={() => loadSampleEmail("ceo_fraud.eml", "CEO Fraud")}
          >
            <span style={{ color: "var(--color-medium)", fontWeight: "bold" }}>●</span>
            CEO Fraud / Wire Transfer (Low Risk)
          </button>
          <button
            type="button"
            className="sample-btn"
            onClick={() => loadSampleEmail("legitimate.eml", "Clean Email")}
          >
            <span style={{ color: "var(--color-clean)", fontWeight: "bold" }}>●</span>
            Legitimate Transaction (Clean)
          </button>
        </div>
      </div>
    </div>
  );
}