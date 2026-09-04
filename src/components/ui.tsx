import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cls, useCountUp, useReveal } from "../lib/utils";
import type { ProjectStatus } from "../lib/types";
import { STATUS_LABELS } from "../lib/types";
import { useApp } from "../state/AppContext";

/* ================= icons ================= */

const PATHS: Record<string, ReactNode> = {
  spark: (
    <>
      <path d="M12 3v0l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M19 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  "chevron-down": <path d="M6 9.5l6 6 6-6" />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" />,
  "arrow-right": <path d="M4 12h16m-6-6l6 6-6 6" />,
  "arrow-left": <path d="M20 12H4m6-6l-6 6 6 6" />,
  download: (
    <>
      <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 3v4.5h-4.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6" />
      <path d="M6.5 6.5l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12M10 10.5v6m4-6v6" />
    </>
  ),
  pen: <path d="M4 20l.9-3.8L16.4 4.7a1.8 1.8 0 0 1 2.6 0l.3.3a1.8 1.8 0 0 1 0 2.6L7.8 19.1 4 20zM14.5 6.5l3 3" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20.5 20.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3.5v4m7-4v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M15.5 5.5a3.5 3.5 0 0 1 0 6M17.5 14.9c2 .8 3.2 2.5 3.5 5.1" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5L21 8l-9 4.5L3 8l9-4.5z" />
      <path d="M4.5 12.5L12 16.2l7.5-3.7M4.5 16.5L12 20.2l7.5-3.7" />
    </>
  ),
  zap: <path d="M13 3L5 13.5h5.5L11 21l8-10.5h-5.5L13 3z" />,
  file: (
    <>
      <path d="M6 3.5h8L19 8.5v12H6v-17z" />
      <path d="M14 3.5v5h5M9 12.5h6.5M9 16h6.5" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M10 12h10.5m-4-4l4 4-4 4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4L2.8 19.5h18.4L12 4z" />
      <path d="M12 10v4.2m0 2.6v.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.6m0 11.8v2.6M20.5 12h-2.6M6.1 12H3.5m14.6-6.1l-1.9 1.9M7.8 16.2l-1.9 1.9m0-12.2l1.9 1.9m8.4 8.4l1.9 1.9" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 15.5c5.5-4 7.5-8.5 7.5-11.5-3 0-7.5 2-11.5 7.5" />
      <path d="M8 11.5L4.5 13l3-1m5 4.5L14 20l1-3M8.5 15.5c-1.5.5-2.7 1.7-3.5 4 2.3-.8 3.5-2 4-3.5" />
      <circle cx="14" cy="10" r="1.4" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M7 9.5l3 2.8-3 2.8m5.5.4h4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </>
  ),
  flame: <path d="M12 3.5c.6 3-1.5 4.6-2.8 6.2C7.8 11.4 7 13 7 14.8a5 5 0 0 0 10 0c0-2.4-1.2-3.9-2.2-5.3-.4 1-.9 1.6-1.8 2.3.4-3-.3-6-1-8.3z" />,
  shield: (
    <>
      <path d="M12 3.5l7.5 2.8v5.2c0 4.6-3 8-7.5 9.5-4.5-1.5-7.5-4.9-7.5-9.5V6.3L12 3.5z" />
      <path d="M9 12l2.2 2.2L15.5 9.7" />
    </>
  ),
  branch: (
    <>
      <circle cx="6.5" cy="6" r="2.2" />
      <circle cx="6.5" cy="18" r="2.2" />
      <circle cx="17.5" cy="8" r="2.2" />
      <path d="M6.5 8.2v7.6M17.5 10.2c0 3-2.5 3.8-5 4.3-1.7.4-3 .9-3.6 2" />
    </>
  ),
  eye: (
    <>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.8-4 3.7-6 7.5-6s6.7 2 7.5 6" />
    </>
  ),
  wand: (
    <>
      <path d="M5 19L15.5 8.5m2-2L19 5M15.5 8.5l1.5 1.5" />
      <path d="M9 4.5l.6 1.7 1.7.6-1.7.6L9 9.1l-.6-1.7-1.7-.6 1.7-.6L9 4.5zM18.5 12l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4zM19.5 3.5l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1z" />
    </>
  ),
  filter: <path d="M4 5.5h16l-6 7.2v5.5L10 20v-7.3L4 5.5z" />,
  hammer: (
    <>
      <path d="M13.5 6.5l4 4M5 20l6.5-6.5" />
      <path d="M11 4.5L9 6.6a1.4 1.4 0 0 0 0 2l.4.4-1.6 1.6a1.4 1.4 0 0 0 0 2l.2.2a1.4 1.4 0 0 0 2 0l1.6-1.6.4.4a1.4 1.4 0 0 0 2 0l2.1-2.1-7.1-7z" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  "half-circle": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
    </>
  ),
  "circle-dashed": <circle cx="12" cy="12" r="8" strokeDasharray="3.2 3.4" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 18,
  className,
  sw = 1.7,
}: {
  name: IconName;
  size?: number;
  className?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls("shrink-0", className)}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

/* ================= brand ================= */

export function Logo({ size = 34, word = true, onClick }: { size?: number; word?: boolean; onClick?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none cursor-pointer" onClick={onClick}>
      <span
        className="inline-flex items-center justify-center rounded-[9px] btn-grad shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
          <path d="M5 20v-6M12 20V4M19 20v-3.5" />
        </svg>
      </span>
      {word && (
        <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
          Dev<span className="text-indigo-400">Forge</span>
        </span>
      )}
    </span>
  );
}

