import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, Eye, EyeOff } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't log you in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-campyellow shadow-campsm">
          <Flame size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-bold">Campfire</span>
      </div>

      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        Log in to catch up with your projects.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="mb-1.5 text-xs font-semibold text-campblue hover:underline"
            >
              Forgot it?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="field-input pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        New to Campfire?{" "}
        <Link to="/register" className="font-semibold text-ink hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
