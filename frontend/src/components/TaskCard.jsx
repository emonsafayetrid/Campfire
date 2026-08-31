import { Paperclip } from "lucide-react";
import Avatar from "./Avatar";

export default function TaskCard({ task, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card card-hover w-full p-3.5 text-left"
    >
      <p className="text-sm font-semibold leading-snug line-clamp-2">
        {task.title}
      </p>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-ink/45">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-ink/40">
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium">
              <Paperclip size={12} />
              {task.attachments.length}
            </span>
          )}
        </div>
        {task.assignedTo && (
          <Avatar user={task.assignedTo} size="xs" />
        )}
      </div>
    </button>
  );
}
