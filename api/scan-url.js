// Vercel Serverless Function: URL Scan
// Receives a URL and submits it to VirusTotal for scanning

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Normalize the URL — add https:// if no protocol
        let normalizedUrl = url.trim();
        if (
            !normalizedUrl.startsWith("http://") &&
            !normalizedUrl.startsWith("https://")
        ) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        // Submit URL to VirusTotal
        const vtResponse = await fetch("https://www.virustotal.com/api/v3/urls", {
            method: "POST",
            headers: {
                "x-apikey": apiKey,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `url=${encodeURIComponent(normalizedUrl)}`,
        });

        if (!vtResponse.ok) {
            const errorText = await vtResponse.text();
            console.error("VT URL scan error:", vtResponse.status, errorText);
            return res.status(vtResponse.status).json({
                error: "VirusTotal API error",
                details: errorText,
            });
        }

        const data = await vtResponse.json();

        return res.status(200).json({
            analysisId: data.data?.id,
            type: "url",
            url: normalizedUrl,
        });
    } catch (err) {
        console.error("Scan URL error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
