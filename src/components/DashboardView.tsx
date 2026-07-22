import React from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  Sparkles, 
  Chrome,
  Clock,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { SystemStats, InstamartItem, ActivityEvent } from '../types';

interface DashboardViewProps {
  stats: SystemStats;
  isScanning: boolean;
  onToggleScan: () => void;
  onManualScan: () => void;
  onPanicStop: () => void;
  recentItems: InstamartItem[];
  recentEvents: ActivityEvent[];
  scanInterval: number;
  watchlistCount: number;
  location: string;
  countdown: number;
  cooldownRemainingSeconds?: number;
  enableJitter?: boolean;
  onSimulateStoreOffline: (reopenTime: string | null) => void;
  onSimulateStoreOnline: () => void;
  onToggleFastSimulation: (enabled: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  isScanning,
  onToggleScan,
  onManualScan,
  onPanicStop,
  recentItems,
  recentEvents,
  scanInterval,
  watchlistCount,
  location,
  countdown,
  cooldownRemainingSeconds = 0,
  enableJitter = true,
  onSimulateStoreOffline,
  onSimulateStoreOnline,
  onToggleFastSimulation
}) => {
  // Format seconds to MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find current item being checked (the top one in stream or a placeholder)
  const currentCheckedProduct = recentItems[0] || {
    title: 'Awaiting first inventory polling chunk...',
    category: 'N/A',
    price: 0,
    stock: 0
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Human Fatigue Cooldown Rest active banner */}
        {cooldownRemainingSeconds > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-[20px] text-xs font-sans flex items-center justify-between shadow-lg shadow-amber-500/15 animate-pulse">
            <span className="flex items-center space-x-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-bold uppercase tracking-wider">HUMAN FATIGUE REST COOL-DOWN ACTIVE:</span>
              <span className="text-amber-50">Emulating human pause intervals to bypass automated traffic heuristics.</span>
            </span>
            <span className="font-bold shrink-0 bg-white text-amber-600 px-3 py-1 rounded-full shadow-sm">{cooldownRemainingSeconds}s left</span>
          </div>
        )}

        {/* Store Temporarily Unavailable with Reopen Time banner */}
        {stats.storeStatus === 'offline_reopen' && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 text-slate-800 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600 shrink-0 mt-0.5">
                <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight text-amber-900 uppercase">
                  Store temporarily unavailable
                </h3>
                <p className="text-xs text-amber-800 font-medium mt-1">
                  Monitoring paused until reopening time (Store expected to reopen at: <span className="font-bold underline">{stats.reopenTimeStr}</span>)
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold text-amber-600">STATE: MONITORING_PAUSED_UNTIL_REOPEN_TIME</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-3 bg-white/90 backdrop-blur border border-amber-200/50 p-3 px-5 rounded-[18px] shadow-sm">
              <div className="text-right font-mono">
                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">REOPEN RESUME</p>
                <p className="text-sm font-extrabold text-amber-700">
                  IN {formatCountdown(stats.offlineCountdown || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Store Temporarily Unavailable with No Reopen Time (15-minute retry) banner */}
        {stats.storeStatus === 'offline_retry' && (
          <div className="p-5 bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 text-slate-800 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 shrink-0 mt-0.5">
                <AlertOctagon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight text-rose-900 uppercase">
                  Store temporarily unavailable
                </h3>
                <p className="text-xs text-rose-800 font-medium mt-1">
                  Next automatic check in 15 minutes (Assume the outage is temporary & retrying)
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold text-rose-600">STATE: AUTO_CHECK_LOOP_ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-3 bg-white/90 backdrop-blur border border-rose-200/50 p-3 px-5 rounded-[18px] shadow-sm">
              <div className="text-right font-mono">
                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">RETRY CHECK</p>
                <p className="text-sm font-extrabold text-rose-700">
                  IN {formatCountdown(stats.offlineCountdown || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Core Automation Controls Row */}
        <div className="bg-white rounded-[24px] border border-blue-100/50 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onToggleScan}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md focus:outline-none cursor-pointer transform hover:scale-[1.03] shrink-0 ${
                isScanning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
              }`}
              title={isScanning ? "Pause Automation Engine" : "Start Automation Engine"}
            >
              {isScanning ? (
                <Pause className="h-5 w-5 text-white fill-white" />
              ) : (
                <Play className="h-5 w-5 text-white fill-white translate-x-0.5" />
              )}
            </button>
            <div>
              <h2 className="font-display font-bold text-sm text-slate-800 leading-tight">
                {isScanning ? "Automation Engine is Active" : "Automation Engine is Standby"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isScanning 
                  ? `Scanning Swiggy Instamart inventory. Next automatic check in ${countdown} seconds.` 
                  : "Start the engine to monitor your watchlist rules for Cash on Delivery checkout."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button 
              onClick={onManualScan}
              disabled={isScanning}
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-50 disabled:text-slate-350 disabled:pointer-events-none text-blue-600 border border-blue-100/50 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer text-center"
            >
              Query Now (Manual Scan)
            </button>
          </div>
        </div>

        {/* Panic Bar & High priority System Action triggers */}
        <div className="bg-rose-50 border border-rose-100/80 p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-sans text-sm text-rose-850 font-medium">
              Need immediate safety intervention? Use the master override.
            </span>
          </div>

          <button
            onClick={onPanicStop}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer transition shadow-md shadow-rose-500/15"
          >
            PANIC STOP (KILL ENGINE)
          </button>
        </div>

        {/* Instamart Store Outage Simulator Panel */}
        <div className="bg-white/75 backdrop-blur-md rounded-[24px] border border-blue-100/50 p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-50 pb-3">
            <div>
              <h2 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>INSTAMART OUTAGE CONTROL SYSTEM</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Force artificial store closed triggers to audit background retry timing loops & pause-resumptions.
              </p>
            </div>
            
            {/* Fast Simulation Mode Toggle Switch */}
            <div className="flex items-center space-x-2.5 bg-blue-50/50 border border-blue-50 p-2 px-3 rounded-xl font-mono text-[10px]">
              <span className="font-bold text-blue-600 uppercase">Fast Evaluation Mode (15s):</span>
              <button
                type="button"
                onClick={() => onToggleFastSimulation(!stats.isFastSimulation)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  stats.isFastSimulation ? 'bg-blue-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    stats.isFastSimulation ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Input and Offline Reopen trigger */}
            <div className="p-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <p className="font-bold text-[10px] text-amber-600 uppercase tracking-wide">Path A: Simulated Reopen Time</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Will pause monitoring until the exact time is reached.</p>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  id="simulated-reopen-input"
                  defaultValue="8:30 AM"
                  placeholder="e.g. 8:30 AM or 11:15 PM"
                  className="w-full bg-white border border-amber-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = (document.getElementById('simulated-reopen-input') as HTMLInputElement)?.value || '8:30 AM';
                    onSimulateStoreOffline(val);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] py-2 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  Simulate Outage with Reopen
                </button>
              </div>
            </div>

            {/* Offline no Reopen trigger */}
            <div className="p-4 bg-rose-50/30 border border-rose-100/50 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <p className="font-bold text-[10px] text-rose-600 uppercase tracking-wide">Path B: No Reopen Time</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Assumes temporary outage and schedules 15-minute checking loops.</p>
              </div>
              <button
                type="button"
                onClick={() => onSimulateStoreOffline(null)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-sm shadow-rose-500/10"
              >
                Simulate Outage (No Reopen Info)
              </button>
            </div>

            {/* Clear/Restore online */}
            <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <p className="font-bold text-[10px] text-emerald-600 uppercase tracking-wide">Clear Sim / Restore Live</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Terminates any suspended loops and restores normal live monitoring feed.</p>
              </div>
              <button
                type="button"
                onClick={onSimulateStoreOnline}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                Restore Store Online
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Quick Diagnostic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-[20px] p-5 border border-blue-50 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Watchlist Coverage</p>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-display font-extrabold text-blue-600">
                {watchlistCount}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">active rules</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-blue-50 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Instamart Store Status</p>
            <div className="flex items-baseline mt-2.5">
              {(!stats.storeStatus || stats.storeStatus === 'online') ? (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ONLINE (LIVE)</span>
                </span>
              ) : stats.storeStatus === 'offline_reopen' ? (
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>PAUSED (REOPEN WAIT)</span>
                </span>
              ) : (
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>OFFLINE (RETRYING)</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-blue-50 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Jitter Jive</p>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-display font-extrabold text-blue-600">
                {enableJitter ? "Active" : "Disabled"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">±{scanInterval}s</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-blue-50 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Location Anchor</p>
            <div className="flex items-baseline mt-2 truncate">
              <span className="text-xs font-mono font-bold text-slate-650 truncate bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full font-bold" title={location}>
                {location}
              </span>
            </div>
          </div>

        </div>

        {/* Current Checked Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Checked Product Panel */}
          <div className="lg:col-span-2 soft-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-blue-50 pb-4 mb-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  CURRENT POLLED PRODUCT (ORGANIC FEED)
                </span>
                <span className={`text-[9px] font-mono px-3 py-1 rounded-full uppercase font-bold shadow-sm ${
                  isScanning 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isScanning ? 'LIVE INGEST' : 'ENGINE STANDBY'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {currentCheckedProduct.imageUrl ? (
                  <img 
                    src={currentCheckedProduct.imageUrl} 
                    alt="Active Product Target" 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border border-blue-100 shadow-sm shrink-0 bg-slate-50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-slate-300 shrink-0">
                    <Activity className="h-8 w-8 animate-pulse text-blue-500" />
                  </div>
                )}
                
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display font-bold text-lg text-slate-800 leading-tight">
                    {currentCheckedProduct.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold">
                      {currentCheckedProduct.category}
                    </span>
                    <span>•</span>
                    <span className="text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">₹{currentCheckedProduct.price}</span>
                    <span>•</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      currentCheckedProduct.stock > 0 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      STOCK: {currentCheckedProduct.stock > 0 ? `${currentCheckedProduct.stock} units` : 'SOLD OUT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-50 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>EMULATED BROWSER AGENT:</span>
              <span className="text-slate-500 truncate max-w-xs md:max-w-md">
                Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36
              </span>
            </div>
          </div>

          {/* Engine Integrity Metrics */}
          <div className="soft-card p-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-blue-50 pb-4 mb-4">
                STEALTH MATRICES
              </p>

              <div className="space-y-3.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TLS SPECIFICATION:</span>
                  <span className="text-blue-600 font-bold">SECURE (JA3)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">RESIDENTIAL IP:</span>
                  <span className="text-emerald-500 font-bold">AUTHENTIC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">STEALTH MODE:</span>
                  <span className="text-blue-600 font-bold">100% ORGANIC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">RATE LIMIT PROTECTION:</span>
                  <span className="text-emerald-500 font-bold">ACTIVE COOL-DOWN</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/40 p-4.5 rounded-2xl border border-blue-100/50 text-[10px] text-slate-500 leading-relaxed font-mono mt-4">
              Local session cookie sync active. Emulating non-linear cursor arcs during automatic add-to-cart clicks.
            </div>
          </div>

        </div>

        {/* Bottom Split: Recent Scanned Feed vs Key Activity Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live parsed feed (left) */}
          <div className="soft-card flex flex-col overflow-hidden bg-white">
            <div className="p-5 border-b border-blue-50 bg-white flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider">
                INVENTORY POLLED STREAM (LAST 5 ITEMS)
              </span>
              <span className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span>LIVE SCAN FEED</span>
              </span>
            </div>

            <div className="p-4 divide-y divide-blue-50/50 overflow-y-auto max-h-72 bg-white">
              {recentItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  Awaiting browser bridge activities...
                </div>
              ) : (
                recentItems.slice(0, 5).map((item, index) => {
                  const isMatch = item.isCollectorPiece;
                  return (
                    <div 
                      key={item.id || index}
                      className={`py-3 px-3.5 text-xs transition-all duration-200 flex items-center justify-between gap-3 ${
                        isMatch 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100/30 text-blue-700 font-bold rounded-xl border border-blue-100/30' 
                          : 'hover:bg-slate-50/50 rounded-xl'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMatch ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                        <span className={`font-mono truncate ${isMatch ? 'text-blue-800' : 'text-slate-600'}`}>
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`font-mono ${isMatch ? 'text-blue-600' : 'text-slate-400'}`}>₹{item.price}</span>
                        {isMatch ? (
                          <span className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full font-mono font-bold shadow-sm">
                            MATCH
                          </span>
                        ) : (
                          <span className="text-slate-355 text-[9px] font-mono uppercase">SKIP</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Key Activity events (right) */}
          <div className="soft-card flex flex-col overflow-hidden bg-white">
            <div className="p-5 border-b border-blue-50 bg-white flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider">
                ENGINE LOG (CRITICAL EVENT MATRIX)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Last 5 triggers
              </span>
            </div>

            <div className="p-4 space-y-2.5 overflow-y-auto max-h-72 bg-white">
              {recentEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  No critical log events captured in current session.
                </div>
              ) : (
                recentEvents.slice(-5).reverse().map((ev) => {
                  let badgeStyle = 'bg-slate-100 text-slate-600';
                  if (ev.category === 'detection') badgeStyle = 'bg-blue-50 text-blue-600 border border-blue-100 font-bold';
                  if (ev.category === 'automation') badgeStyle = 'bg-purple-50 text-purple-600 border border-purple-100 font-bold';
                  if (ev.category === 'warning') badgeStyle = 'bg-amber-50 text-amber-600 border border-amber-100';
                  if (ev.category === 'error') badgeStyle = 'bg-rose-50 text-rose-600 border border-rose-100 font-bold';

                  return (
                    <div key={ev.id} className="text-[11px] font-mono leading-relaxed p-2.5 hover:bg-slate-50/50 rounded-xl transition-all duration-150 flex items-start space-x-2.5">
                      <span className="text-slate-450 shrink-0">[{ev.timestamp}]</span>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[8px] uppercase tracking-wide ${badgeStyle}`}>{ev.category}</span>
                      <span className="text-slate-700 truncate flex-1">{ev.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
