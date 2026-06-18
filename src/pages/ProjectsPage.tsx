import { useState, useEffect } from 'react'
import {
  Plus, FolderOpen, MapPin, Building2, User,
  ChevronRight, Search, X, Check
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { statusColor } from '@/lib/utils'
import type { Project, Authority, BuildingType, ProjectStatus } from '@/lib/types'

const AUTHORITIES: Authority[] = ['RAJUK', 'CDA', 'RDA', 'KDA', 'OTHER']
const BUILDING_TYPES: BuildingType[] = ['residential', 'commercial', 'industrial', 'institutional', 'mixed-use']
const STATUSES: ProjectStatus[] = ['active', 'completed', 'on-hold', 'archived']

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const { projects, currentProject, loading, fetchProjects, createProject, setCurrentProject } = useProjectStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', projectNumber: '', client: '', location: '',
    buildingType: 'residential' as BuildingType,
    status: 'active' as ProjectStatus,
    authority: 'RAJUK' as Authority,
    floors: 5, area: 500, engineer: '',
  })

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user])

  const filtered = projects.filter(
    (p) => {
      const q = search.toLowerCase()
      // Support both Hub field names (projectName, clientName) and legacy aliases (name, client)
      return (
        (p.projectName ?? p.name ?? '').toLowerCase().includes(q) ||
        (p.projectCode ?? p.projectNumber ?? '').toLowerCase().includes(q) ||
        (p.clientName ?? p.client ?? '').toLowerCase().includes(q)
      )
    }
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    // Write Hub-compatible fields so Hub also sees the project
    await createProject({
      ...form,
      projectName: form.name,       // Hub uses projectName
      clientName:  form.client,     // Hub uses clientName
      projectCode: form.projectNumber,
      createdBy:   user.uid,        // Hub uses createdBy
      ownerId:     user.uid,        // keep for backward compat
    })
    setShowForm(false)
    setForm({ name: '', projectNumber: '', client: '', location: '', buildingType: 'residential', status: 'active', authority: 'RAJUK', floors: 5, area: 500, engineer: '' })
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
          placeholder="Search projects..."
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card h-40 bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">
            {search ? 'No matching projects' : 'No projects yet'}
          </p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              <Plus size={15} /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={currentProject?.id === project.id}
              onSelect={() => setCurrentProject(project)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <Modal title="New Project" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Project Name</label>
                <input required className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Residential Building, Dhaka" />
              </div>
              <div>
                <label className="form-label">Project Number</label>
                <input required className="form-input" value={form.projectNumber}
                  onChange={(e) => setForm({ ...form, projectNumber: e.target.value })}
                  placeholder="PRJ-2024-001" />
              </div>
              <div>
                <label className="form-label">Client</label>
                <input required className="form-input" value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Gulshan, Dhaka" />
              </div>
              <div>
                <label className="form-label">Authority</label>
                <select className="form-select" value={form.authority}
                  onChange={(e) => setForm({ ...form, authority: e.target.value as Authority })}>
                  {AUTHORITIES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Building Type</label>
                <select className="form-select" value={form.buildingType}
                  onChange={(e) => setForm({ ...form, buildingType: e.target.value as BuildingType })}>
                  {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Floors</label>
                <input type="number" className="form-input" value={form.floors}
                  onChange={(e) => setForm({ ...form, floors: +e.target.value })} />
              </div>
              <div>
                <label className="form-label">Area (sqm)</label>
                <input type="number" className="form-input" value={form.area}
                  onChange={(e) => setForm({ ...form, area: +e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Lead Engineer</label>
                <input className="form-input" value={form.engineer}
                  onChange={(e) => setForm({ ...form, engineer: e.target.value })}
                  placeholder="Engr. Name" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Create Project</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function ProjectCard({ project, isActive, onSelect }: { project: Project; isActive: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`card cursor-pointer hover:shadow-card-hover transition-all duration-200 border-2 ${
        isActive ? 'border-primary-500' : 'border-slate-100'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-500' : 'bg-slate-100'}`}>
          <Building2 size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="badge bg-primary-50 text-primary-600 border border-primary-100">
              <Check size={10} className="mr-1" /> Active
            </span>
          )}
          <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
        </div>
      </div>
      <h3 className="font-display font-bold text-slate-900 text-sm mb-0.5 line-clamp-1">{project.name}</h3>
      <p className="text-xs text-slate-400 mb-3">{project.projectNumber}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User size={11} /> {project.client}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={11} /> {project.location || '—'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Building2 size={11} /> {project.authority} · {project.floors}F · {project.area}m²
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
