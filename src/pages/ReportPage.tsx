import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import {
  CATEGORY_LABELS,
  DURATION_LABELS,
  PHASE_STATUS_LABELS,
  STATUS_LABELS,
} from "../lib/types";
import { cls, fmtDateFull } from "../lib/utils";
import { downloadProjectReport } from "../lib/pdf";
import { Button, EmptyState, Icon, Reveal } from "../components/ui";

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, projects, roadmapFor, toast } = useApp();
  const project = projects.find((x) => x.id === id);
  const rm = id ? roadmapFor(id) : undefined;

  if (!project || !rm)
    return (
      <EmptyState
        icon="file"
        title="Nothing to report yet"
        body="A PDF report needs a charted roadmap first. Head back and generate one."
      >
        <Button
          icon="arrow-left"
          onClick={() => navigate(id ? `/projects/${id}` : "/dashboard")}
        >
          Back to project
        </Button>
      </EmptyState>
    );

  const totalTasks = rm.phases.reduce((n, p) => n + p.tasks.length, 0);
  const doneTasks = rm.phases.reduce(
    (n, p) => n + p.tasks.filter((t) => t.status === "done").length,
    0,
  );

  const download = () => {
    try {
      downloadProjectReport(project, rm, user);
      toast("success", "Report downloaded — check your downloads folder.");
    } catch {
      toast("error", "PDF generation failed. Please try again.");
    }
  };

  return (
    <div>
      <Reveal>
        <Link
          to={`/projects/${project.id}/roadmap`}
          className="group inline-flex items-center gap-2 font-mono text-[12px] text-slate-500 transition-colors hover:text-indigo-600 dark:hover:text-indigo-300"
        >
          <Icon
            name="arrow-left"
            size={13}
            className="transition-transform group-hover:-translate-x-0.5"
          />{" "}
          roadmap
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mono-tag text-indigo-400">// export</p>

            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Project report
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              A snapshot of{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {project.projectName}
              </span>{" "}
              as it stands today — {doneTasks}/{totalTasks} tasks done, v
              {rm.version} of the roadmap.
            </p>
          </div>

          <Button size="lg" icon="download" onClick={download}>
            Download PDF
          </Button>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* paper preview */}
        <Reveal className="lg:col-span-2">
          <div className="paper overflow-hidden">
            {/* cover band */}
            <div
              className="relative px-8 py-8 text-white"
              style={{ background: "linear-gradient(120deg,#0d1126,#171d3d)" }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(120deg,#6366f1,#8b5cf6)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3.5l5.5 9h-11l5.5-9z" />
                    <path d="M4.5 15.5h15l-2 3.6a1.4 1.4 0 0 1-1.2.9H7.7a1.4 1.4 0 0 1-1.2-.9l-2-3.6z" />
                  </svg>
                </span>

                <span className="font-mono text-[10px] font-bold tracking-[0.2em]">
                  SLIPWAY · ROADMAP REPORT
                </span>
              </div>

              <h2 className="mt-5 font-display text-[1.8rem] font-bold leading-tight">
                {project.projectName}
              </h2>

              {project.tagline && (
                <p className="mt-1 text-[13px] text-indigo-200/80">
                  {project.tagline}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-14 w-14">
                  <svg width="56" height="56" className="-rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="rgba(148,163,184,0.25)"
                      strokeWidth="6"
                    />

                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 23}
                      strokeDashoffset={
                        2 * Math.PI * 23 * (1 - project.progress / 100)
                      }
                    />
                  </svg>

                  <span className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-bold">
                    {project.progress}%
                  </span>
                </div>

                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {STATUS_LABELS[project.status]} · v{rm.version} ·{" "}
                  {fmtDateFull(rm.generatedAt)}
                </p>
              </div>
            </div>

            {/* body */}
            <div className="space-y-7 bg-white px-8 py-8 dark:bg-ink-850">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-600">
                  01 · OVERVIEW
                </p>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {project.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4 dark:border-white/[0.05] dark:bg-white/[0.05]">
                  {[
                    ["Category", CATEGORY_LABELS[project.category]],
                    ["Team", `${project.teamSize}`],
                    ["Timeline", DURATION_LABELS[project.estimatedDuration]],
                    ["Priority", project.priority],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="bg-white px-3 py-2.5 dark:bg-ink-900"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        {k}
                      </p>

                      <p className="mt-0.5 text-[12px] font-bold capitalize text-slate-700 dark:text-slate-200">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-600">
                  02 · PHASES & TASKS
                </p>

                <div className="mt-3 space-y-3">
                  {rm.phases.map((ph) => {
                    const done = ph.tasks.filter(
                      (t) => t.status === "done",
                    ).length;

                    return (
                      <div
                        key={ph.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/[0.06] dark:bg-ink-900/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex items-center gap-2.5 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                              style={{
                                background:
                                  ph.status === "completed"
                                    ? "#10b981"
                                    : ph.status === "in-progress"
                                      ? "#6366f1"
                                      : "#94a3b8",
                              }}
                            >
                              {ph.phaseNumber}
                            </span>

                            {ph.phaseName}
                          </p>

                          <span
                            className={cls(
                              "font-mono text-[9.5px] font-bold uppercase",
                              ph.status === "completed"
                                ? "text-emerald-600"
                                : ph.status === "in-progress"
                                  ? "text-indigo-600"
                                  : "text-slate-400",
                            )}
                          >
                            {PHASE_STATUS_LABELS[ph.status]} · {done}/
                            {ph.tasks.length}
                          </span>
                        </div>

                        <ul className="mt-2.5 grid gap-1 sm:grid-cols-2">
                          {ph.tasks.slice(0, 6).map((t) => (
                            <li
                              key={t.id}
                              className="flex items-center gap-2 text-[11.5px] text-slate-600 dark:text-slate-400"
                            >
                              <span
                                className={cls(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  t.status === "done"
                                    ? "bg-emerald-500"
                                    : t.status === "in-progress"
                                      ? "bg-amber-500"
                                      : "bg-slate-300",
                                )}
                              />

                              <span
                                className={cls(
                                  "truncate",
                                  t.status === "done" &&
                                    "text-slate-400 line-through",
                                )}
                              >
                                {t.taskName}
                              </span>
                            </li>
                          ))}

                          {ph.tasks.length > 6 && (
                            <li className="text-[11px] italic text-slate-400">
                              +{ph.tasks.length - 6} more in the PDF…
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-600">
                    03 · MILESTONES
                  </p>

                  <ol className="mt-2.5 space-y-1.5">
                    {rm.keyMilestones.slice(0, 6).map((m, i) => (
                      <li
                        key={m.name + i}
                        className="flex items-baseline gap-2 text-[11.5px] text-slate-600 dark:text-slate-400"
                      >
                        <span className="font-mono text-[9.5px] font-bold text-indigo-500">
                          M{i + 1}
                        </span>

                        <span className="flex-1 truncate">{m.name}</span>

                        <span className="shrink-0 font-mono text-[9.5px] text-slate-400">
                          {m.date}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-600">
                    04 · RISKS
                  </p>

                  <ul className="mt-2.5 space-y-1.5">
                    {rm.risks.slice(0, 4).map((r, i) => (
                      <li
                        key={i}
                        className="truncate text-[11.5px] text-slate-600 dark:text-slate-400"
                      >
                        <span className="font-semibold text-rose-500">!</span>{" "}
                        {r.risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Slipway — AI Project Planner
                </p>

                <p className="font-mono text-[9px] text-slate-400">
                  full report ≈ {Math.max(4, rm.phases.length + 3)} pages
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* actions */}
        <div className="space-y-5">
          <Reveal delay={120}>
            <div className="card p-6">
              <p className="mono-tag text-indigo-400">// in the download</p>

              <ul className="mt-4 space-y-3">
                {[
                  ["file", "Branded cover with live progress donut"],
                  [
                    "layers",
                    `All ${rm.phases.length} phases with task tables, deliverables & tips`,
                  ],
                  ["target", "Milestone timeline with target dates"],
                  ["shield", "Risk register with mitigations"],
                  ["branch", "Tech stack summary + recommendations"],
                ].map(([icon, text]) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-[13.5px] text-slate-700 dark:text-slate-300"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-500 dark:border-indigo-400/25 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <Icon name={icon as never} size={14} />
                    </span>

                    {text}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                icon="download"
                className="mt-6 w-full"
                onClick={download}
              >
                Download PDF report
              </Button>

              <p className="mt-3 text-center font-mono text-[10.5px] text-slate-500">
                generated client-side · nothing leaves your browser
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="card p-6">
              <p className="mono-tag text-slate-500">// snapshot stats</p>

              <dl className="mt-3 space-y-2 text-[13px]">
                {[
                  ["Tasks complete", `${doneTasks} / ${totalTasks}`],
                  ["Overall progress", `${project.progress}%`],
                  ["Roadmap version", `v${rm.version}`],
                  [
                    "Engine",
                    rm.engine === "groq"
                      ? "Groq · llama-3.1-70b"
                      : "Offline charts",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0 dark:border-white/[0.05]"
                  >
                    <dt className="text-slate-500">{k}</dt>

                    <dd className="font-semibold text-slate-800 dark:text-slate-200">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
