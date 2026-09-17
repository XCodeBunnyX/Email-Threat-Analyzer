import React from "react";
import { Compass } from "lucide-react";
import { safeVal } from "../utils/formatters";

export default function GeoLocationCard({ geolocation = [] }) {
  const geoRecords = geolocation || [];

  return (
    <div className="soc-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Compass size={20} />
          </div>
          <h3>Approximate Infrastructure Geolocation</h3>
        </div>
        <span className="badge badge-muted">Geo-Context</span>
      </div>

      <div className="card-body">
        {geoRecords.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {geoRecords.map((geo, idx) => {
              const hasCoords = geo.latitude !== null && geo.longitude !== null;

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className="mono-val" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                      {geo.ip}
                    </span>
                    <span className="badge badge-muted">
                      {safeVal(geo.source, "IPinfo")}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Country / City:</span>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {safeVal(geo.city)}, {safeVal(geo.country)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Coordinates:</span>
                      <div className="mono-val">
                        {hasCoords ? `${geo.latitude}, ${geo.longitude}` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>ISP / Organization:</span>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {safeVal(geo.organization || geo.isp || geo.org)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Timezone:</span>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {safeVal(geo.timezone)}
                      </div>
                    </div>
                  </div>

                  {/* Geolocation Notice */}
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "var(--text-muted)",
                      paddingTop: 8,
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {safeVal(geo.location_note || geo.forensic_note)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No geolocation records returned.</p>
        )}
      </div>
    </div>
  );
}
