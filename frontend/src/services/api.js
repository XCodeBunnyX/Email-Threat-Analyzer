/**
 * GmailGuard — API Service Layer
 * Supports Vite dev proxy and direct fallback to FastAPI at port 8000.
 */

function getCandidateUrls(endpoint) {
  const urls = [endpoint]; // Vite proxy: /health or /analyze
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    urls.push(`http://${host}:8000${endpoint}`);
  }
  urls.push(`http://127.0.0.1:8000${endpoint}`);
  urls.push(`http://localhost:8000${endpoint}`);
  return [...new Set(urls)];
}

export async function checkHealth() {
  const urls = getCandidateUrls("/health");
  let lastErr = null;

  for (const url of urls) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
    }
  }

  throw lastErr || new Error("Backend health check failed");
}

export async function analyzeEmail(file) {
  const urls = getCandidateUrls("/analyze");
  let lastErr = null;

  for (const url of urls) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Analysis failed (${response.status})`
        );
      }

      return await response.json();
    } catch (err) {
      lastErr = err;
      // If it's a specific validation/HTTP error from FastAPI, do not retry other candidate URLs
      if (
        err.message &&
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("NetworkError") &&
        !err.message.includes("aborted")
      ) {
        throw err;
      }
    }
  }

  throw lastErr || new Error("Failed to connect to backend forensic service at http://127.0.0.1:8000");
}

function getBaseUrl() {
  // Prefer relative URL to use Vite proxy, which avoids CORS issues with cookies
  return ""; 
}

export async function getGmailStatus() {
  const url = `${getBaseUrl()}/gmail/status`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to get Gmail status");
  return await response.json();
}

export async function getGmailEmails() {
  const url = `${getBaseUrl()}/gmail/emails`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch Gmail inbox");
  }
  return await response.json();
}

export async function analyzeGmailMessage(messageId) {
  const url = `${getBaseUrl()}/gmail/analyze/${messageId}`;
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze Gmail message");
  }
  return await response.json();
}