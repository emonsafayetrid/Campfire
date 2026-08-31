import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Spinner from "../components/Spinner";
import { forgotPasswordRequest } from "../api/auth";
import { extractErrorMessage } from "../lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't send the reset link"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-campgreen/25 shadow-campsm">
          <MailCheck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Reset link sent</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          If an account exists for{" "}
          <span className="font-semibold text-ink">{email}</span>, a
          password reset link is on its way.
        </p>
        <Link to="/login" className="btn-dark mt-7 inline-flex w-full">
          Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        Enter your email and we'll send you a link to reset it.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner size={15} />}
          Send reset link
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
