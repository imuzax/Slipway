import { GState, jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Project, Roadmap, User } from "./types";
import { CATEGORY_LABELS, DURATION_LABELS, PHASE_STATUS_LABELS, STATUS_LABELS } from "./types";
import { fmtDateFull, slugify } from "./utils";

type RGB = [number, number, number];
const INK: RGB = [13, 17, 38];
const INK_SOFT: RGB = [24, 30, 58];
const INDIGO: RGB = [99, 102, 241];
const VIOLET: RGB = [139, 92, 246];
const SLATE: RGB = [100, 116, 139];
const TEXT: RGB = [30, 41, 59];
const TEXT_SOFT: RGB = [71, 85, 105];
const LINE: RGB = [226, 232, 240];
const EMERALD: RGB = [16, 185, 129];
const AMBER: RGB = [217, 119, 6];
const ROSE: RGB = [225, 29, 72];

const W = 595.28;
const H = 841.89;
const M = 48;
const BOTTOM = H - 66;

function statusColor(s: string): RGB {
  if (s === "completed" || s === "done") return EMERALD;
  if (s === "in-progress") return AMBER;
  if (s === "skipped") return SLATE;
  if (s === "not-started" || s === "todo") return SLATE;
  return SLATE;
}

function sectionTitle(doc: jsPDF, y: number, eyebrow: string, title: string): number {
  if (y > BOTTOM - 90) {
    doc.addPage();
    y = M;
  }
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INDIGO);
  doc.text(eyebrow.toUpperCase(), M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...TEXT);
  doc.text(title, M, y + 17);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, y + 26, W - M, y + 26);
  return y + 40;
}

function ensure(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > BOTTOM) {
    doc.addPage();
    return M;
  }
  return y;
}

function bullets(doc: jsPDF, items: string[], y: number, opts: { color?: RGB; bold?: boolean } = {}): number {
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...(opts.color ?? TEXT_SOFT));
  for (const item of items) {
    const lines = doc.splitTextToSize(item, W - M * 2 - 16);
    y = ensure(doc, y, lines.length * 12 + 4);
    doc.setTextColor(...INDIGO);
    doc.text("•", M + 4, y);
    doc.setTextColor(...(opts.color ?? TEXT_SOFT));
    doc.text(lines, M + 16, y);
    y += lines.length * 12 + 3;
  }
  return y + 8;
}

