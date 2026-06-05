// ─── Excel Engine (SheetJS) ───────────────────────────────────────
// Generate: BOQ, Cost Analysis, Schedule, Material Summary

import * as XLSX from 'xlsx'
import type { Project } from '@/lib/types'
import type { BOQSection, CostBreakdown } from './pdfEngine'

// ─── Helpers ─────────────────────────────────────────────────────

function currencyBD(val: number) {
  return `BDT ${val.toLocaleString('en-BD', { minimumFractionDigits: 0 })}`
}

function styleCell(ws: XLSX.WorkSheet, cellRef: string, style: object) {
  if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' }
  ws[cellRef].s = style
}

// ─── Common styles ────────────────────────────────────────────────

const STYLES = {
  header: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: '0C1D5E' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: { bottom: { style: 'thin', color: { rgb: 'FFFFFF' } } },
  },
  subHeader: {
    font: { bold: true, color: { rgb: '0C1D5E' }, sz: 9 },
    fill: { fgColor: { rgb: 'EFF6FF' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  total: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 9 },
    fill: { fgColor: { rgb: '334155' } },
    alignment: { horizontal: 'right' },
    numFmt: '#,##0',
  },
  grandTotal: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: '0C1D5E' } },
    alignment: { horizontal: 'right' },
    numFmt: '#,##0',
  },
  number: {
    numFmt: '#,##0',
    alignment: { horizontal: 'right' },
    font: { sz: 8 },
  },
  text: {
    font: { sz: 8 },
    alignment: { vertical: 'top', wrapText: true },
  },
  altRow: {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { sz: 8 },
  },
}

// ═══════════════════════════════════════════════════════════════════
// 1. BOQ Excel
// ═══════════════════════════════════════════════════════════════════

export function generateBOQExcel(
  project: Project,
  sections: BOQSection[],
  revision = 'Rev 00'
): void {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  let row = 1

  // ── Title block ──
  ws[`A${row}`] = { v: 'CivilOS Reports & Export — Bill of Quantities', t: 's' }
  ws[`A${row}`].s = { font: { bold: true, sz: 14, color: { rgb: '0C1D5E' } } }
  row++

  ws[`A${row}`] = { v: `Project: ${project.name}`, t: 's' }
  ws[`B${row}`] = { v: `Ref: ${project.projectNumber}`, t: 's' }
  ws[`D${row}`] = { v: `Client: ${project.client}`, t: 's' }
  ws[`F${row}`] = { v: `Authority: ${project.authority}`, t: 's' }
  ws[`G${row}`] = { v: revision, t: 's' }
  row++

  ws[`A${row}`] = { v: `Date: ${new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })}`, t: 's' }
  ws[`D${row}`] = { v: `Floors: ${project.floors}`, t: 's' }
  ws[`F${row}`] = { v: `Area: ${project.area.toLocaleString()} m²`, t: 's' }
  row += 2

  // ── Column headers ──
  const headers = ['SL No.', 'Description', 'Unit', 'Quantity', 'Rate (BDT)', 'Amount (BDT)', 'Remarks']
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  headers.forEach((h, i) => {
    ws[`${cols[i]}${row}`] = { v: h, t: 's', s: STYLES.header }
  })
  row++

  let grandTotal = 0

  sections.forEach((section, sIdx) => {
    // Section header
    const sectionTotal = section.items.reduce((s, i) => s + i.amount, 0)
    grandTotal += sectionTotal

    ws[`A${row}`] = { v: `${String.fromCharCode(65 + sIdx)}`, t: 's', s: STYLES.subHeader }
    ws[`B${row}`] = { v: section.title.toUpperCase(), t: 's', s: STYLES.subHeader }
    cols.slice(2).forEach((c) => { ws[`${c}${row}`] = { v: '', t: 's', s: STYLES.subHeader } })
    row++

    section.items.forEach((item, iIdx) => {
      const isAlt = iIdx % 2 === 1
      const baseStyle = isAlt ? STYLES.altRow : {}
      ws[`A${row}`] = { v: item.slNo, t: 'n', s: { ...baseStyle, alignment: { horizontal: 'center' } } }
      ws[`B${row}`] = { v: item.description, t: 's', s: { ...baseStyle, ...STYLES.text } }
      ws[`C${row}`] = { v: item.unit, t: 's', s: { ...baseStyle, alignment: { horizontal: 'center' } } }
      ws[`D${row}`] = { v: item.qty, t: 'n', s: { ...baseStyle, ...STYLES.number } }
      ws[`E${row}`] = { v: item.rate, t: 'n', s: { ...baseStyle, ...STYLES.number } }
      ws[`F${row}`] = { v: item.amount, t: 'n', s: { ...baseStyle, ...STYLES.number, font: { bold: true, sz: 8 } } }
      ws[`G${row}`] = { v: item.remarks ?? '', t: 's', s: { ...baseStyle, ...STYLES.text } }
      row++
    })

    // Section subtotal
    ws[`B${row}`] = { v: `Sub-total — ${section.title}`, t: 's', s: STYLES.total }
    ws[`F${row}`] = { v: sectionTotal, t: 'n', s: STYLES.total }
    cols.filter((_, i) => i !== 1 && i !== 5).forEach((c) => {
      ws[`${c}${row}`] = { v: '', t: 's', s: STYLES.total }
    })
    row += 2
  })

  // Grand total
  ws[`B${row}`] = { v: 'GRAND TOTAL', t: 's', s: STYLES.grandTotal }
  ws[`F${row}`] = { v: grandTotal, t: 'n', s: STYLES.grandTotal }
  cols.filter((_, i) => i !== 1 && i !== 5).forEach((c) => {
    ws[`${c}${row}`] = { v: '', t: 's', s: STYLES.grandTotal }
  })
  row += 2

  // Cost per sqm
  ws[`E${row}`] = { v: 'Cost per m²', t: 's', s: { font: { bold: true, sz: 8 } } }
  ws[`F${row}`] = { v: project.area > 0 ? Math.round(grandTotal / project.area) : 0, t: 'n', s: STYLES.number }

  // Column widths
  ws['!cols'] = [
    { wch: 7 }, { wch: 45 }, { wch: 8 }, { wch: 12 },
    { wch: 16 }, { wch: 18 }, { wch: 20 },
  ]
  ws['!ref'] = `A1:G${row}`

  XLSX.utils.book_append_sheet(wb, ws, 'BOQ')
  XLSX.writeFile(wb, `BOQ_${project.projectNumber}_${revision}.xlsx`)
}

