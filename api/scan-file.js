// Vercel Serverless Function: File Scan
import https from "https";

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

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    try {
        const chunks = [];
        await new Promise((resolve, reject) => {
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", resolve);
            req.on("error", reject);
        });
        const buffer = Buffer.concat(chunks);

        if (buffer.length === 0) {
            return res.status(400).json({ error: "No file data received" });
        }

        const boundary = "----VTBoundary" + Date.now();
        const filename = req.headers["x-filename"] || "uploaded_file";

        const header = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
        );
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const formBody = Buffer.concat([header, buffer, footer]);

        const vtResult = await vtRequest(
            {
                hostname: "www.virustotal.com",
                path: "/api/v3/files",
                method: "POST",
                headers: {
                    "x-apikey": apiKey,
                    "Content-Type": `multipart/form-data; boundary=${boundary}`,
                    "Content-Length": formBody.length,
                },
            },
            formBody
        );

        if (vtResult.status >= 400) {
            return res.status(vtResult.status).json({
                error: "VirusTotal API error",
                details: JSON.stringify(vtResult.data),
            });
        }

        return res.status(200).json({
            analysisId: vtResult.data?.data?.id,
            type: "file",
        });
    } catch (err) {
        console.error("Scan file error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
