import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PhaseStatus, Project, Roadmap, Role, Settings, TaskStatus, Toast, User } from "../lib/types";
import { buildLocalRoadmapContent, fetchGroqRoadmap, GENERATION_STAGES } from "../lib/engine";
import { createId, ensureSeed, store } from "../lib/store";
import { hashPw, sleep, uid } from "../lib/utils";

ensureSeed();

interface GeneratingState {
  projectName: string;
  stageIndex: number;
}

interface AppContextValue {
  user: User | null;
  users: User[];
  register: (name: string, email: string, pw: string, role: Role) => string | null;
  login: (email: string, pw: string) => string | null;
  demoLogin: () => void;
  logout: () => void;

  projects: Project[];
  roadmaps: Roadmap[];
  roadmapFor: (projectId: string) => Roadmap | undefined;
  createProject: (data: Omit<Project, "id" | "userId" | "status" | "progress" | "createdAt" | "updatedAt">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  generating: GeneratingState | null;
  generateRoadmap: (projectId: string) => Promise<Roadmap | null>;

  cycleTask: (projectId: string, phaseId: string, taskId: string) => void;
  setPhaseStatus: (projectId: string, phaseId: string, status: PhaseStatus) => void;

  settings: Settings;
  saveGroqKey: (key: string) => void;

  toasts: Toast[];
  toast: (kind: Toast["kind"], message: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Derive phase status from its tasks, preserving a manual "skipped". */
function derivePhaseStatus(prev: PhaseStatus, tasks: Roadmap["phases"][number]["tasks"]): PhaseStatus {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  if (total > 0 && done === total) return "completed";
  if (prev === "skipped") return "skipped";
  return tasks.some((t) => t.status !== "todo") ? "in-progress" : "not-started";
}

function computeProgress(rm: Roadmap): number {
  const counted = rm.phases.filter((p) => p.status !== "skipped");
  const total = counted.reduce((n, p) => n + p.tasks.length, 0);
  const done = counted.reduce((n, p) => n + p.tasks.filter((t) => t.status === "done").length, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => store.loadUsers());
  const [session, setSession] = useState<string | null>(() => store.loadSession());
  const [projects, setProjects] = useState<Project[]>(() => store.loadProjects());
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => store.loadRoadmaps());
  const [settings, setSettings] = useState<Settings>(() => store.loadSettings());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [generating, setGenerating] = useState<GeneratingState | null>(null);

  // Write-through refs so mutations always see the latest state, even when
  // called synchronously right after another mutation (e.g. create → generate).
  const projectsRef = useRef(projects);
  const roadmapsRef = useRef(roadmaps);
  const busyRef = useRef(false);
  const commitProjects = useCallback((next: Project[]) => {
    projectsRef.current = next;
    setProjects(next);
  }, []);
  const commitRoadmaps = useCallback((next: Roadmap[]) => {
    roadmapsRef.current = next;
    setRoadmaps(next);
  }, []);

  useEffect(() => store.saveUsers(users), [users]);
  useEffect(() => store.saveSession(session), [session]);
  useEffect(() => store.saveProjects(projects), [projects]);
  useEffect(() => store.saveRoadmaps(roadmaps), [roadmaps]);
  useEffect(() => store.saveSettings(settings), [settings]);

  const user = useMemo(() => users.find((u) => u.id === session) ?? null, [users, session]);
  const myProjects = useMemo(
    () => (user ? projects.filter((p) => p.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []),
    [projects, user]
  );
  const myRoadmaps = useMemo(() => (user ? roadmaps.filter((r) => r.userId === user.id) : []), [roadmaps, user]);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = uid();
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  /* ---------------- auth ---------------- */

  const register = useCallback(
    (name: string, email: string, pw: string, role: Role): string | null => {
      const e = email.trim().toLowerCase();
      if (!name.trim()) return "Please tell us your name.";
      if (!EMAIL_RE.test(e)) return "That email doesn't look valid.";
      if (pw.length < 6) return "Password needs at least 6 characters.";
      if (users.some((u) => u.email === e)) return "An account with this email already exists — try logging in.";
      const nu: User = { id: createId("u"), name: name.trim(), email: e, pass: hashPw(pw), role, createdAt: new Date().toISOString() };
      setUsers((u) => [...u, nu]);
      setSession(nu.id);
      toast("success", `Welcome aboard, ${nu.name.split(" ")[0]}!`);
      return null;
    },
    [users, toast]
  );

  const login = useCallback(
    (email: string, pw: string): string | null => {
      const e = email.trim().toLowerCase();
      const u = users.find((x) => x.email === e);
      if (!u || u.pass !== hashPw(pw)) return "Invalid email or password.";
      setSession(u.id);
      toast("success", `Welcome back, ${u.name.split(" ")[0]}.`);
      return null;
    },
    [users, toast]
  );

  const demoLogin = useCallback(() => {
    setSession("u-demo");
    toast("success", "Logged into the demo workspace.");
  }, [toast]);

  const logout = useCallback(() => {
    setSession(null);
    toast("info", "Signed out. Your projects stay saved in this browser.");
  }, [toast]);

  /* ---------------- projects ---------------- */

  const createProject = useCallback<AppContextValue["createProject"]>(
    (data) => {
      const now = new Date().toISOString();
      const p: Project = { ...data, id: createId("p"), userId: user!.id, status: "planning", progress: 0, createdAt: now, updatedAt: now };
      commitProjects([...projectsRef.current, p]);
      return p;
    },
    [user, commitProjects]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      commitProjects(projectsRef.current.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
    },
    [commitProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      commitProjects(projectsRef.current.filter((p) => p.id !== id));
      commitRoadmaps(roadmapsRef.current.filter((r) => r.projectId !== id));
      toast("info", "Project deleted.");
    },
    [commitProjects, commitRoadmaps, toast]
  );

  const roadmapFor = useCallback((projectId: string) => roadmaps.find((r) => r.projectId === projectId), [roadmaps]);

  /* ---------------- roadmap progress ---------------- */

  const applyRoadmapUpdate = useCallback(
    (projectId: string, mutate: (rm: Roadmap) => Roadmap) => {
      let projectProgress: number | null = null;
      const nextRoadmaps = roadmapsRef.current.map((r) => {
        if (r.projectId !== projectId) return r;
        const mutated = mutate(r);
        const phases = mutated.phases.map((ph) => ({ ...ph, status: derivePhaseStatus(ph.status, ph.tasks) }));
        const rm = { ...mutated, phases };
        projectProgress = computeProgress(rm);
        return rm;
      });
      commitRoadmaps(nextRoadmaps);
      if (projectProgress !== null) {
        const progress = projectProgress;
        commitProjects(
          projectsRef.current.map((p) => {
            if (p.id !== projectId) return p;
            let status = p.status;
            if (progress >= 100) status = "completed";
            else if (status === "completed") status = "in-progress";
            else if (progress > 0 && status === "planning") status = "in-progress";
            return { ...p, progress, status, updatedAt: new Date().toISOString() };
          })
        );
      }
    },
    [commitProjects, commitRoadmaps]
  );

  const cycleTask = useCallback(
    (projectId: string, phaseId: string, taskId: string) => {
      const order: TaskStatus[] = ["todo", "in-progress", "done"];
      applyRoadmapUpdate(projectId, (rm) => ({
        ...rm,
        phases: rm.phases.map((ph) =>
          ph.id !== phaseId
            ? ph
            : {
                ...ph,
                tasks: ph.tasks.map((t) =>
                  t.id === taskId ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t
                ),
              }
        ),
      }));
    },
    [applyRoadmapUpdate]
  );

  const setPhaseStatus = useCallback(
    (projectId: string, phaseId: string, status: PhaseStatus) => {
      applyRoadmapUpdate(projectId, (rm) => ({
        ...rm,
        phases: rm.phases.map((ph) => {
          if (ph.id !== phaseId) return ph;
          let tasks = ph.tasks;
          if (status === "completed") tasks = tasks.map((t) => ({ ...t, status: "done" as TaskStatus }));
          if (status === "not-started") tasks = tasks.map((t) => ({ ...t, status: "todo" as TaskStatus }));
          if (status === "in-progress" && !tasks.some((t) => t.status !== "todo")) {
            tasks = tasks.map((t, i) => (i === 0 ? { ...t, status: "in-progress" as TaskStatus } : t));
          }
          return { ...ph, tasks, status };
        }),
      }));
    },
    [applyRoadmapUpdate]
  );

  /* ---------------- generation ---------------- */

  const generateRoadmap = useCallback(
    async (projectId: string): Promise<Roadmap | null> => {
      const project = projectsRef.current.find((p) => p.id === projectId);
      if (!project || busyRef.current) return null;
      busyRef.current = true;
      setGenerating({ projectName: project.projectName, stageIndex: 0 });
      const started = Date.now();
      const groqKey = settings.groqKey.trim();

      // Kick off the real work in parallel with the staged animation.
      const work = (async (): Promise<{ content: ReturnType<typeof buildLocalRoadmapContent>; engine: Roadmap["engine"] }> => {
        if (groqKey) {
          try {
            const content = await fetchGroqRoadmap(project, groqKey);
            return { content, engine: "groq" as const };
          } catch {
            toast("info", "Groq was unreachable — falling back to the offline chart engine.");
          }
        }
        await sleep(600);
        return { content: buildLocalRoadmapContent(project), engine: "local" as const };
      })();

      for (let i = 0; i < GENERATION_STAGES.length; i++) {
        setGenerating({ projectName: project.projectName, stageIndex: i });
        await sleep(780);
      }
      const { content, engine } = await work;
      const wait = 4400 - (Date.now() - started);
      if (wait > 0) await sleep(wait);

      const prev = roadmapsRef.current.find((r) => r.projectId === projectId);
      const rm: Roadmap = {
        id: createId("r"),
        projectId,
        userId: project.userId,
        ...content,
        generatedAt: new Date().toISOString(),
        version: prev ? prev.version + 1 : 1,
        engine,
      };
      commitRoadmaps([...roadmapsRef.current.filter((r) => r.projectId !== projectId), rm]);
      commitProjects(
        projectsRef.current.map((p) =>
          p.id === projectId ? { ...p, progress: 0, status: "planning", updatedAt: new Date().toISOString() } : p
        )
      );
      setGenerating(null);
      busyRef.current = false;
      toast(
        "success",
        engine === "groq"
          ? `Roadmap v${rm.version} charted with Groq (llama-3.1-70b).`
          : `Roadmap v${rm.version} charted — ${rm.phases.reduce((n, p) => n + p.tasks.length, 0)} tasks across ${rm.phases.length} phases.`
      );
      return rm;
    },
    [settings.groqKey, toast, commitProjects, commitRoadmaps]
  );

  const saveGroqKey = useCallback(
    (key: string) => {
      setSettings({ groqKey: key.trim() });
      toast("success", key.trim() ? "Groq key saved — generations now use llama-3.1-70b." : "Groq key removed — using the offline chart engine.");
    },
    [toast]
  );

  const value: AppContextValue = {
    user,
    users,
    register,
    login,
    demoLogin,
    logout,
    projects: myProjects,
    roadmaps: myRoadmaps,
    roadmapFor,
    createProject,
    updateProject,
    deleteProject,
    generating,
    generateRoadmap,
    cycleTask,
    setPhaseStatus,
    settings,
    saveGroqKey,
    toasts,
    toast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
