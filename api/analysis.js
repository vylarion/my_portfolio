// Vercel Serverless Function: Get Analysis Results
// Polls VirusTotal for scan results using an analysis ID

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: "Analysis ID is required" });
        }

        // Get the analysis results
        const analysisResponse = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${id}`,
            {
                headers: {
                    "x-apikey": apiKey,
                },
            }
        );

        if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text();
            console.error("VT analysis error:", analysisResponse.status, errorText);
            return res.status(analysisResponse.status).json({
                error: "VirusTotal API error",
                details: errorText,
            });
        }

        const analysisData = await analysisResponse.json();
        const status = analysisData.data?.attributes?.status;

        // If analysis is still in progress, return the status
        if (status !== "completed") {
            return res.status(200).json({
                status: status, // "queued" or "in-progress"
                completed: false,
            });
        }

        // Analysis is complete — get the full report
        // The analysis contains a meta.file_info or meta.url_info
        // with the resource ID for the full report
        const stats = analysisData.data?.attributes?.stats;
        const results = analysisData.data?.attributes?.results;
        const meta = analysisData.data?.meta || {};

        // Try to get the full file/URL report for additional details
        let fullReport = null;
        const fileInfo = meta.file_info;
        const urlInfo = meta.url_info;

        if (fileInfo?.sha256) {
            // Get full file report
            const fileResponse = await fetch(
                `https://www.virustotal.com/api/v3/files/${fileInfo.sha256}`,
                {
                    headers: { "x-apikey": apiKey },
                }
            );
            if (fileResponse.ok) {
                fullReport = await fileResponse.json();
            }
        } else if (urlInfo?.id) {
            // Get full URL report
            const urlResponse = await fetch(
                `https://www.virustotal.com/api/v3/urls/${urlInfo.id}`,
                {
                    headers: { "x-apikey": apiKey },
                }
            );
            if (urlResponse.ok) {
                fullReport = await urlResponse.json();
            }
        }

        // Return the comprehensive results
        return res.status(200).json({
            status: "completed",
            completed: true,
            analysis: {
                stats,
                results,
            },
            fullReport: fullReport?.data || null,
        });
    } catch (err) {
        console.error("Analysis error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
