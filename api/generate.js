// api/generate.js - FINAL FIX FOR YOUR KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // YOUR KEY SUPPORTS THIS - from your screenshot
  const MODEL = "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    res.status(200).json({
      output: data.candidates[0].content.parts[0].text,
      model_used: MODEL
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
