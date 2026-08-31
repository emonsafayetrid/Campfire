import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { changeCurrentPassword, resendEmailVerification } from "../api/auth";
import { extractErrorMessage } from "../lib/utils";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

export default function AccountPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await changeCurrentPassword({ currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't change your password"));
    } finally {
      setSaving(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    try {
      await resendEmailVerification();
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't resend the email"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{user?.fullName}</h1>
          <p className="text-sm text-ink/50">
            @{user?.username} · {user?.email}
          </p>
        </div>
      </div>

      <div className="card mt-6 flex items-center gap-3 p-4">
        {user?.isEmailVerified ? (
          <>
            <ShieldCheck size={20} className="shrink-0 text-campgreen" />
            <p className="text-sm font-medium">Your email is verified.</p>
          </>
        ) : (
          <>
            <ShieldAlert size={20} className="shrink-0 text-camppink" />
            <p className="flex-1 text-sm font-medium">
              Your email isn't verified yet.
            </p>
            <button
              onClick={resendVerification}
              className="btn-outline btn-sm shrink-0"
              disabled={resending}
            >
              {resending && <Spinner size={13} />}
              Resend
            </button>
          </>
        )}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-base font-bold">Change password</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="field-label" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              className="field-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className="field-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner size={15} />}
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
