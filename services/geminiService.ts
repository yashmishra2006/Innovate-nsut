// Service to communicate with Gemini AI via secure backend API
const API_URL = import.meta.env.VITE_API_URL || '/api/gemini';

export interface GenerateImageResponse {
  success: boolean;
  prompt: string;
  analysis: string;
  generated_image_url: string;
  original_image: string;
  error?: string;
}

export interface AnalyzeImageResponse {
  success: boolean;
  prompt: string;
  analysis: string;
  error?: string;
}

export interface GreenCorridorSuggestion {
  success: boolean;
  corridorPath: [number, number][];
  corridorType: string;
  reasoning: string;
  features: string[];
  error?: string;
}

/**
 * Generate image transformation with sustainability features
 */
export async function generateImageWithDetails(
  originalImage: string,
  toggles: {
    trees: boolean;
    solarPanels: boolean;
    greenRoofs: boolean;
    gardens: boolean;
    bikeInfra: boolean;
    vegetation: boolean;
  }
): Promise<GenerateImageResponse> {
  try {
    const features: string[] = [];
    if (toggles.trees) features.push('add native trees and shade canopy');
    if (toggles.solarPanels) features.push('install solar panels on rooftops');
    if (toggles.greenRoofs) features.push('create green roofs with vegetation');
    if (toggles.gardens) features.push('add community gardens and green spaces');
    if (toggles.bikeInfra) features.push('add bike lanes and cycling infrastructure');
    if (toggles.vegetation) features.push('increase ground-level vegetation and landscaping');

    const prompt = features.length > 0 
      ? `Please ${features.join(', ')}.` 
      : 'Add sustainable urban improvements to this scene.';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-image',
        originalImage,
        prompt,
        toggles
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating image:', error);
    return {
      success: false,
      prompt: '',
      analysis: '',
      generated_image_url: '',
      original_image: originalImage,
      error: error.message || 'Failed to generate image'
    };
  }
}

/**
 * Analyze an image with Gemini Vision
 */
export async function analyzeImage(imageBase64: string, question: string): Promise<AnalyzeImageResponse> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze-image',
        imageBase64,
        question
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      prompt: question,
      analysis: '',
      error: error.message || 'Failed to analyze image'
    };
  }
}

/**
 * Analyze region and suggest optimal green corridor placement
 */
export async function analyzeRegionForGreenCorridor(
  centerLat: number,
  centerLng: number,
  activeLayers: string[],
  regionData: any
): Promise<GreenCorridorSuggestion> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze-corridor',
        centerLat,
        centerLng,
        activeLayers,
        regionData
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing corridor:', error);
    return {
      success: false,
      corridorPath: [],
      corridorType: 'mixed-use',
      reasoning: 'Failed to generate corridor suggestion',
      features: [],
      error: error.message || 'Failed to analyze region'
    };
  }
}

    const model = genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        text: `You are an expert urban planner and sustainability consultant. Analyze the following region and suggest an optimal green corridor/belt placement.

Region Information:
- Center Coordinates: ${centerLat}, ${centerLng}
- Active Environmental Layers: ${activeLayers.join(', ')}
- Heat Score: ${regionData.heatScore}/100 (higher = more heat stress)
- Current Green Coverage: ${regionData.greenScore}%
- Trees in area: ${regionData.stats.trees}
- EV Stations: ${regionData.stats.ev}
- Solar Installations: ${regionData.stats.solar}
- Area Size: ${regionData.stats.area} km²

Task: Design an optimal green corridor for this region. The corridor should:
1. Connect existing green spaces
2. Provide shade and cooling
3. Support pedestrian/cycling infrastructure
4. Consider existing infrastructure

Please respond in the following JSON format ONLY (no markdown, no explanation outside JSON):
{
  "corridorType": "linear|circular|branching|network",
  "pathPoints": [
    {"lat": ${centerLat + 0.003}, "lng": ${centerLng - 0.003}},
    {"lat": ${centerLat}, "lng": ${centerLng}},
    {"lat": ${centerLat - 0.003}, "lng": ${centerLng + 0.003}}
  ],
  "reasoning": "brief explanation of why this configuration",
  "features": ["list", "of", "recommended", "features"]
}`
      }]
    });

    const response = await model;
    let text = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        text += part.text;
      }
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Convert parsed response to corridor path
    const corridorPath: [number, number][] = parsed.pathPoints.map((p: any) => [p.lat, p.lng]);

    return {
      success: true,
      corridorPath,
      corridorType: parsed.corridorType || "linear",
      reasoning: parsed.reasoning || "AI-generated optimal green corridor",
      features: parsed.features || ["Trees", "Bike lanes", "Shade structures"],
    };
  } catch (error) {
    console.error("Error analyzing region for green corridor:", error);
    return {
      success: false,
      corridorPath: [],
      corridorType: "linear",
      reasoning: "",
      features: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Convert File to Base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get mime type from file
 */
function getMimeType(file: File): string {
  return file.type || 'image/jpeg';
}

/**
 * Generate image and get both the image and analysis text using Gemini 2.5 Flash Image
 * @param file - The image file to transform
 * @param prompt - The creative prompt for image generation
 * @returns JSON response with generated image and analysis
 */
export async function generateImageWithDetails(
  file: File,
  prompt: string
): Promise<GenerateImageResponse> {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    const base64Data = await fileToBase64(file);
    const mimeType = getMimeType(file);

    const promptParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: promptParts,
    });

    let generatedImageUrl = '';
    let analysisText = '';

    // Extract text and image from response
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        analysisText += part.text;
      } else if (part.inlineData) {
        // Convert base64 image data to blob URL
        const imageData = part.inlineData.data;
        const byteCharacters = atob(imageData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: part.inlineData.mimeType || 'image/png' });
        generatedImageUrl = URL.createObjectURL(blob);
      }
    }

    const originalImageUrl = URL.createObjectURL(file);

    return {
      success: true,
      prompt: prompt,
      analysis: analysisText || 'Image successfully transformed',
      generated_image_url: generatedImageUrl,
      original_image: originalImageUrl,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      prompt: prompt,
      analysis: "",
      generated_image_url: "",
      original_image: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Analyze an image using Gemini Vision
 * @param file - The image file to analyze
 * @param prompt - The analysis prompt
 * @returns Analysis text and details
 */
export async function analyzeImage(
  file: File,
  prompt: string
): Promise<AnalyzeImageResponse> {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    const base64Data = await fileToBase64(file);
    const mimeType = getMimeType(file);

    const promptParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: promptParts,
    });

    let analysisText = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        analysisText += part.text;
      }
    }

    return {
      success: true,
      prompt: prompt,
      analysis: analysisText,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      success: false,
      prompt: prompt,
      analysis: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
