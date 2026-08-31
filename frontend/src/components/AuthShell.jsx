import { Flame, CheckCircle2 } from "lucide-react";

const POINTS = [
  "Organize every project in one calm, shared home base",
  "Break work into tasks and subtasks your whole team can see",
  "Bring people in with roles that match how much access they need",
];

export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r-2 border-ink bg-campnavy px-12 py-12 text-paper lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-campyellow/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-camppink/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-paper bg-campyellow text-ink shadow-camp">
            <Flame size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold">Campfire</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md font-display text-4xl font-bold leading-[1.15]">
            Gather your team{" "}
            <span className="scribble-underline">around the work.</span>
          </h1>
          <ul className="mt-8 space-y-3.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-paper/80">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-campyellow"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-paper/40">
          Campfire — a project camp for focused teams.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
