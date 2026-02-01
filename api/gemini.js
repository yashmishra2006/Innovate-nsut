// Vercel Serverless Function for Gemini API
// This keeps your API key secure on the server side

import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });

export default async function handler(req, res) {
  // Enable CORS
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, originalImage, prompt, toggles, centerLat, centerLng, activeLayers, regionData } = req.body;

    if (action === 'generate-image') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const fullPrompt = `Transform this urban scene to show sustainable improvements. ${prompt}
      
      Make the transformation realistic and subtle. Keep the original composition and perspective.
      Generate a detailed description of the improvements made.`;

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: originalImage.split(',')[1] } },
            { text: fullPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      const analysis = result.response.text();
      
      return res.status(200).json({
        success: true,
        prompt: fullPrompt,
        analysis,
        generated_image_url: originalImage,
        original_image: originalImage
      });
    }

    if (action === 'analyze-corridor') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `You are an urban planning AI analyzing a region in Delhi at coordinates (${centerLat}, ${centerLng}).

Region Data:
- Heat Score: ${regionData.heatScore}/100
- Green Coverage: ${regionData.greenScore}%
- Existing Trees: ${regionData.stats.trees}
- Active Layers: ${activeLayers.join(', ')}

Task: Suggest an optimal green corridor placement for this area.

Respond ONLY with valid JSON in this exact format:
{
  "corridorType": "urban-biodiversity|cooling|mixed-use|connectivity",
  "pathPoints": [[lat1, lng1], [lat2, lng2], ...],
  "reasoning": "brief explanation",
  "features": ["feature1", "feature2", "feature3"]
}

Make pathPoints a realistic corridor path with 4-6 coordinate points within 500m of the center.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const corridorData = JSON.parse(jsonMatch[0]);
        return res.status(200).json({
          success: true,
          corridorPath: corridorData.pathPoints || [],
          corridorType: corridorData.corridorType || 'mixed-use',
          reasoning: corridorData.reasoning || 'AI-generated corridor suggestion',
          features: corridorData.features || []
        });
      }

      throw new Error('Failed to parse AI response');
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

