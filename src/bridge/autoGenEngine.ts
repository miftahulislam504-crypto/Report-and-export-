// ─── Auto Generation Engine ───────────────────────────────────────
// Takes ecosystem data → automatically generates reports & packages
// This is the 90-95% automation engine described in the master plan.

import type { EcosystemData } from '@/bridge/bridgeTypes'
import type { Project } from '@/lib/types'
import { compileTemplate, buildTemplateData } from '@/templates/engine'

// ─── Auto-generation result ───────────────────────────────────────

export interface AutoGenResult {
  reportType: string
  title: string
  status: 'success' | 'skipped' | 'error'
  reason?: string
  content?: string
  dataUsed: string[]  // which source apps contributed data
}

// ─── Template variable builder from ecosystem data ────────────────

export function buildEcosystemVariables(
  project: Project,
  ecosystem: EcosystemData
): Record<string, unknown> {
  const base = buildTemplateData(project, {})
  const vars: Record<string, unknown> = { ...base }

  // ── From Structural app ──────────────────────────────────────
  if (ecosystem.structural) {
    const s = ecosystem.structural
    Object.assign(vars, {
      concreteGrade:      s.concreteGrade,
      steelGrade:         s.steelGrade,
      soilBearing:        s.soilBearingCapacity,
      seismicZone:        s.seismicZone,
      windSpeed:          s.windSpeed,
      exposureCategory:   s.exposureCategory,
      buildingHeight:     s.buildingHeight,
      foundationType:     s.foundationType,
      slabSystem:         s.slabSystem,
      analysisMethod:     s.analysisMethod,
      software:           s.software,
      slabThk:            s.slabThickness,
      beamSize:           s.typicalBeamSize,
      colSize:            s.typicalColumnSize,
      footSize:           s.typicalFootingSize,
      importanceFactor:   s.importanceFactor,
      responseModFactor:  s.responseModFactor,
      soilType:           s.soilType,
      foundDepth:         s.foundationDepth,
    })
  }

  // ── From Estimate app ────────────────────────────────────────
  if (ecosystem.estimate) {
    const e = ecosystem.estimate
    Object.assign(vars, {
      totalCost:          e.totalCost,
      civilCost:          e.civilCost,
      structuralCost:     e.structuralCost,
      architecturalCost:  e.architecturalCost,
      finishingCost:      e.finishingCost,
      mepCost:            e.mepCost,
      costPerSqm:         e.costPerSqm,
      contingency:        e.contingency,
      rateYear:           e.rateYear,
    })
  }

  // ── From Project Management app ──────────────────────────────
  if (ecosystem.projectManagement) {
    const p = ecosystem.projectManagement
    Object.assign(vars, {
      startDate:              p.startDate,
      expectedCompletion:     p.expectedCompletion,
      completionPercent:      p.overallCompletion,
      currentPhase:           p.currentPhase,
      delayDays:              p.delayDays,
      openIssues:             p.openIssues,
      budgetSpent:            p.budgetSpent,
      budgetRemaining:        p.budgetRemaining,
      currentLabour:          p.currentLabour,
    })
  }

  // ── From Architectural app ───────────────────────────────────
  if (ecosystem.architectural) {
    const a = ecosystem.architectural
    Object.assign(vars, {
      occupancyType:   a.occupancyType,
      frontSetback:    a.frontSetback,
      rearSetback:     a.rearSetback,
      sideSetback:     a.sideSetback,
      far:             a.far,
      groundCoverage:  a.groundCoverage,
      openSpace:       a.openSpace,
      basementFloors:  a.basementFloors,
    })
  }

  return vars
}

// ─── Data availability checker ────────────────────────────────────

function hasData(ecosystem: EcosystemData, ...apps: (keyof EcosystemData)[]): boolean {
  return apps.every((app) => ecosystem[app] !== undefined && ecosystem[app] !== null)
}

// ─── Auto-generate all eligible reports ──────────────────────────

