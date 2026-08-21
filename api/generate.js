export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on Vercel Environment Variables' });
  }

  try {
    // 1. Stable v1 endpoint (100% Reliable across all API keys)
    let response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    let data = await response.json();

    // 2. Fallback to gemini-1.5-pro if flash is restricted on your specific key tier
    if (data.error) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      data = await response.json();
    }

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Google API Error' });
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ result: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: 'AI returned empty response or safety block.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
