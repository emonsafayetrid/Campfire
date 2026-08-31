import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Spinner from "../components/Spinner";
import { verifyEmail } from "../api/auth";
import { extractErrorMessage } from "../lib/utils";

export default function VerifyEmailPage() {
  const { verificationToken } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    verifyEmail(verificationToken)
      .then(() => active && setStatus("success"))
      .catch((err) => {
        if (!active) return;
        setError(extractErrorMessage(err, "That link is invalid or expired"));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [verificationToken]);

  return (
    <AuthShell>
      {status === "loading" && (
        <div className="flex flex-col items-center py-6 text-center">
          <Spinner size={28} />
          <p className="mt-4 text-sm font-medium text-ink/60">
            Verifying your email…
          </p>
        </div>
      )}

      {status === "success" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-campgreen/25 shadow-campsm">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Email verified</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            Your account is confirmed. You're all set to log in.
          </p>
          <Link to="/login" className="btn-dark mt-7 inline-flex w-full">
            Go to login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-camppink/25 shadow-campsm">
            <XCircle size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Verification failed</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">{error}</p>
          <Link to="/login" className="btn-outline mt-7 inline-flex w-full">
            Back to login
          </Link>
        </>
      )}
    </AuthShell>
  );
}
