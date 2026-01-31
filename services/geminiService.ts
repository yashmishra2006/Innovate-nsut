// Service to communicate with Gemini Image Generation API
const API_BASE_URL = "http://34.131.185.69:8000";

export interface GenerateImageResponse {
  success: boolean;
  prompt: string;
  analysis: string;
  generated_image_path: string;
  generated_image_filename: string;
  original_image: string;
  error?: string;
}

export interface AnalyzeImageResponse {
  success: boolean;
  filename: string;
  prompt: string;
  analysis: string;
  image_dimensions: string;
}

/**
 * Generate a new image using Gemini 2.5 Flash Image model
 * @param file - The image file to transform
 * @param prompt - The creative prompt for image generation
 * @returns Generated image file response
 */
export async function generateImage(file: File, prompt: string): Promise<Blob> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("prompt", prompt);

  const response = await fetch(`${API_BASE_URL}/generate-image/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate image: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Generate image and get both the image and analysis text
 * @param file - The image file to transform
 * @param prompt - The creative prompt for image generation
 * @returns JSON response with image path and analysis
 */
export async function generateImageWithDetails(
  file: File,
  prompt: string
): Promise<GenerateImageResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("prompt", prompt);

  const response = await fetch(`${API_BASE_URL}/generate-image-with-details/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate image: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Analyze an image using Gemini 1.5 Pro (text analysis only)
 * @param file - The image file to analyze
 * @param prompt - The analysis prompt
 * @returns Analysis text and image details
 */
export async function analyzeImage(
  file: File,
  prompt: string
): Promise<AnalyzeImageResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("prompt", prompt);

  const response = await fetch(`${API_BASE_URL}/analyze-image/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze image: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Download a generated image from the API
 * @param filename - The filename of the generated image
 * @returns Image blob
 */
export async function downloadGeneratedImage(filename: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/download/${filename}`);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Check API health and available models
 */
export async function checkAPIHealth(): Promise<{
  status: string;
  api_configured: boolean;
  models_available: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`API health check failed: ${response.statusText}`);
  }

  return response.json();
}
