import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ResponsiveSelect({ disabled = false, name, onChange, options, value }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="relative min-w-0 max-w-full" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="field flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label || "Select"}</span>
        <ChevronDown className={`shrink-0 transition ${open ? "rotate-180" : ""}`} size={16} />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-[80] mt-1 max-h-60 w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-md border border-line bg-white p-1 shadow-xl"
          role="listbox"
        >
          {options.map((option) => (
            <button
              aria-selected={String(option.value) === String(value)}
              className={`block w-full min-w-0 overflow-hidden rounded px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100 ${String(option.value) === String(value) ? "bg-slate-100 text-brand" : "text-ink"}`}
              key={option.value}
              onClick={() => {
                onChange({ target: { name, value: option.value } });
                setOpen(false);
              }}
              role="option"
              title={option.label}
              type="button"
            >
              <span className="block w-full truncate">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
