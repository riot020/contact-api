export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Allow CORS for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { niche } = req.query;

  if (!niche) {
    return res.status(400).json({ error: 'Missing "niche" parameter' });
  }

  try {
    const githubResponse = await fetch(
      'https://raw.githubusercontent.com/your-username/your-repo/main/numbers.txt',
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!githubResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch numbers.txt from GitHub' });
    }

    const text = await githubResponse.text();
    const lines = text.split('\n');

    const numbersMap = {};
    lines.forEach((line) => {
      const [key, value] = line.trim().split('=');
      if (key && value) {
        numbersMap[key.trim()] = value.trim();
      }
    });

    const number = numbersMap[niche];

    if (!number) {
      return res.status(404).json({ error: `No number found for niche "${niche}"` });
    }

    return res.status(200).json({ number });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
