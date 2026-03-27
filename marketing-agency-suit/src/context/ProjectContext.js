"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ProjectContext = createContext(null);

const PLACEHOLDER_PROJECTS = [
  { id: "proj_1", business_name: "Lumina Skincare", created_at: new Date().toISOString() },
  { id: "proj_2", business_name: "Apex Athletics", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "proj_3", business_name: "Nova Electronics API", created_at: new Date(Date.now() - 172800000).toISOString() },
];

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching projects from DB
    setTimeout(() => {
      setProjects(PLACEHOLDER_PROJECTS);
      setActiveProject(PLACEHOLDER_PROJECTS[0]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, activeProject, setActiveProject, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
