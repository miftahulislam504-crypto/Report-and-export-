// ─── PDF Engine (jsPDF + AutoTable) ──────────────────────────────
// Fast PDF for: BOQ, Cost Summary, Progress Tables, Schedules

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Project, Report } from '@/lib/types'

// ─── Brand Colors ─────────────────────────────────────────────────
const COLORS = {
  navy:    [12, 29, 94]   as [number, number, number],
  teal:    [15, 118, 110] as [number, number, number],
  slate:   [51, 65, 85]   as [number, number, number],
  light:   [248, 250, 252] as [number, number, number],
  border:  [226, 232, 240] as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  text:    [15, 23, 42]   as [number, number, number],
  muted:   [100, 116, 139] as [number, number, number],
  success: [22, 163, 74]  as [number, number, number],
  amber:   [180, 83, 9]   as [number, number, number],
}

// ─── Page Setup ───────────────────────────────────────────────────
function createPDF(orientation: 'p' | 'l' = 'p') {
  return new jsPDF({ orientation, unit: 'mm', format: 'a4' })
}

// ─── Header Banner ────────────────────────────────────────────────
function drawHeader(doc: jsPDF, project: Project, reportTitle: string, revision = 'Rev 00') {
  const W = doc.internal.pageSize.getWidth()

  // Navy top bar
  doc.setFillColor(...COLORS.navy)
  doc.rect(0, 0, W, 22, 'F')

  // CivilOS wordmark
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('CivilOS', 14, 9)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('REPORTS & EXPORT', 14, 14)

  // Report title (right-aligned)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(reportTitle.toUpperCase(), W - 14, 9, { align: 'right' })

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(revision, W - 14, 14, { align: 'right' })

  // Teal accent line
  doc.setFillColor(...COLORS.teal)
  doc.rect(0, 22, W, 1.5, 'F')

  // Project info row
  doc.setFillColor(...COLORS.light)
  doc.rect(0, 23.5, W, 14, 'F')

  doc.setTextColor(...COLORS.navy)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(project.name, 14, 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.muted)

  const meta = [
    `Ref: ${project.projectNumber}`,
    `Client: ${project.client}`,
    `Authority: ${project.authority}`,
    `Date: ${new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}`,
  ]
  doc.text(meta.join('   •   '), 14, 35)

  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(0, 37.5, W, 37.5)

  return 42 // return Y position after header
}

// ─── Footer ───────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, project: Project, pageNum: number, totalPages: number) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  doc.setFillColor(...COLORS.light)
  doc.rect(0, H - 12, W, 12, 'F')

  doc.setDrawColor(...COLORS.border)
  doc.line(0, H - 12, W, H - 12)

  doc.setFontSize(7)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')

  doc.text(`${project.name}  |  ${project.projectNumber}`, 14, H - 5)
  doc.text(`BNBC 2020 Compliant  |  CivilOS Reports`, W / 2, H - 5, { align: 'center' })
  doc.text(`Page ${pageNum} of ${totalPages}`, W - 14, H - 5, { align: 'right' })
}

// ─── Section Title ────────────────────────────────────────────────
function sectionTitle(doc: jsPDF, text: string, y: number): number {
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(...COLORS.navy)
  doc.rect(14, y, 3, 6, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.navy)
  doc.text(text, 20, y + 4.5)
  doc.setDrawColor(...COLORS.border)
  doc.line(14, y + 7, W - 14, y + 7)
  return y + 11
}

// ═══════════════════════════════════════════════════════════════════
// 1. BOQ PDF
// ═══════════════════════════════════════════════════════════════════

export interface BOQItem {
  slNo: number
  description: string
  unit: string
  qty: number
  rate: number
  amount: number
  remarks?: string
}

export interface BOQSection {
  title: string
  items: BOQItem[]
}

