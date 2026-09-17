import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import DashboardPage from "./pages/DashboardPage";
import AnalyzeEmailPage from "./pages/AnalyzeEmailPage";
import InvestigationPage from "./pages/InvestigationPage";
import IOCIntelligencePage from "./pages/IOCIntelligencePage";
import URLIntelligencePage from "./pages/URLIntelligencePage";
import IPIntelligencePage from "./pages/IPIntelligencePage";
import GeolocationPage from "./pages/GeolocationPage";
import ReportsPage from "./pages/ReportsPage";
import GmailInboxPage from "./pages/GmailInboxPage";
import "./App.css";

export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <div className="app-main">
            <Topbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/inbox" element={<GmailInboxPage />} />
                <Route path="/analyze" element={<AnalyzeEmailPage />} />
                <Route path="/investigation" element={<InvestigationPage />} />
                <Route path="/ioc" element={<IOCIntelligencePage />} />
                <Route path="/urls" element={<URLIntelligencePage />} />
                <Route path="/ip" element={<IPIntelligencePage />} />
                <Route path="/geolocation" element={<GeolocationPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AnalysisProvider>
  );
}