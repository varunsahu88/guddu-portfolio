import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' });

    const { message, history } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userMessage = String(message || '').trim();
    if (!userMessage) return res.status(400).json({ error: 'Missing message' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction =
      'You are Guddu\'s portfolio site assistant. Reply in Hinglish, concise, friendly, and helpful. ' +
      'If asked about personal/private info, say you don\'t have it. Keep answers under ~120 words unless user asks for detail.';

    // Convert simple history to Gemini format if provided
    const chatHistory = Array.isArray(history)
      ? history
          .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string')
          .slice(-12)
          .map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.text }],
          }))
      : [];

    // Use chat for multi-turn continuity
    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: systemInstruction }] }, ...chatHistory],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 250,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const text = result?.response?.text?.() || '';

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'Gemini request failed' });
  }
}
