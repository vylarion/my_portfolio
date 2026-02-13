import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { meta } from "../../content_option";

const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
};

export const ScanResults = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const scanType = location.state?.scanType || "file";
    const scanInput = location.state?.scanInput || "Unknown";
    const analysisData = location.state?.analysisData || null;
    const fullReport = location.state?.fullReport || null;

    // If no data passed, redirect home
    if (!analysisData && !fullReport) {
        return (
            <HelmetProvider>
                <section id="scan-results" className="scan-results">
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>{meta.title} | Scan Results</title>
                    </Helmet>
                    <div className="sr-container">
                        <div className="sr-no-data">
                            <h2>No Scan Data</h2>
                            <p>Please run a scan from the homepage first.</p>
                            <button className="btn ac_btn" onClick={() => navigate("/")}>
                                Go to Scanner
                                <div className="ring one"></div>
                                <div className="ring two"></div>
                                <div className="ring three"></div>
                            </button>
                        </div>
                    </div>
                </section>
            </HelmetProvider>
        );
    }

    // Use full report attributes if available, fall back to analysis data
    const attrs = fullReport?.attributes || {};
    const stats = analysisData?.stats || attrs.last_analysis_stats || {};
    const engines = analysisData?.results || attrs.last_analysis_results || {};

    const totalEngines = Object.values(stats).reduce((a, b) => a + b, 0);
    const threatCount = (stats.malicious || 0) + (stats.suspicious || 0);
    const overallStatus =
        (stats.malicious || 0) > 0
            ? "malicious"
            : (stats.suspicious || 0) > 0
                ? "suspicious"
                : "clean";

    // Sort engines: malicious first, then suspicious, undetected, harmless
    const sortOrder = {
        malicious: 0,
        suspicious: 1,
        undetected: 2,
        harmless: 3,
        "type-unsupported": 4,
        timeout: 5,
        "confirmed-timeout": 6,
        failure: 7,
    };
    const sortedEngines = Object.entries(engines).sort(
        ([, a], [, b]) => (sortOrder[a.category] ?? 8) - (sortOrder[b.category] ?? 8)
    );

    return (
        <HelmetProvider>
            <section id="scan-results" className="scan-results">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{meta.title} | Scan Results</title>
                    <meta name="description" content="VirusTotal scan results" />
                </Helmet>

                <div className="sr-container">
                    {/* Back Button */}
                    <button className="sr-back" onClick={() => navigate("/")}>
                        ← Back to Scanner
                    </button>

                    {/* Header */}
                    <div className="sr-header">
                        <div className="sr-title-row">
                            <h1 className="sr-title">Scan Results</h1>
                            <span className={`sr-badge sr-badge--${overallStatus}`}>
                                {overallStatus === "clean"
                                    ? "✓ Clean"
                                    : overallStatus === "suspicious"
                                        ? "⚠ Suspicious"
                                        : "✕ Malicious"}
                            </span>
                        </div>
                        <p className="sr-subtitle">
                            {scanType === "file" ? "File" : "URL"}: <strong>{scanInput}</strong>
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="sr-stats">
                        <div className="sr-stat-card sr-stat--detections">
                            <span className="sr-stat-value">
                                {threatCount}/{totalEngines}
                            </span>
                            <span className="sr-stat-label">Detections</span>
                        </div>
                        <div className="sr-stat-card">
                            <span className="sr-stat-value sr-stat-value--green">
                                {stats.harmless || 0}
                            </span>
                            <span className="sr-stat-label">Harmless</span>
                        </div>
                        <div className="sr-stat-card">
                            <span className="sr-stat-value sr-stat-value--red">
                                {stats.malicious || 0}
                            </span>
                            <span className="sr-stat-label">Malicious</span>
                        </div>
                        <div className="sr-stat-card">
                            <span className="sr-stat-value sr-stat-value--yellow">
                                {stats.suspicious || 0}
                            </span>
                            <span className="sr-stat-label">Suspicious</span>
                        </div>
                        <div className="sr-stat-card">
                            <span className="sr-stat-value sr-stat-value--dim">
                                {stats.undetected || 0}
                            </span>
                            <span className="sr-stat-label">Undetected</span>
                        </div>
                    </div>

                    {/* File/URL Details — only if full report available */}
                    {attrs && Object.keys(attrs).length > 0 && (
                        <div className="sr-section">
                            <h2 className="sr-section-title">
                                {scanType === "file" ? "File Details" : "URL Details"}
                            </h2>
                            <div className="sr-details-grid">
                                {scanType === "file" ? (
                                    <>
                                        {attrs.meaningful_name && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Name</span>
                                                <span className="sr-detail-value">
                                                    {attrs.meaningful_name}
                                                </span>
                                            </div>
                                        )}
                                        {(attrs.type_description || attrs.type_extension) && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Type</span>
                                                <span className="sr-detail-value">
                                                    {attrs.type_description || attrs.type_extension}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.size && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Size</span>
                                                <span className="sr-detail-value">
                                                    {formatSize(attrs.size)}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.times_submitted && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Times Submitted</span>
                                                <span className="sr-detail-value">
                                                    {attrs.times_submitted}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.reputation !== undefined && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Reputation</span>
                                                <span className="sr-detail-value">{attrs.reputation}</span>
                                            </div>
                                        )}
                                        {attrs.last_analysis_date && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Last Analysis</span>
                                                <span className="sr-detail-value">
                                                    {formatDate(attrs.last_analysis_date)}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.md5 && (
                                            <div className="sr-detail sr-detail--full">
                                                <span className="sr-detail-label">MD5</span>
                                                <span className="sr-detail-value sr-detail-hash">
                                                    {attrs.md5}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.sha1 && (
                                            <div className="sr-detail sr-detail--full">
                                                <span className="sr-detail-label">SHA-1</span>
                                                <span className="sr-detail-value sr-detail-hash">
                                                    {attrs.sha1}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.sha256 && (
                                            <div className="sr-detail sr-detail--full">
                                                <span className="sr-detail-label">SHA-256</span>
                                                <span className="sr-detail-value sr-detail-hash">
                                                    {attrs.sha256}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {attrs.url && (
                                            <div className="sr-detail sr-detail--full">
                                                <span className="sr-detail-label">URL</span>
                                                <span className="sr-detail-value sr-detail-hash">
                                                    {attrs.url}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.last_final_url && (
                                            <div className="sr-detail sr-detail--full">
                                                <span className="sr-detail-label">Final URL</span>
                                                <span className="sr-detail-value sr-detail-hash">
                                                    {attrs.last_final_url}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.title && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Page Title</span>
                                                <span className="sr-detail-value">{attrs.title}</span>
                                            </div>
                                        )}
                                        {attrs.last_http_response_code && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">HTTP Status</span>
                                                <span className="sr-detail-value">
                                                    {attrs.last_http_response_code}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.times_submitted && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Times Submitted</span>
                                                <span className="sr-detail-value">
                                                    {attrs.times_submitted}
                                                </span>
                                            </div>
                                        )}
                                        {attrs.last_analysis_date && (
                                            <div className="sr-detail">
                                                <span className="sr-detail-label">Last Analysis</span>
                                                <span className="sr-detail-value">
                                                    {formatDate(attrs.last_analysis_date)}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {attrs.tags && attrs.tags.length > 0 && (
                        <div className="sr-section">
                            <h2 className="sr-section-title">Tags</h2>
                            <div className="sr-tags">
                                {attrs.tags.map((tag, i) => (
                                    <span key={i} className="sr-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Engine Results Table */}
                    {sortedEngines.length > 0 && (
                        <div className="sr-section">
                            <h2 className="sr-section-title">
                                Engine Results ({sortedEngines.length})
                            </h2>
                            <div className="sr-table-wrap">
                                <table className="sr-table">
                                    <thead>
                                        <tr>
                                            <th>Engine</th>
                                            <th>Verdict</th>
                                            <th>Result</th>
                                            {scanType === "file" && <th>Version</th>}
                                            <th>Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedEngines.map(([key, engine]) => (
                                            <tr key={key} className={`sr-row sr-row--${engine.category}`}>
                                                <td className="sr-engine-name">{engine.engine_name}</td>
                                                <td>
                                                    <span
                                                        className={`sr-verdict sr-verdict--${engine.category}`}
                                                    >
                                                        {engine.category}
                                                    </span>
                                                </td>
                                                <td className="sr-result-text">{engine.result || "—"}</td>
                                                {scanType === "file" && (
                                                    <td className="sr-version">
                                                        {engine.engine_version || "—"}
                                                    </td>
                                                )}
                                                <td className="sr-method">{engine.method || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </HelmetProvider>
    );
};