export function downloadProjectReport(project: Project, roadmap: Roadmap, user: User | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const generated = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  /* ---------------- cover band ---------------- */
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 252, "F");
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, 8, 252, "F");
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.18 }));
  doc.setFillColor(...VIOLET);
  doc.circle(W - 60, 40, 110, "F");
  doc.setFillColor(...INDIGO);
  doc.circle(W - 150, 230, 70, "F");
  doc.restoreGraphicsState();

  // brand
  doc.setFillColor(...INDIGO);
  doc.roundedRect(M, 36, 22, 22, 5, 5, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.line(M + 6, 51, M + 6, 46);
  doc.line(M + 11, 51, M + 11, 41);
  doc.line(M + 16, 51, M + 16, 48);
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
    doc.text("SLIPWAY", M + 30, 50);  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...([148, 163, 184] as RGB));
  doc.text("AI PROJECT PLANNER — ROADMAP REPORT", M + 30, 60);

  // title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(project.projectName, W - M * 2 - 140);
  doc.text(titleLines, M, 108);
  let ty = 108 + titleLines.length * 30;
  if (project.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...([165, 180, 252] as RGB));
    const tag = doc.splitTextToSize(project.tagline, W - M * 2 - 140);
    doc.text(tag, M, ty);
    ty += tag.length * 14;
  }
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...([148, 163, 184] as RGB));
  doc.text(
    `PREPARED FOR ${user ? user.name.toUpperCase() : "THE TEAM"}  ·  ${fmtDateFull(roadmap.generatedAt).toUpperCase()}  ·  ROADMAP v${roadmap.version}`,
    M,
    232
  );

  // progress donut
  const cx = W - M - 42;
  const cy = 130;
  doc.setDrawColor(...INK_SOFT);
  doc.setLineWidth(9);
  doc.circle(cx, cy, 34, "S");
  const p = Math.max(0, Math.min(100, project.progress));
  if (p > 0) {
    doc.setDrawColor(...INDIGO);
    const segs = 48;
    const end = (p / 100) * Math.PI * 2;
    for (let i = 0; i < segs; i++) {
      const a1 = -Math.PI / 2 + (end * i) / segs;
      const a2 = -Math.PI / 2 + (end * (i + 1)) / segs;
      doc.line(cx + 34 * Math.cos(a1), cy + 34 * Math.sin(a1), cx + 34 * Math.cos(a2), cy + 34 * Math.sin(a2));
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(`${p}%`, cx, cy + 2, { align: "center", baseline: "middle" });
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...([148, 163, 184] as RGB));
  doc.text("COMPLETE", cx, cy + 56, { align: "center" });

  /* ---------------- overview ---------------- */
  let y = sectionTitle(doc, 292, "01 · Overview", "Project brief");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_SOFT);
  const desc = doc.splitTextToSize(project.description || "—", W - M * 2);
  doc.text(desc, M, y);
  y += desc.length * 13 + 10;
  if (project.problemStatement) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    doc.text("Problem", M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_SOFT);
    const ps = doc.splitTextToSize(project.problemStatement, W - M * 2 - 70);
    doc.text(ps, M + 62, y);
    y += ps.length * 13 + 8;
  }
  if (project.targetAudience) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    doc.text("Audience", M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_SOFT);
    const au = doc.splitTextToSize(project.targetAudience, W - M * 2 - 70);
    doc.text(au, M + 62, y);
    y += au.length * 13 + 12;
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, bottom: 70 },
    head: [],
    body: [
      ["Category", CATEGORY_LABELS[project.category], "Team size", `${project.teamSize} ${project.teamSize === 1 ? "person" : "people"}`],
      ["Timeline", DURATION_LABELS[project.estimatedDuration], "Priority", project.priority.toUpperCase()],
      ["Budget", project.budget.toUpperCase(), "Status", STATUS_LABELS[project.status]],
      ["Total estimate", roadmap.totalEstimatedDuration, "Start date", project.startDate ? fmtDateFull(project.startDate) : "—"],
    ],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 6, textColor: TEXT_SOFT, lineColor: LINE, lineWidth: 0.6 },
    columnStyles: { 0: { fontStyle: "bold", textColor: TEXT, cellWidth: 92 }, 2: { fontStyle: "bold", textColor: TEXT, cellWidth: 92 } },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  /* ---------------- tech stack & features ---------------- */
  y = sectionTitle(doc, y + 8, "02 · Foundations", "Tech stack & features");
  const stack = project.techStack;
  const stackRows: [string, string[]][] = [
    ["Frontend", stack.frontend],
    ["Backend", stack.backend],
    ["Database", stack.database],
    ["Deployment", stack.deployment],
    ["Other tools", stack.other],
  ];
  for (const [label, items] of stackRows) {
    if (!items.length) continue;
    y = ensure(doc, y, 16);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INDIGO);
    doc.text(label.toUpperCase(), M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_SOFT);
    const line = doc.splitTextToSize(items.join("  ·  "), W - M * 2 - 90);
    doc.text(line, M + 88, y);
    y += line.length * 12 + 6;
  }
  y += 8;
  y = ensure(doc, y, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT);
  doc.text("Planned features", M, y);
  y = bullets(doc, project.features, y + 14);

  /* ---------------- phases ---------------- */
  roadmap.phases.forEach((ph, idx) => {
    y = sectionTitle(doc, y, `0${idx + 3} · Phase ${ph.phaseNumber}`, ph.phaseName);
    y = ensure(doc, y, 30);
    // meta row
    doc.setFillColor(...INK);
    doc.roundedRect(M, y - 10, 20, 20, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(ph.phaseNumber), M + 10, y + 3, { align: "center" });
    const sc = statusColor(ph.status);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...sc);
    doc.text(`${PHASE_STATUS_LABELS[ph.status].toUpperCase()}  ·  ${ph.duration.toUpperCase()}`, M + 30, y + 3);
    const doneCount = ph.tasks.filter((t) => t.status === "done").length;
    doc.setTextColor(...SLATE);
    doc.text(`${doneCount}/${ph.tasks.length} TASKS DONE`, W - M, y + 3, { align: "right" });
    y += 20;
    if (ph.description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT_SOFT);
      const d = doc.splitTextToSize(ph.description, W - M * 2);
      y = ensure(doc, y, d.length * 12 + 6);
      doc.text(d, M, y);
      y += d.length * 12 + 8;
    }
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 70 },
      head: [["Task", "Priority", "Estimate", "Status"]],
      body: ph.tasks.map((t) => [t.taskName, t.priority, t.estimatedTime, t.status === "in-progress" ? "in progress" : t.status]),
      theme: "striped",
      headStyles: { fillColor: INK, textColor: [255, 255, 255], font: "helvetica", fontSize: 8, cellPadding: 5 },
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5, textColor: TEXT_SOFT, lineColor: LINE, lineWidth: 0.4 },
      columnStyles: { 1: { cellWidth: 58 }, 2: { cellWidth: 62 }, 3: { cellWidth: 66 } },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const v = String(data.cell.raw);
          data.cell.styles.textColor = statusColor(v);
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    if (ph.deliverables.length) {
      y = ensure(doc, y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);
      doc.text("Deliverables", M, y);
      y = bullets(doc, ph.deliverables, y + 13);
    }
    if (ph.tips.length) {
      y = ensure(doc, y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);
      doc.text("Pro tips", M, y);
      y = bullets(doc, ph.tips, y + 13, { color: AMBER });
    }
    if (ph.tools.length) {
      y = ensure(doc, y, 18);
      doc.setFont("courier", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...VIOLET);
      doc.text(`TOOLS: ${ph.tools.join("  /  ").toUpperCase()}`, M, y);
      y += 18;
    }
    y += 6;
  });

  /* ---------------- milestones & risks ---------------- */
  y = sectionTitle(doc, y, "09 · Trajectory", "Key milestones");
  if (roadmap.keyMilestones.length) {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 70 },
      head: [["#", "Milestone", "Target"]],
      body: roadmap.keyMilestones.map((m, i) => [`M${i + 1}`, m.name, m.date]),
      theme: "striped",
      headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontSize: 8, cellPadding: 5 },
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5, textColor: TEXT_SOFT },
      columnStyles: { 0: { cellWidth: 34, fontStyle: "bold", textColor: INDIGO }, 2: { cellWidth: 70 } },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }
  y = sectionTitle(doc, y, "10 · Guardrails", "Risk assessment");
  if (roadmap.risks.length) {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 70 },
      head: [["Risk", "Mitigation"]],
      body: roadmap.risks.map((r) => [r.risk, r.mitigation]),
      theme: "striped",
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontSize: 8, cellPadding: 5 },
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 6, textColor: TEXT_SOFT },
      columnStyles: { 0: { cellWidth: (W - M * 2) * 0.52, textColor: ROSE } },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }
  if (roadmap.techRecommendations.length) {
    y = sectionTitle(doc, y, "11 · Extras", "Tech recommendations");
    y = bullets(doc, roadmap.techRecommendations, y);
  }

  /* ---------------- footers ---------------- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.6);
    doc.line(M, H - 40, W - M, H - 40);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text("SLIPWAY — AI PROJECT PLANNER", M, H - 28);
    doc.text(`GENERATED ${generated.toUpperCase()}`, W / 2, H - 28, { align: "center" });
    doc.text(`PAGE ${i} / ${pages}`, W - M, H - 28, { align: "right" });
  }

  doc.save(`${slugify(project.projectName)}-slipway-roadmap.pdf`);
}
