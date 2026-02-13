// Vercel Serverless Function: URL Scan
// Receives a URL and submits it to VirusTotal for scanning
const https = require("https");

function vtRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    reject(new Error("Invalid JSON from VirusTotal: " + data.slice(0, 200)));
                }
            });
        });
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    try {
        const { url } = req.body || {};

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Normalize the URL
        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        const postBody = "url=" + encodeURIComponent(normalizedUrl);

        const vtResult = await vtRequest(
            {
                hostname: "www.virustotal.com",
                path: "/api/v3/urls",
                method: "POST",
                headers: {
                    "x-apikey": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postBody),
                },
            },
            postBody
        );

        if (vtResult.status >= 400) {
            return res.status(vtResult.status).json({
                error: "VirusTotal API error",
                details: JSON.stringify(vtResult.data),
            });
        }

        return res.status(200).json({
            analysisId: vtResult.data?.data?.id,
            type: "url",
            url: normalizedUrl,
        });
    } catch (err) {
        console.error("Scan URL error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};
