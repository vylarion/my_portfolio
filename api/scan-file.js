// Vercel Serverless Function: File Scan
// Receives a file upload and submits it to VirusTotal for scanning

export const config = {
    api: {
        bodyParser: false, // We need raw body for file upload
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    try {
        // Read the raw body as a buffer
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Parse the multipart form data manually
        // The Content-Type header contains the boundary
        const contentType = req.headers["content-type"] || "";

        // Forward the file to VirusTotal as multipart/form-data
        const boundary = "----VTBoundary" + Date.now();
        const filename =
            req.headers["x-filename"] || "uploaded_file";

        const formDataParts = [
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`,
            `Content-Type: application/octet-stream\r\n\r\n`,
        ];

        const formDataEnd = `\r\n--${boundary}--\r\n`;

        const formBody = Buffer.concat([
            Buffer.from(formDataParts.join("")),
            buffer,
            Buffer.from(formDataEnd),
        ]);

        const vtResponse = await fetch("https://www.virustotal.com/api/v3/files", {
            method: "POST",
            headers: {
                "x-apikey": apiKey,
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
            },
            body: formBody,
        });

        if (!vtResponse.ok) {
            const errorText = await vtResponse.text();
            console.error("VT file upload error:", vtResponse.status, errorText);
            return res.status(vtResponse.status).json({
                error: "VirusTotal API error",
                details: errorText,
            });
        }

        const data = await vtResponse.json();

        // Return the analysis ID so the frontend can poll for results
        return res.status(200).json({
            analysisId: data.data?.id,
            type: "file",
        });
    } catch (err) {
        console.error("Scan file error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
