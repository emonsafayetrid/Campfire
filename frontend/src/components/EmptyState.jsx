export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-camp border-2 border-dashed border-ink/25 bg-white/50 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-campyellow rotate-[-4deg] shadow-campsm">
          <Icon size={26} strokeWidth={2} />
        </div>
      )}
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink/55">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
