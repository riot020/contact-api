export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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
    res.status(500).json({ error: "Internal server error" });
  }
}

// Optional Vercel config if you need it
export const config = {
  api: {
    bodyParser: false,
  },
};