export function generateBOQPDF(
  project: Project,
  sections: BOQSection[],
  revision = 'Rev 00'
): jsPDF {
  const doc = createPDF('p')
  const W = doc.internal.pageSize.getWidth()
  let y = drawHeader(doc, project, 'Bill of Quantities', revision)

  // Grand total calculation
  const grandTotal = sections.reduce(
    (sum, sec) => sum + sec.items.reduce((s, i) => s + i.amount, 0), 0
  )

  // Summary box
  doc.setFillColor(12, 29, 94, 0.05 as unknown as number)
  doc.setDrawColor(...COLORS.navy)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, y, W - 28, 16, 2, 2, 'FD')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.muted)
  doc.text('TOTAL ESTIMATED COST', 20, y + 6)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.navy)
  doc.text(
    `BDT ${grandTotal.toLocaleString('en-BD', { minimumFractionDigits: 0 })}`,
    20, y + 13
  )
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.muted)
  doc.text(`${project.area.toLocaleString()} m²  •  ${project.floors} Floors  •  ${project.authority}`, W - 20, y + 9, { align: 'right' })

  y += 22

  // Each section
  sections.forEach((section, idx) => {
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    y = sectionTitle(doc, `${String.fromCharCode(65 + idx)}. ${section.title}`, y)

    const sectionTotal = section.items.reduce((s, i) => s + i.amount, 0)

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['SL', 'Description', 'Unit', 'Qty', 'Rate (BDT)', 'Amount (BDT)', 'Remarks']],
      body: [
        ...section.items.map((item) => [
          item.slNo,
          item.description,
          item.unit,
          item.qty.toLocaleString(),
          item.rate.toLocaleString(),
          item.amount.toLocaleString(),
          item.remarks ?? '—',
        ]),
        ['', { content: `Sub-total — ${section.title}`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: COLORS.light } },
          { content: `BDT ${sectionTotal.toLocaleString()}`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', textColor: COLORS.navy, fillColor: COLORS.light } }
        ],
      ],
      headStyles: {
        fillColor: COLORS.slate,
        textColor: COLORS.white,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 7.5, textColor: COLORS.text },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center', cellWidth: 14 },
        3: { halign: 'right', cellWidth: 16 },
        4: { halign: 'right', cellWidth: 24 },
        5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
        6: { cellWidth: 22 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data) => {
        drawFooter(doc, project, data.pageNumber, 999)
      },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  })

  // Grand total row
  if (y > 240) { doc.addPage(); y = 20 }
  doc.setFillColor(...COLORS.navy)
  doc.rect(14, y, W - 28, 10, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('GRAND TOTAL', 20, y + 6.5)
  doc.text(
    `BDT ${grandTotal.toLocaleString('en-BD', { minimumFractionDigits: 0 })}`,
    W - 20, y + 6.5, { align: 'right' }
  )

  // Fix page count
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, project, i, totalPages)
  }

  return doc
}

// ═══════════════════════════════════════════════════════════════════
// 2. Cost Report PDF
// ═══════════════════════════════════════════════════════════════════

export interface CostBreakdown {
  category: string
  subItems: { name: string; amount: number }[]
}

