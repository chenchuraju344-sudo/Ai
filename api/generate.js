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
    // లేటెస్ట్ జెమిని మోడల్ ఎండ్‌పాయింట్
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    // గూగుల్ నుంచి ఏవైనా ఎర్రర్స్ వస్తే ఇక్కడ స్పష్టంగా కనిపిస్తాయి
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
