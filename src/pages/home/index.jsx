import React, { useState, useRef } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { introdata, meta } from "../../content_option";
import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 32 * 1024 * 1024) {
        setError("File size must be under 32 MB.");
        return;
      }
      setSelectedFile(file);
      setError("");
      setScanResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 32 * 1024 * 1024) {
        setError("File size must be under 32 MB.");
        return;
      }
      setSelectedFile(file);
      setError("");
      setScanResult(null);
    }
  };

  // Poll for analysis results
  const pollAnalysis = async (analysisId, scanInput, scanType) => {
    const maxAttempts = 30;
    const pollInterval = 3000; // 3 seconds

    for (let i = 0; i < maxAttempts; i++) {
      setScanStatus(
        i === 0 ? "Submitting to VirusTotal..." : `Analyzing... (${i * 3}s)`
      );

      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      try {
        const response = await fetch(`/api/analysis?id=${encodeURIComponent(analysisId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get analysis");
        }

        if (data.completed) {
          setIsScanning(false);
          setScanStatus("");
          navigate("/scan-results", {
            state: {
              scanType,
              scanInput,
              analysisData: data.analysis,
              fullReport: data.fullReport,
            },
          });
          return;
        }
      } catch (err) {
        console.error("Poll error:", err);
        // Continue polling unless it's a critical error
      }
    }

    // Timeout
    setIsScanning(false);
    setScanStatus("");
    setError("Analysis timed out. Please try again.");
  };

  const handleScan = async () => {
    setError("");
    setScanResult(null);

    if (scanMode === "file" && !selectedFile) {
      setError("Please select a file to scan.");
      return;
    }
    if (scanMode === "url" && !urlInput.trim()) {
      setError("Please enter a URL to scan.");
      return;
    }

    setIsScanning(true);

    try {
      if (scanMode === "file") {
        setScanStatus("Uploading file...");

        // Read file as array buffer and send to our API
        const buffer = await selectedFile.arrayBuffer();

        const response = await fetch("/api/scan-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "x-filename": selectedFile.name,
          },
          body: buffer,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload file");
        }

        // Poll for results
        await pollAnalysis(data.analysisId, selectedFile.name, "file");
      } else {
        setScanStatus("Submitting URL...");

        const response = await fetch("/api/scan-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlInput }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit URL");
        }

        // Poll for results
        await pollAnalysis(data.analysisId, urlInput, "url");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setIsScanning(false);
      setScanStatus("");
      setError(err.message || "Scan failed. Please try again.");
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setUrlInput("");
    setScanResult(null);
    setError("");
    setScanStatus("");
  };

  const switchMode = (mode) => {
    setScanMode(mode);
    resetScanner();
  };

  return (
    <HelmetProvider>
      <section id="home" className="home">
        <Helmet>
          <meta charSet="utf-8" />
          <title> {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <div className="intro_sec d-block d-lg-flex align-items-center ">
          <div
            className="h_bg-image order-1 order-lg-1 h-100 "
            style={{ backgroundImage: `url(${introdata.your_img_url})` }}
          ></div>
          <div className="text order-2 order-lg-2 h-100 d-lg-flex justify-content-center">
            <div className="align-self-center ">
              <div className="intro mx-auto">
                <h2 className="mb-1x">{introdata.title}</h2>
                <h1 className="fluidz-48 mb-1x">
                  The{" "}
                  <Typewriter
                    options={{
                      strings: [
                        introdata.animated.first,
                        introdata.animated.second,
                        introdata.animated.third,
                        introdata.animated.fourth,
                      ],
                      autoStart: true,
                      loop: true,
                      delay: 50,
                      deleteSpeed: 20,
                      pauseFor: 1500,
                    }}
                  />
                </h1>
                <p className="scanner-intro">Security operative specializing in offensive security & threat analysis.</p>
                <p className="scanner-tagline">Secure now — scan files for malware & check websites for threats.</p>

                {/* Scanner Card */}
                <div className="scanner-card">
                  <div className="scanner-tabs">
                    <button
                      className={`scanner-tab ${scanMode === "file" ? "active" : ""}`}
                      onClick={() => switchMode("file")}
                      disabled={isScanning}
                    >
                      File Scan
                    </button>
                    <button
                      className={`scanner-tab ${scanMode === "url" ? "active" : ""}`}
                      onClick={() => switchMode("url")}
                      disabled={isScanning}
                    >
                      URL Scan
                    </button>
                  </div>

                  <div className="scanner-body">
                    {scanMode === "file" ? (
                      <div
                        className={`scanner-dropzone ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isScanning && fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                          id="scanner-file-input"
                        />
                        {selectedFile ? (
                          <div className="dropzone-content">
                            <span className="dropzone-icon">📄</span>
                            <span className="dropzone-filename">{selectedFile.name}</span>
                            <span className="dropzone-size">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ) : (
                          <div className="dropzone-content dropzone-inline">
                            <span className="dropzone-icon">↑</span>
                            <span className="dropzone-text">Drop file or click to browse</span>
                            <span className="dropzone-hint">· Max 32 MB</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="scanner-url-input">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter website URL (e.g. example.com)"
                          value={urlInput}
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            setError("");
                            setScanResult(null);
                          }}
                          disabled={isScanning}
                          id="scanner-url-field"
                        />
                      </div>
                    )}

                    {error && <p className="scanner-error">{error}</p>}
                    {scanStatus && <p className="scanner-status">{scanStatus}</p>}

                    <button
                      className="btn ac_btn scanner-btn"
                      onClick={handleScan}
                      disabled={isScanning}
                      id="scanner-scan-btn"
                    >
                      {isScanning ? "Scanning..." : "Scan"}
                      <div className="ring one"></div>
                      <div className="ring two"></div>
                      <div className="ring three"></div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </HelmetProvider>
  );
};
