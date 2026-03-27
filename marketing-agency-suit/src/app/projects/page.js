"use client";

import { useProject } from "@/context/ProjectContext";
import { CheckCircle, FolderOpen, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { projects, activeProject, setActiveProject, loading } = useProject();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSelect = (project) => {
    setActiveProject(project);
    router.push("/dashboard");
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Select a project to access AI tools.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, idx) => {
          const isActive = activeProject?.id === project.id;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelect(project)}
              className={`flex items-center justify-between p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                isActive 
                  ? "bg-brand-500/10 border-brand-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                  : "glass border-transparent hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isActive ? "bg-brand-500/20 text-brand-400" : "bg-dark-800 text-gray-400"}`}>
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{project.business_name}</h3>
                  <p className="text-sm text-gray-400">Created: {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {isActive && (
                <div className="flex items-center text-brand-400 gap-2">
                  <span className="text-sm font-medium">Active</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