// ═══════════════════════════════════════════════════════════════════
// 2. Cost Analysis Excel
// ═══════════════════════════════════════════════════════════════════

export function generateCostExcel(
  project: Project,
  breakdown: CostBreakdown[],
  totalCost: number,
  revision = 'Rev 00'
): void {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Cost Summary ──
  const ws1: XLSX.WorkSheet = {}
  let row = 1

  ws1[`A${row}`] = { v: 'PROJECT COST ANALYSIS', t: 's', s: { font: { bold: true, sz: 14, color: { rgb: '0C1D5E' } } } }
  row++
  ws1[`A${row}`] = { v: `${project.name}  •  ${project.projectNumber}  •  ${project.client}`, t: 's' }
  row += 2

  // KPIs
  const kpis = [
    ['Total Cost', currencyBD(totalCost)],
    ['Cost per m²', currencyBD(project.area > 0 ? Math.round(totalCost / project.area) : 0)],
    ['Built Area', `${project.area.toLocaleString()} m²`],
    ['Floors', `${project.floors}`],
  ]
  kpis.forEach(([label, value], i) => {
    ws1[`${String.fromCharCode(65 + i * 2)}${row}`] = { v: label, t: 's', s: STYLES.subHeader }
    ws1[`${String.fromCharCode(65 + i * 2 + 1)}${row}`] = { v: value, t: 's', s: { font: { bold: true, sz: 10 } } }
  })
  row += 2

  // Headers
  ;['Category', 'Sub-Item', 'Amount (BDT)', '% of Total'].forEach((h, i) => {
    ws1[`${String.fromCharCode(65 + i)}${row}`] = { v: h, t: 's', s: STYLES.header }
  })
  row++

  breakdown.forEach((cat) => {
    const catTotal = cat.subItems.reduce((s, i) => s + i.amount, 0)
    ws1[`A${row}`] = { v: cat.category, t: 's', s: STYLES.subHeader }
    ws1[`C${row}`] = { v: catTotal, t: 'n', s: { ...STYLES.number, font: { bold: true, sz: 9 } } }
    ws1[`D${row}`] = { v: `${((catTotal / totalCost) * 100).toFixed(1)}%`, t: 's', s: { alignment: { horizontal: 'center' } } }
    row++

    cat.subItems.forEach((item, idx) => {
      ws1[`B${row}`] = { v: item.name, t: 's', s: idx % 2 === 1 ? STYLES.altRow : {} }
      ws1[`C${row}`] = { v: item.amount, t: 'n', s: { ...(idx % 2 === 1 ? STYLES.altRow : {}), ...STYLES.number } }
      ws1[`D${row}`] = {
        v: `${((item.amount / totalCost) * 100).toFixed(1)}%`, t: 's',
        s: { alignment: { horizontal: 'center' }, ...(idx % 2 === 1 ? STYLES.altRow : {}) },
      }
      row++
    })
    row++
  })

  ws1[`A${row}`] = { v: 'GRAND TOTAL', t: 's', s: STYLES.grandTotal }
  ws1[`C${row}`] = { v: totalCost, t: 'n', s: STYLES.grandTotal }
  ws1[`D${row}`] = { v: '100%', t: 's', s: { ...STYLES.grandTotal, alignment: { horizontal: 'center' } } }

  ws1['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 22 }, { wch: 14 }]
  ws1['!ref'] = `A1:D${row}`

  XLSX.utils.book_append_sheet(wb, ws1, 'Cost Summary')
  XLSX.writeFile(wb, `Cost_${project.projectNumber}_${revision}.xlsx`)
}

// ═══════════════════════════════════════════════════════════════════
// 3. Material Schedule Excel
// ═══════════════════════════════════════════════════════════════════

export interface MaterialItem {
  category: string
  material: string
  specification: string
  unit: string
  quantity: number
  rate: number
  amount: number
}

export function generateMaterialExcel(
  project: Project,
  materials: MaterialItem[],
  revision = 'Rev 00'
): void {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}
  let row = 1

  ws[`A${row}`] = { v: 'MATERIAL SCHEDULE', t: 's', s: { font: { bold: true, sz: 14, color: { rgb: '0C1D5E' } } } }
  row++
  ws[`A${row}`] = { v: `${project.name}  •  ${project.projectNumber}`, t: 's' }
  row += 2

  const headers = ['Category', 'Material', 'Specification', 'Unit', 'Quantity', 'Rate (BDT)', 'Amount (BDT)']
  headers.forEach((h, i) => {
    ws[`${String.fromCharCode(65 + i)}${row}`] = { v: h, t: 's', s: STYLES.header }
  })
  row++

  const total = materials.reduce((s, m) => s + m.amount, 0)

  materials.forEach((item, idx) => {
    const isAlt = idx % 2 === 1
    const base = isAlt ? STYLES.altRow : {}
    ws[`A${row}`] = { v: item.category,      t: 's', s: base }
    ws[`B${row}`] = { v: item.material,       t: 's', s: base }
    ws[`C${row}`] = { v: item.specification,  t: 's', s: { ...base, ...STYLES.text } }
    ws[`D${row}`] = { v: item.unit,           t: 's', s: { ...base, alignment: { horizontal: 'center' } } }
    ws[`E${row}`] = { v: item.quantity,       t: 'n', s: { ...base, ...STYLES.number } }
    ws[`F${row}`] = { v: item.rate,           t: 'n', s: { ...base, ...STYLES.number } }
    ws[`G${row}`] = { v: item.amount,         t: 'n', s: { ...base, ...STYLES.number, font: { bold: true, sz: 8 } } }
    row++
  })

  row++
  ws[`F${row}`] = { v: 'TOTAL', t: 's', s: STYLES.grandTotal }
  ws[`G${row}`] = { v: total, t: 'n', s: STYLES.grandTotal }

  ws['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 28 },
    { wch: 8 }, { wch: 12 }, { wch: 16 }, { wch: 18 },
  ]
  ws['!ref'] = `A1:G${row}`

  XLSX.utils.book_append_sheet(wb, ws, 'Materials')
  XLSX.writeFile(wb, `Materials_${project.projectNumber}_${revision}.xlsx`)
}
