import type {
  Milestone,
  Project,
  Risk,
  RoadmapPhase,
  RoadmapTask,
  TaskPriority,
  TaskStatus,
} from "./types";
import { addDays, uid } from "./utils";

export const GENERATION_STAGES = [
  "Parsing project brief…",
  "Mapping features to vertical slices…",
  "Plotting phases against your timeline…",
  "Pricing risks & mitigations…",
  "Charting the course…",
];

const DURATION_DAYS: Record<string, number> = {
  "1-week": 7,
  "2-weeks": 14,
  "1-month": 30,
  "2-months": 60,
  "3-months": 90,
  "6-months": 180,
  "1-year": 365,
};

const PHASE_WEIGHTS = [0.1, 0.14, 0.12, 0.38, 0.16, 0.1];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
};

export function humanDays(days: number): string {
  if (days <= 1) return "1 day";
  if (days < 7) return `${Math.round(days)} days`;
  const w = days / 7;
  if (w < 1.6) return "1 week";
  if (w < 5) return `${Math.round(w)} weeks`;
  const m = days / 30;
  if (m < 1.6) return "1 month";
  if (m < 11) return `${Math.round(m)} months`;
  return `${Math.round(m / 12)} year${m >= 18 ? "s" : ""}`;
}

const task = (
  taskName: string,
  description: string,
  priority: TaskPriority,
  estimatedTime: string,
  status: TaskStatus = "todo"
): RoadmapTask => ({ id: uid(), taskName, description, priority, status, estimatedTime });

interface Ctx {
  p: Project;
  name: string;
  fe: string;
  be: string;
  db: string;
  deploy: string;
  feats: string[];
  feat0: string;
  feat1: string;
  audience: string;
  totalDays: number;
  est: (phaseIdx: number, tasks: number, jitter?: number) => string;
  hasRealtime: boolean;
  hasPayments: boolean;
  hasAuth: boolean;
  isMobile: boolean;
  solo: boolean;
  testRunner: string;
}

