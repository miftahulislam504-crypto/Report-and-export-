import { useState, useEffect } from 'react'
import { FileText, Plus, Filter, X, Download, Eye } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { useReportStore } from '@/store/useReportStore'
import { useAuthStore } from '@/store/useAuthStore'
import { statusColor, reportTypeLabel, formatDate, initialRevision } from '@/lib/utils'
import type { ReportType, ReportStatus } from '@/lib/types'

const REPORT_TYPES: ReportType[] = [
  'structural', 'boq', 'progress', 'cost',
  'compliance', 'calculation', 'design-basis', 'client-summary'
]

export default function ReportsPage() {
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const { reports, loading, fetchReports, createReport, updateReport } = useReportStore()
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all')
  const [form, setForm] = useState({ type: 'structural' as ReportType, title: '' })

  useEffect(() => {
    if (currentProject) fetchReports(currentProject.id)
  }, [currentProject])

  const filtered = filterStatus === 'all'
    ? reports
    : reports.filter((r) => r.status === filterStatus)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProject || !user) return
    await createReport({
      projectId: currentProject.id,
      type: form.type,
      title: form.title || reportTypeLabel(form.type),
      status: 'draft',
      revision: initialRevision(),
      generatedBy: user.email ?? 'Engineer',
      data: {},
    })
    setShowForm(false)
    setForm({ type: 'structural', title: '' })
  }

  const advanceStatus = async (id: string, current: ReportStatus) => {
    const next: Record<ReportStatus, ReportStatus> = {
      draft: 'review', review: 'approved', approved: 'issued', issued: 'issued'
    }
    await updateReport(id, { status: next[current] })
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            {currentProject ? currentProject.name : 'Select a project first'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          disabled={!currentProject}
        >
          <Plus size={15} /> Generate Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['all', 'draft', 'review', 'approved', 'issued'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? `All (${reports.length})` : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {!currentProject ? (
        <div className="empty-state">
          <FileText size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">No project selected</p>
          <p className="text-xs text-slate-300 mt-1">Go to Projects and select one</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">No reports found</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            <Plus size={15} /> Generate First Report
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Revision</th>
                <th>Status</th>
                <th>By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={12} className="text-primary-500" />
                      </div>
                      <span className="font-medium text-slate-800">{r.title}</span>
                    </div>
                  </td>
                  <td className="text-slate-500">{reportTypeLabel(r.type)}</td>
                  <td>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{r.revision}</span>
                  </td>
                  <td>
                    <span className={`badge ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="text-slate-500 text-xs">{r.generatedBy}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {r.status !== 'issued' && (
                        <button
                          onClick={() => advanceStatus(r.id, r.status)}
                          className="btn-ghost text-xs py-1 px-2"
                        >
                          Advance
                        </button>
                      )}
                      <button className="btn-ghost p-1.5"><Eye size={13} /></button>
                      <button className="btn-ghost p-1.5"><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900">Generate Report</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="form-label">Report Type</label>
                <select className="form-select" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ReportType })}>
                  {REPORT_TYPES.map(t => (
                    <option key={t} value={t}>{reportTypeLabel(t)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Title (optional)</label>
                <input className="form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={reportTypeLabel(form.type)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
