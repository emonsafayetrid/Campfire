import { useState } from "react";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { addMemberToProject } from "../api/projects";
import { useProjectDetail } from "../context/ProjectDetailContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage, ROLE_OPTIONS, ROLES } from "../lib/utils";

export default function AddMemberModal({ open, onClose }) {
  const { projectId, refreshMembers } = useProjectDetail();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    setEmail("");
    setRole("member");
    setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addMemberToProject(projectId, { email: email.trim(), role });
      await refreshMembers();
      toast.success("Member added");
      close();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't add that member"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add a team member">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="member-email">
            Email address
          </label>
          <input
            id="member-email"
            type="email"
            className="field-input"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-ink/40">
            They need an existing Campfire account with this email.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="member-role">
            Role
          </label>
          <select
            id="member-role"
            className="field-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLES[r]}
              </option>
            ))}
          </select>
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
            Add member
          </button>
        </div>
      </form>
    </Modal>
  );
}
