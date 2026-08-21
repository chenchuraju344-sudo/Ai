export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not found on Vercel Environment Variables' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Google API Error' });
    }

    // జెమిని 2.5 మోడల్ నుంచి టెక్స్ట్ పార్ట్ ఎక్స్‌ట్రాక్ట్ చేయడం
    const parts = data.candidates?.[0]?.content?.parts || [];
    let outputText = '';
    
    for (const part of parts) {
      if (part.text) {
        outputText += part.text;
      }
    }

    if (!outputText) {
      return res.status(500).json({ error: 'AI returned empty output or content was filtered.' });
    }

    return res.status(200).json({
      result: outputText,
      output: outputText
    });

  } catch (error) {
    return res.status(500).json({ error: `Server Error: ${error.message}` });
  }
}
