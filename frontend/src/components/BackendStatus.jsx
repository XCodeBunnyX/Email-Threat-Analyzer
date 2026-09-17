import React, { useEffect, useState } from "react";
import { checkHealth } from "../services/api";

export default function BackendStatus({ className = "" }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      try {
        await checkHealth();
        if (mounted) setStatus("online");
      } catch {
        if (mounted) setStatus("offline");
      }
    };

    ping();
    const timer = setInterval(ping, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      className={`status-pill ${status} ${className}`}
      title={
        status === "online"
          ? "FastAPI Backend is operational"
          : "FastAPI Backend at http://127.0.0.1:8000 is unreachable"
      }
    >
      <span className="status-dot" />
      <span>
        {status === "online"
          ? "Backend Connected"
          : status === "offline"
          ? "Backend Offline"
          : "Checking Status..."}
      </span>
    </div>
  );
}
