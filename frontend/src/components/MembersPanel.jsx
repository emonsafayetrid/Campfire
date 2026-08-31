import { useState } from "react";
import { Plus, UserMinus, Users } from "lucide-react";
import { useProjectDetail } from "../context/ProjectDetailContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateMemberRole, removeMember } from "../api/projects";
import { ROLE_OPTIONS, ROLES, extractErrorMessage } from "../lib/utils";
import Avatar from "./Avatar";
import AddMemberModal from "./AddMemberModal";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";

export default function MembersPanel() {
  const { projectId, members, isAdmin, refreshMembers } = useProjectDetail();
  const { user } = useAuth();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Team members</h2>
          <p className="mt-1 text-sm text-ink/50">
            {members.length} {members.length === 1 ? "person has" : "people have"}{" "}
            access to this project.
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Add member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title="No members yet" />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-camp border-2 border-ink bg-white">
          {members.map((m) => {
            const isSelf = m.user._id === user?._id;
            return (
              <div
                key={m.user._id}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <Avatar user={m.user} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {m.user.fullName}{" "}
                    {isSelf && (
                      <span className="text-ink/35 font-normal">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink/45">
                    {m.user.email}
                  </p>
                </div>

                {isAdmin ? (
                  <RoleSelect
                    projectId={projectId}
                    projectMember={m}
                    disabled={isSelf}
                    onChanged={refreshMembers}
                  />
                ) : (
                  <span className="badge">{ROLES[m.role]}</span>
                )}

                {isAdmin && !isSelf && (
                  <button
                    onClick={() => setPendingRemove(m)}
                    className="icon-btn text-camppink hover:bg-camppink/10"
                    aria-label={`Remove ${m.user.fullName}`}
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddMemberModal open={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDialog
        open={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        loading={removing}
        title="Remove member?"
        description={
          pendingRemove &&
          `${pendingRemove.user.fullName} will lose access to this project.`
        }
        confirmLabel="Remove"
        onConfirm={async () => {
          setRemoving(true);
          try {
            await removeMember(projectId, pendingRemove.user._id);
            await refreshMembers();
            toast.success("Member removed");
            setPendingRemove(null);
          } catch (err) {
            toast.error(extractErrorMessage(err, "Couldn't remove member"));
          } finally {
            setRemoving(false);
          }
        }}
      />
    </div>
  );
}

function RoleSelect({ projectId, projectMember, disabled, onChanged }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const change = async (e) => {
    const newrole = e.target.value;
    setSaving(true);
    try {
      await updateMemberRole(projectId, projectMember.user._id, newrole);
      await onChanged();
      toast.success("Role updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update role"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className="rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
      value={projectMember.role}
      disabled={disabled || saving}
      onChange={change}
    >
      {ROLE_OPTIONS.map((r) => (
        <option key={r} value={r}>
          {ROLES[r]}
        </option>
      ))}
    </select>
  );
}
