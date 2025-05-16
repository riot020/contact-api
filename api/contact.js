export default async function handler(req, res) {
  // ✅ Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { niche } = req.query;

  if (!niche) {
    return res.status(400).json({ error: "Missing niche" });
  }

  const githubRawUrl = "https://raw.githubusercontent.com/riot020/Numbers/master/Numbers.txt";

  try {
    const response = await fetch(githubRawUrl);
    if (!response.ok) throw new Error("Failed to fetch file from GitHub");

    const text = await response.text();
    const lines = text.split("\n");
    const contacts = {};

    lines.forEach(line => {
      const [key, value] = line.trim().split("=");
      if (key && value) contacts[key.toLowerCase()] = value;
    });

    const number = contacts[niche.toLowerCase()];
    if (!number) return res.status(404).json({ error: "Number not found" });

    res.status(200).json({ number });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
