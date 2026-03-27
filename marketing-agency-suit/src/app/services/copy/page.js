"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { PenTool, Copy, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CopyService() {
  const { activeProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.target);
    const data = {
      projectId: activeProject?.id,
      productName: formData.get("productName"),
      category: formData.get("category"),
      audience: formData.get("audience"),
    };

    try {
      const res = await fetch("/api/generate/copy", {
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

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.output_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <div className="p-3 bg-brand-500/20 text-brand-400 rounded-xl">
          <PenTool className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Marketing Copywriter</h1>
          <p className="text-gray-400">Generate high-converting ad copy, hooks, and headlines tailored to your audience.</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Category</label>
              <input name="category" required className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="e.g. Skincare & Beauty" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
              <input name="audience" required className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="e.g. Women 25-45 looking for anti-aging" />
            </div>

            <button disabled={loading} type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
              {loading ? "Generating Copy..." : "Generate Marketing Copy"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-brand-400 font-medium animate-pulse">Crafting perfect copy...</p>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col">
              <div className="flex-grow p-5 bg-dark-900 border border-white/10 rounded-xl mb-4 overflow-y-auto whitespace-pre-wrap text-gray-300">
                {result.output_url}
              </div>
              <button onClick={copyToClipboard} className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-medium rounded-lg flex justify-center items-center gap-2 transition-colors relative overflow-hidden">
                {copied ? <Check className="w-4 h-4 text-brand-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy to Clipboard"}
                {copied && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-brand-500/20" />}
              </button>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <PenTool className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your generated copy will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
