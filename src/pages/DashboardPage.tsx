import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, CheckCircle, Clock, Download,
  FolderOpen, ArrowRight, Plus, TrendingUp,
  Package, LayoutTemplate
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useReportStore } from '@/store/useReportStore'
import { statusColor, formatDate, reportTypeLabel } from '@/lib/utils'
import type { ReportStatus } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { projects, currentProject, fetchProjects } = useProjectStore()
  const { reports, fetchReports } = useReportStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user])

  useEffect(() => {
    if (currentProject) fetchReports(currentProject.id)
  }, [currentProject])

  const stats = {
    totalReports: reports.length,
    generated: reports.filter((r) => r.status !== 'draft').length,
    pending: reports.filter((r) => r.status === 'draft' || r.status === 'review').length,
    approved: reports.filter((r) => r.status === 'approved' || r.status === 'issued').length,
  }

  const recentReports = reports.slice(0, 5)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Documentation Hub</h1>
          <p className="page-subtitle">
            {currentProject
              ? `${currentProject.name} · ${currentProject.projectNumber}`
              : 'Select a project to get started'}
          </p>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="btn-primary"
        >
          <Plus size={15} />
          New Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total Reports"
          value={stats.totalReports}
          icon={FileText}
          color="blue"
          trend={currentProject ? `${currentProject.name}` : '—'}
        />
        <KpiCard
          label="Generated"
          value={stats.generated}
          icon={TrendingUp}
          color="teal"
          trend="Ready to export"
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="amber"
          trend="Needs attention"
        />
        <KpiCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
          trend="Issued documents"
        />
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
              Recent Reports
            </h2>
            <button
              onClick={() => navigate('/reports')}
              className="btn-ghost text-xs"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentReports.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} className="text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-400">No reports yet</p>
              <p className="text-xs text-slate-300 mt-1">
                {currentProject ? 'Generate your first report' : 'Select a project first'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentReports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/reports')}
                >
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400">{reportTypeLabel(r.type)} · {r.revision}</p>
                  </div>
                  <span className={`badge ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Projects */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Browse Projects', icon: FolderOpen, to: '/projects', color: 'bg-blue-50 text-blue-600' },
                { label: 'Generate Report', icon: FileText, to: '/reports', color: 'bg-teal-50 text-teal-600' },
                { label: 'Build Package', icon: Package, to: '/packages', color: 'bg-purple-50 text-purple-600' },
                { label: 'Manage Templates', icon: LayoutTemplate, to: '/templates', color: 'bg-amber-50 text-amber-600' },
                { label: 'Export Center', icon: Download, to: '/exports', color: 'bg-green-50 text-green-600' },
              ].map(({ label, icon: Icon, to, color }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{label}</span>
                  <ArrowRight size={12} className="ml-auto text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                Projects
              </h2>
              <span className="badge bg-slate-100 text-slate-500">{projects.length}</span>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">No projects found</p>
                <button
                  onClick={() => navigate('/projects')}
                  className="btn-primary mt-3 text-xs py-1.5"
                >
                  <Plus size={12} /> Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate('/projects')}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.authority} · {p.buildingType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── KPI Card Component ────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'teal' | 'amber' | 'green'
  trend?: string
}

const colorMap = {
  blue:  { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
  teal:  { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100' },
  amber: { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
  green: { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
}

function KpiCard({ label, value, icon: Icon, color, trend }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
          <Icon size={16} className={c.text} />
        </div>
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {trend && <p className="text-[10px] text-slate-400 mt-1 truncate">{trend}</p>}
    </div>
  )
}
