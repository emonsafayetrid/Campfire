import { useState } from "react";
import { Plus, Compass } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import EmptyState from "../components/EmptyState";
import NewProjectModal from "../components/NewProjectModal";

export default function DashboardPage() {
  const { projects, loading } = useProjects();
  const { user } = useAuth();
  const [showNewProject, setShowNewProject] = useState(false);

  const firstName = user?.fullName?.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Hey {firstName}
            <span className="text-campyellow">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink/55">
            Here's everything you're a part of.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewProject(true)}>
          <Plus size={16} strokeWidth={2.5} />
          New project
        </button>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-camp border-2 border-ink/10 bg-white"
              />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <EmptyState
            icon={Compass}
            title="No projects yet"
            description="Start a new project to bring your team and tasks together in one place."
            action={
              <button className="btn-primary" onClick={() => setShowNewProject(true)}>
                <Plus size={16} strokeWidth={2.5} />
                Create your first project
              </button>
            }
          />
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
      />
    </div>
  );
}
