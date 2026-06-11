export function StatusBadge({ children, tone = "default" }) {
  const styles =
    tone === "danger"
      ? "bg-red-50 text-red-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-brandDark";

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-extrabold ${styles}`}>
      {children}
    </span>
  );
}
