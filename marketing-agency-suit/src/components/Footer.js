import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-dark-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-brand-500" />
            <span className="text-lg font-bold text-white tracking-tight">Quadri<span className="font-light">Labs</span></span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full border border-brand-500/20">Phase 1 Demo</span>
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-white transition-colors">Phase 2 Specs</Link>
          </div>
          
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} QuadriLabs AI. Setup for Demo.
          </p>
        </div>
      </div>
    </footer>
  );
}