function makeCtx(p: Project): Ctx {
  const totalDays = DURATION_DAYS[p.estimatedDuration] ?? 60;
  const allText = [...p.features, ...p.techStack.other, p.description].join(" ").toLowerCase();
  const fe = p.techStack.frontend[0] || "React";
  const est = (phaseIdx: number, tasks: number, jitter = 0.8) =>
    humanDays(Math.max(0.5, ((totalDays * PHASE_WEIGHTS[phaseIdx]) / tasks) * (0.7 + Math.random() * jitter)));
  return {
    p,
    name: p.projectName,
    fe,
    be: p.techStack.backend[0] || "Node.js",
    db: p.techStack.database[0] || "MongoDB",
    deploy: p.techStack.deployment[0] || "Vercel",
    feats: p.features.length ? p.features : ["the core MVP flow"],
    feat0: (p.features[0] || "the core flow").toLowerCase(),
    feat1: (p.features[1] || "user onboarding").toLowerCase(),
    audience: p.targetAudience || "your target users",
    totalDays,
    est,
    hasRealtime: /real-?time|realtime|chat|socket|live|collab/i.test(allText),
    hasPayments: /pay|stripe|billing|checkout|subscription|seat/i.test(allText),
    hasAuth: /auth|login|account|user|invitation|team/i.test(allText),
    isMobile: p.category === "mobile-app",
    solo: p.teamSize <= 1,
    testRunner: /vue|angular|svelte/i.test(fe) ? "Vitest" : pick(["Vitest", "Jest"]),
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ------------------------------------------------------------------ */
/* Phase builders                                                      */
/* ------------------------------------------------------------------ */

function phase1(c: Ctx): RoadmapPhase {
  const n = 5;
  return {
    id: uid(),
    phaseNumber: 1,
    phaseName: "Requirements & Research",
    description: `Nail down what ${c.name} must do — and more importantly, what it won't do yet. Turn the brief into testable user stories and a scope the ${c.p.estimatedDuration.replace("-", " ")} window can actually hold.`,
    duration: humanDays(c.totalDays * PHASE_WEIGHTS[0]),
    status: "not-started",
    tasks: [
      task(
        "Lock the problem statement & success metrics",
        `Distill the brief into one sentence and define 3 measurable success criteria for ${c.name} (activation, retention or revenue — pick what matters).`,
        "high",
        c.est(0, n)
      ),
      task(
        `Profile ${c.audience}`,
        "Write 2–3 lightweight personas with their top jobs-to-be-done. If possible, talk to 3 real users for 15 minutes each.",
        "high",
        c.est(0, n)
      ),
      task(
        "Competitive teardown",
        "Analyze the 3 closest alternatives: pricing, onboarding, and the gap your project can own.",
        "medium",
        c.est(0, n)
      ),
      task(
        `Turn the ${c.feats.length} features into user stories`,
        "Write each feature as “As a [user], I want [capability] so that [outcome]” with acceptance criteria. Tag the must-haves for the MVP.",
        "high",
        c.est(0, n)
      ),
      task(
        "Scope with MoSCoW",
        "Classify every feature Must / Should / Could / Won't. The MVP should fit in ~60% of the timeline — leave slack for the unknown.",
        "medium",
        c.est(0, n)
      ),
    ],
    deliverables: [
      `One-page PRD for ${c.name}`,
      "User stories with acceptance criteria",
      "MoSCoW-scoped MVP backlog",
      "Success metrics & KPI list",
    ],
    tips: c.solo
      ? [
          "Solo build: timebox research hard — momentum beats perfect requirements.",
          "Write the launch announcement first. It exposes fuzzy thinking faster than any template.",
        ]
      : [
          `With ${c.p.teamSize} people, run one 60-min kickoff instead of a meeting series — leave with the MoSCoW board filled.`,
          "Assign one owner per user story. Unowned stories don't get built.",
        ],
    tools: pickN(["Notion", "Linear", "FigJam", "Google Forms", "Miro"], 4),
  };
}

function phase2(c: Ctx): RoadmapPhase {
  const n = 5;
  const tasks = [
    task(
      `Model the data in ${c.db}`,
      `Design the schema around ${c.feat0} and ${c.feat1}. Sketch entities, relations and indexes in dbdiagram.io before writing any code.`,
      "high",
      c.est(1, n)
    ),
    task(
      "Contract-first API design",
      `Draft the ${c.be} route map (or OpenAPI spec) for every MVP endpoint. Request/response shapes agreed now prevent rework in Phase 4.`,
      "high",
      c.est(1, n)
    ),
    task(
      "Wireframes for the 3 golden journeys",
      `Low-fi Figma flows for onboarding, ${c.feat0}, and the primary daily-use loop. States included: empty, loading, error, success.`,
      "medium",
      c.est(1, n)
    ),
    task(
      "Component inventory",
      `List the ~15 shared ${c.fe} components you'll need (buttons, inputs, cards, modals, tables) and their variants. This becomes your Phase 3 UI kit backlog.`,
      "medium",
      c.est(1, n)
    ),
  ];
  if (c.hasAuth)
    tasks.push(
      task(
        "Auth & permissions model",
        "Decide session vs JWT, password reset flow, and the role/permission matrix. Diagram the token lifecycle.",
        "high",
        c.est(1, n + 1)
      )
    );
  else
    tasks.push(
      task(
        "Architecture decision records",
        `Write 3–5 short ADRs: why ${c.fe} + ${c.be}, why ${c.db}, hosting choice, and the one decision you're most unsure about.`,
        "medium",
        c.est(1, n + 1)
      )
    );
  return {
    id: uid(),
    phaseNumber: 2,
    phaseName: "System Design & Architecture",
    description: `Make the expensive decisions on paper while they're still cheap: data model, API contract, and the UI flows for ${c.name}. Code comes later — agreement comes first.`,
    duration: humanDays(c.totalDays * PHASE_WEIGHTS[1]),
    status: "not-started",
    tasks,
    deliverables: [
      `ERD / schema diagram for ${c.db}`,
      "API contract (OpenAPI or route table)",
      "Figma wireframes for core flows",
      "ADR log + component inventory",
    ],
    tips: [
      "Design for the second feature, build for the first. Don't over-abstract.",
      `If a schema change would hurt after launch, settle it now — ${c.db} migrations get expensive fast.`,
    ],
    tools: pickN(["Figma", "dbdiagram.io", "Excalidraw", "Stoplight", "draw.io"], 4),
  };
}

function phase3(c: Ctx): RoadmapPhase {
  const n = 5;
  const tasks = [
    task(
      "Scaffold the repo",
      `Initialize ${c.fe} + ${c.be} with TypeScript, ESLint and Prettier. A clean README with setup commands is part of “done”.`,
      "high",
      c.est(2, n)
    ),
    task(
      "Git workflow & CI pipeline",
      "GitHub Flow + PR template, and a GitHub Actions pipeline running lint, typecheck and tests on every push. No green check, no merge.",
      "high",
      c.est(2, n)
    ),
    task(
      "Environments & secrets",
      `Dev / staging / prod environment variables with a .env.example. Secret handling configured for ${c.deploy} from day one.`,
      "medium",
      c.est(2, n)
    ),
    task(
      "Base UI kit",
      `Build the design primitives in ${c.fe}: type scale, color tokens, button/input/form states. Every later screen inherits this.`,
      "medium",
      c.est(2, n)
    ),
    task(
      `Preview deploys on ${c.deploy}`,
      "Every PR gets a preview URL; main auto-deploys to staging. If it isn't deployed, it isn't done.",
      "medium",
      c.est(2, n)
    ),
  ];
  if (c.hasAuth)
    tasks.push(
      task(
        "Auth skeleton end-to-end",
        "Register → login → protected route working against the real database, with token refresh and error states.",
        "high",
        c.est(2, n + 1)
      )
    );
  else
    tasks.push(
      task(
        `Seed data & fixtures for ${c.db}`,
        "A one-command seed script with realistic demo data so anyone can run the app populated in seconds.",
        "medium",
        c.est(2, n + 1)
      )
    );
  return {
    id: uid(),
    phaseNumber: 3,
    phaseName: "Setup & Foundation",
    description: `Boring on purpose. A green pipeline, preview deploys and a shared UI kit make Phase 4 twice as fast — the foundation is where ${c.name}'s speed is actually decided.`,
    duration: humanDays(c.totalDays * PHASE_WEIGHTS[2]),
    status: "not-started",
    tasks,
    deliverables: [
      "Green CI pipeline on every PR",
      "Shared UI primitives in " + c.fe,
      `Staging deploy live on ${c.deploy}`,
      "Seeded development database",
    ],
    tips: [
      "Timebox foundation work. One week of tooling that serves a month of building — not longer.",
      "Automate the README test: a stranger clones the repo and runs it in under 10 minutes.",
    ],
    tools: pickN(["GitHub Actions", c.deploy, "ESLint", "Prettier", "Husky"], 4),
  };
}

function phase4(c: Ctx): RoadmapPhase {
  const slices = chunk(c.feats, Math.max(1, Math.ceil(c.feats.length / 4)));
  const devDays = c.totalDays * PHASE_WEIGHTS[3];
  const per = Math.max(1, devDays / (slices.length + 2));
  const tasks: RoadmapTask[] = slices.map((group, i) =>
    task(
      group.length === 1 ? `Ship: ${group[0]}` : `Sprint slice ${i + 1}: ${group.join(" + ")}`,
      `End-to-end vertical slice — ${c.fe} UI, ${c.be} endpoints, ${c.db} persistence, plus empty/loading/error states. Demo-able at the end.`,
      i < 2 ? "high" : "medium",
      humanDays(per)
    )
  );
  tasks.push(
    task(
      `Integrate ${c.fe} ↔ ${c.be}`,
      "Wire real API calls with optimistic UI, global error handling, request cancellation and auth-protected routes.",
      "high",
      humanDays(per)
    )
  );
  if (c.hasRealtime)
    tasks.push(
      task(
        "Realtime layer",
        "Presence + live sync over Socket.io (or equivalent) with reconnection/backoff and conflict handling.",
        "medium",
        humanDays(per * 0.8)
      )
    );
  if (c.hasPayments)
    tasks.push(
      task(
        "Billing in test mode",
        "Stripe products, checkout session, webhook handling and a local webhook tester. No real money until Phase 5 signs off.",
        "high",
        humanDays(per * 0.8)
      )
    );
  tasks.push(
    task(
      "Hardening pass",
      "Form validation everywhere (Zod or similar), skeleton loaders, 404/500 pages, and keyboard accessibility on core flows.",
      "medium",
      humanDays(per * 0.7)
    )
  );
  return {
    id: uid(),
    phaseNumber: 4,
    phaseName: "Core Development",
    description: `The build proper: ${c.feats.length} feature${c.feats.length === 1 ? "" : "s"} shipped as vertical slices against ${c.be} and ${c.db}. Weekly demos keep the scope honest and the morale high.`,
    duration: humanDays(devDays),
    status: "not-started",
    tasks: tasks.slice(0, 8),
    deliverables: [
      "Feature-complete MVP build on staging",
      "All flows integrated end-to-end",
      "Demo script / walkthrough recording",
    ],
    tips: c.solo
      ? [
          "Ship one slice at a time and demo it to a friend every Friday — external eyes catch what tunnel vision misses.",
          "Keep a 'cut list': anything that threatens the deadline goes there without guilt.",
        ]
      : [
          "Split work by feature, not by layer — one owner per slice avoids merge hell.",
          `Daily 10-minute standup, weekly demo. With ${c.p.teamSize} people, coordination cost is your real enemy.`,
        ],
    tools: pickN([c.fe, c.be, "GitHub Projects", "Zod", "Storybook"], 4),
  };
}

function phase5(c: Ctx): RoadmapPhase {
  const n = 5;
  const tasks = [
    task(
      "Unit tests for critical logic",
      `${c.testRunner} around auth, ${c.feat0} rules and money-adjacent paths. Aim for the risky 20%, not 100% coverage.`,
      "high",
      c.est(4, n)
    ),
    task(
      "End-to-end smoke suite",
      "Playwright scripts for the 3 golden journeys, running in CI on every PR.",
      "high",
      c.est(4, n)
    ),
    task(
      "Performance pass",
      `Lighthouse ≥ 90: code-split the ${c.fe} bundle, index hot ${c.db} queries, compress and cache assets.`,
      "medium",
      c.est(4, n)
    ),
    task(
      "Security sweep",
      "OWASP top-10 pass: input validation, auth bypass attempts, dependency audit, and secrets never in client code.",
      "high",
      c.est(4, n)
    ),
    c.solo
      ? task(
          "Solo bug bash",
          "Cold-start the app on a clean machine and on a phone. Every papercut you hit, a user will hit harder.",
          "medium",
          c.est(4, n)
        )
      : task(
          "Team bug bash",
          `30 minutes, ${c.p.teamSize} people, one shared board. Triage into must-fix-before-launch vs nice-to-have.`,
          "medium",
          c.est(4, n)
        ),
  ];
  if (c.isMobile)
    tasks.push(
      task(
        "Store readiness",
        "Screenshots, store listing, privacy manifest, and a TestFlight / internal-testing build submitted early — reviews take days.",
        "high",
        c.est(4, n + 1)
      )
    );
  return {
    id: uid(),
    phaseNumber: 5,
    phaseName: "Testing & QA",
    description: `Break ${c.name} on purpose before the internet does it by accident. Tests target the risky paths; the performance and security passes protect launch week.`,
    duration: humanDays(c.totalDays * PHASE_WEIGHTS[4]),
    status: "not-started",
    tasks,
    deliverables: [
      "Test coverage report for critical paths",
      "Zero open P0/P1 bugs",
      "Lighthouse baseline ≥ 90",
      "Security checklist sign-off",
    ],
    tips: [
      "Bugs found now cost 1×. The same bugs found after launch cost 10× in trust.",
      "Freeze features at the start of this phase. QA on moving targets is QA on nothing.",
    ],
    tools: pickN([c.testRunner, "Playwright", "Lighthouse", "npm audit", "OWASP ZAP"], 4),
  };
}

function phase6(c: Ctx): RoadmapPhase {
  const n = 5;
  return {
    id: uid(),
    phaseNumber: 6,
    phaseName: "Deployment & Launch",
    description: `Ship ${c.name} to production with a rollback plan, eyes on the error feed, and a loop that turns early users into roadmap input.`,
    duration: humanDays(c.totalDays * PHASE_WEIGHTS[5]),
    status: "not-started",
    tasks: [
      task(
        `Production deploy on ${c.deploy}`,
        "Zero-downtime config, env parity with staging, and a documented one-command rollback.",
        "high",
        c.est(5, n)
      ),
      task(
        "Observability & backups",
        `Sentry for errors, an uptime ping, and scheduled ${c.db} backups verified with an actual restore test.`,
        "high",
        c.est(5, n)
      ),
      task(
        "Docs & README",
        "Setup guide, API docs, and a 60-second demo GIF. Future-you is the first user to respect.",
        "medium",
        c.est(5, n)
      ),
      task(
        "Launch checklist",
        "OG tags, favicon, 404 page, analytics events (Plausible), and — if SaaS — terms & privacy policy.",
        "medium",
        c.est(5, n)
      ),
      task(
        "Post-launch feedback loop",
        "Instrument the 3 success metrics from Phase 1, schedule a weekly review of feedback, and draft the v1.1 shortlist.",
        "medium",
        c.est(5, n)
      ),
    ],
    deliverables: [
      "Live production URL",
      "Monitoring + backup alerts armed",
      "Public README & docs",
      "Launch retro + v1.1 shortlist",
    ],
    tips: [
      "Launch on a Tuesday morning, never a Friday evening. Be online the first 48 hours.",
      "The first 10 users are worth more than the next 1,000 — talk to each one.",
    ],
    tools: pickN([c.deploy, "Sentry", "Plausible", "Cronitor", "Crisp"], 4),
  };
}

/* ------------------------------------------------------------------ */
/* Summary builders                                                    */
/* ------------------------------------------------------------------ */

function buildMilestones(c: Ctx, phases: RoadmapPhase[]): Milestone[] {
  const start = c.p.startDate ? new Date(c.p.startDate) : new Date();
  const names = [
    "Requirements locked & MVP scoped",
    "Architecture & designs approved",
    "Staging environment green",
    "Feature-complete build",
    "QA sign-off",
    `${c.name} v1.0 live`,
  ];
  let cum = 0;
  return phases.map((ph, i) => {
    cum += c.totalDays * PHASE_WEIGHTS[i];
    return { name: names[i], date: addDays(start, cum).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
}

function buildRisks(c: Ctx): Risk[] {
  const pool: Risk[] = [
    {
      risk: `Scope creep — ${c.feats.length} features is ambitious for ${c.p.estimatedDuration.replace("-", " ")}.`,
      mitigation: "Enforce the MoSCoW cut from Phase 1; any addition must swap something out.",
    },
    {
      risk: "Integration slippage between frontend and backend contracts.",
      mitigation: "Contract-first API (Phase 2) plus mock-server development so sides never block each other.",
    },
    {
      risk: "The last 10% (edge cases, polish, deploy) taking as long as the first 90%.",
      mitigation: "Phases 5–6 are pre-scheduled, not leftover time. Protect them in the plan.",
    },
    {
      risk: `Learning curve on unfamiliar parts of the stack (${[...c.p.techStack.frontend, ...c.p.techStack.backend].slice(-1)[0] || "a new tool"}).`,
      mitigation: "Timeboxed 2-day spike early in Phase 3; if it's still foggy, swap for something known.",
    },
  ];
  if (c.solo)
    pool.unshift({
      risk: "Bus factor of one — knowledge and momentum live in a single head.",
      mitigation: "Write ADRs and a running DECISIONS.md; keep the repo runnable by a stranger.",
    });
  if (c.p.budget === "free")
    pool.push({
      risk: "Free-tier limits (database, hosting, third-party APIs) hitting mid-build.",
      mitigation: "List every free-tier ceiling in Phase 1; mock paid services locally until launch.",
    });
  if (c.hasPayments)
    pool.push({
      risk: "Billing edge cases (failed cards, proration, webhooks) ballooning development time.",
      mitigation: "Stripe test-mode only until QA; reuse their reference integration instead of hand-rolling.",
    });
  if (c.isMobile)
    pool.push({
      risk: "App-store review rejection or delays landing right at launch.",
      mitigation: "Submit the first review build in Phase 5, not Phase 6; keep a web fallback URL.",
    });
  return pickN(pool, Math.min(5, Math.max(4, pool.length - 1)));
}

function buildTechRecs(c: Ctx): string[] {
  const recs: string[] = [];
  if (!c.p.techStack.deployment.length) recs.push("Vercel or Railway for zero-config deploys");
  if (!c.p.techStack.other.some((t) => /sentry/i.test(t))) recs.push("Sentry — error tracking from the first deploy");
  recs.push(`${c.testRunner} + Playwright for the test pyramid`);
  if (c.hasPayments && !c.p.techStack.other.some((t) => /stripe/i.test(t))) recs.push("Stripe Billing for seat-based subscriptions");
  if (c.hasRealtime && !c.p.techStack.other.some((t) => /socket|redis/i.test(t))) recs.push("Redis pub/sub to scale the realtime layer");
  recs.push("Zod for runtime validation shared between client and server");
  if (!c.p.techStack.other.some((t) => /plausible|analytics|ga/i.test(t))) recs.push("Plausible for privacy-friendly launch analytics");
  if (c.p.teamSize > 1) recs.push("Linear or GitHub Projects for the shared board");
  recs.push("A DRAGON.md / DECISIONS.md for architecture decisions");
  return recs.slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface RoadmapContent {
  phases: RoadmapPhase[];
  totalEstimatedDuration: string;
  keyMilestones: Milestone[];
  risks: Risk[];
  techRecommendations: string[];
}

/** Deterministic-ish offline engine: always available, tailored to the brief. */
export function buildLocalRoadmapContent(p: Project): RoadmapContent {
  const c = makeCtx(p);
  const phases = [phase1(c), phase2(c), phase3(c), phase4(c), phase5(c), phase6(c)];
  return {
    phases,
    totalEstimatedDuration: `${humanDays(c.totalDays)}${c.solo ? " at solo pace" : ` with a team of ${c.p.teamSize}`}`,
    keyMilestones: buildMilestones(c, phases),
    risks: buildRisks(c),
    techRecommendations: buildTechRecs(c),
  };
}

const GROQ_PROMPT = (p: Project) => `You are Slipway AI, an expert software project planning assistant. Generate a comprehensive phased roadmap in valid JSON for this project.

PROJECT:
- Name: ${p.projectName}
- Description: ${p.description}
- Category: ${p.category}
- Problem: ${p.problemStatement || "—"}
- Audience: ${p.targetAudience || "—"}
- Stack: Frontend: ${p.techStack.frontend.join(", ") || "—"} | Backend: ${p.techStack.backend.join(", ") || "—"} | DB: ${p.techStack.database.join(", ") || "—"} | Deploy: ${p.techStack.deployment.join(", ") || "—"} | Other: ${p.techStack.other.join(", ") || "—"}
- Features: ${p.features.join("; ") || "—"}
- Team size: ${p.teamSize} | Duration target: ${p.estimatedDuration} | Priority: ${p.priority} | Budget: ${p.budget}

Produce exactly 6 phases (Requirements & Research; System Design & Architecture; Setup & Foundation; Core Development; Testing & QA; Deployment & Launch). Each phase: phaseNumber, phaseName, description (2-3 sentences), duration (realistic string), tasks (4-8 items: taskName, description, priority low|medium|high, estimatedTime string), deliverables (array), tips (2-3 strings), tools (array). Also: totalEstimatedDuration, keyMilestones (6 × {name,date}), risks (3-5 × {risk,mitigation}), techRecommendations (3-5 strings). Respond ONLY with the JSON object.`;

/** Validate/coerce an AI (or arbitrary) payload into safe RoadmapContent. */
export function normalizeRoadmapContent(raw: unknown, p: Project): RoadmapContent | null {
  try {
    const r = raw as Partial<RoadmapContent>;
    if (!r || !Array.isArray(r.phases) || r.phases.length < 3) return null;
    const str = (v: unknown, fb = "") => (typeof v === "string" && v.trim() ? v : fb);
    const phases: RoadmapPhase[] = r.phases.slice(0, 10).map((ph, i) => {
      const anyPh = ph as Partial<RoadmapPhase> | null | undefined;
      const tasks: RoadmapTask[] = Array.isArray(anyPh?.tasks)
        ? anyPh!.tasks.slice(0, 12).map((t) => {
            const at = t as Partial<RoadmapTask>;
            const pr = at?.priority === "high" || at?.priority === "low" ? at.priority : "medium";
            return {
              id: uid(),
              taskName: str(at?.taskName, "Untitled task"),
              description: str(at?.description),
              priority: pr,
              status: "todo",
              estimatedTime: str(at?.estimatedTime, "—"),
            };
          })
        : [];
      const arr = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);
      return {
        id: uid(),
        phaseNumber: typeof anyPh?.phaseNumber === "number" ? anyPh.phaseNumber : i + 1,
        phaseName: str(anyPh?.phaseName, `Phase ${i + 1}`),
        description: str(anyPh?.description),
        duration: str(anyPh?.duration, "—"),
        status: "not-started",
        tasks,
        deliverables: arr(anyPh?.deliverables),
        tips: arr(anyPh?.tips),
        tools: arr(anyPh?.tools),
      };
    });
    if (!phases.some((ph) => ph.tasks.length > 0)) return null;
    return {
      phases,
      totalEstimatedDuration: str(r.totalEstimatedDuration, "—"),
      keyMilestones: Array.isArray(r.keyMilestones)
        ? r.keyMilestones.map((m) => ({ name: str((m as Milestone)?.name, "Milestone"), date: str((m as Milestone)?.date, "—") }))
        : [],
      risks: Array.isArray(r.risks)
        ? r.risks.map((k) => ({ risk: str((k as Risk)?.risk), mitigation: str((k as Risk)?.mitigation) })).filter((k) => k.risk)
        : [],
      techRecommendations: Array.isArray(r.techRecommendations) ? (r.techRecommendations as unknown[]).map((x) => str(x)).filter(Boolean) : [],
    };
  } catch {
    return null;
  }
}

/** Try the real Groq API (OpenAI-compatible). Throws on any failure — caller falls back. */
export async function fetchGroqRoadmap(p: Project, apiKey: string): Promise<RoadmapContent> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are Slipway AI. You output structured project roadmaps as valid JSON only." },
          { role: "user", content: GROQ_PROMPT(p) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = normalizeRoadmapContent(JSON.parse(content), p);
    if (!parsed) throw new Error("Groq returned unusable JSON");
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}
