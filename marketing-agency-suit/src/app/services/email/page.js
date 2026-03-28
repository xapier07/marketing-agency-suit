"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Mail, Copy, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmailService() {
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
    };

    try {
      const res = await fetch("/api/generate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Email Marketing Sequences</h1>
          <p className="text-gray-400">Generate high-converting 3-part email drips to monetize your list.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product / Brand Name</label>
              <input name="productName" required className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" placeholder="e.g. Lumina Skin" />
            </div>

            <button disabled={loading} type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              {loading ? "Generating Sequence..." : "Generate Email Sequence"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-emerald-400 font-medium animate-pulse">Structuring email drip...</p>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col">
              <div className="flex-grow p-5 bg-dark-900 border border-white/10 rounded-xl mb-4 overflow-y-auto whitespace-pre-wrap text-gray-300">
                {result.output_url}
              </div>
              <button onClick={copyToClipboard} className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-medium rounded-lg flex justify-center items-center gap-2 transition-colors relative overflow-hidden">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy to Clipboard"}
                {copied && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-emerald-500/20" />}
              </button>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your 3-part email sequence will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
