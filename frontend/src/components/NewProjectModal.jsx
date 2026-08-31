import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { createProject } from "../api/projects";
import { useProjects } from "../context/ProjectsContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../lib/utils";

export default function NewProjectModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { upsertProject } = useProjects();
  const toast = useToast();
  const navigate = useNavigate();

  const close = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your project a name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createProject({ name: name.trim(), description });
      const project = res.data.data;
      upsertProject(project);
      toast.success("Project created");
      close();
      navigate(`/projects/${project._id}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create the project"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Start a new project">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            className="field-input"
            placeholder="e.g. Campsite Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="field-label" htmlFor="project-description">
            Description{" "}
            <span className="normal-case text-ink/40">(optional)</span>
          </label>
          <textarea
            id="project-description"
            className="field-textarea"
            rows={3}
            placeholder="What's this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
}
