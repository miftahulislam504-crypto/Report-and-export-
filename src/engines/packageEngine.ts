// ─── Package Engine (pdf-lib) ─────────────────────────────────────
// Merge PDFs, add watermarks, stamps, page numbers, cover pages

import { PDFDocument, rgb, StandardFonts, degrees, PageSizes } from 'pdf-lib'
import type { Project } from '@/lib/types'
import type { PackageType } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────

export interface PackageDocument {
  title: string
  pdfBytes: Uint8Array | ArrayBuffer
  drawingNo?: string
  revision?: string
}

export interface PackageConfig {
  type: PackageType
  title: string
  revision: string
  preparedBy: string
  checkedBy?: string
  approvedBy?: string
  date: string
  includeWatermark?: boolean
  watermarkText?: string
  includePageNumbers?: boolean
  includeCoverPage?: boolean
  includeTransmittal?: boolean
  includeDrawingIndex?: boolean
}

// ─── Color helpers ────────────────────────────────────────────────
const C = {
  navy:   rgb(0.047, 0.114, 0.369),
  teal:   rgb(0.059, 0.463, 0.431),
  white:  rgb(1, 1, 1),
  light:  rgb(0.973, 0.980, 0.988),
  slate:  rgb(0.200, 0.255, 0.333),
  muted:  rgb(0.392, 0.455, 0.545),
  border: rgb(0.886, 0.910, 0.941),
  amber:  rgb(0.706, 0.325, 0.035),
  green:  rgb(0.086, 0.639, 0.290),
}

// ═══════════════════════════════════════════════════════════════════
// 1. Cover Page Generator
// ═══════════════════════════════════════════════════════════════════

