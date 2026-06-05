import { useState, useEffect } from 'react'
import { X, Wand2, RefreshCw, ChevronRight } from 'lucide-react'
import type { ReportTemplate } from '@/lib/types'
import { compileTemplate, buildTemplateData } from '@/templates/engine'
import { useProjectStore } from '@/store/useProjectStore'
import { useReportStore } from '@/store/useReportStore'
import { useAuthStore } from '@/store/useAuthStore'
import { reportTypeLabel, initialRevision } from '@/lib/utils'

interface GenerateModalProps {
  template: ReportTemplate
  onClose: () => void
  onSuccess: (reportId: string) => void
}

export default function GenerateFromTemplate({ template, onClose, onSuccess }: GenerateModalProps) {
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const { createReport } = useReportStore()

  // Manual override values for each variable
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<'fill' | 'preview'>('fill')
  const [preview, setPreview] = useState('')
  const [previewError, setPreviewError] = useState('')

  // Pre-fill from project data
  useEffect(() => {
    if (!currentProject) return
    const prefill: Record<string, string> = {}
    template.variables.forEach((v) => {
      const proj = currentProject as Record<string, unknown>
      if (v.source === 'project' && proj[v.key] !== undefined) {
        prefill[v.key] = String(proj[v.key])
      }
    })
    setOverrides(prefill)
  }, [template, currentProject])

  const buildData = () => {
    if (!currentProject) return {}
    const base = buildTemplateData(currentProject, {})
    // merge manual overrides
    const merged = { ...base }
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== '') (merged as Record<string, unknown>)[k] = v
    })
    return merged
  }

  const handlePreview = () => {
    try {
      setPreviewError('')
      const data = buildData()
      const result = compileTemplate(template.content, data as never)
      setPreview(result)
      setStep('preview')
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : 'Preview failed')
    }
  }

  const handleGenerate = async () => {
    if (!currentProject || !user) return
    setGenerating(true)
    try {
      const data = buildData()
      const compiled = compileTemplate(template.content, data as never)
      const id = await createReport({
        projectId: currentProject.id,
        type: template.type,
        title: template.name,
        status: 'draft',
        revision: initialRevision(),
        generatedBy: user.email ?? 'Engineer',
        data: { ...data, compiledContent: compiled, templateId: template.id },
      })
      onSuccess(id)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  // Group variables by source
  const projectVars  = template.variables.filter((v) => v.source === 'project')
  const structVars   = template.variables.filter((v) => v.source === 'structural')
  const estimateVars = template.variables.filter((v) => v.source === 'estimate')
  const manualVars   = template.variables.filter((v) => v.source === 'manual')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-display font-bold text-slate-900">Generate Report</h3>
            <p className="text-xs text-slate-400 mt-0.5">{reportTypeLabel(template.type)} · {template.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`px-2.5 py-1 rounded-full font-medium ${step === 'fill' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                1 Fill Data
              </span>
              <ChevronRight size={12} />
              <span className={`px-2.5 py-1 rounded-full font-medium ${step === 'preview' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                2 Preview
              </span>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'fill' ? (
            <div className="px-6 py-5 space-y-5">
              {!currentProject && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
                  ⚠ No project selected. Go to Projects first.
                </div>
              )}

              {previewError && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600">
                  {previewError}
                </div>
              )}

              {/* Project variables (auto-filled) */}
              {projectVars.length > 0 && (
                <VarGroup
                  title="Project Data"
                  color="bg-blue-50 text-blue-600"
                  subtitle="Auto-filled from project"
                  variables={projectVars}
                  overrides={overrides}
                  onChange={(k, v) => setOverrides((o) => ({ ...o, [k]: v }))}
                />
              )}

              {/* Structural */}
              {structVars.length > 0 && (
                <VarGroup
                  title="Structural Data"
                  color="bg-indigo-50 text-indigo-600"
                  subtitle="From CivilOS Structural"
                  variables={structVars}
                  overrides={overrides}
                  onChange={(k, v) => setOverrides((o) => ({ ...o, [k]: v }))}
                />
              )}

              {/* Estimate */}
              {estimateVars.length > 0 && (
                <VarGroup
                  title="Cost / Estimate Data"
                  color="bg-green-50 text-green-600"
                  subtitle="From CivilOS Estimate"
                  variables={estimateVars}
                  overrides={overrides}
                  onChange={(k, v) => setOverrides((o) => ({ ...o, [k]: v }))}
                />
              )}

              {/* Manual */}
              {manualVars.length > 0 && (
                <VarGroup
                  title="Manual Input"
                  color="bg-amber-50 text-amber-600"
                  subtitle="Enter these values manually"
                  variables={manualVars}
                  overrides={overrides}
                  onChange={(k, v) => setOverrides((o) => ({ ...o, [k]: v }))}
                />
              )}
            </div>
          ) : (
            /* Preview pane */
            <div className="px-6 py-5">
              <div className="bg-slate-950 rounded-xl p-5 overflow-x-auto">
                <pre className="text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {preview}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
          {step === 'fill' ? (
            <>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button
                onClick={handlePreview}
                disabled={!currentProject}
                className="btn-primary ml-auto"
              >
                Preview <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('fill')} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary ml-auto"
              >
                {generating ? (
                  <><RefreshCw size={14} className="animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 size={14} /> Generate Report</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Variable Group ────────────────────────────────────────────────

interface VarGroupProps {
  title: string
  subtitle: string
  color: string
  variables: ReportTemplate['variables']
  overrides: Record<string, string>
  onChange: (key: string, value: string) => void
}

function VarGroup({ title, subtitle, color, variables, overrides, onChange }: VarGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{title}</span>
        <span className="text-xs text-slate-400">{subtitle}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {variables.map((v) => (
          <div key={v.key}>
            <label className="form-label">{v.label}</label>
            <input
              type={v.type === 'number' ? 'number' : v.type === 'date' ? 'date' : 'text'}
              value={overrides[v.key] ?? ''}
              onChange={(e) => onChange(v.key, e.target.value)}
              className="form-input"
              placeholder={`{{${v.key}}}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
