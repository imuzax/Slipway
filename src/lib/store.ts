import type { Project, Roadmap, Settings, User } from "./types";
import { hashPw, uid } from "./utils";
import { buildLocalRoadmapContent } from "./engine";

const KEYS = {
  users: "devforge:users",
  session: "devforge:session",
  projects: "devforge:projects",
  roadmaps: "devforge:roadmaps",
  settings: "devforge:settings",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — run in-memory */
  }
}

export const store = {
  loadUsers: () => read<User[]>(KEYS.users, []),
  saveUsers: (u: User[]) => write(KEYS.users, u),
  loadSession: () => read<string | null>(KEYS.session, null),
  saveSession: (id: string | null) => write(KEYS.session, id),
  loadProjects: () => read<Project[]>(KEYS.projects, []),
  saveProjects: (p: Project[]) => write(KEYS.projects, p),
  loadRoadmaps: () => read<Roadmap[]>(KEYS.roadmaps, []),
  saveRoadmaps: (r: Roadmap[]) => write(KEYS.roadmaps, r),
  loadSettings: () => read<Settings>(KEYS.settings, { groqKey: "" }),
  saveSettings: (s: Settings) => write(KEYS.settings, s),
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** First-run seed: a demo workspace so the product is explorable instantly. */
export function ensureSeed() {
  try {
    if (localStorage.getItem(KEYS.users)) return;
  } catch {
    return;
  }

  const demoUser: User = {
    id: "u-demo",
    name: "Ava Chen",
    email: "demo@devforge.dev",
    pass: hashPw("forge123"),
    role: "developer",
    createdAt: daysAgo(21),
  };

  const project: Project = {
    id: "p-demo",
    userId: demoUser.id,
    projectName: "Nimbus Notes",
    tagline: "A realtime markdown workspace for distributed teams",
    description:
      "Nimbus Notes is a collaborative markdown workspace where engineering teams capture decisions, RFCs and runbooks in realtime. Documents sync instantly across editors, every change is versioned, and the whole workspace is shareable through granular public links. Billing is seat-based via Stripe.",
    category: "saas",
    techStack: {
      frontend: ["React", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      database: ["MongoDB", "Redis"],
      deployment: ["Vercel", "Railway"],
      other: ["Socket.io", "Stripe", "Cloudinary"],
    },
    features: [
      "Realtime collaborative markdown editor",
      "Team workspaces & invitations",
      "Version history & snapshots",
      "Comments & @mentions",
      "Stripe billing & seat management",
      "Public share links with granular access",
    ],
    targetAudience: "Remote engineering teams of 5–50 people",
    problemStatement:
      "Existing docs tools are either too heavy (Notion) or too dumb (plain .md files in a repo). Teams lose architectural decisions in chat threads and can't trace why something was built.",
    teamSize: 3,
    estimatedDuration: "2-months",
    priority: "high",
    budget: "medium",
    status: "in-progress",
    progress: 0,
    startDate: daysAgo(10),
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
  };

  const content = buildLocalRoadmapContent(project);
  const roadmap: Roadmap = {
    id: "r-demo",
    projectId: project.id,
    userId: demoUser.id,
    ...content,
    generatedAt: daysAgo(10),
    version: 1,
    engine: "local",
  };

  // Simulate ~3 sprints of real usage: phase 1 done, phase 2 mostly done, phase 3 started.
  const setPhase = (idx: number, doneCount: number, inProgress: boolean) => {
    const ph = roadmap.phases[idx];
    ph.tasks.forEach((t, i) => {
      t.status = i < doneCount ? "done" : i === doneCount && inProgress ? "in-progress" : "todo";
    });
    const allDone = doneCount >= ph.tasks.length;
    ph.status = allDone ? "completed" : doneCount > 0 || inProgress ? "in-progress" : "not-started";
  };
  setPhase(0, 99, false);
  setPhase(1, 3, true);
  setPhase(2, 1, true);

  const total = roadmap.phases.reduce((n, p) => n + p.tasks.length, 0);
  const done = roadmap.phases.reduce((n, p) => n + p.tasks.filter((t) => t.status === "done").length, 0);
  project.progress = Math.round((done / total) * 100);

  store.saveUsers([demoUser]);
  store.saveProjects([project]);
  store.saveRoadmaps([roadmap]);
  store.saveSettings({ groqKey: "" });
}

export function createId(prefix: string) {
  return `${prefix}-${uid()}`;
}