export function autoGenerateReports(
  project: Project,
  ecosystem: EcosystemData,
  templates: { type: string; content: string; name: string }[]
): AutoGenResult[] {
  const results: AutoGenResult[] = []
  const vars = buildEcosystemVariables(project, ecosystem)

  // ── Structural Report ───────────────────────────────────────
  const structTpl = templates.find((t) => t.type === 'structural')
  if (structTpl) {
    if (hasData(ecosystem, 'structural')) {
      try {
        const content = compileTemplate(structTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
        results.push({
          reportType: 'structural',
          title: 'Structural Engineering Report',
          status: 'success',
          content,
          dataUsed: ['structural'],
        })
      } catch (e) {
        results.push({ reportType: 'structural', title: 'Structural Report', status: 'error', reason: String(e), dataUsed: [] })
      }
    } else {
      results.push({ reportType: 'structural', title: 'Structural Report', status: 'skipped', reason: 'No structural data synced', dataUsed: [] })
    }
  }

  // ── Design Basis Report ─────────────────────────────────────
  const dbTpl = templates.find((t) => t.type === 'design-basis')
  if (dbTpl) {
    if (hasData(ecosystem, 'structural', 'architectural')) {
      try {
        const content = compileTemplate(dbTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
        results.push({ reportType: 'design-basis', title: 'Design Basis Report', status: 'success', content, dataUsed: ['structural', 'architectural'] })
      } catch (e) {
        results.push({ reportType: 'design-basis', title: 'Design Basis Report', status: 'error', reason: String(e), dataUsed: [] })
      }
    } else {
      results.push({ reportType: 'design-basis', title: 'Design Basis Report', status: 'skipped', reason: 'Needs structural + architectural data', dataUsed: [] })
    }
  }

  // ── BOQ Report ──────────────────────────────────────────────
  const boqTpl = templates.find((t) => t.type === 'boq')
  if (boqTpl) {
    if (hasData(ecosystem, 'estimate')) {
      try {
        const content = compileTemplate(boqTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
        results.push({ reportType: 'boq', title: 'Bill of Quantities', status: 'success', content, dataUsed: ['estimate'] })
      } catch (e) {
        results.push({ reportType: 'boq', title: 'BOQ Report', status: 'error', reason: String(e), dataUsed: [] })
      }
    } else {
      results.push({ reportType: 'boq', title: 'BOQ Report', status: 'skipped', reason: 'No estimate data synced', dataUsed: [] })
    }
  }

  // ── Cost Report ─────────────────────────────────────────────
  const costTpl = templates.find((t) => t.type === 'cost')
  if (costTpl && hasData(ecosystem, 'estimate')) {
    try {
      const content = compileTemplate(costTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
      results.push({ reportType: 'cost', title: 'Project Cost Report', status: 'success', content, dataUsed: ['estimate'] })
    } catch (e) {
      results.push({ reportType: 'cost', title: 'Cost Report', status: 'error', reason: String(e), dataUsed: [] })
    }
  }

  // ── Progress Report ─────────────────────────────────────────
  const progTpl = templates.find((t) => t.type === 'progress')
  if (progTpl && hasData(ecosystem, 'projectManagement')) {
    try {
      const content = compileTemplate(progTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
      results.push({ reportType: 'progress', title: 'Monthly Progress Report', status: 'success', content, dataUsed: ['project-management'] })
    } catch (e) {
      results.push({ reportType: 'progress', title: 'Progress Report', status: 'error', reason: String(e), dataUsed: [] })
    }
  }

  // ── BNBC Compliance ─────────────────────────────────────────
  const bnbcTpl = templates.find((t) => t.type === 'compliance')
  if (bnbcTpl && hasData(ecosystem, 'structural', 'architectural')) {
    try {
      const content = compileTemplate(bnbcTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
      results.push({ reportType: 'compliance', title: 'BNBC Compliance Report', status: 'success', content, dataUsed: ['structural', 'architectural'] })
    } catch (e) {
      results.push({ reportType: 'compliance', title: 'BNBC Compliance', status: 'error', reason: String(e), dataUsed: [] })
    }
  }

  // ── Client Summary ──────────────────────────────────────────
  const clientTpl = templates.find((t) => t.type === 'client-summary')
  if (clientTpl) {
    const available = [
      hasData(ecosystem, 'structural') && 'structural',
      hasData(ecosystem, 'estimate') && 'estimate',
      hasData(ecosystem, 'projectManagement') && 'project-management',
    ].filter(Boolean) as string[]

    if (available.length > 0) {
      try {
        const content = compileTemplate(clientTpl.content, vars as unknown as import('@/templates/engine').TemplateData)
        results.push({ reportType: 'client-summary', title: 'Client Summary Report', status: 'success', content, dataUsed: available })
      } catch (e) {
        results.push({ reportType: 'client-summary', title: 'Client Summary', status: 'error', reason: String(e), dataUsed: [] })
      }
    }
  }

  return results
}

// ─── Automation level calculator ─────────────────────────────────

export function calcAutomationLevel(ecosystem: EcosystemData): {
  level: number
  connectedApps: number
  totalApps: number
  breakdown: { app: string; connected: boolean; contribution: number }[]
} {
  const apps = [
    { app: 'Structural',         key: 'structural',        contribution: 30 },
    { app: 'Estimate',           key: 'estimate',          contribution: 25 },
    { app: 'Project Management', key: 'projectManagement', contribution: 25 },
    { app: 'Architectural',      key: 'architectural',     contribution: 20 },
  ]

  const breakdown = apps.map(({ app, key, contribution }) => ({
    app,
    connected: Boolean(ecosystem[key as keyof EcosystemData]),
    contribution,
  }))

  const level = breakdown.reduce((sum, b) => sum + (b.connected ? b.contribution : 0), 0)
  const connectedApps = breakdown.filter((b) => b.connected).length

  return { level, connectedApps, totalApps: apps.length, breakdown }
}
