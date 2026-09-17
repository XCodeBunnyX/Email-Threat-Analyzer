/**
 * GmailGuard — Formatting and Safety Utilities
 */

/**
 * Return defaultText if value is null, undefined, or empty string.
 */
export function safeVal(val, defaultText = "N/A") {
  if (val === null || val === undefined) return defaultText;
  if (typeof val === "string" && val.trim() === "") return defaultText;
  return val;
}

/**
 * Format bytes to KB or MB
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format date string to clean human-readable date
 */
export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Safely defang URLs so they are not accidentally clicked or triggered
 * e.g. http://evil.com -> hxxp://evil[.]com
 */
export function defangUrl(url) {
  if (!url) return "";
  return url
    .replace(/^http:/i, "hxxp:")
    .replace(/^https:/i, "hxxps:")
    .replace(/\./g, "[.]");
}

/**
 * Map verdict and score to design tokens and labels
 */
export function getVerdictTheme(verdict, score = 0) {
  const normVerdict = (verdict || "").toUpperCase();

  if (normVerdict === "HIGH_RISK" || score >= 70) {
    return {
      label: normVerdict || "HIGH RISK",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      borderColor: "rgba(239, 68, 68, 0.4)",
      badgeClass: "badge-high",
      riskLevel: "High Risk",
    };
  }

  if (normVerdict === "SUSPICIOUS" || (score >= 40 && score < 70)) {
    return {
      label: normVerdict || "SUSPICIOUS",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeClass: "badge-medium",
      riskLevel: "Medium Risk",
    };
  }

  if (normVerdict === "LOW_RISK") {
    return {
      label: "LOW RISK",
      color: "#38bdf8",
      bgColor: "rgba(56, 189, 248, 0.12)",
      borderColor: "rgba(56, 189, 248, 0.4)",
      badgeClass: "badge-low",
      riskLevel: "Low Risk",
    };
  }

  return {
    label: normVerdict || "CLEAN",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    badgeClass: "badge-clean",
    riskLevel: "Clean / Low Risk",
  };
}

/**
 * Authentication status mapper
 */
export function getAuthBadge(status) {
  const s = (status || "").toUpperCase();
  if (s === "PASS") {
    return { class: "auth-pass", text: "PASS", color: "#10b981" };
  }
  if (s === "FAIL") {
    return { class: "auth-fail", text: "FAIL", color: "#ef4444" };
  }
  if (s === "SOFTFAIL") {
    return { class: "auth-softfail", text: "SOFTFAIL", color: "#f59e0b" };
  }
  if (s === "NONE") {
    return { class: "auth-none", text: "NONE", color: "#94a3b8" };
  }
  return { class: "auth-unknown", text: s || "UNKNOWN", color: "#64748b" };
}

/**
 * Severity mapper for evidence
 */
export function getSeverityBadge(severity) {
  const s = (severity || "").toLowerCase();
  switch (s) {
    case "critical":
      return { label: "CRITICAL", bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
    case "high":
      return { label: "HIGH", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
    case "medium":
      return { label: "MEDIUM", bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
    case "low":
      return { label: "LOW", bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" };
    case "info":
    default:
      return { label: "INFO", bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
  }
}
