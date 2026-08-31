import { Flame } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-paper">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border-2 border-ink bg-campyellow shadow-camp">
        <Flame size={26} strokeWidth={2.5} />
      </div>
      <p className="font-display text-sm font-semibold text-ink/60">
        Stoking the fire…
      </p>
    </div>
  );
}
