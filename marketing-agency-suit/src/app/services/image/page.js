"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Image as ImageIcon, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ImageService() {
  const { activeProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.target);
    const data = {
      projectId: activeProject?.id,
      productName: formData.get("productName"),
      category: formData.get("category"),
      style: formData.get("style"),
      prompt: formData.get("prompt"),
    };

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Product Image Studio</h1>
          <p className="text-gray-400">Generate stunning product lifestyle images, studio shots, and ad banners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
              <input name="productName" required className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="e.g. Lumina Glow Serum" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <input name="category" required className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="e.g. Skincare" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Visual Style</label>
              <select name="style" className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors">
                <option value="studio">Studio & Portrait</option>
                <option value="lifestyle">Lifestyle / UGC</option>
                <option value="ad">Ad Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Additional Context (Optional)</label>
              <textarea name="prompt" rows={3} className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="Describe the background or specific elements..." />
            </div>

            <button disabled={loading} type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {loading ? "Generating..." : "Generate Images"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center">
              <div className="w-16 h-16 relative mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-blue-400 animate-spin duration-700" />
              </div>
              <p className="text-brand-400 font-medium animate-pulse">Running Antigravity Gen Workflow...</p>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 border border-white/10">
                <img src={result.output_url} alt="Generated" className="object-cover w-full h-full" />
              </div>
              <a href={result.output_url} download target="_blank" className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-medium rounded-lg flex justify-center items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> Download High-Res
              </a>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your generated images will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
