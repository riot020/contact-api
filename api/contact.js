export default async function handler(req, res) {
  // Always set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { niche } = req.query;

  if (!niche) {
    res.status(400).json({ error: "Missing niche" });
    return;
  }

  const githubRawUrl = "https://raw.githubusercontent.com/riot020/Numbers/master/Numbers.txt";

  try {
    const response = await fetch(githubRawUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch file from GitHub");
    }

    const text = await response.text();
    const lines = text.split("\n");
    const contacts = {};

    lines.forEach(line => {
      const [key, value] = line.trim().split("=");
      if (key && value) {
        contacts[key.toLowerCase()] = value;
      }
    });

    const number = contacts[niche.toLowerCase()];
    if (!number) {
      res.status(404).json({ error: "Number not found" });
      return;
    }

    res.status(200).json({ number });
  } catch (err) {
    // Ensure CORS headers even on error
    res.status(500).json({ error: "Internal server error" });
  }
}
