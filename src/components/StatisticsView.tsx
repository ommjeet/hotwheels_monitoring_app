import React from 'react';
import { 
  BarChart3, 
  Activity, 
  Sparkles, 
  Clock, 
  AlertOctagon, 
  Cpu, 
  RefreshCw, 
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Settings
} from 'lucide-react';
import { SystemStats } from '../types';

interface StatisticsViewProps {
  stats: SystemStats;
  watchlistCount: number;
  uptime: string;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  stats,
  watchlistCount,
  uptime
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-blue-50">
        <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Operational Telemetry Desk</span>
        </h1>
        <p className="text-[11px] text-slate-450 font-mono mt-1">
          Real-time execution diagnostics and statistical metrics for Swiggy Instamart checkouts.
        </p>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Metric bento-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Total scans processed */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250 group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Scans Processed</p>
              <div className="p-1.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {stats.totalScans}
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-bold">100% HEALTHY</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Active inventory polling cycles</span>
              <span className="text-blue-500 font-bold">LIVE STREAMING</span>
            </div>
          </div>

          {/* Matches detected */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Matched Detections</p>
              <div className="p-1.5 bg-purple-50 rounded-xl text-purple-500 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {stats.totalMatches}
              </span>
              <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-mono font-bold">HOT HITS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Items flagged in watchlist rules</span>
              <span className="text-purple-500 font-bold">RULE MATCHED</span>
            </div>
          </div>

          {/* Orders Completed */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Checkout Orders Completed</p>
              <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-500 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {stats.ordersCompleted}
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-bold">DISPATCHED</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Dispatched through native sandbox</span>
              <span className="text-emerald-500 font-bold">ZERO ERRORS</span>
            </div>
          </div>

          {/* Average scan time */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Scan Latency</p>
              <div className="p-1.5 bg-amber-50 rounded-xl text-amber-500 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {stats.averageScanTimeMs}ms
              </span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-mono font-bold">FAST SOCKET</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Socket round-trip payload latency</span>
              <span className="text-amber-500 font-bold">OPTIMIZED</span>
            </div>
          </div>

          {/* Average detection time */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Filter Latency</p>
              <div className="p-1.5 bg-sky-50 rounded-xl text-sky-500 shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {stats.averageDetectionTimeMs}ms
              </span>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-mono font-bold">SUB-MILLISECOND</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>String pattern execution speed</span>
              <span className="text-sky-500 font-bold">PARSING</span>
            </div>
          </div>

          {/* Session Time / Uptime */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-36 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all duration-250">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Session Duration</p>
              <div className="p-1.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {uptime}
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono font-bold">STABLE</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Local browser automation uptime</span>
              <span className="text-blue-500 font-bold">CONTINUOUS</span>
            </div>
          </div>

        </div>

        {/* Failures and Retries Telemetry */}
        <div className="bg-white/95 border border-blue-50/50 p-6 space-y-5 shadow-sm rounded-[24px]">
          <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50/50 pb-3 flex items-center space-x-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
            <span>Connection Security & Error Records</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Failure metrics */}
            <div className="bg-slate-50/50 border border-blue-50/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase font-mono">API Gateway Exception Count</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">HTTP failures or Swiggy cloud blocks encountered.</p>
              </div>
              <div className="text-right font-mono">
                <span className={`text-xl font-bold ${stats.failures > 0 ? 'text-rose-500 font-extrabold underline animate-pulse' : 'text-slate-700'}`}>
                  {stats.failures}
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 uppercase">Exceptions</p>
              </div>
            </div>

            {/* Reconnections / Retries */}
            <div className="bg-slate-50/50 border border-blue-50/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase font-mono">Browser Debug Port Retries</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Reconnection signals dispatched to local debug socket.</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xl font-bold text-slate-700">
                  {stats.retries}
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 uppercase">Reconnects</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
