// Vercel Serverless Function: Get Analysis Results
import https from "https";

function vtGet(path, apiKey) {
    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                hostname: "www.virustotal.com",
                path: path,
                method: "GET",
                headers: { "x-apikey": apiKey },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        reject(new Error("Invalid JSON from VirusTotal"));
                    }
                });
            }
        );
        req.on("error", reject);
        req.end();
    });
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "Analysis ID is required" });

        const analysisResult = await vtGet("/api/v3/analyses/" + encodeURIComponent(id), apiKey);

        if (analysisResult.status >= 400) {
            return res.status(analysisResult.status).json({
                error: "VirusTotal API error",
                details: JSON.stringify(analysisResult.data),
            });
        }

        const analysisData = analysisResult.data;
        const status = analysisData.data?.attributes?.status;

        if (status !== "completed") {
            return res.status(200).json({ status, completed: false });
        }

        const stats = analysisData.data?.attributes?.stats;
        const results = analysisData.data?.attributes?.results;
        const meta = analysisData.data?.meta || {};

        let fullReport = null;
        const fileInfo = meta.file_info;
        const urlInfo = meta.url_info;

        try {
            if (fileInfo?.sha256) {
                const fileResult = await vtGet("/api/v3/files/" + fileInfo.sha256, apiKey);
                if (fileResult.status === 200) fullReport = fileResult.data;
            } else if (urlInfo?.id) {
                const urlResult = await vtGet("/api/v3/urls/" + urlInfo.id, apiKey);
                if (urlResult.status === 200) fullReport = urlResult.data;
            }
        } catch (e) {
            console.error("Full report fetch failed:", e);
        }

        return res.status(200).json({
            status: "completed",
            completed: true,
            analysis: { stats, results },
            fullReport: fullReport?.data || null,
        });
    } catch (err) {
        console.error("Analysis error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
