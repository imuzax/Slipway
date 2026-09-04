import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import type { Budget, Category, Duration, Priority, Project, ProjectStatus } from "../lib/types";
import { CATEGORY_LABELS, DURATION_LABELS, PHASE_STATUS_LABELS, STATUS_LABELS } from "../lib/types";
import { fmtDateFull, cls } from "../lib/utils";
import { Badge, Bar, Button, EmptyState, Field, Icon, Input, Modal, ProgressRing, ProjectStatusBadge, Reveal, Segmented, Select, Textarea } from "../components/ui";

const TABS = [
  { id: "overview", label: "Overview", icon: "grid" as const },
  { id: "roadmap", label: "Roadmap", icon: "layers" as const },
  { id: "settings", label: "Settings", icon: "gear" as const },
];

function OverviewTab({ p }: { p: Project }) {
  const stack: [string, string[]][] = [
    ["Frontend", p.techStack.frontend],
    ["Backend", p.techStack.backend],
    ["Database", p.techStack.database],
    ["Deployment", p.techStack.deployment],
    ["Other tools", p.techStack.other],
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Reveal className="lg:col-span-2">
        <div className="card p-6">
          <p className="mono-tag text-indigo-400">// about the build</p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-slate-300">{p.description}</p>
          {p.problemStatement && (
            <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-rose-300">
                <Icon name="flame" size={15} /> The problem
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{p.problemStatement}</p>
            </div>
          )}
          {p.targetAudience && (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-emerald-300">
                <Icon name="users" size={15} /> Built for
              </p>
              <p className="mt-1.5 text-sm text-slate-300">{p.targetAudience}</p>
            </div>
          )}
        </div>
      </Reveal>
      <div className="space-y-5">
        <Reveal delay={100}>
          <div className="card p-6">
            <p className="mono-tag text-indigo-400">// tech stack</p>
            <div className="mt-3 space-y-3.5">
              {stack.filter(([, items]) => items.length > 0).map(([label, items]) => (
                <div key={label}>
                  <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-slate-500">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => (
                      <span key={t} className="rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-1 text-[12px] font-semibold text-indigo-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="card p-6">
            <p className="mono-tag text-indigo-400">// plan</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Team size", `${p.teamSize} ${p.teamSize === 1 ? "person" : "people"}`],
                ["Timeline", DURATION_LABELS[p.estimatedDuration]],
                ["Priority", p.priority],
                ["Budget", p.budget],
                ["Start date", p.startDate ? fmtDateFull(p.startDate) : "—"],
                ["Created", fmtDateFull(p.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/[0.05] pb-2.5 last:border-0 last:pb-0">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-semibold capitalize text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
      <Reveal className="lg:col-span-3" delay={140}>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="mono-tag text-indigo-400">// {p.features.length} planned features</p>
            <Badge tone="violet">→ phase 4 sprint slices</Badge>
          </div>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {p.features.map((f, i) => (
              <li key={f} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-ink-900/60 px-3.5 py-2.5 text-sm text-slate-200">
                <span className="font-mono text-[10.5px] font-bold text-violet-400">{String(i + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

function RoadmapTab({ p }: { p: Project }) {
  const { roadmapFor, generateRoadmap, generating } = useApp();
  const navigate = useNavigate();
  const rm = roadmapFor(p.id);
  if (!rm)
    return (
      <EmptyState
        icon="hammer"
        title="No roadmap yet"
        body="This project is still a blank ingot. Forge a six-phase roadmap — tasks, milestones, risks and all."
      >
        <Button size="lg" icon="spark" disabled={!!generating} onClick={() => void generateRoadmap(p.id)}>
          Forge roadmap now
        </Button>
      </EmptyState>
    );
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono-tag text-indigo-400">// roadmap v{rm.version} · {rm.engine === "groq" ? "groq · llama-3.1-70b" : "offline forge engine"}</p>
          <p className="mt-1 text-sm text-slate-400">Total estimate: <span className="font-semibold text-slate-200">{rm.totalEstimatedDuration}</span></p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" icon="file" onClick={() => navigate(`/projects/${p.id}/report`)}>
            Report
          </Button>
          <Button icon="arrow-right" onClick={() => navigate(`/projects/${p.id}/roadmap`)}>
            Open full roadmap
          </Button>
        </div>
      </div>
      <div className="mt-6 space-y-2.5">
        {rm.phases.map((ph) => {
          const done = ph.tasks.filter((t) => t.status === "done").length;
          const pct = ph.tasks.length ? (done / ph.tasks.length) * 100 : 0;
          return (
            <button
              key={ph.id}
              onClick={() => navigate(`/projects/${p.id}/roadmap`)}
              className="group flex w-full items-center gap-4 rounded-xl border border-white/[0.07] bg-ink-900/60 px-4 py-3 text-left transition-all hover:border-indigo-400/40 hover:bg-indigo-500/[0.06]"
            >
              <span
                className={cls(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold",
                  ph.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : ph.status === "in-progress" ? "btn-grad text-white" : "bg-white/[0.06] text-slate-400"
                )}
              >
                {ph.status === "completed" ? <Icon name="check" size={14} sw={2.6} /> : ph.phaseNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cls("truncate text-sm font-bold", ph.status === "skipped" ? "text-slate-500 line-through" : "text-slate-200")}>{ph.phaseName}</p>
                  <span className="shrink-0 font-mono text-[10.5px] text-slate-500">{ph.duration}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <Bar value={pct} className="flex-1" />
                  <span className="shrink-0 font-mono text-[10.5px] text-slate-500">
                    {done}/{ph.tasks.length} · {PHASE_STATUS_LABELS[ph.status]}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({ p }: { p: Project }) {
  const { updateProject, deleteProject, toast } = useApp();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [d, setD] = useState({
    projectName: p.projectName,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    teamSize: p.teamSize,
    estimatedDuration: p.estimatedDuration,
    priority: p.priority,
    budget: p.budget,
    status: p.status,
    startDate: p.startDate,
  });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card p-6 lg:col-span-2">
        <p className="mono-tag text-indigo-400">// project settings</p>
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name">
              <Input value={d.projectName} onChange={(e) => set("projectName", e.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={d.category} onChange={(e) => set("category", e.target.value as Category)}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Tagline">
            <Input value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={d.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Team size">
              <Input type="number" min={1} max={50} value={d.teamSize} onChange={(e) => set("teamSize", parseInt(e.target.value || "1", 10))} />
            </Field>
            <Field label="Duration">
              <Select value={d.estimatedDuration} onChange={(e) => set("estimatedDuration", e.target.value as Duration)}>
                {Object.entries(DURATION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={d.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Priority">
            <Segmented
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              value={d.priority as Priority}
              onChange={(v) => set("priority", v)}
            />
          </Field>
          <Field label="Budget">
            <Segmented
              options={[
                { value: "free", label: "Free / OSS" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              value={d.budget as Budget}
              onChange={(v) => set("budget", v)}
            />
          </Field>
          <Field label="Start date">
            <Input type="date" value={d.startDate ? d.startDate.slice(0, 10) : ""} onChange={(e) => set("startDate", e.target.value ? new Date(e.target.value + "T00:00:00").toISOString() : "")} />
          </Field>
          <div className="flex justify-end border-t border-white/[0.07] pt-5">
            <Button
              icon="check"
              onClick={() => {
                if (!d.projectName.trim()) {
                  toast("error", "The project needs a name.");
                  return;
                }
                updateProject(p.id, { ...d, projectName: d.projectName.trim() });
                toast("success", "Project settings saved.");
              }}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
      <div className="card h-fit border-rose-500/25 p-6">
        <p className="mono-tag text-rose-400">// danger zone</p>
        <h3 className="mt-3 font-display text-lg font-bold text-white">Delete this project</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Removes <span className="font-semibold text-slate-200">{p.projectName}</span>, its roadmap and all tracked progress. This cannot be undone.
        </p>
        <Button variant="danger" icon="trash" className="mt-5 w-full" onClick={() => setConfirmOpen(true)}>
          Delete project
        </Button>
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete project?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                deleteProject(p.id);
                navigate("/dashboard");
              }}
            >
              Yes, delete forever
            </Button>
          </>
        }
      >
        <p className="leading-relaxed">
          <span className="font-bold text-white">{p.projectName}</span> and its roadmap ({p.progress}% complete) will be permanently removed from this browser.
        </p>
      </Modal>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, roadmapFor } = useApp();
  const [tab, setTab] = useState("overview");
  const p = projects.find((x) => x.id === id);

  if (!p)
    return (
      <EmptyState icon="search" title="Project not found" body="It may have been deleted, or the link is stale.">
        <Button icon="arrow-left" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      </EmptyState>
    );

  const rm = roadmapFor(p.id);

  return (
    <div>
      <Reveal>
        <Link to="/dashboard" className="group inline-flex items-center gap-2 font-mono text-[12px] text-slate-500 transition-colors hover:text-indigo-300">
          <Icon name="arrow-left" size={13} className="transition-transform group-hover:-translate-x-0.5" /> all projects
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{p.projectName}</h1>
              <ProjectStatusBadge status={p.status} />
              <Badge tone="violet">{CATEGORY_LABELS[p.category]}</Badge>
            </div>
            {p.tagline && <p className="mt-2 text-[15px] text-slate-400">{p.tagline}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...p.techStack.frontend, ...p.techStack.backend, ...p.techStack.database, ...p.techStack.deployment].slice(0, 6).map((t) => (
                <span key={t} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing value={p.progress} label="complete" />
            <div className="flex flex-col gap-2.5">
              <Button icon="layers" onClick={() => navigate(`/projects/${p.id}/roadmap`)}>
                {rm ? "Open roadmap" : "Forge roadmap"}
              </Button>
              <Button variant="outline" icon="file" disabled={!rm} onClick={() => navigate(`/projects/${p.id}/report`)}>
                PDF report
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* tabs */}
      <Reveal delay={120}>
        <div className="mt-8 flex gap-1.5 border-b border-white/[0.07]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cls(
                "relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold transition-colors",
                tab === t.id ? "text-white" : "text-slate-500 hover:text-slate-200"
              )}
            >
              <Icon name={t.icon} size={15} className={tab === t.id ? "text-indigo-400" : ""} />
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" />}
            </button>
          ))}
        </div>
      </Reveal>

      <div key={tab} className="anim-fade-up mt-6" style={{ animationDuration: "0.4s" }}>
        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "roadmap" && <RoadmapTab p={p} />}
        {tab === "settings" && <SettingsTab p={p} />}
      </div>
    </div>
  );
}
