import React, { createContext, useContext, useState, useCallback } from "react";
import { analyzeEmail } from "../services/api";

const AnalysisContext = createContext(null);

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

let nextId = 1;

export function AnalysisProvider({ children }) {
  const [analysis, setAnalysisState] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const runAnalysis = useCallback(async (file) => {
    setLoading(true);
    setError("");

    try {
      const report = await analyzeEmail(file);
      setAnalysisState(report);
      setFileName(file.name);

      // Append to history
      setHistory((prev) => [
        {
          id: nextId++,
          fileName: file.name,
          verdict: report.verdict || "UNKNOWN",
          score: report.threat_score ?? 0,
          date: new Date().toISOString(),
          urlCount: report.urls?.count ?? 0,
          suspiciousUrls: report.urls?.suspicious ?? 0,
          iocCount: countIOCs(report),
          attachmentCount: report.attachments?.count ?? 0,
        },
        ...prev,
      ]);

      return report;
    } catch (err) {
      setError(err.message || "Failed to analyze email. Ensure backend is running.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runGmailAnalysis = useCallback(async (messageId, subject) => {
    setLoading(true);
    setError("");

    try {
      // Import dynamically to avoid circular dependencies if api.js imports context
      const { analyzeGmailMessage } = await import("../services/api");
      const report = await analyzeGmailMessage(messageId);
      
      const emailFileName = `Gmail: ${subject || messageId}`;
      setAnalysisState(report);
      setFileName(emailFileName);

      setHistory((prev) => [
        {
          id: nextId++,
          fileName: emailFileName,
          verdict: report.verdict || "UNKNOWN",
          score: report.threat_score ?? 0,
          date: new Date().toISOString(),
          urlCount: report.urls?.count ?? 0,
          suspiciousUrls: report.urls?.suspicious ?? 0,
          iocCount: countIOCs(report),
          attachmentCount: report.attachments?.count ?? 0,
        },
        ...prev,
      ]);

      return report;
    } catch (err) {
      setError(err.message || "Failed to analyze Gmail message.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisState(null);
    setFileName("");
    setError("");
    setLoading(false);
  }, []);

  const setAnalysis = useCallback((report, name) => {
    setAnalysisState(report);
    setFileName(name || "");
  }, []);

  const value = {
    analysis,
    fileName,
    loading,
    error,
    history,
    runAnalysis,
    runGmailAnalysis,
    clearAnalysis,
    setAnalysis,
    setError,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

/**
 * Count total IOCs extracted from an analysis report
 */
function countIOCs(report) {
  let count = 0;
  // IPs
  const infra = report.infrastructure || {};
  if (infra.public_ips) count += infra.public_ips.length;
  // URLs
  const urls = report.urls || {};
  if (urls.findings) count += urls.findings.length;
  // Domains
  if (report.domain?.domain) count += 1;
  // Email addresses
  if (report.email?.sender_email) count += 1;
  if (report.email?.reply_to && report.email.reply_to !== report.email.sender_email) count += 1;
  // Attachments (file hashes)
  if (report.attachments?.findings) count += report.attachments.findings.length;
  return count;
}

export default AnalysisContext;
