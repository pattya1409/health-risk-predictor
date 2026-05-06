import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Activity,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

type Page = 'dashboard' | 'records' | 'assessment' | 'profile';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'records', label: 'Health Records', icon: FileText },
  { id: 'assessment', label: 'Risk Assessment', icon: Activity },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 h-screen sticky top-0`}
    >
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-teal-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white whitespace-nowrap">HealthRisk</h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">Risk Predictor</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              currentPage === id
                ? 'bg-teal-500/15 text-teal-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3 space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">Health Enthusiast</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
