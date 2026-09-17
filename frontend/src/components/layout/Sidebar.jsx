import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Upload,
  Search,
  Crosshair,
  Link2,
  Globe,
  MapPin,
  FileBarChart,
  Menu,
  X,
  Activity,
  Cpu,
  Inbox,
} from "lucide-react";
import { checkHealth } from "../../services/api";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/inbox", icon: Inbox, label: "Gmail Inbox" },
  { to: "/analyze", icon: Upload, label: "Analyze Email" },
  { to: "/investigation", icon: Search, label: "Investigation" },
  { to: "/ioc", icon: Crosshair, label: "IOC Intelligence" },
  { to: "/urls", icon: Link2, label: "URL Intelligence" },
  { to: "/ip", icon: Globe, label: "IP Intelligence" },
  { to: "/geolocation", icon: MapPin, label: "Geolocation" },
  { to: "/reports", icon: FileBarChart, label: "Reports" },
];

export default function Sidebar() {
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [mlReady, setMlReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      try {
        const data = await checkHealth();
        if (mounted) {
          setBackendOnline(true);
          setMlReady(data?.ml_model_loaded === true);
        }
      } catch {
        if (mounted) {
          setBackendOnline(false);
          setMlReady(false);
        }
      }
    };
    ping();
    const timer = setInterval(ping, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <ShieldCheck size={24} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">GmailGuard</span>
              <span className="sidebar-brand-badge">SIH 2026</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={closeMobile}
            >
              <item.icon size={19} className="sidebar-link-icon" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Status */}
        <div className="sidebar-footer">
          <div className={`sidebar-status-item ${backendOnline ? "online" : "offline"}`}>
            <Activity size={14} />
            {!collapsed && <span>{backendOnline ? "Backend Online" : "Backend Offline"}</span>}
            <span className={`sidebar-status-dot ${backendOnline ? "online" : "offline"}`} />
          </div>
          <div className={`sidebar-status-item ${mlReady ? "online" : "offline"}`}>
            <Cpu size={14} />
            {!collapsed && <span>{mlReady ? "ML Engine Ready" : "ML Unavailable"}</span>}
            <span className={`sidebar-status-dot ${mlReady ? "online" : "offline"}`} />
          </div>
        </div>
      </aside>
    </>
  );
}
