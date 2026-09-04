import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import type { PhaseStatus, RoadmapPhase, RoadmapTask, TaskStatus } from "../lib/types";
import { PHASE_STATUS_LABELS } from "../lib/types";
import { cls, fmtDateFull, useClickOutside } from "../lib/utils";
import { Badge, Bar, Button, EmptyState, Icon, Modal, ProgressRing, Reveal, Spinner } from "../components/ui";

/* ---------------- phase status dropdown ---------------- */

const PHASE_TONE: Record<PhaseStatus, string> = {
  "not-started": "border-slate-500/40 bg-slate-500/10 text-slate-300",
  "in-progress": "border-indigo-400/50 bg-indigo-500/15 text-indigo-200",
  completed: "border-emerald-400/50 bg-emerald-500/15 text-emerald-300",
  skipped: "border-slate-600/40 bg-slate-700/20 text-slate-500",
};

function PhaseStatusMenu({ projectId, phase }: { projectId: string; phase: RoadmapPhase }) {
  const { setPhaseStatus } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cls("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:scale-[1.03]", PHASE_TONE[phase.status])}
      >
        {PHASE_STATUS_LABELS[phase.status]}
        <Icon name="chevron-down" size={11} className={cls("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="anim-pop absolute right-0 top-8 z-30 w-40 card rounded-xl! p-1.5">
          {(Object.keys(PHASE_STATUS_LABELS) as PhaseStatus[]).map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                setPhaseStatus(projectId, phase.id, s);
                setOpen(false);
              }}
              className={cls(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] font-semibold transition-colors",
                s === phase.status ? "bg-indigo-500/20 text-indigo-200" : "text-slate-300 hover:bg-white/[0.06]"
              )}
            >
              <span className={cls("h-1.5 w-1.5 rounded-full", s === "completed" ? "bg-emerald-400" : s === "in-progress" ? "bg-indigo-400" : s === "skipped" ? "bg-slate-600" : "bg-slate-400")} />
              {PHASE_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- task row ---------------- */

function TaskRow({ projectId, phaseId, task }: { projectId: string; phaseId: string; task: RoadmapTask }) {
  const { cycleTask } = useApp();
  const prioTone = task.priority === "high" ? "bg-rose-400" : task.priority === "medium" ? "bg-amber-400" : "bg-slate-500";
  const icon: { name: "check" | "half-circle" | "circle-dashed"; cls: string } =
    task.status === "done"
      ? { name: "check", cls: "border-emerald-400/70 bg-emerald-500/20 text-emerald-300" }
      : task.status === "in-progress"
        ? { name: "half-circle", cls: "border-amber-400/70 bg-amber-500/15 text-amber-400" }
        : { name: "circle-dashed", cls: "border-slate-600 text-slate-600" };
  const next: Record<TaskStatus, string> = { todo: "start", "in-progress": "complete", done: "reopen" };
  return (
    <button
      onClick={() => cycleTask(projectId, phaseId, task.id)}
      title={`Click to ${next[task.status]}`}
      className="group flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-white/[0.07] hover:bg-white/[0.03]"
    >
      <span className={cls("mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition-all group-active:scale-90", icon.cls)}>
        <Icon name={icon.name} size={task.status === "done" ? 10 : 12} sw={task.status === "done" ? 3 : 1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cls("block text-[13.5px] font-semibold transition-colors", task.status === "done" ? "text-slate-500 line-through" : "text-slate-200")}>
          {task.taskName}
        </span>
        {task.description && <span className="mt-0.5 block text-[12.5px] leading-relaxed text-slate-500">{task.description}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2 pt-0.5">
        <span className={cls("h-1.5 w-1.5 rounded-full", prioTone)} title={`${task.priority} priority`} />
        <span className="font-mono text-[10.5px] text-slate-500">{task.estimatedTime}</span>
      </span>
    </button>
  );
}

/* ---------------- phase card ---------------- */

function PhaseCard({ projectId, phase, expanded, onToggle, isNext }: { projectId: string; phase: RoadmapPhase; expanded: boolean; onToggle: () => void; isNext: boolean }) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const done = phase.tasks.filter((t) => t.status === "done").length;
  const pct = phase.tasks.length ? (done / phase.tasks.length) * 100 : 0;
  const numTone =
    phase.status === "completed"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
      : phase.status === "in-progress"
        ? "btn-grad text-white border-transparent"
        : phase.status === "skipped"
          ? "bg-slate-700/30 text-slate-500 border-slate-600/40"
          : "bg-white/[0.05] text-slate-300 border-white/[0.1]";

  return (
    <div className={cls("card relative overflow-hidden transition-colors", isNext && expanded && "border-indigo-400/35")}>
      {isNext && <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-indigo-500 to-violet-500" />}
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <span className={cls("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-[15px] font-bold", numTone)}>
          {phase.status === "completed" ? <Icon name="check" size={17} sw={2.6} /> : phase.phaseNumber}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className={cls("font-display text-[16.5px] font-bold", phase.status === "skipped" ? "text-slate-500 line-through" : "text-white")}>
              {phase.phaseName}
            </h3>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10.5px] text-slate-400">{phase.duration}</span>
            {isNext && <Badge tone="indigo">up next</Badge>}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Bar value={pct} className="max-w-[220px]" />
            <span className="font-mono text-[10.5px] text-slate-500">
              {done}/{phase.tasks.length} tasks
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          <PhaseStatusMenu projectId={projectId} phase={phase} />
        </div>
        <Icon name="chevron-down" size={17} className={cls("shrink-0 text-slate-500 transition-transform duration-300", expanded && "rotate-180")} />
      </button>

      <div className={cls("expander", expanded && "open")}>
        <div>
          <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
            {phase.description && <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">{phase.description}</p>}

            <p className="mono-tag mb-2 text-indigo-400">tasks · click to cycle status</p>
            <div className="space-y-1">
              {phase.tasks.map((t) => (
                <TaskRow key={t.id} projectId={projectId} phaseId={phase.id} task={t} />
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="mono-tag mb-2.5 text-emerald-400">deliverables</p>
                <ul className="space-y-2">
                  {phase.deliverables.map((dv) => (
                    <li key={dv} className="flex items-start gap-2.5 text-[13px] text-slate-300">
                      <Icon name="target" size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                      {dv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mono-tag mb-2.5 text-violet-400">recommended tools</p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.tools.map((t) => (
                    <span key={t} className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[12px] font-semibold text-violet-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {phase.tips.length > 0 && (
              <div className="mt-5">
                <button onClick={() => setTipsOpen((o) => !o)} className="flex items-center gap-2 rounded-lg px-1 py-1 text-[12.5px] font-bold text-amber-300 transition-colors hover:text-amber-200">
                  <Icon name="zap" size={14} />
                  {phase.tips.length} pro tip{phase.tips.length > 1 ? "s" : ""} from the forge
                  <Icon name="chevron-down" size={12} className={cls("transition-transform", tipsOpen && "rotate-180")} />
                </button>
                <div className={cls("expander", tipsOpen && "open")}>
                  <div>
                    <ul className="mt-2 space-y-2 border-l-2 border-amber-400/40 pl-4">
                      {phase.tips.map((tip) => (
                        <li key={tip} className="text-[13px] leading-relaxed text-slate-400">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function RoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, roadmapFor, generateRoadmap, generating } = useApp();
  const [regenOpen, setRegenOpen] = useState(false);

  const project = projects.find((x) => x.id === id);
  const rm = id ? roadmapFor(id) : undefined;

  const expandedId = useMemo(() => {
    if (!rm) return null;
    const next = rm.phases.find((p) => p.status === "in-progress") ?? rm.phases.find((p) => p.status === "not-started");
    return (next ?? rm.phases[0]).id;
  }, [rm?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [manualExpanded, setManualExpanded] = useState<string | null>(null);
  const activeExpanded = manualExpanded ?? expandedId;

  if (!project)
    return (
      <EmptyState icon="search" title="Project not found" body="It may have been deleted, or the link is stale.">
        <Button icon="arrow-left" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </EmptyState>
    );

  if (!rm)
    return (
      <EmptyState
        icon="hammer"
        title={generating ? "Forging your roadmap…" : "No roadmap yet"}
        body={
          generating
            ? "DevForge AI is analyzing your project. This usually takes under 15 seconds."
            : "This project is a blank ingot. Forge a six-phase roadmap with tasks, milestones, risks and pro tips."
        }
      >
        {generating ? (
          <Spinner size={30} className="text-indigo-400" />
        ) : (
          <Button size="lg" icon="spark" onClick={() => void generateRoadmap(project.id)}>
            Forge roadmap
          </Button>
        )}
      </EmptyState>
    );

  const totalTasks = rm.phases.reduce((n, p) => n + p.tasks.length, 0);
  const doneTasks = rm.phases.reduce((n, p) => n + p.tasks.filter((t) => t.status === "done").length, 0);
  const nextPhase = rm.phases.find((p) => p.status === "in-progress") ?? rm.phases.find((p) => p.status === "not-started");

  return (
    <div>
      <Reveal>
        <Link to={`/projects/${project.id}`} className="group inline-flex items-center gap-2 font-mono text-[12px] text-slate-500 transition-colors hover:text-indigo-300">
          <Icon name="arrow-left" size={13} className="transition-transform group-hover:-translate-x-0.5" /> {project.projectName}
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Roadmap</h1>
              <Badge tone="indigo">v{rm.version}</Badge>
              <Badge tone={rm.engine === "groq" ? "violet" : "slate"}>
                <Icon name="spark" size={11} /> {rm.engine === "groq" ? "groq · llama-3.1-70b" : "offline forge"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Total estimate: <span className="font-semibold text-slate-200">{rm.totalEstimatedDuration}</span>
              <span className="mx-2 text-slate-600">·</span>
              {doneTasks}/{totalTasks} tasks complete
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" icon="refresh" onClick={() => setRegenOpen(true)}>
              Regenerate
            </Button>
            <Button icon="file" onClick={() => navigate(`/projects/${project.id}/report`)}>
              PDF report
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* timeline */}
        <div className="relative lg:col-span-2">
          <div className="absolute bottom-6 left-[37px] top-6 hidden w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/25 to-transparent sm:block" />
          <div className="space-y-5">
            {rm.phases.map((ph, i) => (
              <Reveal key={ph.id} delay={i * 60} className="relative sm:pl-0">
                <PhaseCard
                  projectId={project.id}
                  phase={ph}
                  expanded={activeExpanded === ph.id}
                  onToggle={() => setManualExpanded(activeExpanded === ph.id ? "__none__" : ph.id)}
                  isNext={nextPhase?.id === ph.id}
                />
              </Reveal>
            ))}
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-5">
          <Reveal delay={100}>
            <div className="card flex items-center gap-5 p-6">
              <ProgressRing value={project.progress} size={96} label="complete" />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-white">
                  Phase {nextPhase ? nextPhase.phaseNumber : rm.phases.length} of {rm.phases.length}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-slate-400">
                  {nextPhase ? `Currently forging: ${nextPhase.phaseName}` : "All phases complete — ship it! 🎉".replace(" 🎉", "")}
                </p>
                <div className="mt-3 space-y-1.5">
                  {rm.phases.map((ph) => {
                    const pct = ph.tasks.length ? (ph.tasks.filter((t) => t.status === "done").length / ph.tasks.length) * 100 : 0;
                    return (
                      <div key={ph.id} className="flex items-center gap-2">
                        <span className="w-4 font-mono text-[10px] text-slate-500">{ph.phaseNumber}</span>
                        <Bar value={pct} className="flex-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="card p-6">
              <p className="mono-tag flex items-center gap-2 text-indigo-400">
                <Icon name="target" size={13} /> key milestones
              </p>
              <ol className="mt-4 space-y-3">
                {rm.keyMilestones.map((m, i) => (
                  <li key={m.name + i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 font-mono text-[10px] font-bold text-indigo-300">
                      M{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-snug text-slate-200">{m.name}</p>
                      <p className="font-mono text-[10.5px] text-slate-500">{m.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="card p-6">
              <p className="mono-tag flex items-center gap-2 text-rose-400">
                <Icon name="shield" size={13} /> risks & mitigations
              </p>
              <div className="mt-4 space-y-3.5">
                {rm.risks.map((r, i) => (
                  <div key={i} className="rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-3.5">
                    <p className="text-[13px] font-semibold leading-snug text-rose-200">{r.risk}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-slate-400">
                      <Icon name="check" size={12} sw={2.6} className="mt-0.5 shrink-0 text-emerald-400" />
                      {r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="card p-6">
              <p className="mono-tag flex items-center gap-2 text-violet-400">
                <Icon name="wand" size={13} /> tech recommendations
              </p>
              <ul className="mt-3.5 space-y-2">
                {rm.techRecommendations.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-300">
                    <Icon name="spark" size={13} className="mt-0.5 shrink-0 text-violet-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="card p-6">
              <p className="mono-tag text-slate-500">// meta</p>
              <dl className="mt-3 space-y-2 text-[13px]">
                {[
                  ["Generated", fmtDateFull(rm.generatedAt)],
                  ["Version", `v${rm.version}`],
                  ["Engine", rm.engine === "groq" ? "Groq · llama-3.1-70b" : "Offline forge"],
                  ["Phases / tasks", `${rm.phases.length} / ${totalTasks}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-semibold text-slate-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>

      <Modal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        title="Regenerate roadmap?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRegenOpen(false)}>Cancel</Button>
            <Button
              icon="hammer"
              onClick={() => {
                setRegenOpen(false);
                void generateRoadmap(project.id);
              }}
            >
              Forge v{rm.version + 1}
            </Button>
          </>
        }
      >
        <p className="leading-relaxed">
          A fresh v{rm.version + 1} will be forged for <span className="font-bold text-white">{project.projectName}</span>. Current task progress (
          {project.progress}%) will be reset — the old version is replaced.
        </p>
      </Modal>
    </div>
  );
}
