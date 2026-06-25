import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Presentation, 
  PackageOpen, 
  Award, 
  BotMessageSquare, 
  Activity,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userEmail?: string;
}

export default function Sidebar({ currentTab, setTab, userEmail }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hcp', label: 'HCP Directory', icon: Users },
    { id: 'planner', label: 'Call Planner', icon: Calendar },
    { id: 'detailing', label: 'eDetailing (CLM)', icon: Presentation },
    { id: 'inventory', label: 'Sample Inventory', icon: PackageOpen },
    { id: 'events', label: 'Medical Events', icon: Award },
    { id: 'copilot', label: 'Pharma Co-pilot', icon: BotMessageSquare },
  ];

  return (
    <aside 
      id="sidebar-container" 
      className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-20"
    >
      {/* Brand Logo */}
      <div id="sidebar-logo-section" className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-teal-500 text-white p-2 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/10">
          <Activity size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">Pharma <span className="text-teal-400">Intelligence</span></h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">CRM & CLM ENVIRONMENT</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav id="sidebar-navigation" className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 mb-2 font-mono">FIELD MODULES</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/15' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
              {item.id === 'copilot' && (
                <span className="ml-auto bg-teal-500/20 text-teal-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div id="sidebar-footer" className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'SR'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate font-mono">
              {userEmail || 'rep@biomed.com'}
            </p>
            <p className="text-[10px] text-teal-400 font-mono">Territory: Boston-NE1</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-center font-mono mt-2">
          SYSTEM ACTIVE • PORT 3000
        </div>
      </div>
    </aside>
  );
}
