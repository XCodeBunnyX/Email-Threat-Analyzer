import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, Info, Network } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Custom icon setup for leaflet in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to automatically fit map to all markers
function MapBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
      // Pad bounds slightly
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [map, markers]);
  return null;
}

export default function GeolocationPage() {
  const navigate = useNavigate();
  const { analysis } = useAnalysis();

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <MapPin size={48} />
          </div>
          <h3>No Geolocation Data Available</h3>
          <p>Analyze an email to view approximate geolocation of sender infrastructure.</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Upload size={16} />
            <span>Analyze an Email</span>
          </button>
        </div>
      </div>
    );
  }

  const infra = analysis.infrastructure || {};
  const geolocation = infra.geolocation || [];

  /**
   * Safely extract [lat, lon] from a geolocation entry.
   * Handles both numeric fields (latitude/longitude, lat/lon) and a
   * combined string field like "28.5133, 77.372" (ipinfo "loc" style).
   * Uses Number() + isFinite() so that 0.0 is never treated as missing.
   */
  function parseCoords(geo) {
    // 1. Numeric fields — the canonical path from ip-api.com / ipinfo fallback
    const numLat = Number(geo.latitude ?? geo.lat);
    const numLon = Number(geo.longitude ?? geo.lon);
    if (isFinite(numLat) && isFinite(numLon)) {
      return [numLat, numLon];
    }

    // 2. Combined "lat,lon" string (e.g. ipinfo "loc" field forwarded as-is)
    const locStr =
      geo.loc ||
      geo.coords ||
      geo.coordinates ||
      geo.location ||
      null;
    if (locStr && typeof locStr === "string" && locStr.includes(",")) {
      const [rawLat, rawLon] = locStr.split(",");
      const strLat = Number(rawLat);
      const strLon = Number(rawLon);
      if (isFinite(strLat) && isFinite(strLon)) {
        return [strLat, strLon];
      }
    }

    return null; // no usable coordinates
  }

  // Build the markers array — one entry per geolocation entry with valid coords
  const markers = geolocation
    .map((geo) => {
      const coords = parseCoords(geo);
      if (!coords) return null;
      const [lat, lon] = coords;
      return { ...geo, lat, lon };
    })
    .filter(Boolean);

  return (
    <div className="page-container">
      {/* Attribution Notice */}
      <div className="disclaimer-banner" style={{ marginBottom: 20 }}>
        <Info size={16} style={{ flexShrink: 0 }} />
        <div>
          <strong>Approximate Network-Level Attribution</strong>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.85 }}>
            Geolocation data is derived from IP address databases and represents the registered location
            of the network operator — not necessarily the physical location of the sender. VPN, proxy,
            and cloud infrastructure can significantly affect accuracy.
          </p>
        </div>
      </div>

      {geolocation.length === 0 ? (
        <div className="soc-card">
          <div className="card-body" style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <MapPin size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
            <p>No geolocation coordinates available for the IPs in this email.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Interactive Map */}
          {markers.length > 0 && (
            <div className="soc-card" style={{ padding: 0, overflow: "hidden", height: 400, marginBottom: 20 }}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                {/* Transparent labels/boundaries overlay — Esri companion layer for World Imagery */}
                <TileLayer
                  attribution='Labels &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  opacity={0.85}
                />
                <MapBounds markers={markers} />
                {markers.map((marker, idx) => (
                  <Marker key={idx} position={[marker.lat, marker.lon]} icon={customIcon}>
                    <Popup>
                      <div style={{ padding: "0 4px", fontSize: 13 }}>
                        <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
                          {marker.ip}
                        </strong>
                        <div style={{ color: "#64748b", marginBottom: 2 }}>{marker.isp || marker.org}</div>
                        <div>
                          {marker.city !== "UNKNOWN" ? marker.city + ", " : ""}
                          {marker.country}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Location Detail Cards */}
          <div className="geo-grid">
            {geolocation.map((geo, idx) => (
              <div key={idx} className="soc-card">
                <div className="card-header">
                  <div className="card-title-group">
                    <div className="card-icon">
                      <Network size={18} />
                    </div>
                    <h3>{geo.ip || `Location ${idx + 1}`}</h3>
                  </div>
                  {geo.country && geo.country !== "UNKNOWN" && (
                    <span className="badge badge-low">{geo.country}</span>
                  )}
                </div>
                <div className="card-body">
                  <div className="geo-details-grid">
                    <GeoDetail label="Country" value={geo.country} />
                    <GeoDetail label="Region" value={geo.region} />
                    <GeoDetail label="City" value={geo.city} />
                    <GeoDetail label="ISP" value={geo.isp} />
                    <GeoDetail label="Organization" value={geo.org} />
                    <GeoDetail label="AS Number" value={geo.as_number || geo.asn} />
                    {(() => {
                      const c = parseCoords(geo);
                      return c ? (
                        <GeoDetail
                          label="Coordinates"
                          value={`${c[0].toFixed(4)}, ${c[1].toFixed(4)}`}
                        />
                      ) : null;
                    })()}
                    {geo.timezone && <GeoDetail label="Timezone" value={geo.timezone} />}
                  </div>

                  {/* Coordinate Visual Text */}
                  {(() => {
                    const c = parseCoords(geo);
                    return c ? (
                      <div className="geo-coord-visual">
                        <div className="geo-coord-pin">
                          <MapPin size={20} />
                        </div>
                        <div className="geo-coord-text">
                          <span className="mono-val">
                            {c[0].toFixed(4)}°{c[0] >= 0 ? "N" : "S"},{" "}
                            {c[1].toFixed(4)}°{c[1] >= 0 ? "E" : "W"}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GeoDetail({ label, value }) {
  if (!value || value === "UNKNOWN") return null;
  return (
    <div className="geo-detail-item">
      <span className="geo-detail-label">{label}</span>
      <span className="geo-detail-value">{value}</span>
    </div>
  );
}
