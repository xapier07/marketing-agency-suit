"use client";

import { useState, useRef, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { Image as ImageIcon, Download, Loader2, Upload, X, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const VISUAL_STYLES = [
  { id: "studio", label: "Minimalist Studio", emoji: "🎨", desc: "Clean, professional studio lighting" },
  { id: "lifestyle", label: "Lifestyle Scene", emoji: "🌿", desc: "Natural, real-world environments" },
  { id: "3d_render", label: "3D Product Render", emoji: "💎", desc: "Glossy, hyper-realistic 3D look" },
  { id: "luxury", label: "Luxury & Premium", emoji: "✨", desc: "Marble, gold, high-end aesthetics" },
  { id: "outdoor", label: "Outdoor Adventure", emoji: "🏔️", desc: "Nature, beach, tropical vibes" },
  { id: "neon", label: "Cyberpunk Neon", emoji: "🌃", desc: "Futuristic, vibrant glow effects" },
];

const ASPECT_RATIOS = [
  { id: "square_hd", label: "1:1", desc: "Square", icon: "▪️" },
  { id: "portrait_16_9", label: "9:16", desc: "Vertical", icon: "📱" },
  { id: "landscape_16_9", label: "16:9", desc: "Landscape", icon: "🖥️" },
];

const VARIATION_OPTIONS = [
  { id: 1, label: "1 Concept", desc: "Fast & focused" },
  { id: 4, label: "4 Concepts", desc: "Explore options" },
];

export default function ImageService() {
  const { activeProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingStage, setLoadingStage] = useState("");

  // Form state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("studio");
  const [selectedRatio, setSelectedRatio] = useState("square_hd");
  const [numVariations, setNumVariations] = useState(1);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Loading stage animation
  const loadingStages = [
    "Analyzing product textures...",
    "Removing background...",
    "Constructing 3D lighting map...",
    "Applying studio environment...",
    "Rendering final composition...",
    "Enhancing resolution...",
  ];

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!uploadedImage) {
      alert("Please upload a product photo first.");
      return;
    }

    setLoading(true);
    setResults(null);

    // Animate loading stages
    let stageIndex = 0;
    setLoadingStage(loadingStages[0]);
    const stageInterval = setInterval(() => {
      stageIndex = (stageIndex + 1) % loadingStages.length;
      setLoadingStage(loadingStages[stageIndex]);
    }, 2500);

    try {
      // Convert image to base64
      const base64 = imagePreview.split(",")[1];

      const data = {
        projectId: activeProject?.id,
        imageBase64: base64,
        imageMimeType: uploadedImage.type,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        numVariations: numVariations,
        additionalContext: additionalContext,
      };

      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      } else {
        alert("Generation failed: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      clearInterval(stageInterval);
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleDownload = async (url, i) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `product_image_${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image", error);
      window.open(url, "_blank"); // Fallback to opening in new tab
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-10"
      >
        <div className="p-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-blue-400 rounded-2xl border border-blue-500/20">
          <ImageIcon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Product Image Studio</h1>
          <p className="text-gray-400 mt-1">Upload your product → Choose a vibe → Get stunning, production-ready images.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* LEFT: Controls (3 cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* STEP 1: Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold">1</span>
              <h2 className="text-lg font-semibold text-white">Upload Product Photo</h2>
            </div>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-brand-500 bg-brand-500/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <motion.div animate={{ y: isDragOver ? -5 : 0 }} transition={{ type: "spring" }}>
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? "text-brand-400" : "text-gray-500"}`} />
                  <p className="text-gray-300 font-medium text-lg">Drag & drop your product photo</p>
                  <p className="text-gray-500 text-sm mt-2">or click to browse • PNG, JPG up to 10MB</p>
                </motion.div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-dark-900">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-56 object-contain bg-dark-900 p-4"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {uploadedImage.name} ({(uploadedImage.size / 1024 / 1024).toFixed(1)}MB)
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* STEP 2: Visual Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold">2</span>
              <h2 className="text-lg font-semibold text-white">Choose Visual Style</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VISUAL_STYLES.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedStyle === s.id
                      ? "border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10"
                      : "border-white/5 bg-dark-800/40 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                  {selectedStyle === s.id && (
                    <motion.div
                      layoutId="styleCheck"
                      className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* STEP 3: Aspect Ratio + Variations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold">3</span>
              <h2 className="text-lg font-semibold text-white">Dimensions & Variations</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Aspect Ratio */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Aspect Ratio</p>
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map((r) => (
                    <motion.button
                      key={r.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRatio(r.id)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
                        selectedRatio === r.id
                          ? "border-brand-500 bg-brand-500/15"
                          : "border-white/5 bg-dark-800/40 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg mb-1">{r.icon}</div>
                      <p className="text-xs font-bold text-white">{r.label}</p>
                      <p className="text-[10px] text-gray-500">{r.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Variations */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Number of Concepts</p>
                <div className="flex gap-2">
                  {VARIATION_OPTIONS.map((v) => (
                    <motion.button
                      key={v.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setNumVariations(v.id)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
                        numVariations === v.id
                          ? "border-brand-500 bg-brand-500/15"
                          : "border-white/5 bg-dark-800/40 hover:border-white/20"
                      }`}
                    >
                      <p className="text-sm font-bold text-white">{v.label}</p>
                      <p className="text-[10px] text-gray-500">{v.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 4: Additional Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold">4</span>
              <h2 className="text-lg font-semibold text-white">Additional Context</h2>
              <span className="text-xs text-gray-500 ml-auto">Optional</span>
            </div>

            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-brand-500 outline-none transition-colors resize-none text-sm"
              placeholder="e.g. 'Place on a marble counter with morning sunlight' or 'Tropical beach in the background with soft shadows'..."
            />
          </motion.div>

          {/* GENERATE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !uploadedImage}
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-lg rounded-2xl flex justify-center items-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            {loading ? "Generating..." : "Generate Production Images"}
          </motion.button>
        </div>

        {/* RIGHT: Results Panel (2 cols) */}
        <div className="xl:col-span-2">
          <div className="glass-card rounded-2xl p-6 min-h-[600px] flex flex-col items-center justify-center sticky top-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center w-full"
                >
                  {/* Scanning animation */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-2xl border-2 border-brand-500/30 overflow-hidden">
                      {imagePreview && (
                        <img src={imagePreview} alt="Processing" className="w-full h-full object-contain opacity-30 p-4" />
                      )}
                      {/* Scan line */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute -inset-4 border-2 border-dashed border-brand-500/20 rounded-3xl"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <motion.p
                    key={loadingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-brand-400 font-medium text-sm"
                  >
                    {loadingStage}
                  </motion.p>
                  <p className="text-gray-600 text-xs mt-2">This may take 15-30 seconds...</p>
                </motion.div>
              ) : results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full space-y-4"
                >
                  <p className="text-sm text-gray-400 text-center mb-4">
                    ✨ {results.variants?.length || 1} concept{(results.variants?.length || 1) > 1 ? "s" : ""} generated
                  </p>
                  <div className={`grid gap-4 ${results.variants?.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {(results.variants || [results.output_url]).map((url, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="group relative"
                      >
                        <div className="relative rounded-xl overflow-hidden border border-white/10 hover:border-brand-500/30 transition-all">
                          <img
                            src={url}
                            alt={`Generated ${i + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                            <button
                              onClick={() => handleDownload(url, i)}
                              className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-gray-500 text-sm">Your AI-generated images will appear here</p>
                  <p className="text-gray-700 text-xs mt-2">Upload a photo and hit generate to start</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
