import { initials, colorForString } from "../lib/utils";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export default function Avatar({ user, size = "sm", className = "" }) {
  const name = user?.fullName || user?.username || "?";
  const url = user?.avatar?.url;
  const color = colorForString(name);
  const sizeCls = SIZES[size] || SIZES.sm;

  const isPlaceholder =
    !url || url.includes("placehold.co");

  if (!isPlaceholder) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeCls} shrink-0 rounded-full border-2 border-ink object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} ${color.bg} flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-display font-bold text-ink ${className}`}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