export async function createCoverPage(
  project: Project,
  config: PackageConfig
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage(PageSizes.A4)
  const { width, height } = page.getSize()

  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // ── Full navy header band ──────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 180, width, height: 180, color: C.navy })

  // Teal accent stripe
  page.drawRectangle({ x: 0, y: height - 183, width, height: 3, color: C.teal })

  // CivilOS wordmark
  page.drawText('CivilOS', {
    x: 48, y: height - 52,
    font: fontBold, size: 28, color: C.white,
  })
  page.drawText('REPORTS & EXPORT', {
    x: 48, y: height - 70,
    font: fontNormal, size: 8, color: rgb(0.6, 0.7, 0.9),
  })

  // Package type badge (top-right)
  const badgeLabel = packageTypeShort(config.type)
  page.drawRectangle({ x: width - 160, y: height - 60, width: 112, height: 22, color: C.teal, opacity: 0.9 })
  page.drawText(badgeLabel, {
    x: width - 155, y: height - 52,
    font: fontBold, size: 9, color: C.white,
  })

  // Revision chip
  page.drawText(`${config.revision}  •  ${config.date}`, {
    x: width - 155, y: height - 78,
    font: fontNormal, size: 8, color: rgb(0.7, 0.75, 0.85),
  })

  // ── Document title block ──────────────────────────────────────
  page.drawText(config.title.toUpperCase(), {
    x: 48, y: height - 150,
    font: fontBold, size: 16, color: C.white,
  })

  // ── Project info box ──────────────────────────────────────────
  const boxTop = height - 230
  page.drawRectangle({ x: 40, y: boxTop - 90, width: width - 80, height: 100, color: C.light, borderColor: C.border, borderWidth: 0.5 })

  const infoRows = [
    ['Project',    project.name],
    ['Ref No',     project.projectNumber],
    ['Client',     project.client],
    ['Location',   project.location],
    ['Authority',  project.authority],
  ]
  infoRows.forEach(([label, value], i) => {
    const y = boxTop - 12 - i * 16
    page.drawText(label, { x: 52, y, font: fontBold, size: 8, color: C.muted })
    page.drawText(value ?? '—', { x: 160, y, font: fontNormal, size: 8, color: C.slate })
  })

  // ── Large decorative geometry ─────────────────────────────────
  // Background circle (decorative)
  page.drawCircle({ x: width - 80, y: height / 2, size: 120, color: rgb(0.047, 0.114, 0.369), opacity: 0.04 })
  page.drawCircle({ x: width - 80, y: height / 2, size: 90,  color: rgb(0.047, 0.114, 0.369), opacity: 0.04 })
  page.drawCircle({ x: width - 80, y: height / 2, size: 60,  color: rgb(0.047, 0.114, 0.369), opacity: 0.06 })

  // ── Contents summary ──────────────────────────────────────────
  const summaryY = height / 2 - 20
  page.drawText('PACKAGE CONTENTS', {
    x: 48, y: summaryY,
    font: fontBold, size: 10, color: C.navy,
  })
  page.drawRectangle({ x: 48, y: summaryY - 3, width: 40, height: 1.5, color: C.teal })

  const contents = packageContents(config.type)
  contents.forEach((item, i) => {
    page.drawText('→', { x: 52, y: summaryY - 22 - i * 16, font: fontBold, size: 8, color: C.teal })
    page.drawText(item, { x: 68, y: summaryY - 22 - i * 16, font: fontNormal, size: 8, color: C.slate })
  })

  // ── Signature block ───────────────────────────────────────────
  const sigY = 80
  const sigRoles = [
    { role: 'Prepared By', name: config.preparedBy },
    { role: 'Checked By',  name: config.checkedBy ?? '________________' },
    { role: 'Approved By', name: config.approvedBy ?? '________________' },
  ]
  const sigW = (width - 96) / 3

  sigRoles.forEach((sig, i) => {
    const x = 48 + i * (sigW + 16)
    page.drawLine({ start: { x, y: sigY + 18 }, end: { x: x + sigW, y: sigY + 18 }, thickness: 0.5, color: C.border })
    page.drawText(sig.role, { x, y: sigY + 8, font: fontBold, size: 7, color: C.muted })
    page.drawText(sig.name, { x, y: sigY - 4, font: fontNormal, size: 8, color: C.navy })
    page.drawText(config.date, { x, y: sigY - 16, font: fontNormal, size: 7, color: C.muted })
  })

  // ── Footer strip ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 28, color: C.light, borderColor: C.border, borderWidth: 0.3 })
  page.drawText('BNBC 2020 Compliant  •  CivilOS Engineering Documentation Platform', {
    x: 48, y: 10, font: fontNormal, size: 7, color: C.muted,
  })
  page.drawText(config.date, {
    x: width - 48, y: 10, font: fontNormal, size: 7, color: C.muted,
  })

  return pdfDoc
}

// ═══════════════════════════════════════════════════════════════════
// 2. Transmittal Letter Generator
// ═══════════════════════════════════════════════════════════════════

