// api/generate.js - OmniAI Studio - Gemini 3.0 Flash Final Version

export default async function handler(req, res) {
  // CORS handle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, input } = req.body;
  const userPrompt = prompt || input;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel' });
  }

  // LATEST MODEL - Gemini 3 Flash
  const MODEL = "gemini-3-flash";
  const URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `You are OmniAI Studio Prompt Enhancer. Transform this simple idea into a production-grade, ultra-detailed AI prompt: "${userPrompt}". Give 8k, volumetric lighting, Hasselblad style output.` }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ error: `Gemini API Error: ${data.error.message}` });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: 'No output from model' });
    }

    const outputText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      output: outputText,
      model: MODEL,
      status: "success"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
