"use client";

import { useState, useRef, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { Video, Download, Loader2, Upload, X, Sparkles, Check, Play } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_STYLES = [
  { id: "cinematic", label: "Cinematic Reveal", emoji: "🎬", desc: "Dramatic slow orbit, epic lighting" },
  { id: "ugc", label: "UGC Creator", emoji: "📱", desc: "Authentic, handheld TikTok feel" },
  { id: "social_ad", label: "Social Media Ad", emoji: "⚡", desc: "Fast, bold, high energy" },
  { id: "lifestyle", label: "Lifestyle / Ambient", emoji: "🌊", desc: "Slow motion, dreamy, aspirational" },
  { id: "product_demo", label: "Product Close-Up", emoji: "🔬", desc: "Detailed angles, feature showcase" },
];

const ASPECT_RATIOS = [
  { id: "9:16", label: "9:16", desc: "Vertical", icon: "📱", sub: "TikTok / Reels" },
  { id: "16:9", label: "16:9", desc: "Horizontal", icon: "🖥️", sub: "YouTube / Web" },
  { id: "1:1", label: "1:1", desc: "Square", icon: "▪️", sub: "Instagram" },
];

const DURATION_OPTIONS = [
  { id: "5", label: "5 sec", desc: "Quick Hook", icon: "⚡" },
  { id: "10", label: "10 sec", desc: "Full Ad", icon: "🎥" },
];

export default function VideoService() {
  const { activeProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingStage, setLoadingStage] = useState("");

  // Form state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [selectedDuration, setSelectedDuration] = useState("5");
  const [creativePrompt, setCreativePrompt] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const loadingStages = [
    "Analyzing product composition...",
    "Building 3D motion path...",
    "Generating cinematic camera movement...",
    "Rendering lighting transitions...",
    "Computing temporal coherence...",
    "Applying motion smoothing...",
    "Encoding final video...",
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
    setResult(null);

    let stageIndex = 0;
    setLoadingStage(loadingStages[0]);
    const stageInterval = setInterval(() => {
      stageIndex = (stageIndex + 1) % loadingStages.length;
      setLoadingStage(loadingStages[stageIndex]);
    }, 3000);

    try {
      const base64 = imagePreview.split(",")[1];

      const data = {
        projectId: activeProject?.id,
        imageBase64: base64,
        imageMimeType: uploadedImage.type,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        duration: selectedDuration,
        creativePrompt: creativePrompt,
      };

      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
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
        <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-400 rounded-2xl border border-purple-500/20">
          <Video className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Video Production Studio</h1>
          <p className="text-gray-400 mt-1">Upload your product photo → Choose a style → Get cinematic, production-ready video.</p>
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
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold">1</span>
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
                    ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <motion.div animate={{ y: isDragOver ? -5 : 0 }} transition={{ type: "spring" }}>
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? "text-purple-400" : "text-gray-500"}`} />
                  <p className="text-gray-300 font-medium text-lg">Drag & drop your product photo</p>
                  <p className="text-gray-500 text-sm mt-2">The AI will animate your product into a video</p>
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

          {/* STEP 2: Video Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold">2</span>
              <h2 className="text-lg font-semibold text-white">Choose Video Style</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VIDEO_STYLES.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedStyle === s.id
                      ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                      : "border-white/5 bg-dark-800/40 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                  {selectedStyle === s.id && (
                    <motion.div
                      layoutId="videoStyleCheck"
                      className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* STEP 3: Duration + Aspect Ratio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold">3</span>
              <h2 className="text-lg font-semibold text-white">Duration & Format</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Duration */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Video Duration</p>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <motion.button
                      key={d.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDuration(d.id)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
                        selectedDuration === d.id
                          ? "border-purple-500 bg-purple-500/15"
                          : "border-white/5 bg-dark-800/40 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg mb-1">{d.icon}</div>
                      <p className="text-sm font-bold text-white">{d.label}</p>
                      <p className="text-[10px] text-gray-500">{d.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

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
                          ? "border-purple-500 bg-purple-500/15"
                          : "border-white/5 bg-dark-800/40 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg mb-1">{r.icon}</div>
                      <p className="text-xs font-bold text-white">{r.label}</p>
                      <p className="text-[10px] text-gray-500">{r.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 4: Creative Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold">4</span>
              <h2 className="text-lg font-semibold text-white">Creative Direction</h2>
              <span className="text-xs text-gray-500 ml-auto">Optional</span>
            </div>

            <textarea
              value={creativePrompt}
              onChange={(e) => setCreativePrompt(e.target.value)}
              rows={3}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-colors resize-none text-sm"
              placeholder="e.g. 'Camera slowly orbits around the product while lights shift from cool blue to warm gold' or 'Product floats and rotates with particles in background'..."
            />
          </motion.div>

          {/* GENERATE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !uploadedImage}
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-2xl flex justify-center items-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            {loading ? "Rendering Video..." : "Generate Production Video"}
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
                  {/* Cinematic loading animation */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/30 overflow-hidden">
                      {imagePreview && (
                        <img src={imagePreview} alt="Processing" className="w-full h-full object-contain opacity-30 p-4" />
                      )}
                      {/* Film strip effect */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-pink-400 to-transparent"
                        animate={{ left: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    {/* Orbiting ring */}
                    <motion.div
                      className="absolute -inset-4 border-2 border-dashed border-purple-500/20 rounded-3xl"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute -inset-8 border border-dashed border-pink-500/10 rounded-[2rem]"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <motion.p
                    key={loadingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-purple-400 font-medium text-sm"
                  >
                    {loadingStage}
                  </motion.p>
                  <p className="text-gray-600 text-xs mt-2">Video generation takes 30-90 seconds...</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <p className="text-sm text-gray-400 text-center mb-4">✨ Video generated successfully</p>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black mb-4">
                    <video
                      src={result.output_url}
                      controls
                      autoPlay
                      loop
                      className="w-full aspect-video object-contain"
                    />
                  </div>
                  <a
                    href={result.output_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Video
                  </a>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-gray-500 text-sm">Your AI-generated video will appear here</p>
                  <p className="text-gray-700 text-xs mt-2">Upload a product photo and hit generate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
