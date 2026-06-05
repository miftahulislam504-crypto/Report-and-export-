import { useState, useCallback } from 'react'
import { X, Eye, Code2, Save, RefreshCw, Variable } from 'lucide-react'
import type { ReportTemplate } from '@/lib/types'
import { compileTemplate, extractVariables } from '@/templates/engine'

interface TemplateEditorProps {
  template: ReportTemplate
  onSave: (id: string, content: string, name: string) => void
  onClose: () => void
}

export default function TemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [content, setContent] = useState(template.content)
  const [name, setName] = useState(template.name)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [previewError, setPreviewError] = useState('')

  // Auto-detect variables from current content
  const variables = extractVariables(content)

  // Fill preview data with placeholder values
  const fillSampleData = useCallback(() => {
    const sample: Record<string, string> = {
      projectName: 'Gulshan Residential Tower',
      projectNumber: 'PRJ-2024-001',
      client: 'Mr. Ahmed Hassan',
      location: 'Gulshan-2, Dhaka',
      buildingType: 'residential',
      authority: 'RAJUK',
      floors: '8',
      area: '4800',
      engineer: 'Engr. Miftahul Islam',
      reportDate: new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' }),
      reportYear: new Date().getFullYear().toString(),
      concreteGrade: "f'c = 25 MPa",
      steelGrade: 'Grade 60 (415 MPa)',
      soilBearing: '150',
      seismicZone: 'Zone 2',
      windSpeed: '150',
      totalCost: '45000000',
      costPerSqm: '9375',
      completionPercent: '35',
      currentPhase: 'Structural Frame',
      revision: 'Rev 00',
    }
    // fill any extra variables with placeholders
    variables.forEach((v) => {
      if (!sample[v]) sample[v] = `[${v}]`
    })
    setPreviewData(sample)
  }, [variables])

  const getPreview = (): string => {
    try {
      setPreviewError('')
      return compileTemplate(content, previewData as never)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Preview error'
      setPreviewError(msg)
      return ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    onSave(template.id, content, name)
    setSaving(false)
  }

  const insertVariable = (key: string) => {
    setContent((c) => c + `{{${key}}}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-stretch">
      <div className="flex flex-col w-full bg-[#0f1117] text-slate-100 overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 shrink-0">
          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                       text-sm font-medium text-white placeholder-slate-500
                       focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Mode toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 size={13} /> Editor
            </button>
            <button
              onClick={() => { setMode('preview'); fillSampleData() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1.5 px-3">
            {saving
              ? <RefreshCw size={13} className="animate-spin" />
              : <><Save size={13} /> Save</>
            }
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Editor / Preview */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {mode === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none bg-[#0f1117] text-slate-200 font-mono text-sm
                           px-6 py-5 focus:outline-none leading-relaxed"
                placeholder="Write your Handlebars template here..."
              />
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {previewError ? (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm font-mono">
                    ⚠ {previewError}
                  </div>
                ) : (
                  <pre className="text-slate-200 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {getPreview()}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Right: Variable Panel */}
          <div className="w-64 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Variable size={13} className="text-blue-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Variables ({variables.length})
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {/* Detected from template */}
              {variables.length === 0 ? (
                <p className="text-xs text-slate-500 px-1 py-2">
                  Use {'{{variableName}}'} in your template to add variables.
                </p>
              ) : (
                variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    title="Click to insert"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                               bg-white/5 hover:bg-white/10 transition-colors text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 flex-1 truncate">{v}</span>
                    <span className="text-[10px] text-slate-600 group-hover:text-slate-400">insert</span>
                  </button>
                ))
              )}

              {/* Divider + common helpers */}
              <div className="pt-3 pb-1">
                <p className="text-[10px] text-slate-600 uppercase tracking-wide px-1 mb-2">
                  Helpers
                </p>
                {[
                  ['formatCurrency', '{{formatCurrency totalCost}}'],
                  ['formatNumber',   '{{formatNumber area}}'],
                  ['formatDate',     '{{formatDate startDate}}'],
                  ['upper',          '{{upper authority}}'],
                  ['default',        '{{default value "fallback"}}'],
                ].map(([label, snippet]) => (
                  <button
                    key={label}
                    onClick={() => setContent((c) => c + snippet)}
                    className="w-full flex items-start gap-2 px-3 py-2 rounded-lg
                               bg-white/5 hover:bg-white/10 transition-colors text-left mb-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-teal-300">{label}</p>
                      <p className="font-mono text-[10px] text-slate-600 truncate">{snippet}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Data Editor (only in preview mode) */}
            {mode === 'preview' && (
              <div className="border-t border-white/10 px-3 py-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">
                  Preview Values
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {variables.slice(0, 8).map((v) => (
                    <div key={v} className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500 w-24 truncate shrink-0">{v}</span>
                      <input
                        value={previewData[v] ?? ''}
                        onChange={(e) => setPreviewData((d) => ({ ...d, [v]: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1
                                   text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
