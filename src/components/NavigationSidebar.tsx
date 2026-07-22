import React from 'react';
import { 
  LayoutDashboard, 
  Eye, 
  Calendar, 
  Terminal, 
  BarChart3, 
  Image as ImageIcon, 
  Settings,
  ShieldCheck, 
  Cpu, 
  Network 
} from 'lucide-react';
import { SystemStats } from '../types';

interface NavigationSidebarProps {
  activeTab: 'dashboard' | 'watchlist' | 'scheduler' | 'activity' | 'statistics' | 'gallery' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'watchlist' | 'scheduler' | 'activity' | 'statistics' | 'gallery' | 'settings') => void;
  stats: SystemStats;
  isScanning: boolean;
  totalMatches: number;
  watchlistCount: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isScanning,
  totalMatches,
  watchlistCount
}) => {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: isScanning ? 'RUNNING' : 'PAUSED',
      badgeColor: isScanning 
        ? 'bg-black text-white border-black' 
        : 'bg-gray-100 text-gray-700 border-gray-300'
    },
    {
      id: 'watchlist' as const,
      label: 'Product Watchlist',
      icon: Eye,
      badge: `${watchlistCount} rules`,
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300'
    },
    {
      id: 'scheduler' as const,
      label: 'Scheduler Engine',
      icon: Calendar,
      badge: 'Online',
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300'
    },
    {
      id: 'activity' as const,
      label: 'Activity Stream',
      icon: Terminal,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'statistics' as const,
      label: 'Analytics Desk',
      icon: BarChart3,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'gallery' as const,
      label: 'Screenshot Shelf',
      icon: ImageIcon,
      badge: totalMatches > 0 ? `${totalMatches} Pics` : null,
      badgeColor: 'bg-black text-white border-black'
    },
    {
      id: 'settings' as const,
      label: 'System Parameters',
      icon: Settings,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <div className="w-64 bg-white/90 backdrop-blur-md border-r border-blue-100 flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* Scrollable upper body */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col justify-between space-y-6 scrollbar-none">
        {/* Navigation Section */}
        <div className="px-4">
          <p className="text-[10px] font-mono font-bold text-blue-400 tracking-wider uppercase px-3 mb-4">Monitor Controls</p>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-btn-${item.id}`}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/15' 
                      : 'text-slate-600 hover:bg-blue-50/60 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-[13px] font-medium tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono shrink-0 border ${
                      isActive 
                        ? 'bg-blue-600/50 text-white border-blue-400' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostics Module */}
        <div className="px-4 mt-auto">
          <div className="bg-blue-50/40 rounded-[22px] border border-blue-100/60 p-4 space-y-4">
            <p className="text-[10px] font-mono font-bold text-slate-800 tracking-wider uppercase flex items-center justify-between border-b border-blue-100/50 pb-2">
              <span>SYSTEM DIAGNOSTICS</span>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </p>
 
            {/* CPU Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="h-3 w-3 text-blue-500" />
                  <span>CPU LOAD</span>
                </span>
                <span className="text-slate-700 font-bold">12%</span>
              </div>
              <div className="w-full bg-blue-100/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `12%` }}
                ></div>
              </div>
            </div>

            {/* RAM Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Network className="h-3 w-3 text-blue-500" />
                  <span>RAM USAGE</span>
                </span>
                <span className="text-slate-700 font-bold">264 MB</span>
              </div>
              <div className="w-full bg-blue-100/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `26%` }}
                ></div>
              </div>
            </div>

            {/* Local Chrome Bridge Status */}
            <div className="pt-2.5 border-t border-blue-100/50 space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">LOCAL CHROME:</span>
                <span className="font-bold text-blue-600 uppercase">
                  {stats.chromeStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">BRIDGE PORT:</span>
                <span className="text-slate-600">
                  localhost:{stats.localPort}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-blue-50 bg-slate-50/50 text-[10px] text-slate-400 font-mono text-center shrink-0">
        <span>Instamart Collector Engine v1.2</span>
      </div>
    </div>
  );
};

