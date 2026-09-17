import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, RefreshCw, AlertCircle, ShieldAlert, CheckCircle, Search, Inbox, Activity } from "lucide-react";
import { getGmailStatus, getGmailEmails, API_BASE_URL } from "../services/api";
import { useAnalysis } from "../context/AnalysisContext";
import AnalysisLoader from "../components/AnalysisLoader";

export default function GmailInboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { runGmailAnalysis, loading: contextLoading } = useAnalysis();
  
  const [authStatus, setAuthStatus] = useState("checking"); // checking, authenticated, unauthenticated
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Check URL for OAuth errors
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error")) {
      let msg = "Authentication failed.";
      if (params.get("error") === "not_configured") {
        msg = "Google Cloud credentials are not configured in the backend .env file.";
      }
      setError(msg);
      // Remove query param from URL without refreshing
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await getGmailStatus();
      if (res.authenticated) {
        setAuthStatus("authenticated");
        fetchEmails();
      } else {
        setAuthStatus("unauthenticated");
      }
    } catch (err) {
      setAuthStatus("unauthenticated");
      setError("Could not connect to backend to check Gmail status.");
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getGmailEmails();
      setEmails(res.emails || []);
    } catch (err) {
      setError(err.message || "Failed to fetch emails.");
      if (err.message && err.message.toLowerCase().includes("auth")) {
        setAuthStatus("unauthenticated");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Navigate the browser directly to the backend OAuth start endpoint.
    // API_BASE_URL comes from VITE_API_URL env var:
    //   - Local dev: http://localhost:8000  (also proxied by Vite for API calls)
    //   - Render:    https://email-threat-analyzer-p77w.onrender.com
    // This MUST be a browser navigation (window.location), NOT fetch(),
    // because the backend issues a 302 redirect to Google's consent screen.
    window.location.href = `${API_BASE_URL}/gmail/auth`;
  };

  const handleAnalyze = async (messageId, subject) => {
    try {
      await runGmailAnalysis(messageId, subject);
      navigate("/investigation");
    } catch (err) {
      setError(err.message || "Failed to analyze email.");
    }
  };

  const filteredEmails = emails.filter((email) => {
    const q = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(q) ||
      email.sender.toLowerCase().includes(q) ||
      email.snippet.toLowerCase().includes(q)
    );
  });

  if (contextLoading) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <AnalysisLoader />
      </div>
    );
  }

  if (authStatus === "checking") {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <RefreshCw className="spin" size={32} style={{ color: "var(--primary)", opacity: 0.5 }} />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--primary)" }}>
            <Mail size={48} />
          </div>
          <h3>Connect Gmail</h3>
          <p style={{ maxWidth: 400, margin: "0 auto 24px" }}>
            Connect your Gmail account to instantly analyze suspicious emails without downloading .eml files.
            OAuth credentials are managed securely by the backend.
          </p>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 24, textAlign: "left", maxWidth: 400 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <button className="btn-primary" onClick={handleConnect} style={{ fontSize: 16, padding: "12px 24px" }}>
            Connect Gmail Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="soc-card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div className="card-title-group">
            <div className="card-icon" style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--primary)" }}>
              <Inbox size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Gmail Inbox</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Recent messages available for immediate analysis</p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="search-box" style={{ position: "relative", width: 250 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search sender or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 12px 8px 36px",
                  color: "var(--text)",
                  outline: "none"
                }}
              />
            </div>
            <button className="btn-secondary" onClick={fetchEmails} disabled={loading} title="Refresh Inbox">
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {error && (
            <div className="alert alert-error" style={{ margin: 16 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && emails.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <RefreshCw className="spin" size={24} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Fetching recent emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <Inbox size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p>No emails found matching your criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject & Preview</th>
                    <th style={{ width: 140 }}>Date</th>
                    <th style={{ width: 120, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => {
                    // Extract name from "Name <email@domain.com>"
                    const senderMatch = email.sender.match(/^([^<]+)/);
                    const senderName = senderMatch ? senderMatch[1].trim().replace(/"/g, '') : email.sender;
                    
                    return (
                      <tr key={email.id}>
                        <td>
                          <div style={{ fontWeight: 500, color: "var(--text)" }}>{senderName}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                            {email.sender}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--text)" }}>{email.subject}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {email.snippet}
                          </div>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {new Date(email.date).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button 
                            className="btn-primary" 
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() => handleAnalyze(email.id, email.subject)}
                          >
                            <Activity size={14} />
                            Analyze
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
