import { Link } from "react-router-dom";
import { Users, ArrowUpRight } from "lucide-react";
import { colorForString, ROLES } from "../lib/utils";

export default function ProjectCard({ project }) {
  const color = colorForString(project.name);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card card-hover group flex flex-col p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink ${color.bg}`}
        >
          <span className="font-display text-lg font-bold">
            {project.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <ArrowUpRight
          size={18}
          className="text-ink/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
        />
      </div>

      <h3 className="mt-4 line-clamp-1 text-base font-bold">
        {project.name}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink/50">
        {project.description || "No description yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="badge">
          <Users size={12} />
          {project.memberCount ?? 1}{" "}
          {project.memberCount === 1 ? "member" : "members"}
        </span>
        {project.role && (
          <span className="text-xs font-semibold text-ink/40">
            {ROLES[project.role] || project.role}
          </span>
        )}
      </div>
    </Link>
  );
}
