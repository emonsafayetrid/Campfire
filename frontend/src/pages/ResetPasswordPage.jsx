import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Spinner from "../components/Spinner";
import { resetForgotPassword } from "../api/auth";
import { extractErrorMessage } from "../lib/utils";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await resetForgotPassword(resetToken, newPassword);
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't reset your password"));
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthShell>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-camppink/25 shadow-campsm">
          <XCircle size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          This link is missing its reset token. Request a new one from the
          forgot password page.
        </p>
        <Link to="/forgot-password" className="btn-dark mt-7 inline-flex w-full">
          Request new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-campgreen/25 shadow-campsm">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Password reset</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Your password has been updated. Log in with your new password.
        </p>
        <button
          className="btn-dark mt-7 w-full"
          onClick={() => navigate("/login")}
        >
          Go to login
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        Choose a new password for your account.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label className="field-label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            className="field-input"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            className="field-input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner size={15} />}
          Reset password
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        <Link to="/login" className="font-semibold text-ink hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
