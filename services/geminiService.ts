// Service to communicate with Gemini AI directly from the frontend (Mocked for deployment without API Key)

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
 * Analyze region and suggest optimal green corridor placement (MOCKED)
 */
export async function analyzeRegionForGreenCorridor(
  centerLat: number,
  centerLng: number,
  activeLayers: string[],
  regionData: any
): Promise<GreenCorridorSuggestion> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    corridorPath: [
      [centerLat + 0.003, centerLng - 0.003],
      [centerLat + 0.001, centerLng - 0.001],
      [centerLat, centerLng],
      [centerLat - 0.002, centerLng + 0.002],
    ],
    corridorType: "branching text-green network",
    reasoning: "Mock Analysis: This AI-generated corridor connects existing green spaces while maximizing shade provision in high-heat areas. (Simulated response due to missing API key)",
    features: ["Shade trees", "Permeable pathways", "Native shrubs", "Bike lanes", "Solar lighting"],
  };
}

/**
 * Generate image and get both the image and analysis text using Gemini (MOCKED)
 */
export async function generateImageWithDetails(
  file: File,
  prompt: string
): Promise<GenerateImageResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const originalImageUrl = URL.createObjectURL(file);

  return {
    success: true,
    prompt: prompt,
    analysis: "Mock Analysis: The provided image has been processed to reflect urban greenery, renewable energy installations, and sustainable transit options based on your prompt. (Simulated response due to missing API key)",
    generated_image_url: originalImageUrl, // using original image as mock
    original_image: originalImageUrl,
  };
}

/**
 * Analyze an image using Gemini Vision (MOCKED)
 */
export async function analyzeImage(
  file: File,
  prompt: string
): Promise<AnalyzeImageResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    prompt: prompt,
    analysis: "Mock Vision Analysis: The selected area features a mix of residential and commercial structures with moderate potential for green roof integration and smart traffic routing. (Simulated response due to missing API key)",
  };
}
