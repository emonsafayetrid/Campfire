import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Plus, ListTodo } from "lucide-react";
import {
  ProjectDetailProvider,
  useProjectDetail,
} from "../context/ProjectDetailContext";
import { colorForString } from "../lib/utils";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import TaskBoard from "../components/TaskBoard";
import NewTaskModal from "../components/NewTaskModal";
import TaskDrawer from "../components/TaskDrawer";
import MembersPanel from "../components/MembersPanel";
import ProjectSettingsPanel from "../components/ProjectSettingsPanel";

function ProjectPageInner() {
  const { project, tasks, loading, notFound, isProjectAdmin } =
    useProjectDetail();
  const [showNewTask, setShowNewTask] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={26} />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-lg px-8 py-16">
        <EmptyState
          icon={ListTodo}
          title="Project not found"
          description="It may have been deleted, or you may not have access to it."
          action={
            <button className="btn-dark" onClick={() => navigate("/")}>
              Back to projects
            </button>
          }
        />
      </div>
    );
  }

  const color = colorForString(project.name);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b-2 border-ink bg-white px-8 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink ${color.bg}`}
            >
              <span className="font-display text-lg font-bold">
                {project.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 max-w-xl text-sm text-ink/50">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {isProjectAdmin && (
            <button
              className="btn-primary shrink-0"
              onClick={() => setShowNewTask(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              New task
            </button>
          )}
        </div>

        <nav className="mt-6 flex gap-1">
          {[
            { to: "", label: "Board", end: true },
            { to: "members", label: "Members" },
            ...(isProjectAdmin
              ? [{ to: "settings", label: "Settings" }]
              : []),
          ].map((tab) => (
            <NavLink
              key={tab.to || "board"}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-t-lg border-2 border-b-0 px-4 py-2 text-sm font-display font-semibold transition-colors ${
                  isActive
                    ? "border-ink bg-paper text-ink"
                    : "border-transparent text-ink/45 hover:text-ink/70"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route
            index
            element={
              <div className="px-8 py-7">
                {tasks.length === 0 ? (
                  <EmptyState
                    icon={ListTodo}
                    title="No tasks yet"
                    description={
                      isProjectAdmin
                        ? "Add the first task to get this project moving."
                        : "Nothing has been assigned here yet."
                    }
                    action={
                      isProjectAdmin && (
                        <button
                          className="btn-primary"
                          onClick={() => setShowNewTask(true)}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          Add a task
                        </button>
                      )
                    }
                  />
                ) : (
                  <TaskBoard tasks={tasks} onTaskClick={setActiveTaskId} />
                )}
              </div>
            }
          />
          <Route path="members" element={<MembersPanel />} />
          {isProjectAdmin && (
            <Route path="settings" element={<ProjectSettingsPanel />} />
          )}
        </Routes>
      </div>

      <NewTaskModal open={showNewTask} onClose={() => setShowNewTask(false)} />

      {activeTaskId && (
        <TaskDrawer
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
        />
      )}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <ProjectDetailProvider>
      <ProjectPageInner />
    </ProjectDetailProvider>
  );
}
