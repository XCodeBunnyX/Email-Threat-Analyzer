import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, ShieldCheck } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/analyze": "Analyze Email",
  "/investigation": "Investigation Results",
  "/ioc": "IOC Intelligence",
  "/urls": "URL Intelligence",
  "/ip": "IP Intelligence",
  "/geolocation": "Geolocation",
  "/reports": "Reports",
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis } = useAnalysis();

  const title = PAGE_TITLES[location.pathname] || "GmailGuard";

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-right">
        <span className="topbar-badge">
          <ShieldCheck size={14} />
          <span>SIH 2026</span>
        </span>

        {analysis && location.pathname !== "/analyze" && (
          <button
            className="btn-primary btn-sm"
            onClick={() => navigate("/analyze")}
          >
            <Plus size={15} />
            <span>New Analysis</span>
          </button>
        )}
      </div>
    </div>
  );
}
