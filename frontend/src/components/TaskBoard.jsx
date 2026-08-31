import { STATUS_META, STATUS_OPTIONS } from "../lib/utils";
import TaskCard from "./TaskCard";

export default function TaskBoard({ tasks, onTaskClick }) {
  const grouped = STATUS_OPTIONS.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {grouped.map(({ status, items }) => {
        const meta = STATUS_META[status];
        return (
          <div key={status} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`chip-dot ${meta.dot}`} />
              <h3 className="text-sm font-display font-bold uppercase tracking-wide text-ink/70">
                {meta.label}
              </h3>
              <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/40">
                {items.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 rounded-camp border-2 border-dashed border-ink/15 bg-ink/[0.02] p-2.5 min-h-[120px]">
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-ink/30">
                  Nothing here yet
                </p>
              )}
              {items.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => onTaskClick(task._id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
