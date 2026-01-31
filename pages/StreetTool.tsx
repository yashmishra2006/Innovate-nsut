import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { generateImageWithDetails, analyzeImage } from '../services/geminiService';

const StreetTool: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [beforeImage, setBeforeImage] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuD2b85fZA5ZhSV6ALnmH30gWhXPINZbMos-K8l5CDdeWBVzy-Cen78tC8z0bldCnYH56qHqYRb2LpS054_J_1g2tf5VVmgsFBR_v3qHrftKh8Yp_2W1ZAwJeklFJV3VSNIK6MuigHWnd0ZRTRDA4HR6BdryKYeXPKLFfvKBKDXsNcoWxNpMBymVNu_Kh114iJOmuDDREOelF4Z_0UGUM0JLUOcC6g-vL-m5x2u8lVtvF0_7EpJxPbLzy3TbACE0n9R66E6f-sVxMg');
  const [afterImage, setAfterImage] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuCHMrif_FZz6MFxzgYOs8DkUKUMy1kgjRQlm0dsWSV2e3KvCAUsz8bwUcLu3V1swB9_heMVTDwKKosK57c4CdW-b9hO3CAQQ7N4AKl5GxC-d0baLGi--UG91c-w2zt6qfjZxsFhuyWgaopmRJCYHs0sRM7i0pyiYNK-SCJbfwSUa7JVoE64VQsX3KpJ8ssuwg62YOxCLtBlHYN-u1okLrP9vomNTnLpdg3QA4scmcKd-ibGfMELIKDv2XzlxpRFEDgbueLBqX9J7A');
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock Toggles state
  const [toggles, setToggles] = useState({
      trees: true,
      shade: false,
      greenBelt: true,
      cycleLane: true,
      vegetation: false,
      gardens: false
  });

  const handleToggle = (key: string) => {
      setToggles(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const buildPrompt = (): string => {
    const interventions: string[] = [];
    if (toggles.trees) interventions.push("add lush green trees throughout");
    if (toggles.shade) interventions.push("add shade canopy structures");
    if (toggles.greenBelt) interventions.push("add green belt landscaping");
    if (toggles.cycleLane) interventions.push("paint and add a dedicated cycle lane");
    if (toggles.vegetation) interventions.push("add dense vegetation and plants");
    if (toggles.gardens) interventions.push("add vertical gardens on buildings");
    
    const basePrompt = interventions.length > 0 
      ? `Transform this street scene to be more sustainable and green by: ${interventions.join(", ")}. Make it look professional and photorealistic.`
      : "Make this street more green and sustainable with trees, vegetation, and green spaces. Make it look professional and photorealistic.";
    
    return basePrompt;
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const generateTransformation = async (file: File) => {
    try {
      setError('');
      setIsGenerating(true);

      // Generate the after image using API
      const prompt = buildPrompt();
      const response = await generateImageWithDetails(file, prompt);

      if (response.success) {
        // Fetch the generated image to display it
        const imageBlob = await fetch(`http://34.131.185.69:8000/download/${response.generated_image_filename}`)
          .then(res => res.blob());
        
        const imageUrl = URL.createObjectURL(imageBlob);
        setAfterImage(imageUrl);
        setAnalysis(response.analysis);
        setShowResult(true);
      } else {
        setError(`Generation failed: ${response.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image. Make sure the API is accessible.');
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      
      // Read the before image for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBeforeImage(result);
      };
      reader.readAsDataURL(file);

      // Generate the transformation
      await generateTransformation(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
      console.error('Error processing file:', err);
    }
  };

  const handleGenerate = () => {
    // Only regenerate if a file is already uploaded
    if (!uploadedFile) {
      setError('Please upload an image first using the "Upload New" button.');
      return;
    }
    
    // Regenerate with current toggles
    generateTransformation(uploadedFile);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display">
      <Navbar />
      <main className="flex-grow flex flex-col items-center py-8 px-6 lg:px-12 w-full max-w-[1440px] mx-auto gap-8">
        
        <div className="w-full max-w-[1200px] flex flex-col gap-2">
           <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-main">Street Transformation Tool</h1>
           <p className="text-gray-500 dark:text-text-muted max-w-2xl font-body">Visualize urban sustainability improvements instantly. Upload a street photo and apply green interventions to see the potential impact.</p>
        </div>

        {error && (
          <div className="w-full max-w-[1200px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {isGenerating && (
          <div className="w-full max-w-[1200px] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 animate-spin">autorenew</span>
              <span className="font-bold text-blue-900 dark:text-blue-300">Processing your image with AI...</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">This usually takes 30-45 seconds</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row w-full max-w-[1200px] gap-6 items-start">
           {/* Visualizer */}
           <div className="flex-1 w-full flex flex-col gap-4">
              <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm group">
                 {isGenerating && (
                    <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <span className="material-symbols-outlined text-4xl animate-spin mb-2">autorenew</span>
                        <span className="font-bold">Generating AI Transformation...</span>
                    </div>
                 )}
                 <BeforeAfterSlider 
                    beforeImage={beforeImage}
                    afterImage={afterImage}
                    labelBefore="Before"
                    labelAfter="After"
                 />
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-xl border border-dashed border-[#cfe7d3] dark:border-[#2a4d31]">
                 <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 dark:text-text-muted">add_photo_alternate</span>
                    <span className="text-sm text-gray-600 dark:text-text-muted">Want to try another street?</span>
                 </div>
                 <button 
                   onClick={handleUploadClick}
                   className="text-sm font-bold text-primary hover:text-primary/80">
                   Upload New
                 </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {analysis && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-bold text-text-main mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                    AI Analysis
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis}</p>
                </div>
              )}
           </div>

           {/* Controls */}
           <div className="w-full lg:w-[400px] flex flex-col gap-6">
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7f3e9] dark:border-[#2a4d31] p-6 flex flex-col gap-6">
                 <div className="flex items-center justify-between pb-2 border-b border-[#e7f3e9] dark:border-[#2a4d31]">
                    <h2 className="text-xl font-bold text-text-main">Interventions</h2>
                    <span className="material-symbols-outlined text-gray-400 dark:text-text-muted">tune</span>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                    <Toggle label="Add Trees" icon="park" checked={toggles.trees} onChange={() => handleToggle('trees')} />
                    <Toggle label="Shade Canopy" icon="umbrella" checked={toggles.shade} onChange={() => handleToggle('shade')} />
                    <Toggle label="Green Belt" icon="forest" checked={toggles.greenBelt} onChange={() => handleToggle('greenBelt')} />
                    <Toggle label="Cycle Lane" icon="directions_bike" checked={toggles.cycleLane} onChange={() => handleToggle('cycleLane')} />
                    <Toggle label="Vegetation" icon="grass" checked={toggles.vegetation} onChange={() => handleToggle('vegetation')} />
                    <Toggle label="Vertical Gardens" icon="potted_plant" checked={toggles.gardens} onChange={() => handleToggle('gardens')} />
                 </div>

                 <div className="pt-4 border-t border-[#e7f3e9] dark:border-[#2a4d31]">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm text-text-main">Green Density</span>
                       <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">High</span>
                    </div>
                    <input type="range" className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" min="1" max="100" defaultValue="75" />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-text-muted mt-1">
                       <span>Sparse</span>
                       <span>Dense</span>
                    </div>
                 </div>

                 <button 
                    className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                 >
                    {isGenerating ? (
                        <>
                           <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Processing...
                        </>
                    ) : (
                        <>
                           <span className="material-symbols-outlined">auto_fix_high</span> Generate After Image
                        </>
                    )}
                 </button>
              </div>
           </div>
        </div>

        {/* Dashboard */}
        <div className="w-full max-w-[1200px] mt-4">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main">
              <span className="material-symbols-outlined text-primary">analytics</span> Projected Impact Metrics
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricBox icon="air" label="Air Quality Index" value={toggles.trees ? "+18%" : "+5%"} sub="Improved" subColor="text-green-600 bg-green-100" iconColor="text-blue-500 bg-blue-50" />
              <MetricBox icon="thermostat" label="Surface Temp" value={toggles.shade ? "-6°C" : "-2°C"} sub="Cooler" subColor="text-green-600 bg-green-100" iconColor="text-orange-500 bg-orange-50" />
              <MetricBox icon="emoji_nature" label="Biodiversity Score" value="8.5" sub="/ 10" subColor="text-gray-400" iconColor="text-purple-500 bg-purple-50" />
              <MetricBox icon="directions_walk" label="Walkability" value="High" sub="Safe" subColor="text-green-600 bg-green-100" iconColor="text-yellow-600 bg-yellow-50" />
           </div>
        </div>

      </main>
    </div>
  );
};

const Toggle = ({ label, icon, checked, onChange }: any) => (
   <label className="flex items-center justify-between p-3 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer group select-none">
      <div className="flex items-center gap-3">
         <span className="material-symbols-outlined text-gray-500 dark:text-text-muted group-hover:text-primary transition-colors">{icon}</span>
         <span className="font-medium text-text-main">{label}</span>
      </div>
      <div className="relative inline-flex items-center cursor-pointer">
         <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
         <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </div>
   </label>
);

const MetricBox = ({ icon, label, value, sub, subColor, iconColor }: any) => (
   <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#e7f3e9] dark:border-[#2a4d31] shadow-sm flex flex-col items-start gap-2 hover:border-primary/50 dark:hover:border-primary/30 transition-colors">
      <div className={`${iconColor} dark:bg-opacity-20 p-2 rounded-lg mb-1`}>
         <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-sm text-gray-500 dark:text-text-muted font-body">{label}</span>
      <div className="flex items-baseline gap-2">
         <span className="text-2xl font-bold text-text-main transition-all duration-300">{value}</span>
         <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${subColor} dark:bg-opacity-30`}>{sub}</span>
      </div>
   </div>
);

export default StreetTool;
