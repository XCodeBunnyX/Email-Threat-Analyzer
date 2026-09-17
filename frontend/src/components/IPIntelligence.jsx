import React from "react";
import { Globe, MapPin, Building, Radio } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function IPIntelligence({ ipRecords = [], geolocation = [], publicIps = [] }) {
  // Merge ip_records and geolocation by IP
  const mergedIPs = (publicIps.length > 0 ? publicIps : ipRecords.map((r) => r.ip)).map((ip) => {
    const rec = (ipRecords || []).find((r) => r.ip === ip) || {};
    const geo = (geolocation || []).find((g) => g.ip === ip) || {};
    return {
      ip,
      reputation: rec.reputation || "unknown",
      reputationScore: rec.reputation_score ?? null,
      categories: rec.categories || [],
      source: rec.source || geo.source || "MOCK_INTEL",
      isObservableInfra: rec.is_observable_infra ?? true,
      country: geo.country || "UNKNOWN",
      region: geo.region || "UNKNOWN",
      city: geo.city || "UNKNOWN",
      latitude: geo.latitude ?? geo.lat ?? null,
      longitude: geo.longitude ?? geo.lon ?? null,
      asn: geo.asn || "UNKNOWN",
      isp: geo.isp || geo.org || "UNKNOWN",
      organization: geo.organization || geo.org || "UNKNOWN",
      timezone: geo.timezone || null,
      status: geo.status || "success",
      locationNote: geo.location_note || geo.forensic_note || "Observable mail relay infrastructure location",
    };
  });

  const getReputationBadge = (rep) => {
    const r = (rep || "").toLowerCase();
    if (r === "malicious" || r === "high_risk") {
      return { class: "badge-high", text: "MALICIOUS", color: "var(--color-high)" };
    }
    if (r === "suspicious") {
      return { class: "badge-medium", text: "SUSPICIOUS", color: "var(--color-medium)" };
    }
    if (r === "clean") {
      return { class: "badge-clean", text: "CLEAN", color: "var(--color-clean)" };
    }
    return { class: "badge-muted", text: "UNKNOWN", color: "var(--text-muted)" };
  };

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Globe size={20} />
          </div>
          <h3>Observed IP Intelligence &amp; Approximate Geolocation</h3>
        </div>
        <span className="badge badge-muted">{mergedIPs.length} Public IP(s)</span>
      </div>

      <div className="card-body">
        {mergedIPs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mergedIPs.map((item, idx) => {
              const rep = getReputationBadge(item.reputation);
              const hasCoords = item.latitude !== null && item.longitude !== null;

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-card)",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="mono-val" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {item.ip}
                      </span>
                      {item.isObservableInfra && (
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>
                          Observable Infrastructure IP
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`badge ${rep.class}`}>{rep.text}</span>
                      {item.reputationScore !== null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: rep.color }}>
                          Risk: {item.reputationScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  {item.categories.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {item.categories.map((cat, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "var(--color-high)",
                            fontWeight: 600,
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={13} /> Approx. Country / City
                      </span>
                      <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>
                        {safeVal(item.city)}, {safeVal(item.country)}
                        {item.region !== "UNKNOWN" && ` (${item.region})`}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Building size={13} /> ISP / Network
                      </span>
                      <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>
                        {safeVal(item.isp)}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Radio size={13} /> Autonomous System
                      </span>
                      <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>
                        {safeVal(item.asn)}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Globe size={13} /> Coordinates / TZ
                      </span>
                      <div className="mono-val" style={{ marginTop: 2, display: "inline-block" }}>
                        {hasCoords ? `${item.latitude}, ${item.longitude}` : "Coordinates Unavailable"}
                        {item.timezone && ` (${item.timezone})`}
                      </div>
                    </div>
                  </div>

                  {/* Geolocation disclaimer */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>Notice:</span>
                    <span>{item.locationNote}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No public IP addresses observed.</p>
        )}
      </div>
    </div>
  );
}
