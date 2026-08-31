import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Flame,
  Plus,
  LayoutGrid,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";
import { useToast } from "../context/ToastContext";
import Avatar from "./Avatar";
import NewProjectModal from "./NewProjectModal";
import { colorForString } from "../lib/utils";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { projects, loading } = useProjects();
  const [showNewProject, setShowNewProject] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out — see you soon!");
      navigate("/login");
    } catch {
      toast.error("Couldn't log out cleanly, but your session was cleared.");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r-2 border-ink bg-white">
        <div className="flex items-center gap-2.5 border-b-2 border-ink px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-campyellow shadow-campsm">
            <Flame size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold">Campfire</span>
        </div>

        <div className="px-4 pt-4">
          <button
            className="btn-primary w-full"
            onClick={() => setShowNewProject(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            New project
          </button>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto px-3 py-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-ink text-paper"
                  : "text-ink/70 hover:bg-ink/5"
              }`
            }
          >
            <LayoutGrid size={16} />
            All projects
          </NavLink>

          <p className="mt-4 mb-1.5 px-3 text-[11px] font-display font-bold uppercase tracking-wider text-ink/35">
            Your projects
          </p>

          {loading && (
            <div className="space-y-2 px-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-ink/5"
                />
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <p className="px-3 text-xs text-ink/40">
              No projects yet. Create your first one above.
            </p>
          )}

          <div className="space-y-0.5">
            {projects.map((project) => {
              const color = colorForString(project.name);
              return (
                <NavLink
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-ink text-paper"
                        : "text-ink/75 hover:bg-ink/5"
                    }`
                  }
                >
                  <span className={`chip-dot ${color.dot}`} />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t-2 border-ink p-3">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-ink/5"
          >
            <Avatar user={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-ink/45">
                @{user?.username}
              </p>
            </div>
            <ChevronDown
              size={15}
              className={`shrink-0 text-ink/40 transition-transform ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-[calc(100%+6px)] left-3 right-3 z-20 overflow-hidden rounded-xl border-2 border-ink bg-white shadow-camp animate-pop">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/account");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium hover:bg-ink/5"
              >
                <Settings size={15} />
                Account settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-ink/10 px-3.5 py-2.5 text-sm font-medium text-camppink hover:bg-camppink/10"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
      />
    </div>
  );
}
