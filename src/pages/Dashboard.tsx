import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import type { Category, Project, ProjectStatus } from "../lib/types";
import { CATEGORY_LABELS, DURATION_LABELS } from "../lib/types";
import { cls, timeAgo, useCountUp } from "../lib/utils";
import { Badge, Bar, Button, EmptyState, Icon, Input, ProjectStatusBadge, Reveal, Select } from "../components/ui";
import type { IconName } from "../components/ui";

function StatCard({ label, value, icon, tone, delay }: { label: string; value: number; icon: IconName; tone: string; delay: number }) {
  const v = useCountUp(value);
  return (
    <Reveal delay={delay}>
      <div className="card card-hover flex items-center gap-4 p-5">
        <span className={cls("flex h-11 w-11 items-center justify-center rounded-xl border", tone)}>
          <Icon name={icon} size={19} />
        </span>
        <div>
          <p className="font-display text-[1.9rem] font-bold leading-none text-white tabular-nums">{v}</p>
          <p className="mt-1.5 text-[12.5px] font-medium text-slate-400">{label}</p>
        </div>
      </div>
    </Reveal>
  );
}

function ProjectCard({ project, hasRoadmap, delay }: { project: Project; hasRoadmap: boolean; delay: number }) {
  const navigate = useNavigate();
  const tech = [...project.techStack.frontend, ...project.techStack.backend, ...project.techStack.database].slice(0, 3);
  return (
    <Reveal delay={delay}>
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        className="card card-hover group w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[17px] font-bold text-white transition-colors group-hover:text-indigo-200">
              {project.projectName}
            </h3>
            {project.tagline && <p className="mt-0.5 truncate text-[13px] text-slate-400">{project.tagline}</p>}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10.5px] text-slate-500">
            <span>{hasRoadmap ? "roadmap progress" : "no roadmap yet"}</span>
            <span className={cls(project.progress > 0 && "text-indigo-300")}>{project.progress}%</span>
          </div>
          <Bar value={project.progress} striped={project.status === "in-progress"} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge tone="violet">{CATEGORY_LABELS[project.category]}</Badge>
          {tech.map((t) => (
            <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-[12px] text-slate-500">
          <span className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5"><Icon name="users" size={13} /> {project.teamSize}</span>
            <span className="flex items-center gap-1.5"><Icon name="clock" size={13} /> {DURATION_LABELS[project.estimatedDuration]}</span>
            <span className="flex items-center gap-1.5"><Icon name="calendar" size={13} /> {timeAgo(project.updatedAt)}</span>
          </span>
          <span className="flex translate-x-1 items-center gap-1 font-semibold text-indigo-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            Open <Icon name="arrow-right" size={13} />
          </span>
        </div>
      </button>
    </Reveal>
  );
}

export default function Dashboard() {
  const { user, projects, roadmapFor } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [category, setCategory] = useState<"all" | Category>("all");

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "in-progress").length,
      done: projects.filter((p) => p.status === "completed").length,
      planning: projects.filter((p) => p.status === "planning").length,
    }),
    [projects]
  );

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (category === "all" || p.category === category) &&
          (q.trim() === "" || (p.projectName + " " + p.tagline + " " + p.description).toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [projects, q, status, category]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <Reveal>
          <p className="mono-tag text-indigo-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {greeting}, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {stats.total === 0
              ? "The forge is cold. Light it with your first project."
              : `${stats.active} project${stats.active === 1 ? "" : "s"} in motion · ${stats.done} shipped`}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <Button size="lg" icon="plus" onClick={() => navigate("/projects/new")}>
            New Project
          </Button>
        </Reveal>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total projects" value={stats.total} icon="grid" tone="border-indigo-400/30 bg-indigo-500/10 text-indigo-300" delay={0} />
        <StatCard label="In progress" value={stats.active} icon="flame" tone="border-violet-400/30 bg-violet-500/10 text-violet-300" delay={70} />
        <StatCard label="Completed" value={stats.done} icon="check" tone="border-emerald-400/30 bg-emerald-500/10 text-emerald-300" delay={140} />
        <StatCard label="Planning" value={stats.planning} icon="target" tone="border-amber-400/30 bg-amber-500/10 text-amber-300" delay={210} />
      </div>

      {/* toolbar */}
      {projects.length > 0 && (
        <Reveal delay={150}>
          <div className="card mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon name="search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input className="pl-10!" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Select value={status} onChange={(e) => setStatus(e.target.value as never)} className="sm:w-40">
                <option value="all">All statuses</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Select value={category} onChange={(e) => setCategory(e.target.value as never)} className="sm:w-40">
                <option value="all">All categories</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Reveal>
      )}

      {/* grid / empty states */}
      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="hammer"
            title="Forge your first project"
            body="Describe what you're building — stack, features, timeline — and DevForge will hammer out a complete six-phase roadmap in seconds."
          >
            <Button size="lg" icon="spark" onClick={() => navigate("/projects/new")}>
              Create your first project
            </Button>
          </EmptyState>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center px-6 py-14 text-center">
          <Icon name="filter" size={26} className="text-slate-600" />
          <p className="mt-3 font-display text-lg font-bold text-white">No projects match</p>
          <p className="mt-1 text-sm text-slate-400">Try a different search or clear the filters.</p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setQ("");
              setStatus("all");
              setCategory("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} hasRoadmap={!!roadmapFor(p.id)} delay={(i % 3) * 80} />
          ))}
        </div>
      )}
    </div>
  );
}
