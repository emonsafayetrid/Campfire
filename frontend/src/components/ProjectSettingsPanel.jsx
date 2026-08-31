import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useProjectDetail } from "../context/ProjectDetailContext";
import { useProjects } from "../context/ProjectsContext";
import { useToast } from "../context/ToastContext";
import { updateProject, deleteProject } from "../api/projects";
import { extractErrorMessage } from "../lib/utils";
import Spinner from "./Spinner";
import ConfirmDialog from "./ConfirmDialog";

export default function ProjectSettingsPanel() {
  const { projectId, project, setProject, isAdmin } = useProjectDetail();
  const { upsertProject, removeProject } = useProjects();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty =
    name !== project?.name || description !== (project?.description || "");

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name can't be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updateProject(projectId, {
        name: name.trim(),
        description,
      });
      setProject(res.data.data);
      upsertProject(res.data.data);
      toast.success("Project updated");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't save changes"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(projectId);
      removeProject(projectId);
      toast.success("Project deleted");
      navigate("/");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete the project"));
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <p className="text-sm text-ink/50">
          Only project admins can view settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h2 className="text-xl font-bold">Project settings</h2>

      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="field-label" htmlFor="settings-name">
            Project name
          </label>
          <input
            id="settings-name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="settings-description">
            Description
          </label>
          <textarea
            id="settings-description"
            className="field-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || !dirty}
          >
            {saving && <Spinner size={15} />}
            Save changes
          </button>
        </div>
      </form>

      <div className="card mt-6 border-camppink/40 p-6">
        <h3 className="text-base font-bold text-camppink">Danger zone</h3>
        <p className="mt-1.5 text-sm text-ink/55">
          Deleting a project permanently removes its tasks, subtasks and
          member list. This can't be undone.
        </p>
        <button
          className="btn-danger mt-4"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={15} />
          Delete project
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this project?"
        description={`"${project?.name}" and everything in it will be permanently deleted.`}
      />
    </div>
  );
}
