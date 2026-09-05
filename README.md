# ⛵ Slipway

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</p>

**An Autonomous Project Planning & Milestone Orchestration Platform for Modern Engineering Teams.**

> *A slipway is the specialized ramp where vessels are engineered and constructed before launch. Slipway provides the exact architectural blueprint, phased execution timeline, and milestone tracking required to take software from concept to production.*

---

## 🎯 Architectural Overview

Traditional software planning often suffers from fragmented roadmaps, unaccounted dependencies, and unrealistic delivery estimates. **Slipway** eliminates planning friction by converting structured product briefs into comprehensive, engineering-grade execution plans.

- **6 Comprehensive Phases**: Requirements Definition → System Architecture & Design → Infrastructure Setup → Iterative Development → Quality Assurance → Production Launch.
- **Phased Decomposition**: Generates ~40 granular, concrete engineering tasks customized to your exact technology stack and team structure.
- **Dynamic Risk & Milestone Modeling**: Identifies integration bottlenecks (e.g. payment gateway edge-cases, single-maintainer risks) and recommends production mitigations.
- **Automated Executive Reporting**: Generates branded, paginated **Executive PDF Reports** with interactive progress rings and risk logs with one click.

---

## 👥 Core Engineering Team

| Lead Architect & Engineer | Co-Architect & Full Stack Engineer |
|:---:|:---:|
| **Muzaffar Hussain**<br/>[@imuzax](https://github.com/imuzax) | **Sayyed Gufran**<br/>[@SayyedGufran](https://github.com/SayyedGufran) |

---

## 🚀 Key Modules & Capabilities

### 1. Phased Brief Specification (5-Step Engine)
- **Project Scope & Architecture**: Definition of domain, target scale, and system constraints.
- **Tech Stack Matrix**: Interactive selection of frontend, backend, database, cache, and DevOps layers.
- **Feature Prioritization**: MoSCoW-based task weighting and milestone targeting.
- **Resource Sizing**: Team velocity modeling based on available engineering bandwidth.

### 2. Execution Engine & Heuristic Planner
- **Deterministic Planning Engine**: Zero-config offline heuristic synthesizer that calculates dependency trees and critical path milestones.
- **Assisted LLM Reasoning Engine (Optional)**: Groq Llama-3 high-throughput JSON-mode integration for deep architectural decomposition with seamless fallback.

### 3. Interactive Execution Dashboard
- **Kanban & Gantt Timeline**: Full drag-and-drop state transitions (`Todo` ➔ `In Progress` ➔ `Completed` ➔ `Deferred`).
- **Live Metric Rollups**: Real-time progress synchronization across phases, deliverable checklists, and executive burndown metrics.

### 4. Executive PDF Synthesis
- Comprehensive multi-page PDF generation via **jsPDF** and **AutoTable**:
  - Live progress donut charts and completion metrics.
  - Phase-by-phase task tables with assignees and estimated hours.
  - Comprehensive Risk Register and Recommended Tooling Matrix.

---

## 🛠️ Technology Stack

- **Framework**: React 18 (SPA Architecture)
- **Language**: TypeScript 5.7 (Strict Mode)
- **Build System**: Vite 6
- **Styling Engine**: TailwindCSS v4 with Glassmorphism & Custom Design Tokens
- **State Management**: React Context with LocalStorage & Supabase Persistence
- **Drag and Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Charts & Visualizations**: Recharts
- **Document Engine**: jsPDF, jsPDF-AutoTable, Canvas-Confetti

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

```bash
# Clone the repository
git clone https://github.com/imuzax/Slipway.git
cd Slipway

# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript typechecks
npm run typecheck

# Build production bundle
npm run build
```

---

## 🤝 Contributing

We welcome contributions from the open-source community! Please see our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) for pull request protocols and development standards.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
