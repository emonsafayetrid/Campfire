import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trash2,
  Plus,
  Paperclip,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../api/tasks";
import { useProjectDetail } from "../context/ProjectDetailContext";
import { useToast } from "../context/ToastContext";
import {
  extractErrorMessage,
  STATUS_META,
  STATUS_OPTIONS,
  bytesToSize,
  formatRelative,
} from "../lib/utils";
import Avatar from "./Avatar";
import Spinner from "./Spinner";
import ConfirmDialog from "./ConfirmDialog";

export default function TaskDrawer({ taskId, onClose }) {
  const {
    projectId,
    members,
    isProjectAdmin,
    updateTaskLocal,
    removeTaskLocal,
  } = useProjectDetail();
  const toast = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    getTaskById(projectId, taskId)
      .then((res) => setTask(res.data.data))
      .catch(() => toast.error("Couldn't load this task"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const patchTask = async (patch) => {
    setSaving(true);
    try {
      const res = await updateTask(projectId, taskId, patch);
      setTask((t) => ({ ...t, ...res.data.data }));
      updateTaskLocal(taskId, res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save that change"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("attachments", f));
      const res = await updateTask(projectId, taskId, formData);
      setTask((t) => ({ ...t, ...res.data.data }));
      updateTaskLocal(taskId, res.data.data);
      toast.success("Attachment added");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try {
      await deleteTask(projectId, taskId);
      removeTaskLocal(taskId);
      toast.success("Task deleted");
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete the task"));
      setDeleting(false);
    }
  };

  const addSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    try {
      const res = await createSubTask(projectId, taskId, newSubtask.trim());
      setTask((t) => ({
        ...t,
        subtasks: [...(t.subtasks || []), res.data.data],
      }));
      setNewSubtask("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't add the subtask"));
    } finally {
      setAddingSubtask(false);
    }
  };

  const toggleSubtask = async (subTaskId, isCompleted) => {
    setTask((t) => ({
      ...t,
      subtasks: t.subtasks.map((s) =>
        s._id === subTaskId ? { ...s, isCompleted } : s
      ),
    }));
    try {
      await updateSubTask(projectId, taskId, subTaskId, { isCompleted });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update the subtask"));
      load();
    }
  };

  const removeSubtask = async (subTaskId) => {
    setTask((t) => ({
      ...t,
      subtasks: t.subtasks.filter((s) => s._id !== subTaskId),
    }));
    try {
      await deleteSubTask(projectId, taskId, subTaskId);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove the subtask"));
      load();
    }
  };

  const canEdit = isProjectAdmin;
  const doneCount = task?.subtasks?.filter((s) => s.isCompleted).length || 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l-2 border-ink bg-paper shadow-camp animate-slide-in">
        <div className="flex items-center justify-between border-b-2 border-ink px-6 py-4">
          <div className="flex items-center gap-2">
            {saving && <Spinner size={14} className="text-ink/40" />}
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">
              Task
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="icon-btn text-camppink hover:bg-camppink/10"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="icon-btn" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size={26} />
          </div>
        )}

        {!loading && task && (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {canEdit ? (
              <textarea
                className="w-full resize-none border-none bg-transparent p-0 font-display text-xl font-bold leading-snug focus:outline-none"
                rows={2}
                value={task.title}
                onChange={(e) =>
                  setTask((t) => ({ ...t, title: e.target.value }))
                }
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== task.title) {
                    patchTask({ title: e.target.value.trim() });
                  }
                }}
              />
            ) : (
              <h2 className="text-xl font-bold leading-snug">{task.title}</h2>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <select
                className="rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wide disabled:opacity-60"
                value={task.status}
                disabled={!canEdit}
                onChange={(e) => patchTask({ status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>

              <select
                className="rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                value={task.assignedTo?._id || ""}
                disabled={!canEdit}
                onChange={(e) => patchTask({ assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <p className="field-label">Description</p>
              {canEdit ? (
                <textarea
                  className="field-textarea"
                  rows={4}
                  value={task.description}
                  onChange={(e) =>
                    setTask((t) => ({ ...t, description: e.target.value }))
                  }
                  onBlur={(e) => {
                    if (
                      e.target.value.trim() &&
                      e.target.value !== task.description
                    ) {
                      patchTask({ description: e.target.value.trim() });
                    }
                  }}
                />
              ) : (
                <p className="text-sm leading-relaxed text-ink/70">
                  {task.description}
                </p>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2">
                <span className="text-xs font-semibold text-ink/50">
                  Assigned by
                </span>
                {task.assignedBy && (
                  <div className="flex items-center gap-1.5">
                    <Avatar user={task.assignedBy} size="xs" />
                    <span className="text-xs font-semibold">
                      {task.assignedBy.fullName}
                    </span>
                  </div>
                )}
                <span className="ml-auto text-xs text-ink/35">
                  {formatRelative(task.createdAt)}
                </span>
              </div>
            </div>

            {/* Subtasks */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="field-label mb-0">
                  Subtasks{" "}
                  {task.subtasks?.length > 0 &&
                    `(${doneCount}/${task.subtasks.length})`}
                </p>
              </div>

              <div className="space-y-1.5">
                {task.subtasks?.map((s) => (
                  <div
                    key={s._id}
                    className="group flex items-center gap-2.5 rounded-xl border-2 border-ink/10 bg-white px-3 py-2"
                  >
                    <button
                      onClick={() => toggleSubtask(s._id, !s.isCompleted)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink transition-colors ${
                        s.isCompleted ? "bg-campgreen" : "bg-white"
                      }`}
                      aria-label={
                        s.isCompleted ? "Mark incomplete" : "Mark complete"
                      }
                    >
                      {s.isCompleted && <Check size={13} strokeWidth={3} />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        s.isCompleted ? "text-ink/35 line-through" : ""
                      }`}
                    >
                      {s.title}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => removeSubtask(s._id)}
                        className="shrink-0 text-ink/25 opacity-0 hover:text-camppink group-hover:opacity-100"
                        aria-label="Remove subtask"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={addSubtask} className="mt-2 flex gap-2">
                <input
                  className="field-input"
                  placeholder="Add a subtask…"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-outline shrink-0 px-3"
                  disabled={addingSubtask || !newSubtask.trim()}
                >
                  {addingSubtask ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                </button>
              </form>
            </div>

            {/* Attachments */}
            <div className="mt-6">
              <p className="field-label">Attachments</p>
              <div className="space-y-1.5">
                {task.attachments?.map((a, idx) => (
                  <a
                    key={idx}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm hover:border-ink/30"
                  >
                    <Paperclip size={14} className="shrink-0 text-ink/40" />
                    <span className="flex-1 truncate">
                      {a.url?.split("/").pop()}
                    </span>
                    <span className="shrink-0 text-xs text-ink/35">
                      {bytesToSize(a.size)}
                    </span>
                    <ExternalLink size={13} className="shrink-0 text-ink/30" />
                  </a>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                  <p className="text-xs text-ink/35">No files attached.</p>
                )}
              </div>

              {canEdit && (
                <>
                  <label
                    htmlFor="drawer-upload"
                    className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/25 bg-white px-3.5 py-2.5 text-sm font-medium text-ink/50 hover:border-ink/50"
                  >
                    {uploading ? (
                      <Spinner size={14} />
                    ) : (
                      <Paperclip size={14} />
                    )}
                    Add attachment
                  </label>
                  <input
                    id="drawer-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteTask}
        loading={deleting}
        title="Delete this task?"
        description="This removes the task and all of its subtasks. This can't be undone."
      />
    </div>,
    document.body
  );
}