export async function createTransmittal(
  project: Project,
  config: PackageConfig,
  documents: { title: string; drawingNo?: string; revision?: string; pages?: number }[]
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Header
  page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: C.navy })
  page.drawRectangle({ x: 0, y: height - 63, width, height: 3,  color: C.teal })
  page.drawText('DOCUMENT TRANSMITTAL', { x: 48, y: height - 30, font: fontBold, size: 14, color: C.white })
  page.drawText(`${project.name}  •  ${project.projectNumber}`, { x: 48, y: height - 48, font: fontNormal, size: 8, color: rgb(0.7, 0.75, 0.9) })

  let y = height - 90

  // To / From / Date block
  const metaRows = [
    ['To',        project.authority],
    ['Project',   project.name],
    ['Ref No',    project.projectNumber],
    ['Date',      config.date],
    ['Revision',  config.revision],
    ['Prepared',  config.preparedBy],
  ]
  metaRows.forEach(([label, value]) => {
    page.drawText(label, { x: 48, y, font: fontBold, size: 8, color: C.muted })
    page.drawText(value ?? '—', { x: 140, y, font: fontNormal, size: 8, color: C.slate })
    y -= 14
  })

  y -= 10

  // Document list header
  page.drawRectangle({ x: 40, y: y - 14, width: width - 80, height: 18, color: C.slate })
  const docCols = [
    { label: 'No.', x: 52, w: 20 },
    { label: 'Document Title', x: 76, w: 200 },
    { label: 'Drawing No.', x: 280, w: 80 },
    { label: 'Rev', x: 364, w: 28 },
    { label: 'Pages', x: 396, w: 32 },
  ]
  docCols.forEach(({ label, x }) => {
    page.drawText(label, { x, y: y - 8, font: fontBold, size: 7.5, color: C.white })
  })
  y -= 22

  documents.forEach((doc, idx) => {
    const isAlt = idx % 2 === 1
    if (isAlt) page.drawRectangle({ x: 40, y: y - 12, width: width - 80, height: 16, color: C.light })
    page.drawText(`${idx + 1}`, { x: 52, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.title, { x: 76, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.drawingNo ?? '—', { x: 280, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.revision ?? config.revision, { x: 364, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(String(doc.pages ?? 1), { x: 396, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    y -= 16
  })

  // Total
  y -= 4
  page.drawRectangle({ x: 40, y: y - 14, width: width - 80, height: 18, color: C.navy })
  page.drawText(`Total Documents: ${documents.length}`, { x: 52, y: y - 8, font: fontBold, size: 8, color: C.white })

  // Note
  y -= 40
  page.drawText('REMARKS / INSTRUCTIONS', { x: 48, y, font: fontBold, size: 9, color: C.navy })
  page.drawRectangle({ x: 48, y: y - 3, width: 40, height: 1.5, color: C.teal })
  page.drawText('Please acknowledge receipt and review the enclosed documents.', { x: 48, y: y - 18, font: fontNormal, size: 8, color: C.slate })
  page.drawText('Any comments should be returned within 7 working days.', { x: 48, y: y - 32, font: fontNormal, size: 8, color: C.slate })

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 28, color: C.light })
  page.drawText('CivilOS Reports & Export  •  BNBC 2020', { x: 48, y: 10, font: fontNormal, size: 7, color: C.muted })
  page.drawText('Page 1 of 1', { x: width - 80, y: 10, font: fontNormal, size: 7, color: C.muted })

  return pdfDoc
}

// ═══════════════════════════════════════════════════════════════════
// 3. Drawing Index Generator
// ═══════════════════════════════════════════════════════════════════

export async function createDrawingIndex(
  project: Project,
  config: PackageConfig,
  documents: PackageDocument[]
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Header
  page.drawRectangle({ x: 0, y: height - 55, width, height: 55, color: C.navy })
  page.drawRectangle({ x: 0, y: height - 58, width, height: 3,  color: C.teal })
  page.drawText('DRAWING / DOCUMENT INDEX', { x: 48, y: height - 26, font: fontBold, size: 13, color: C.white })
  page.drawText(`${project.name}  •  ${project.projectNumber}  •  ${config.revision}`, { x: 48, y: height - 44, font: fontNormal, size: 8, color: rgb(0.7, 0.75, 0.9) })

  let y = height - 80

  // Table header
  page.drawRectangle({ x: 40, y: y - 14, width: width - 80, height: 18, color: C.slate })
  ;[
    { t: 'No.', x: 52 }, { t: 'Title', x: 76 },
    { t: 'Drawing No.', x: 280 }, { t: 'Rev', x: 370 }, { t: 'Status', x: 406 },
  ].forEach(({ t, x }) => {
    page.drawText(t, { x, y: y - 8, font: fontBold, size: 7.5, color: C.white })
  })
  y -= 22

  documents.forEach((doc, idx) => {
    const isAlt = idx % 2 === 1
    if (isAlt) page.drawRectangle({ x: 40, y: y - 12, width: width - 80, height: 16, color: C.light })
    page.drawText(`${idx + 1}`, { x: 52, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.title, { x: 76, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.drawingNo ?? '—', { x: 280, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText(doc.revision ?? config.revision, { x: 370, y: y - 6, font: fontNormal, size: 7.5, color: C.slate })
    page.drawText('ISSUED', { x: 406, y: y - 6, font: fontBold, size: 7, color: C.green })
    y -= 16
  })

  return pdfDoc
}

// ═══════════════════════════════════════════════════════════════════
// 4. Main Package Assembler
// ═══════════════════════════════════════════════════════════════════

export async function assemblePackage(
  project: Project,
  config: PackageConfig,
  documents: PackageDocument[]
): Promise<Uint8Array> {
  const finalDoc = await PDFDocument.create()

  // 1. Cover page
  if (config.includeCoverPage !== false) {
    const coverDoc = await createCoverPage(project, config)
    const [coverPage] = await finalDoc.copyPages(coverDoc, [0])
    finalDoc.addPage(coverPage)
  }

  // 2. Transmittal
  if (config.includeTransmittal !== false) {
    const transmittalDoc = await createTransmittal(
      project, config,
      documents.map((d) => ({ title: d.title, drawingNo: d.drawingNo, revision: d.revision }))
    )
    const [tPage] = await finalDoc.copyPages(transmittalDoc, [0])
    finalDoc.addPage(tPage)
  }

  // 3. Drawing index
  if (config.includeDrawingIndex !== false) {
    const indexDoc = await createDrawingIndex(project, config, documents)
    const [iPage] = await finalDoc.copyPages(indexDoc, [0])
    finalDoc.addPage(iPage)
  }

  // 4. Merge all documents
  for (const docItem of documents) {
    try {
      const srcDoc = await PDFDocument.load(docItem.pdfBytes)
      const pageIndices = srcDoc.getPageIndices()
      const copiedPages = await finalDoc.copyPages(srcDoc, pageIndices)
      copiedPages.forEach((p) => finalDoc.addPage(p))
    } catch {
      console.warn(`Could not load PDF for: ${docItem.title}`)
    }
  }

  // 5. Add watermark if requested
  if (config.includeWatermark && config.watermarkText) {
    const helvetica = await finalDoc.embedFont(StandardFonts.HelveticaBold)
    const pages = finalDoc.getPages()
    // Skip cover + transmittal + index (first 3 pages)
    pages.slice(3).forEach((page) => {
      const { width, height } = page.getSize()
      page.drawText(config.watermarkText!, {
        x: width / 2 - 120, y: height / 2 - 20,
        font: helvetica, size: 52,
        color: rgb(0.8, 0.8, 0.8), opacity: 0.12,
        rotate: degrees(-40),
      })
    })
  }

  // 6. Page numbers on all pages
  if (config.includePageNumbers !== false) {
    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica)
    const pages = finalDoc.getPages()
    const total = pages.length
    pages.forEach((page, i) => {
      const { width } = page.getSize()
      page.drawText(`Page ${i + 1} of ${total}`, {
        x: width - 90, y: 14,
        font: helvetica, size: 7, color: rgb(0.6, 0.6, 0.65),
      })
    })
  }

  return finalDoc.save()
}

// ─── Helpers ─────────────────────────────────────────────────────

function packageTypeShort(type: PackageType): string {
  const map: Record<PackageType, string> = {
    'authority-submission': 'AUTHORITY SUBMISSION',
    'client-package':       'CLIENT PACKAGE',
    'tender-package':       'TENDER PACKAGE',
    'construction-package': 'CONSTRUCTION PACKAGE',
  }
  return map[type] ?? type.toUpperCase()
}

function packageContents(type: PackageType): string[] {
  const map: Record<PackageType, string[]> = {
    'authority-submission': [
      'Cover Page & Transmittal',
      'Drawing / Document Index',
      'Structural Drawings',
      'Structural Calculations',
      'BNBC Compliance Report',
      'BOQ Summary',
      'Authority Forms',
    ],
    'client-package': [
      'Cover Page & Transmittal',
      'Client Summary Report',
      'Project Cost Report',
      'Progress Report',
      'Structural Report (Summary)',
      'Drawing Package',
    ],
    'tender-package': [
      'Cover Page & Transmittal',
      'Bill of Quantities (BOQ)',
      'Technical Specifications',
      'Structural Drawings',
      'Tender Schedule',
      'General Conditions',
    ],
    'construction-package': [
      'Cover Page & Transmittal',
      'IFC Drawings',
      'Bar Bending Schedule (BBS)',
      'Method Statement',
      'Material Specifications',
      'Quality Checklist',
    ],
  }
  return map[type] ?? []
}
