export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  tone = "default",
  onCancel,
  onConfirm,
}) {
  const buttonClass = tone === "danger" ? "btn bg-red-700 text-white hover:bg-red-800" : "btn-primary";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 px-4 py-6">
      <section className="panel w-full max-w-md p-5 shadow-2xl">
        <div className="grid gap-3">
          <h3 className="text-xl font-extrabold tracking-normal">{title}</h3>
          <p className="text-sm font-semibold leading-6 text-muted">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className={buttonClass} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
