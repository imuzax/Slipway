import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import type { Budget, Category, Duration, Priority } from "../lib/types";
import { CATEGORY_LABELS, DURATION_LABELS, TECH_POOLS } from "../lib/types";
import { cls } from "../lib/utils";
import { Badge, Button, Field, Icon, Input, Reveal, Segmented, Select, TagPicker, Textarea } from "../components/ui";

const STEPS = [
  { label: "Brief", icon: "pen" as const },
  { label: "Stack", icon: "branch" as const },
  { label: "Scope", icon: "target" as const },
  { label: "Team", icon: "users" as const },
  { label: "Review", icon: "spark" as const },
];

interface Draft {
  projectName: string;
  tagline: string;
  description: string;
  category: Category;
  frontend: string[];
  backend: string[];
  database: string[];
  deployment: string[];
  other: string[];
  problemStatement: string;
  targetAudience: string;
  features: string[];
  teamSize: number;
  estimatedDuration: Duration;
  priority: Priority;
  budget: Budget;
  startDate: string;
}

export default function NewProject() {
  const { createProject, generateRoadmap, toast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [featureDraft, setFeatureDraft] = useState("");
  const [d, setD] = useState<Draft>({
    projectName: "",
    tagline: "",
    description: "",
    category: "web-app",
    frontend: [],
    backend: [],
    database: [],
    deployment: [],
    other: [],
    problemStatement: "",
    targetAudience: "",
    features: [],
    teamSize: 1,
    estimatedDuration: "2-months",
    priority: "medium",
    budget: "free",
    startDate: "",
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!d.projectName.trim()) e.projectName = "Every vessel needs a name.";
      if (d.tagline.length > 150) e.tagline = "Keep the tagline under 150 characters.";
      if (d.description.trim().length < 30) e.description = "Give the AI at least a couple of sentences to work with (30+ chars).";
    }
    if (s === 1 && d.frontend.length + d.backend.length + d.database.length === 0)
      e.stack = "Pick at least one frontend, backend or database technology.";
    if (s === 2 && d.features.length === 0) e.features = "Add at least one feature — the AI builds sprint slices from this list.";
    if (s === 3 && (d.teamSize < 1 || d.teamSize > 50 || isNaN(d.teamSize))) e.teamSize = "Team size must be between 1 and 50.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (target: number) => {
    if (target > step && !validate(step)) return;
    setStep(target);
    setMaxVisited((m) => Math.max(m, target));
  };

  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    if (d.features.some((f) => f.toLowerCase() === v.toLowerCase())) {
      setFeatureDraft("");
      return;
    }
    set("features", [...d.features, v]);
    setFeatureDraft("");
    setErrors((e) => ({ ...e, features: "" }));
  };

  const launch = () => {
    const p = createProject({
      projectName: d.projectName.trim(),
      tagline: d.tagline.trim(),
      description: d.description.trim(),
      category: d.category,
      techStack: { frontend: d.frontend, backend: d.backend, database: d.database, deployment: d.deployment, other: d.other },
      features: d.features,
      targetAudience: d.targetAudience.trim(),
      problemStatement: d.problemStatement.trim(),
      teamSize: d.teamSize,
      estimatedDuration: d.estimatedDuration,
      priority: d.priority,
      budget: d.budget,
      startDate: d.startDate || new Date().toISOString(),
    });
    toast("info", `${p.projectName} created — charting your roadmap…`);
    navigate(`/projects/${p.id}/roadmap`);
    void generateRoadmap(p.id);
  };

  const reviewRow = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5 border-b border-white/[0.05] py-2.5 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <span className="mono-tag mt-0.5 text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-200">{value || "—"}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="mono-tag text-indigo-400">// new project</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">Describe the build</h1>
        <p className="mt-1.5 text-sm text-slate-400">Five short steps. The more specific the brief, the sharper the roadmap.</p>
      </Reveal>

      {/* step rail */}
      <Reveal delay={100}>
        <div className="mt-8 flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const reachable = i <= maxVisited;
            return (
              <div key={s.label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => reachable && go(i)}
                  disabled={!reachable}
                  className={cls(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-1 py-3 transition-all duration-200 sm:flex-row sm:justify-center sm:gap-2.5 sm:px-3",
                    active
                      ? "border-indigo-400/60 bg-indigo-500/15 shadow-[0_0_24px_-8px_rgba(99,102,241,0.7)]"
                      : done
                        ? "border-emerald-500/30 bg-emerald-500/[0.07] hover:border-emerald-400/50"
                        : reachable
                          ? "border-white/[0.08] bg-white/[0.02] hover:border-slate-500/50"
                          : "border-white/[0.06] bg-transparent opacity-50"
                  )}
                >
                  <span
                    className={cls(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                      done ? "bg-emerald-500/25 text-emerald-300" : active ? "btn-grad text-white" : "bg-white/[0.07] text-slate-400"
                    )}
                  >
                    {done ? <Icon name="check" size={11} sw={3} /> : i + 1}
                  </span>
                  <span className={cls("text-[11px] font-semibold sm:text-[12.5px]", active ? "text-white" : "text-slate-400")}>{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
      </Reveal>

      {/* step body */}
      <div key={step} className="card anim-slide mt-6 p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Project name" error={errors.projectName}>
              <Input placeholder="e.g. Nimbus Notes" value={d.projectName} invalid={!!errors.projectName} onChange={(e) => set("projectName", e.target.value)} autoFocus />
            </Field>
            <Field label="Tagline" error={errors.tagline} counter={`${d.tagline.length}/150`} hint="One line that sells the idea.">
              <Input placeholder="A realtime markdown workspace for distributed teams" value={d.tagline} invalid={!!errors.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
            <Field label="Description" error={errors.description} hint="What is it, roughly how does it work, what makes it different?">
              <Textarea placeholder="Nimbus Notes is a collaborative markdown workspace where teams capture decisions, RFCs and runbooks…" value={d.description} invalid={!!errors.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={d.category} onChange={(e) => set("category", e.target.value as Category)}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {errors.stack && (
              <p className="anim-fade-up flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] font-medium text-rose-300">
                <Icon name="alert" size={15} /> {errors.stack}
              </p>
            )}
            <TagPicker label="Frontend" options={TECH_POOLS.frontend} values={d.frontend} onChange={(v) => set("frontend", v)} />
            <TagPicker label="Backend" options={TECH_POOLS.backend} values={d.backend} onChange={(v) => set("backend", v)} />
            <TagPicker label="Database" options={TECH_POOLS.database} values={d.database} onChange={(v) => set("database", v)} />
            <TagPicker label="Deployment" options={TECH_POOLS.deployment} values={d.deployment} onChange={(v) => set("deployment", v)} />
            <div>
              <span className="mb-2 block text-[13px] font-semibold text-slate-300">Other tools</span>
              <OtherTags values={d.other} onChange={(v) => set("other", v)} />
              <p className="mt-1.5 text-xs text-slate-500">Stripe, Socket.io, Cloudinary… press Enter after each.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Problem statement" hint="What pain does this project kill?">
              <Textarea placeholder="Teams lose architectural decisions in chat threads and can't trace why something was built." value={d.problemStatement} onChange={(e) => set("problemStatement", e.target.value)} />
            </Field>
            <Field label="Target audience" hint="Who will actually use this?">
              <Input placeholder="Remote engineering teams of 5–50 people" value={d.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
            </Field>
            <Field label="Key features" error={errors.features || undefined} hint="These become the sprint slices in Phase 4 — one per line of thought.">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Realtime collaborative editor"
                  value={featureDraft}
                  invalid={!!errors.features}
                  onChange={(e) => setFeatureDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" variant="subtle" icon="plus" onClick={addFeature}>
                  Add
                </Button>
              </div>
            </Field>
            {d.features.length > 0 && (
              <ul className="space-y-2">
                {d.features.map((f, i) => (
                  <li key={f} className="anim-pop flex items-center gap-3 rounded-lg border border-indigo-500/25 bg-indigo-500/[0.08] px-3.5 py-2.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-400">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-sm font-medium text-slate-200">{f}</span>
                    <button onClick={() => set("features", d.features.filter((x) => x !== f))} className="text-slate-500 transition-colors hover:text-rose-400">
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Team size" error={errors.teamSize}>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={d.teamSize}
                  invalid={!!errors.teamSize}
                  onChange={(e) => set("teamSize", parseInt(e.target.value || "1", 10))}
                />
              </Field>
              <Field label="Estimated duration">
                <Select value={d.estimatedDuration} onChange={(e) => set("estimatedDuration", e.target.value as Duration)}>
                  {Object.entries(DURATION_LABELS).map(([v, l]) => (
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
                value={d.priority}
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
                value={d.budget}
                onChange={(v) => set("budget", v)}
              />
            </Field>
            <Field label="Start date" hint="Optional — used to date your milestones.">
              <Input type="date" value={d.startDate ? d.startDate.slice(0, 10) : ""} onChange={(e) => set("startDate", e.target.value ? new Date(e.target.value + "T00:00:00").toISOString() : "")} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-white">{d.projectName}</h2>
              <Badge tone="violet">{CATEGORY_LABELS[d.category]}</Badge>
              <Badge tone="indigo">{DURATION_LABELS[d.estimatedDuration]}</Badge>
              <Badge tone={d.priority === "critical" ? "rose" : d.priority === "high" ? "amber" : "slate"}>{d.priority} priority</Badge>
            </div>
            {d.tagline && <p className="text-sm italic text-slate-400">“{d.tagline}”</p>}
            <div className="mt-5 grid gap-x-10 lg:grid-cols-2">
              <div>
                <p className="mono-tag mb-1 text-indigo-400">brief</p>
                <p className="text-sm leading-relaxed text-slate-300">{d.description}</p>
                <div className="mt-3">
                  {reviewRow("Problem", d.problemStatement)}
                  {reviewRow("Audience", d.targetAudience)}
                  {reviewRow("Team", `${d.teamSize} ${d.teamSize === 1 ? "person" : "people"}`)}
                  {reviewRow("Priority / budget", `${d.priority} · ${d.budget}`)}
                </div>
              </div>
              <div>
                <p className="mono-tag mb-1 text-indigo-400">stack & scope</p>
                {reviewRow("Frontend", d.frontend.join(", "))}
                {reviewRow("Backend", d.backend.join(", "))}
                {reviewRow("Database", d.database.join(", "))}
                {reviewRow("Deploy", d.deployment.join(", "))}
                {d.other.length > 0 && reviewRow("Other", d.other.join(", "))}
                <div className="mt-3">
                  <p className="mono-tag mb-2 text-indigo-400">{d.features.length} features → sprint slices</p>
                  <ul className="space-y-1.5">
                    {d.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px] text-slate-300">
                        <Icon name="zap" size={12} className="text-violet-400" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* nav */}
        <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-6">
          <Button variant="ghost" icon="arrow-left" onClick={() => (step === 0 ? navigate("/dashboard") : setStep(step - 1))}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button icon="arrow-right" onClick={() => go(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button size="lg" icon="boat" onClick={launch}>
              Chart my roadmap
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function OtherTags({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/,+$/, "");
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="input flex flex-wrap items-center gap-2 py-2!">
      {values.map((v) => (
        <span key={v} className="anim-pop inline-flex items-center gap-1.5 rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-1 text-xs font-semibold text-violet-200">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-violet-300/70 hover:text-white">
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
        }}
        placeholder={values.length ? "" : "Type a tool and press Enter"}
        className="min-w-[140px] flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
      />
    </div>
  );
}
