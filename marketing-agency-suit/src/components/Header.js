"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hexagon, LayoutDashboard } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <Hexagon className="w-5 h-5 absolute" />
              <div className="w-2 h-2 bg-white rounded-full relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
              Quadri<span className="font-light">Labs</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-brand-400" : "text-gray-400 hover:text-white"}`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors ${pathname.includes("/dashboard") ? "text-brand-400" : "text-gray-400 hover:text-white"}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/projects" 
              className={`text-sm font-medium transition-colors ${pathname.includes("/projects") ? "text-brand-400" : "text-gray-400 hover:text-white"}`}
            >
              Projects
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Demo Dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
