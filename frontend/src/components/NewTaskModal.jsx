import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { createTask } from "../api/tasks";
import { useProjectDetail } from "../context/ProjectDetailContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage, STATUS_META, STATUS_OPTIONS } from "../lib/utils";

export default function NewTaskModal({ open, onClose }) {
  const { projectId, members, addTaskLocal, refreshTasks } =
    useProjectDetail();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("todo");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setStatus("todo");
    setFiles([]);
    setError("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }
    if (!description.trim()) {
      setError("Add a short description.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("status", status);
      if (assignedTo) formData.append("assignedTo", assignedTo);
      files.forEach((f) => formData.append("attachments", f));

      const res = await createTask(projectId, formData);
      addTaskLocal(res.data.data);
      refreshTasks();
      toast.success("Task created");
      close();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create the task"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add a task" maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            className="field-input"
            placeholder="e.g. Draft the onboarding copy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="field-label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="field-textarea"
            rows={3}
            placeholder="What needs to get done?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="task-assignee">
              Assign to
            </label>
            <select
              id="task-assignee"
              className="field-input"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="field-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="task-files">
            Attachments{" "}
            <span className="normal-case text-ink/40">(up to 5)</span>
          </label>
          <label
            htmlFor="task-files"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/25 bg-white px-3.5 py-3 text-sm font-medium text-ink/50 hover:border-ink/50"
          >
            <Paperclip size={15} />
            Choose files
          </label>
          <input
            id="task-files"
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between rounded-lg bg-ink/5 px-3 py-1.5 text-xs"
                >
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="shrink-0 text-ink/40 hover:text-camppink"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="btn-ghost"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Spinner size={15} />}
            Create task
          </button>
        </div>
      </form>
    </Modal>
  );
}
