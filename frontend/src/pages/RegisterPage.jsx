import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Eye, EyeOff, MailCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../lib/utils";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.username !== form.username.toLowerCase()) {
      setError("Username must be lowercase.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create your account"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-campgreen/25 shadow-campsm">
          <MailCheck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          We sent a verification link to{" "}
          <span className="font-semibold text-ink">{form.email}</span>.
          Verify your email, then come back and log in.
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
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-campyellow shadow-campsm">
          <Flame size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-bold">Campfire</span>
      </div>

      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        Set up a free space for your team's work.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label className="field-label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="field-input"
            placeholder="Jamie Rivera"
            value={form.fullName}
            onChange={update("fullName")}
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="field-input"
            placeholder="jamierivera"
            value={form.username}
            onChange={update("username")}
            autoCapitalize="none"
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="field-input pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner size={15} />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
