export const ROLES = {
  admin: "Admin",
  project_admin: "Project Admin",
  member: "Member",
};

export const ROLE_OPTIONS = ["admin", "project_admin", "member"];

export const STATUS_META = {
  todo: { label: "To-do", dot: "bg-campnavy/40" },
  in_progress: { label: "In progress", dot: "bg-campblue" },
  done: { label: "Done", dot: "bg-campgreen" },
};

export const STATUS_OPTIONS = ["todo", "in_progress", "done"];

// Deterministic accent color per project/name so cards feel alive but stable.
// Class names are written out in full (not templated) so Tailwind's scanner
// picks them up in the production build.
export const PALETTE = [
  {
    bg: "bg-campyellow",
    text: "text-campyellow",
    dot: "bg-campyellow",
    soft: "bg-campyellow/20",
  },
  {
    bg: "bg-camppink",
    text: "text-camppink",
    dot: "bg-camppink",
    soft: "bg-camppink/15",
  },
  {
    bg: "bg-campgreen",
    text: "text-campgreen",
    dot: "bg-campgreen",
    soft: "bg-campgreen/15",
  },
  {
    bg: "bg-campblue",
    text: "text-campblue",
    dot: "bg-campblue",
    soft: "bg-campblue/15",
  },
  {
    bg: "bg-camppurple",
    text: "text-camppurple",
    dot: "bg-camppurple",
    soft: "bg-camppurple/15",
  },
];

export const colorForString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
};

export const initials = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatRelative = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const extractErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    error?.message ||
    fallback
  );
};

export const bytesToSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
