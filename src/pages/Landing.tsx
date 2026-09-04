import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { cls } from "../lib/utils";
import { Badge, Button, Icon, Logo, ProgressRing, Reveal } from "../components/ui";
import type { IconName } from "../components/ui";

const TERM_LINES = [
  "$ devforge forge --brief nimbus-notes.md",
  "› parsing brief · 6 features · MERN + realtime",
  "› sizing phases against a 2-month window…",
  "› mapping features → vertical sprint slices…",
  "› pricing 4 risks with mitigations…",
];

const TERM_PHASES = [
  { name: "Requirements & Research", dur: "6d" },
  { name: "System Design & Architecture", dur: "8d" },
  { name: "Setup & Foundation", dur: "7d" },
  { name: "Core Development", dur: "23d" },
  { name: "Testing & QA", dur: "10d" },
  { name: "Deployment & Launch", dur: "6d" },
];

function ForgeTerminal() {
  const totalSteps = TERM_LINES.length + TERM_PHASES.length + 2;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s >= totalSteps + 7 ? 0 : s + 1)), 460);
    return () => window.clearInterval(t);
  }, [totalSteps]);

  const done = step >= totalSteps;
  return (
    <div className="card relative overflow-hidden rounded-2xl!">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-[11px] text-slate-500">devforge — ai planner</span>
        <Badge tone="indigo" className="ml-auto text-[10px]!">
          <Icon name="spark" size={11} /> live
        </Badge>
      </div>
      <div className="min-h-[318px] p-5 font-mono text-[12.5px] leading-[1.9]">
        {TERM_LINES.map((l, i) =>
          step > i ? (
            <p key={i} className={cls("anim-fade-up whitespace-pre-wrap", i === 0 ? "text-slate-200" : "text-slate-400")}>
              {i === 0 ? <span className="text-indigo-400">$ </span> : null}
              {i === 0 ? l.slice(2) : l}
            </p>
          ) : null
        )}
        {TERM_PHASES.map((p, i) => {
          const at = TERM_LINES.length + i;
          if (step <= at) return null;
          return (
            <p key={p.name} className="anim-slide flex items-center justify-between gap-3 text-slate-300">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                  <Icon name="check" size={10} sw={2.6} />
                </span>
                <span className="truncate">
                  phase {i + 1}/6 · {p.name}
                </span>
              </span>
              <span className="shrink-0 text-slate-600">{p.dur}</span>
            </p>
          );
        })}
        {done && (
          <p className="anim-fade-up mt-1 text-emerald-400">
            ✓ roadmap v1 ready — 34 tasks · 6 milestones · report.pdf
            <span className="anim-caret ml-1 inline-block h-3.5 w-[7px] translate-y-0.5 bg-emerald-400" />
          </p>
        )}
        {!done && step <= TERM_LINES.length && (
          <span className="anim-caret inline-block h-3.5 w-[7px] translate-y-0.5 bg-indigo-400" />
        )}
      </div>
    </div>
  );
}

const PROCESS: { n: string; title: string; body: string; icon: IconName }[] = [
  { n: "01", title: "Describe the build", body: "A five-step brief: what it is, the stack, features, team and timeline.", icon: "pen" },
  { n: "02", title: "Forge the roadmap", body: "DevForge AI returns 6 phases, ~40 tasks, milestones, risks and tooling.", icon: "hammer" },
  { n: "03", title: "Track every phase", body: "Flip task and phase statuses — progress rolls up automatically.", icon: "layers" },
  { n: "04", title: "Ship the report", body: "One click produces a professional PDF you can hand to anyone.", icon: "file" },
];

const TICKER = [
  "Requirements & Research",
  "System Design",
  "Setup & Foundation",
  "Core Development",
  "Testing & QA",
  "Deployment & Launch",
];

