export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { niche } = req.query;

  if (!niche) {
    return res.status(400).json({ error: 'Missing niche parameter' });
  }

  try {
    const githubResponse = await fetch(
      'https://raw.githubusercontent.com/riot020/Numbers/master/Numbers.txt'
    );

    if (!githubResponse.ok) {
      throw new Error(`GitHub responded with status: ${githubResponse.status}`);
    }

    const text = await githubResponse.text();
    const lines = text.split('\n');
    const map = {};

    for (let line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      const [key, value] = line.trim().split('=');
      if (key && value) {
        map[key.trim()] = value.trim();
      }
    }

    const number = map[niche];

    if (!number) {
      return res.status(404).json({ error: 'Number not found for this niche' });
    }

    return res.status(200).json({ number });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