export function generateCostPDF(
  project: Project,
  breakdown: CostBreakdown[],
  totalCost: number,
  revision = 'Rev 00'
): jsPDF {
  const doc = createPDF('p')
  const W = doc.internal.pageSize.getWidth()
  let y = drawHeader(doc, project, 'Project Cost Report', revision)

  // KPI row
  const costPerSqm = project.area > 0 ? totalCost / project.area : 0
  const kpis = [
    { label: 'Total Cost', value: `BDT ${(totalCost / 1_000_000).toFixed(2)}M` },
    { label: 'Cost / m²',  value: `BDT ${costPerSqm.toLocaleString('en-BD', { maximumFractionDigits: 0 })}` },
    { label: 'Built Area',  value: `${project.area.toLocaleString()} m²` },
    { label: 'Floors',      value: `${project.floors} Floors` },
  ]
  const kpiW = (W - 28) / kpis.length

  kpis.forEach((kpi, i) => {
    const x = 14 + i * kpiW
    doc.setFillColor(i === 0 ? COLORS.navy[0] : COLORS.light[0],
                     i === 0 ? COLORS.navy[1] : COLORS.light[1],
                     i === 0 ? COLORS.navy[2] : COLORS.light[2])
    doc.roundedRect(x, y, kpiW - 2, 18, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(i === 0 ? 200 : COLORS.muted[0], i === 0 ? 210 : COLORS.muted[1], i === 0 ? 220 : COLORS.muted[2])
    doc.text(kpi.label.toUpperCase(), x + (kpiW - 2) / 2, y + 6, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(i === 0 ? 255 : COLORS.navy[0], i === 0 ? 255 : COLORS.navy[1], i === 0 ? 255 : COLORS.navy[2])
    doc.text(kpi.value, x + (kpiW - 2) / 2, y + 14, { align: 'center' })
  })

  y += 24

  // Breakdown table
  y = sectionTitle(doc, 'Cost Breakdown by Category', y)

  const tableBody: unknown[] = []
  breakdown.forEach((cat) => {
    const catTotal = cat.subItems.reduce((s, i) => s + i.amount, 0)
    // Category header row
    tableBody.push([
      { content: cat.category, colSpan: 2, styles: { fontStyle: 'bold', fillColor: COLORS.light, textColor: COLORS.navy } },
      { content: `BDT ${catTotal.toLocaleString()}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: COLORS.light, textColor: COLORS.navy } },
      { content: `${((catTotal / totalCost) * 100).toFixed(1)}%`, styles: { halign: 'center', fillColor: COLORS.light } },
    ])
    cat.subItems.forEach((item) => {
      tableBody.push([
        '',
        item.name,
        { content: `BDT ${item.amount.toLocaleString()}`, styles: { halign: 'right' } },
        { content: `${((item.amount / totalCost) * 100).toFixed(1)}%`, styles: { halign: 'center', textColor: COLORS.muted } },
      ])
    })
  })

  // Grand total
  tableBody.push([
    { content: 'GRAND TOTAL', colSpan: 2, styles: { fontStyle: 'bold', fillColor: COLORS.navy, textColor: COLORS.white } },
    { content: `BDT ${totalCost.toLocaleString()}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: COLORS.navy, textColor: COLORS.white } },
    { content: '100%', styles: { halign: 'center', fillColor: COLORS.navy, textColor: COLORS.white } },
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['#', 'Description', 'Amount (BDT)', '% of Total']],
    body: tableBody as unknown as import('jspdf-autotable').RowInput[],
    headStyles: { fillColor: COLORS.slate, textColor: COLORS.white, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    columnStyles: {
      0: { cellWidth: 8 },
      2: { halign: 'right' },
      3: { halign: 'center', cellWidth: 20 },
    },
    didDrawPage: (data) => drawFooter(doc, project, data.pageNumber, 999),
  })

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, project, i, totalPages)
  }

  return doc
}

// ═══════════════════════════════════════════════════════════════════
// 3. Progress Report PDF
// ═══════════════════════════════════════════════════════════════════

export interface ProgressActivity {
  activity: string
  plannedStart: string
  plannedEnd: string
  completion: number
  status: 'completed' | 'in-progress' | 'not-started' | 'delayed'
}

export function generateProgressPDF(
  project: Project,
  activities: ProgressActivity[],
  overallPercent: number,
  revision = 'Rev 00'
): jsPDF {
  const doc = createPDF('l') // Landscape for Gantt-style
  const W = doc.internal.pageSize.getWidth()
  let y = drawHeader(doc, project, 'Progress Report', revision)

  // Overall progress bar
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.navy)
  doc.text(`Overall Completion: ${overallPercent}%`, 14, y + 5)

  // Bar background
  doc.setFillColor(...COLORS.border)
  doc.roundedRect(14, y + 8, W - 28, 7, 2, 2, 'F')

  // Bar fill
  const fillW = ((W - 28) * overallPercent) / 100
  const barColor = overallPercent >= 80 ? COLORS.success : overallPercent >= 40 ? COLORS.amber : COLORS.navy
  doc.setFillColor(...barColor)
  doc.roundedRect(14, y + 8, fillW, 7, 2, 2, 'F')

  y += 22
  y = sectionTitle(doc, 'Activity Schedule & Progress', y)

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed':   return [22, 163, 74]   as [number, number, number]
      case 'in-progress': return [37, 99, 235]   as [number, number, number]
      case 'delayed':     return [220, 38, 38]   as [number, number, number]
      default:            return [148, 163, 184] as [number, number, number]
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Activity', 'Planned Start', 'Planned End', 'Completion', 'Status']],
    body: activities.map((a) => [
      a.activity,
      a.plannedStart,
      a.plannedEnd,
      `${a.completion}%`,
      a.status.replace('-', ' ').toUpperCase(),
    ]),
    headStyles: { fillColor: COLORS.slate, textColor: COLORS.white, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    columnStyles: {
      0: { cellWidth: 80 },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const val = (data.cell.raw as string).toLowerCase().replace(' ', '-')
        data.cell.styles.textColor = statusColor(val)
        data.cell.styles.fontStyle = 'bold'
      }
      if (data.column.index === 3 && data.section === 'body') {
        const pct = parseInt(data.cell.raw as string)
        data.cell.styles.textColor = pct === 100 ? COLORS.success : pct > 0 ? COLORS.amber : COLORS.muted
      }
    },
    didDrawPage: (data) => drawFooter(doc, project, data.pageNumber, 999),
  })

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, project, i, totalPages)
  }

  return doc
}
