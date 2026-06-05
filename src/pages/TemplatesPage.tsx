import { useState, useEffect } from 'react'
import {
  LayoutTemplate, Plus, Search, X, Wand2,
  RefreshCw, CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useTemplateStore } from '@/store/useTemplateStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useNavigate } from 'react-router-dom'
import type { ReportTemplate, ReportType } from '@/lib/types'
import { reportTypeLabel } from '@/lib/utils'
import TemplateCard from '@/components/template/TemplateCard'
import TemplateEditor from '@/components/template/TemplateEditor'
import GenerateFromTemplate from '@/components/template/GenerateFromTemplate'

const REPORT_TYPES: ReportType[] = [
  'structural', 'design-basis', 'boq', 'progress',
  'compliance', 'calculation', 'cost', 'client-summary',
]

export default function TemplatesPage() {
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const {
    templates, loading,
    fetchTemplates, createTemplate, updateTemplate,
    deleteTemplate, seedDefaultTemplates,
  } = useTemplateStore()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all')
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [generateTemplate, setGenerateTemplate] = useState<ReportTemplate | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [successId, setSuccessId] = useState('')
  const [newForm, setNewForm] = useState({
    name: '', type: 'structural' as ReportType, description: '',
  })

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    fetchTemplates(user.uid).then(async () => {
      // Seed defaults if library is empty
      await seedDefaultTemplates(user.uid)
    })
  }, [user])

  // ── Filtered list ─────────────────────────────────────────────────
  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    return matchSearch && matchType
  })

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSaveEdit = async (id: string, content: string, name: string) => {
    await updateTemplate(id, { content, name })
    setEditingTemplate(null)
  }

  const handleDuplicate = async (t: ReportTemplate) => {
    if (!user) return
    await createTemplate({
      ...t,
      name: `${t.name} (Copy)`,
      isDefault: false,
      ownerId: user.uid,
    } as never)
    await fetchTemplates(user.uid)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('এই template delete করবেন?')) return
    await deleteTemplate(id)
  }

  const handleGenerateSuccess = (reportId: string) => {
    setGenerateTemplate(null)
    setSuccessId(reportId)
    setTimeout(() => setSuccessId(''), 3000)
  }

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const id = await createTemplate({
      ...newForm,
      isDefault: false,
      variables: [],
      content: `${newForm.name.toUpperCase()}\n${'='.repeat(newForm.name.length)}\n\nProject  : {{projectName}}\nRef No   : {{projectNumber}}\nClient   : {{client}}\nDate     : {{reportDate}}\n\n─────────────────────────────────────────────\n\n`,
      ownerId: user.uid,
    } as never)
    await fetchTemplates(user.uid)
    setShowNewForm(false)
    // Open editor immediately
    const created = templates.find((t) => t.id === id)
    if (created) setEditingTemplate(created)
  }

  // ── Counts per type ───────────────────────────────────────────────
  const countByType = (type: ReportType) => templates.filter((t) => t.type === type).length

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Template Engine</h1>
          <p className="page-subtitle">
            {templates.length} template{templates.length !== 1 ? 's' : ''} · Handlebars-powered dynamic reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!currentProject && (
            <button
              onClick={() => navigate('/projects')}
              className="btn-secondary text-xs"
            >
              Select Project First
            </button>
          )}
          <button onClick={() => setShowNewForm(true)} className="btn-primary">
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>

      {/* ── Success Toast ── */}
      {successId && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-green-600 text-white
                        px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Report generated successfully!</span>
          <button onClick={() => navigate('/reports')} className="text-green-100 underline text-xs ml-1">
            View →
          </button>
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9 text-sm"
            placeholder="Search templates..."
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({templates.length})
          </button>
          {REPORT_TYPES.map((type) => {
            const count = countByType(type)
            if (count === 0) return null
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {reportTypeLabel(type)} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <LayoutTemplate size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">
            {search ? 'No matching templates' : 'No templates yet'}
          </p>
          {!search && (
            <button onClick={() => setShowNewForm(true)} className="btn-primary mt-4">
              <Plus size={15} /> Create Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={setEditingTemplate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onGenerate={setGenerateTemplate}
            />
          ))}
        </div>
      )}

      {/* ── New Template Modal ── */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900">New Template</h3>
              <button onClick={() => setShowNewForm(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateNew} className="px-6 py-5 space-y-4">
              <div>
                <label className="form-label">Template Name</label>
                <input
                  required
                  className="form-input"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Custom Structural Report"
                />
              </div>
              <div>
                <label className="form-label">Report Type</label>
                <select
                  className="form-select"
                  value={newForm.type}
                  onChange={(e) => setNewForm({ ...newForm, type: e.target.value as ReportType })}
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{reportTypeLabel(t)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="What is this template for?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Wand2 size={14} /> Create & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Template Editor (full screen) ── */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveEdit}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      {/* ── Generate Modal ── */}
      {generateTemplate && (
        <GenerateFromTemplate
          template={generateTemplate}
          onClose={() => setGenerateTemplate(null)}
          onSuccess={handleGenerateSuccess}
        />
      )}
    </div>
  )
}
