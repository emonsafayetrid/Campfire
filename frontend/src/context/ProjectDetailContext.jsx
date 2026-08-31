import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { getProjectById, getProjectMembers } from "../api/projects";
import { getTasks } from "../api/tasks";
import { useAuth } from "./AuthContext";

const ProjectDetailContext = createContext(null);

export const ProjectDetailProvider = ({ children }) => {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const myMembership = members.find(
    (m) => m.user?._id === user?._id
  );
  const role = myMembership?.role || null;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [projectRes, membersRes, tasksRes] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId),
        getTasks(projectId),
      ]);
      setProject(projectRes.data.data);
      setMembers(membersRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshTasks = useCallback(async () => {
    const res = await getTasks(projectId);
    setTasks(res.data.data || []);
  }, [projectId]);

  const refreshMembers = useCallback(async () => {
    const res = await getProjectMembers(projectId);
    setMembers(res.data.data || []);
  }, [projectId]);

  const updateTaskLocal = (taskId, patch) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, ...patch } : t))
    );
  };

  const removeTaskLocal = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const addTaskLocal = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  return (
    <ProjectDetailContext.Provider
      value={{
        projectId,
        project,
        setProject,
        members,
        tasks,
        loading,
        notFound,
        role,
        isAdmin: role === "admin",
        isProjectAdmin: role === "admin" || role === "project_admin",
        loadAll,
        refreshTasks,
        refreshMembers,
        updateTaskLocal,
        removeTaskLocal,
        addTaskLocal,
      }}
    >
      {children}
    </ProjectDetailContext.Provider>
  );
};

export const useProjectDetail = () => {
  const ctx = useContext(ProjectDetailContext);
  if (!ctx)
    throw new Error(
      "useProjectDetail must be used within ProjectDetailProvider"
    );
  return ctx;
};