export default function Landing() {
  const navigate = useNavigate();
  const { demoLogin } = useApp();
  const openDemo = () => {
    demoLogin();
    navigate("/projects/p-demo/roadmap");
  };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="overflow-hidden">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
            <button onClick={() => scrollTo("process")} className="transition-colors hover:text-white">Process</button>
            <button onClick={() => scrollTo("features")} className="transition-colors hover:text-white">Features</button>
            <button onClick={() => scrollTo("phases")} className="transition-colors hover:text-white">The 6 phases</button>
          </nav>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              Get started free
            </Button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:pt-24">
        <div>
          <Reveal>
            <p className="mono-tag flex items-center gap-2.5 text-indigo-400">
              <span className="inline-block h-px w-8 bg-indigo-400/70" />
              AI-powered project planning
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]">
              Plan smarter.
              <br />
              Build faster.
              <br />
              <span className="relative inline-block text-transparent" style={{ backgroundImage: "linear-gradient(110deg,#818cf8,#c4b5fd)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
                Ship with confidence.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-slate-400">
              Give DevForge a project brief — stack, features, team, timeline — and get back a complete{" "}
              <span className="text-slate-200 font-semibold">six-phase roadmap</span> with tasks, estimates, milestones, risks and pro tips.
              Track it live, then hand over a polished PDF.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button size="lg" icon="spark" onClick={() => navigate("/register")}>
                Forge your first roadmap
              </Button>
              <Button size="lg" variant="outline" icon="eye" onClick={openDemo}>
                Explore the live demo
              </Button>
            </div>
            <p className="mt-5 font-mono text-[11.5px] tracking-wide text-slate-500">
              6 phases · ~40 tasks per roadmap · PDF in one click · free while in beta
            </p>
          </Reveal>
        </div>

        <Reveal delay={180} className="relative">
          <ForgeTerminal />
          <div className="anim-float absolute -right-3 -top-7 hidden rounded-xl border border-indigo-400/30 bg-ink-850/95 px-4 py-3 shadow-glow backdrop-blur sm:flex sm:items-center sm:gap-3">
            <ProgressRing value={42} size={54} stroke={6} />
            <div>
              <p className="text-[13px] font-bold text-white">Phase 3 of 6</p>
              <p className="font-mono text-[10.5px] text-slate-500">setup & foundation</p>
            </div>
          </div>
          <div className="anim-float absolute -bottom-6 -left-3 hidden items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-ink-850/95 px-4 py-3 shadow-card backdrop-blur sm:flex" style={{ animationDelay: "1.2s" }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Icon name="file" size={16} />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-white">nimbus-roadmap.pdf</p>
              <p className="font-mono text-[10.5px] text-slate-500">12 pages · ready to send</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* process */}
      <section id="process" className="border-t border-white/[0.05] bg-ink-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="mono-tag text-indigo-400">// how it works</p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From a rough idea to a shippable plan
            </h2>
          </Reveal>
          <div className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
            <div className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-slate-700/70 md:block" />
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <div className="relative">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-400/30 bg-ink-850 text-indigo-300 shadow-glow">
                    <Icon name={s.icon} size={22} />
                  </div>
                  <p className="mt-5 font-mono text-xs font-bold text-violet-400">{s.n}</p>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* features — asymmetric */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="mono-tag text-indigo-400">// the forge</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything between “idea” and “launched”
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-5">
            {/* big card */}
            <Reveal className="lg:col-span-3">
              <div className="card card-hover h-full p-7">
                <Badge tone="indigo">
                  <Icon name="spark" size={12} /> core engine
                </Badge>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">Roadmaps that read your brief</h3>
                <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-400">
                  The engine weaves your actual stack, features and team size into every phase — sprint slices are built from{" "}
                  <em className="text-slate-200 not-italic font-semibold">your</em> feature list, risks respond to{" "}
                  <em className="text-slate-200 not-italic font-semibold">your</em> constraints. Plug in a Groq key and it runs on
                  llama-3.1-70b; without one, the offline forge still delivers.
                </p>
                <div className="mt-6 space-y-2">
                  {["Core Development", "Testing & QA", "Deployment & Launch"].map((p, i) => (
                    <div key={p} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-ink-900/70 px-3.5 py-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 font-mono text-[11px] font-bold text-indigo-300">
                        {i + 4}
                      </span>
                      <span className="flex-1 text-[13px] font-semibold text-slate-200">{p}</span>
                      <span className="font-mono text-[10.5px] text-slate-500">{["23d", "10d", "6d"][i]}</span>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700/60">
                        <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${[72, 35, 0][i]}%` }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 lg:col-span-2">
              <Reveal delay={120}>
                <div className="card card-hover p-7">
                  <Badge tone="emerald">
                    <Icon name="layers" size={12} /> tracking
                  </Badge>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">Status that rolls up itself</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Tick a task, and its phase, the progress ring and the project card all update in the same instant.
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {[
                      ["Scaffold repo + CI", true],
                      ["Preview deploys on Vercel", true],
                      ["Base UI kit", false],
                    ].map(([label, done]) => (
                      <div key={label as string} className="flex items-center gap-2.5 text-[13px]">
                        <span className={cls("flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full border", done ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-400" : "border-slate-600 text-transparent")}>
                          <Icon name="check" size={10} sw={3} />
                        </span>
                        <span className={done ? "text-slate-500 line-through" : "text-slate-300"}>{label as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={220}>
                <div className="card card-hover p-7">
                  <Badge tone="violet">
                    <Icon name="file" size={12} /> reporting
                  </Badge>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">A report worth sending</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Cover page, task tables, milestone timeline, risk register — branded and paginated, downloaded as PDF in one click.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* phase ticker */}
      <section id="phases" className="border-y border-white/[0.05] bg-ink-900/40 py-10">
        <div className="mx-auto mb-7 max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="mono-tag text-indigo-400">// every roadmap, six phases</p>
          </Reveal>
        </div>
        <div className="relative overflow-hidden">
          <div className="ticker-track flex w-max gap-4 pr-4">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-3 rounded-full border border-indigo-500/25 bg-indigo-500/[0.07] px-5 py-2.5 font-mono text-[12.5px] text-indigo-200">
                <span className="font-bold text-violet-400">{String((i % 6) + 1).padStart(2, "0")}</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="card relative overflow-hidden px-8 py-14 text-center sm:px-14">
              <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 120% at 50% 0%, rgba(99,102,241,0.16), transparent 70%)" }} />
              <p className="mono-tag relative text-indigo-400">// ready when you are</p>
              <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-[2.6rem] sm:leading-[1.1]">
                Your next project deserves more than a to-do list.
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-slate-400">
                Join free, describe your build in five minutes, and walk away with a plan a senior PM would nod at.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3.5">
                <Button size="lg" icon="spark" onClick={() => navigate("/register")}>
                  Start forging — it's free
                </Button>
                <Button size="lg" variant="outline" onClick={openDemo}>
                  See the demo roadmap
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
          <Logo size={28} />
          <p className="font-mono text-[11px] text-slate-600">forged with react · tailwind · groq-ready — © 2026 devforge</p>
          <div className="flex gap-5 text-sm text-slate-500">
            <button onClick={() => scrollTo("process")} className="transition-colors hover:text-white">Process</button>
            <button onClick={() => scrollTo("features")} className="transition-colors hover:text-white">Features</button>
            <button onClick={() => navigate("/login")} className="transition-colors hover:text-white">Log in</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