export function Ambient() {
  return (
    <div className="ambient">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="glow glow-c" />
    </div>
  );
}

/* ================= buttons & badges ================= */

type BtnVariant = "primary" | "outline" | "ghost" | "danger" | "subtle";

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg"; icon?: IconName }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70";
  const sizes = { sm: "text-[13px] px-3 py-1.5", md: "text-sm px-4 py-2.5", lg: "text-[15px] px-6 py-3" };
  const variants: Record<BtnVariant, string> = {
    primary: "btn-grad text-white shadow-lg shadow-indigo-950/40",
    outline: "border border-slate-600/60 text-slate-200 hover:border-indigo-400/70 hover:text-white hover:bg-indigo-500/10 active:scale-[0.97]",
    ghost: "text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.97]",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:text-rose-200 active:scale-[0.97]",
    subtle: "bg-white/[0.07] text-slate-100 hover:bg-white/[0.12] active:scale-[0.97]",
  };
  return (
    <button className={cls(base, sizes[size], variants[variant], className)} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

const TONES: Record<string, string> = {
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cls("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}

const PROJECT_STATUS_TONE: Record<ProjectStatus, { tone: keyof typeof TONES; dot: string }> = {
  planning: { tone: "slate", dot: "bg-slate-400" },
  "in-progress": { tone: "indigo", dot: "bg-indigo-400" },
  "on-hold": { tone: "amber", dot: "bg-amber-400" },
  completed: { tone: "emerald", dot: "bg-emerald-400" },
  cancelled: { tone: "rose", dot: "bg-rose-400" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const t = PROJECT_STATUS_TONE[status];
  return (
    <Badge tone={t.tone}>
      <span className={cls("h-1.5 w-1.5 rounded-full", t.dot, status === "in-progress" && "anim-caret")} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

/* ================= form ================= */

export function Field({
  label,
  error,
  hint,
  children,
  counter,
}: {
  label: string;
  error?: string;
  hint?: string;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-slate-300">{label}</span>
        {counter && <span className="font-mono text-[10.5px] text-slate-500">{counter}</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400 anim-fade-up">
          <Icon name="alert" size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cls("input", invalid && "input-error", className)} {...rest} />;
}

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cls("input min-h-[110px] resize-y leading-relaxed", invalid && "input-error", className)} {...rest} />;
}

export function Select({ invalid, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cls("input appearance-none bg-no-repeat pr-9 cursor-pointer", invalid && "input-error", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9.5l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.7rem center",
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function TagPicker({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (t: string) => onChange(values.includes(t) ? values.filter((x) => x !== t) : [...values, t]);
  return (
    <div>
      <span className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-300">{label}</span>
        {values.length > 0 && <span className="mono-tag text-indigo-400">{values.length} selected</span>}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cls(
                "rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-150 active:scale-95",
                on
                  ? "border-indigo-400/70 bg-indigo-500/20 text-indigo-200 shadow-[0_0_18px_-6px_rgba(99,102,241,0.6)]"
                  : "border-slate-600/50 bg-white/[0.03] text-slate-400 hover:border-slate-400/60 hover:text-slate-200"
              )}
            >
              {on && <Icon name="check" size={12} className="mr-1 inline -mt-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/,+$/, "");
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="input flex flex-wrap items-center gap-2 py-2! cursor-text" onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
      {values.map((v) => (
        <span key={v} className="anim-pop inline-flex items-center gap-1.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 text-xs font-semibold text-indigo-200">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-indigo-300/70 hover:text-white transition-colors">
            <Icon name="x" size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
          if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={() => draft.trim() && add()}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
      />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; tone?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cls(
              "rounded-[10px] border px-2 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]",
              on ? "border-indigo-400/70 bg-indigo-500/20 text-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.55)]" : "border-slate-600/50 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-slate-400/60"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ================= progress ================= */

export function ProgressRing({ value, size = 92, stroke = 8, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value, 700);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-white" style={{ fontSize: size * 0.22 }}>
          {v}%
        </span>
        {label && <span className="mono-tag text-slate-500 text-[8.5px]!">{label}</span>}
      </div>
    </div>
  );
}

export function Bar({ value, className, striped }: { value: number; className?: string; striped?: boolean }) {
  return (
    <div className={cls("h-1.5 w-full overflow-hidden rounded-full bg-slate-500/15", className)}>
      <div
        className={cls("h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-[width] duration-700 ease-out", striped && "striped-bar")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ================= motion & feedback ================= */

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={cls("reveal", shown && "shown", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cls("card anim-pop relative w-full p-6", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="text-sm text-slate-300">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  const icons = { success: "check", error: "alert", info: "spark" } as const;
  const tones = {
    success: "border-emerald-500/40 text-emerald-300",
    error: "border-rose-500/40 text-rose-300",
    info: "border-indigo-500/40 text-indigo-300",
  };
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      {toasts.map((t) => (
        <div key={t.id} className={cls("anim-toast pointer-events-auto card flex items-start gap-3 border p-3.5 rounded-xl!", tones[t.kind])}>
          <Icon name={icons[t.kind]} size={17} className="mt-0.5" />
          <p className="flex-1 text-[13.5px] font-medium leading-snug text-slate-200">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="text-slate-500 transition-colors hover:text-white">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="card anim-fade-up flex flex-col items-center px-6 py-16 text-center">
      <div className="anim-float mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls("animate-spin", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.6" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
