// Service to communicate with Gemini AI directly from the frontend
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ Gemini API Key not found. Please set VITE_GEMINI_API_KEY in your .env file");
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || "" });

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
