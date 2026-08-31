import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getProjects } from "../api/projects";
import { useAuth } from "./AuthContext";

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [isAuthenticated, refresh]);

  const upsertProject = (project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p._id === project._id);
      if (exists) {
        return prev.map((p) => (p._id === project._id ? { ...p, ...project } : p));
      }
      return [{ ...project, memberCount: 1, role: "admin" }, ...prev];
    });
  };

  const removeProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
  };

  return (
    <ProjectsContext.Provider
      value={{ projects, loading, refresh, upsertProject, removeProject }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
};
