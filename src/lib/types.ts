export type Role = "developer" | "manager" | "freelancer";

export interface User {
  id: string;
  name: string;
  email: string;
  pass: string; // hashed (demo-grade, local only)
  role: Role;
  createdAt: string;
}

export type Category =
  | "web-app"
  | "mobile-app"
  | "saas"
  | "e-commerce"
  | "portfolio"
  | "api"
  | "open-source-tool"
  | "other";

export type Duration =
  | "1-week"
  | "2-weeks"
  | "1-month"
  | "2-months"
  | "3-months"
  | "6-months"
  | "1-year";

export type Priority = "low" | "medium" | "high" | "critical";
export type Budget = "free" | "low" | "medium" | "high";
export type ProjectStatus = "planning" | "in-progress" | "on-hold" | "completed" | "cancelled";

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  deployment: string[];
  other: string[];
}

export interface Project {
  id: string;
  userId: string;
  projectName: string;
  tagline: string;
  description: string;
  category: Category;
  techStack: TechStack;
  features: string[];
  targetAudience: string;
  problemStatement: string;
  teamSize: number;
  estimatedDuration: Duration;
  priority: Priority;
  budget: Budget;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface RoadmapTask {
  id: string;
  taskName: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedTime: string;
}

export type PhaseStatus = "not-started" | "in-progress" | "completed" | "skipped";

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  phaseName: string;
  description: string;
  duration: string;
  status: PhaseStatus;
  tasks: RoadmapTask[];
  deliverables: string[];
  tips: string[];
  tools: string[];
}

export interface Milestone {
  name: string;
  date: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface Roadmap {
  id: string;
  projectId: string;
  userId: string;
  phases: RoadmapPhase[];
  totalEstimatedDuration: string;
  keyMilestones: Milestone[];
  risks: Risk[];
  techRecommendations: string[];
  generatedAt: string;
  version: number;
  engine: "local" | "groq";
}

export interface Settings {
  groqKey: string;
}

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  "web-app": "Web App",
  "mobile-app": "Mobile App",
  saas: "SaaS",
  "e-commerce": "E-Commerce",
  portfolio: "Portfolio",
  api: "API / Backend",
  "open-source-tool": "Open-Source Tool",
  other: "Other",
};

export const DURATION_LABELS: Record<Duration, string> = {
  "1-week": "1 week",
  "2-weeks": "2 weeks",
  "1-month": "1 month",
  "2-months": "2 months",
  "3-months": "3 months",
  "6-months": "6 months",
  "1-year": "1 year",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
  skipped: "Skipped",
};

export const TECH_POOLS = {
  frontend: ["React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "Tailwind CSS", "TypeScript", "HTML/CSS"],
  backend: ["Node.js", "Express", "NestJS", "Django", "FastAPI", "Flask", "Go", "Spring Boot", "Ruby on Rails", "Supabase", "Firebase"],
  database: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Firebase", "Supabase", "DynamoDB", "Elasticsearch"],
  deployment: ["Vercel", "Netlify", "Railway", "Render", "AWS", "DigitalOcean", "Fly.io", "Cloudflare Pages", "Docker"],
};
