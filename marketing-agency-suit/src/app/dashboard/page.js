"use client";

import Link from "next/link";
import { useProject } from "@/context/ProjectContext";
import CardService from "@/components/CardService";
import { 
  Image as ImageIcon, 
  Video, 
  PenTool, 
  FileText, 
  List, 
  Mic 
} from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  {
    id: "image",
    title: "Product Image Studio",
    description: "Generate stunning product lifestyle images, studio shots, and ad banners.",
    icon: ImageIcon,
    href: "/services/image",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "video",
    title: "UGC/Studio Video Generator",
    description: "Create engaging 15-60s promotional videos and UGC content automatically.",
    icon: Video,
    href: "/services/video",
    color: "from-purple-500 to-pink-400",
  },
  {
    id: "copy",
    title: "Marketing Copywriter",
    description: "Generate high-converting ad copy, hooks, and headlines tailored to your audience.",
    icon: PenTool,
    href: "/services/copy",
    color: "from-brand-500 to-emerald-400",
  },
  {
    id: "blog",
    title: "SEO & Blog Engine",
    description: "Produce SEO-optimized long-form blog articles to drive organic traffic.",
    icon: FileText,
    href: "/services/blog",
    color: "from-orange-500 to-amber-400",
  },
  {
    id: "description",
    title: "Product Description Gen",
    description: "Write compelling product features, benefits, and bullet points instantly.",
    icon: List,
    href: "/services/description",
    color: "from-red-500 to-rose-400",
  },
  {
    id: "script",
    title: "UGC Script Generator",
    description: "Get structured UGC video scripts with hooks, talking points, and CTAs.",
    icon: Mic,
    href: "/services/script",
    color: "from-indigo-500 to-blue-400",
  },
];

export default function Dashboard() {
  const { activeProject, loading } = useProject();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No Active Project</h2>
        <p className="text-gray-400 mb-8">Please select or create a project to continue.</p>
        <Link href="/projects" className="px-6 py-3 bg-brand-600 rounded-lg font-medium hover:bg-brand-500 transition-colors">
          View Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Managing AI creation for <span className="text-brand-400 font-semibold">{activeProject.business_name}</span>
          </p>
        </div>
        <Link 
          href="/projects" 
          className="text-sm bg-dark-800 border border-white/10 hover:bg-dark-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
        >
          Switch Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CardService service={service} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
