// /api/generate.js - OmniAI Studio - Final Fast Version (2.5-flash-lite)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const { prompt, input } = req.body || {};
  const userPrompt = prompt || input;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel Env' });
  }

  // ✅ నీ screenshot లో ఉన్న fast model
  const MODEL = "gemini-2.5-flash-lite";

  try {
    // ✅ ఇప్పుడున్నది తీసేసి ఇది పెట్టు - Speed optimized
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are OmniAI Studio Prompt Enhancer. Transform this simple idea into a production-grade, ultra-detailed AI prompt for image/video generation: "${userPrompt}". Make it 8k, cinematic, volumetric lighting, highly detailed.` }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512, // 2048 కాదు, 512 పెట్టు - speed కోసం
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error.message, model: MODEL });
    }

    if (!data.candidates ||!data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ error: 'No output from Gemini', raw: data });
    }

    const outputText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      output: outputText,
      model_used: MODEL,
      status: "success"
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
