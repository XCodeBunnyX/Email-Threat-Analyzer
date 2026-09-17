import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailUpload from "../components/EmailUpload";
import AnalysisLoader from "../components/AnalysisLoader";
import { useAnalysis } from "../context/AnalysisContext";

export default function AnalyzeEmailPage() {
  const navigate = useNavigate();
  const { runAnalysis, loading, error, setError } = useAnalysis();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError("");
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an .eml email file first.");
      return;
    }

    try {
      await runAnalysis(selectedFile);
      // Auto-navigate to investigation page on success
      navigate("/investigation");
    } catch {
      // error is already set in context
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <AnalysisLoader />
      </div>
    );
  }

  return (
    <div className="page-container">
      <EmailUpload
        onFileSelect={handleFileSelect}
        onAnalyze={handleAnalyze}
        selectedFile={selectedFile}
        loading={loading}
        error={error}
        onClearFile={handleClearFile}
      />
    </div>
  );
}
