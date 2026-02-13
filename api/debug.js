// Debug endpoint — check if env variables are available
// DELETE THIS FILE after debugging

export default function handler(req, res) {
    const apiKey = process.env.VT_API_KEY;

    return res.status(200).json({
        hasApiKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPreview: apiKey ? apiKey.slice(0, 4) + "..." : "NOT SET",
        nodeVersion: process.version,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes("VT") || k.includes("API")),
    });
}
