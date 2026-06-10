import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, FileText,
  LayoutTemplate, Package, Download,
  LogOut, Building2, ChevronRight, Zap,
  Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/projects',   label: 'Projects',   icon: FolderOpen },
  { to: '/reports',    label: 'Reports',    icon: FileText },
  { to: '/templates',  label: 'Templates',  icon: LayoutTemplate },
  { to: '/packages',   label: 'Packages',   icon: Package },
  { to: '/exports',    label: 'Exports',    icon: Download },
  { to: '/bridge',     label: 'Ecosystem',  icon: Zap },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const { currentProject } = useProjectStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-slate-900 leading-tight">CivilOS</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Reports</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Active Project */}
      {currentProject && (
        <div className="mx-3 mt-3 px-3 py-2.5 bg-primary-50 rounded-lg border border-primary-100">
          <p className="text-[10px] text-primary-400 uppercase tracking-wide font-medium">Active Project</p>
          <p className="text-xs font-semibold text-primary-700 mt-0.5 truncate">{currentProject.name}</p>
          <p className="text-[10px] text-primary-400">{currentProject.projectNumber}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {to === '/bridge' ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                AUTO
              </span>
            ) : (
              <ChevronRight size={12} className="opacity-30" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary-700">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-400">Engineer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full mt-1 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Desktop Sidebar ── */}
      <aside className="w-[240px] shrink-0 fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-20 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-100 flex flex-col z-40 lg:hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <main className="lg:ml-[240px] flex-1 min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
              <Building2 size={12} className="text-white" />
            </div>
            <span className="font-display text-sm font-bold text-slate-900">CivilOS Reports</span>
          </div>
          {currentProject && (
            <span className="ml-auto text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full truncate max-w-[120px]">
              {currentProject.name}
            </span>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
