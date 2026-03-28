"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-8"
      >
        <Sparkles className="w-4 h-4" />
        <span>Final Boss Level Now Live</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
      >
        AI Content Platform <br />
        for <span className="text-gradient">E-Commerce</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10"
      >
        Generate product images, UGC videos, marketing copy, and SEO blogs instantly. Scale your e-commerce brand with the power of QuadriLabs AI.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        <Link 
          href="/dashboard" 
          className="group flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-1"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          href="https://github.com" 
          target="_blank"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1"
        >
          View Documentation
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl"
      >
        {[
          { icon: Layers, title: "8 AI Services", desc: "Images, Videos, Copy, Blogs, Social, Emails, and more." },
          { icon: Zap, title: "Lightning Fast", desc: "Async webhooks and powerful servers for quick generations." },
          { icon: Sparkles, title: "Ready for Scale", desc: "Built to scale with multi-tenant SaaS features coming soon." }
        ].map((feature, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
