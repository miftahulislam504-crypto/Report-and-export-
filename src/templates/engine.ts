import Handlebars from 'handlebars'
import type { Project } from '@/lib/types'

// ─── Register Custom Helpers ──────────────────────────────────────

Handlebars.registerHelper('formatCurrency', (val: number) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(val ?? 0)
)

Handlebars.registerHelper('formatDate', (val: string | Date) => {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
})

Handlebars.registerHelper('formatNumber', (val: number) =>
  new Intl.NumberFormat('en-BD').format(val ?? 0)
)

Handlebars.registerHelper('upper', (val: string) => (val ?? '').toUpperCase())
Handlebars.registerHelper('lower', (val: string) => (val ?? '').toLowerCase())

Handlebars.registerHelper('ifEqual', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this)
})

Handlebars.registerHelper('default', (val: unknown, fallback: string) =>
  val !== undefined && val !== null && val !== '' ? val : fallback
)

Handlebars.registerHelper('multiply', (a: number, b: number) => (a ?? 0) * (b ?? 0))
Handlebars.registerHelper('add', (a: number, b: number) => (a ?? 0) + (b ?? 0))

// ─── Template Compiler ────────────────────────────────────────────

export function compileTemplate(templateContent: string, data: TemplateData): string {
  try {
    const compiled = Handlebars.compile(templateContent)
    return compiled(data)
  } catch (err) {
    console.error('Template compilation error:', err)
    throw new Error(`Template error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

// ─── Template Data Builder ────────────────────────────────────────

export interface TemplateData {
  // Project
  projectName: string
  projectNumber: string
  client: string
  location: string
  buildingType: string
  authority: string
  floors: number
  area: number
  engineer: string
  reportDate: string
  reportYear: string

  // Structural (from CivilOS Structural)
  concreteGrade?: string
  steelGrade?: string
  soilBearing?: number
  seismicZone?: string
  windSpeed?: number
  exposureCategory?: string
  buildingHeight?: number

  // Cost (from CivilOS Estimate)
  totalCost?: number
  civilCost?: number
  structuralCost?: number
  finishingCost?: number
  costPerSqm?: number

  // Progress (from CivilOS PM)
  completionPercent?: number
  startDate?: string
  expectedCompletion?: string
  currentPhase?: string

  // Dynamic extra fields
  [key: string]: unknown
}

export function buildTemplateData(project: Project, extra: Record<string, unknown> = {}): TemplateData {
  const now = new Date()
  return {
    projectName: project.name,
    projectNumber: project.projectNumber,
    client: project.client,
    location: project.location,
    buildingType: project.buildingType,
    authority: project.authority,
    floors: project.floors,
    area: project.area,
    engineer: project.engineer,
    reportDate: now.toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' }),
    reportYear: now.getFullYear().toString(),
    ...extra,
  }
}

// ─── Variable Extractor ───────────────────────────────────────────
// Reads {{variable}} tokens from a template string

export function extractVariables(templateContent: string): string[] {
  const regex = /\{\{([^#\/!>][^}]*)\}\}/g
  const found = new Set<string>()
  let match
  while ((match = regex.exec(templateContent)) !== null) {
    const key = match[1].trim().split(' ')[0] // strip helpers
    if (key && !key.startsWith('if') && !key.startsWith('each') && !key.startsWith('unless')) {
      found.add(key)
    }
  }
  return Array.from(found)
}
