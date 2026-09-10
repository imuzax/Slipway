import { useCallback, useEffect, useState } from "react";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useApp } from "../state/AppContext";

import { GENERATION_STAGES } from "../lib/engine";

import { cls, useClickOutside } from "../lib/utils";

import { Button, Icon, Logo, Modal, Input } from "./ui";
import ShortcutsModal from "./ShortcutsModal";

function GroqKeyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, saveGroqKey } = useApp();
  const [draft, setDraft] = useState(settings.groqKey);

  useEffect(() => {
    if (open) setDraft(settings.groqKey);
  }, [open, settings.groqKey]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI engine"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            icon="spark"
            onClick={() => {
              saveGroqKey(draft);
              onClose();
            }}
          >
            Save engine config
          </Button>
        </>
      }
    >
      <p className="leading-relaxed text-slate-700 dark:text-slate-400">
        Slipway ships with an{" "}
        <span className="font-semibold text-slate-950 dark:text-slate-200">
          offline chart engine
        </span>{" "}
        that always works. Paste a{" "}
        <span className="font-mono text-indigo-600 dark:text-indigo-300">
          Groq API key
        </span>{" "}
        to generate roadmaps with{" "}
        <span className="font-mono text-indigo-600 dark:text-indigo-300">
          llama-3.1-70b-versatile
        </span>{" "}
        instead — the key stays in this browser only.
      </p>

      <div className="mt-4">
        <Input
          type="password"
          placeholder="gsk_…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <p className="mt-2 text-xs text-slate-500">
          Get a free key at console.groq.com. If a call fails, Slipway
          automatically falls back to the offline engine.
        </p>
      </div>
    </Modal>
  );
}

function AvatarMenu() {
  const { user, logout } = useApp();

  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const ref = useClickOutside(useCallback(() => setOpen(false), []));

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          flex h-9 w-9 items-center justify-center rounded-full
          border border-indigo-300 bg-indigo-50
          font-mono text-[12px] font-bold text-indigo-700
          transition-all
          hover:border-indigo-400 hover:shadow-glow
          dark:border-indigo-400/40 dark:bg-indigo-500/20
          dark:text-indigo-200
          dark:hover:border-indigo-300/70
        "
      >
        {initials}
      </button>

      {open && (
        <div className="anim-pop absolute right-0 top-12 z-50 w-60 card rounded-xl! p-2">
          <div className="border-b border-slate-200 px-3 pb-3 pt-2 dark:border-white/[0.07]">
            <p className="text-sm font-bold">{user.name}</p>

            <p className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-500">
              {user.email}
            </p>

            <span className="mono-tag mt-1.5 inline-block text-violet-600 dark:text-violet-400">
              {user.role}
            </span>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              setAiOpen(true);
            }}
            className="
              mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2
              text-left text-[13.5px] font-medium
              text-slate-700
              transition-colors
              hover:bg-slate-100 hover:text-slate-950
              dark:text-slate-300
              dark:hover:bg-white/[0.06]
              dark:hover:text-white
            "
          >
            <Icon name="spark" size={15} className="text-indigo-400" />
            AI engine settings
          </button>

          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="
              flex w-full items-center gap-2.5 rounded-lg px-3 py-2
              text-left text-[13.5px] font-medium
              text-slate-700
              transition-colors
              hover:bg-rose-50 hover:text-rose-600
              dark:text-slate-300
              dark:hover:bg-rose-500/10
              dark:hover:text-rose-300
            "
          >
            <Icon name="logout" size={15} className="text-rose-400" />
            Sign out
          </button>
        </div>
      )}

      <GroqKeyModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

function GenerationOverlay() {
  const { generating } = useApp();

  if (!generating) return null;

  const stage =
    GENERATION_STAGES[generating.stageIndex] ?? GENERATION_STAGES[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/92 p-6 backdrop-blur-md">
      <div className="anim-pop w-full max-w-md text-center">
        <div className="anim-pulse-ring mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl btn-grad">
          <Icon name="boat" size={36} className="text-white" />
        </div>

        <p className="mono-tag text-indigo-400">Charting the course</p>

        <h2 className="mt-2 font-display text-2xl font-bold text-white">
          {generating.projectName}
        </h2>

        <p className="mt-5 font-mono text-sm text-slate-300">
          <span className="anim-caret mr-1 inline-block h-3.5 w-[7px] translate-y-0.5 bg-indigo-400" />
          {stage}
        </p>

        <div className="mt-6 flex justify-center gap-2">
          {GENERATION_STAGES.map((_, i) => (
            <span
              key={i}
              className={cls(
                "h-1.5 w-9 rounded-full transition-all duration-500",
                i < generating.stageIndex
                  ? "bg-indigo-500"
                  : i === generating.stageIndex
                    ? "bg-violet-400 striped-bar"
                    : "bg-slate-700/60",
              )}
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Usually takes under 15 seconds — hang tight.
        </p>
      </div>
    </div>
  );
}

export default function Shell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?") setShortcutsOpen(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { handleTheme, theme } = useApp();

  return (
    <div className="min-h-screen">
      <header
        className="
          sticky top-0 z-40
          border-b border-slate-200
          bg-paper-950/75
          backdrop-blur-xl
          dark:border-white/[0.06]
          dark:bg-ink-950/75
        "
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo onClick={() => navigate("/dashboard")} />

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/dashboard"
              className={cls(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                location.pathname === "/dashboard"
                  ? "bg-slate-100 text-slate-950 dark:bg-white/[0.07] dark:text-white"
                  : "text-slate-300 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              <Icon name="grid" size={15} />
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              size="md"
              icon={theme === "dark" ? "sun" : "moon"}
              title={
                theme === "dark"
                  ? "switch to light mode"
                  : "switch to dark mode"
              }
              onClick={handleTheme}
              className="px-3.5!"
            />

            <Button
              size="sm"
              icon="plus"
              onClick={() => navigate("/projects/new")}
              className="px-3.5!"
            >
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>

            <AvatarMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <GenerationOverlay />
      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
