import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CardService({ service }) {
  const { title, description, icon: Icon, href, color } = service;

  return (
    <Link 
      href={href}
      className="group block relative glass-card p-6 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      {/* Background glow effect on hover */}
      <div className={`absolute -inset-2 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-3xl z-0`} />
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${color} bg-opacity-10 text-white shadow-lg`}>
          <Icon className="w-6 h-6 drop-shadow-md" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-brand-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-6 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
          Open Service 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
