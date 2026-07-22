import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { SchedulerConfig } from '../types';

interface SchedulerViewProps {
  config: SchedulerConfig;
  onUpdateConfig: (updatedConfig: SchedulerConfig) => void;
  isScanning: boolean;
  countdown: number;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  config,
  onUpdateConfig,
  isScanning,
  countdown
}) => {
  const [startTime, setStartTime] = useState(config.startTime);
  const [endTime, setEndTime] = useState(config.endTime);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval);
  const [workingDays, setWorkingDays] = useState<string[]>(config.workingDays);
  const [autoStart, setAutoStart] = useState(config.autoStart);
  const [autoStop, setAutoStop] = useState(config.autoStop);
  const [orderLimit, setOrderLimit] = useState(config.orderLimit);

  const [isSaved, setIsSaved] = useState(false);

  // Sync state with props
  useEffect(() => {
    setStartTime(config.startTime);
    setEndTime(config.endTime);
    setRefreshInterval(config.refreshInterval);
    setWorkingDays(config.workingDays);
    setAutoStart(config.autoStart);
    setAutoStop(config.autoStop);
    setOrderLimit(config.orderLimit);
  }, [config]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      startTime,
      endTime,
      refreshInterval: Number(refreshInterval),
      workingDays,
      autoStart,
      autoStop,
      orderLimit: Number(orderLimit)
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  // Helper calculations for Estimated Runtime
  const calculateEstimatedDailyQueries = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // crossover midnight
    }

    const totalSeconds = totalMinutes * 60;
    const queries = Math.floor(totalSeconds / refreshInterval);
    const hours = (totalMinutes / 60).toFixed(1);

    return { hours, queries };
  };

  const { hours, queries } = calculateEstimatedDailyQueries();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-6 py-5 bg-white/85 backdrop-blur-md border-b border-blue-50">
        <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Local Session Scheduler</span>
        </h1>
        <p className="text-[11px] text-slate-450 font-mono mt-1">
          Limit automated loop queries to organic working hours to protect local browser session footprints.
        </p>
      </div>

      {/* Scheduler Form Stage */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Main scheduler params */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Timeslot Boundaries */}
            <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-6 shadow-sm">
              <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3.5 flex items-center space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-blue-500" />
                <span>MONITORING WINDOW (WORKING HOURS)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide">
                    Daily Start Time
                  </label>
                  <input 
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide">
                    Daily Stop Time
                  </label>
                  <input 
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Working Days Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide block">
                  Active Monitoring Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => {
                    const isActive = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-2 text-xs font-mono font-bold rounded-full border transition cursor-pointer ${
                          isActive 
                            ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/15' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-500'
                        }`}
                      >
                        {day.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Loop Safety Configurations */}
            <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-6 shadow-sm">
              <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3.5 flex items-center space-x-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-blue-500" />
                <span>SAFETY & RATE LIMIT CONTROLLERS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Polling Interval */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide flex justify-between">
                    <span>Polling Refresh (Interval)</span>
                    <span className="font-bold text-blue-500 bg-blue-50 px-2 rounded">{refreshInterval} seconds</span>
                  </label>
                  <input 
                    type="range"
                    min="2"
                    max="15"
                    value={refreshInterval}
                    onChange={e => setRefreshInterval(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg cursor-pointer mt-3"
                  />
                  <p className="text-[9px] text-slate-400 font-mono mt-1">Slight randomized jitters are applied dynamically</p>
                </div>

                {/* Safe Order Limit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide">
                    Max Daily Orders Cap
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={orderLimit}
                    onChange={e => setOrderLimit(Number(e.target.value))}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono"
                  />
                  <p className="text-[9px] text-slate-400 font-mono">Runaway order threshold to protect accounts</p>
                </div>
              </div>

              {/* Automation switches */}
              <div className="pt-4 border-t border-blue-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoStart}
                    onChange={e => setAutoStart(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold uppercase">Auto Start Loops</span>
                    <span className="text-[9px] text-slate-400 font-mono">Boot engine at daily start boundary</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoStop}
                    onChange={e => setAutoStop(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold uppercase">Auto Stop Loops</span>
                    <span className="text-[9px] text-slate-400 font-mono">Force standby status at daily stop boundary</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Column 3: Live countdown widget & Estimated Runtime metrics */}
          <div className="space-y-6">
            
            {/* Interactive Countdown Meter */}
            <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 text-center flex flex-col justify-between h-48 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                {isScanning && (
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000" 
                    style={{ width: `${((refreshInterval - countdown) / refreshInterval) * 100}%` }}
                  ></div>
                )}
              </div>

              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                ENGINE POLLING COUNTER
              </span>

              <div className="my-auto space-y-1">
                <div className="text-4xl font-display font-extrabold text-blue-500 flex items-center justify-center space-x-1">
                  {isScanning ? (
                    <span className="animate-pulse">{countdown}s</span>
                  ) : (
                    <span className="text-slate-300">STANDBY</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                  {isScanning ? 'Awaiting next scrape payload...' : 'Automation paused'}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-blue-600 font-mono font-bold bg-blue-50/50 border border-blue-100 py-2.5 rounded-xl uppercase">
                <Play className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                <span>SCHEDULER STATUS: ONLINE</span>
              </div>
            </div>

            {/* Simulated Runtime Calculator metrics */}
            <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-4 font-mono shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-blue-50 pb-2.5 flex items-center space-x-2">
                <Clock className="h-4.5 w-4.5 text-blue-500" />
                <span>DAILY PROJECTIONS</span>
              </h3>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Working Period:</span>
                  <span className="text-slate-800 font-bold">{hours} hours / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. API Queries:</span>
                  <span className="text-slate-800 font-bold">~{queries.toLocaleString()} runs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Anti-Block Rating:</span>
                  <span className="text-emerald-500 font-bold uppercase underline">EXCELLENT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loop Jitter Offset:</span>
                  <span className="text-blue-500 font-bold">Enabled</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/30 border border-blue-50 rounded-xl text-[10px] text-slate-450 leading-relaxed">
                Active schedulers mimic standard human work shifts to prevent anomalous 24/7 scraping fingerprints from trigger-happy rate limit alarms.
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="lg:col-span-3 flex justify-end pt-5 border-t border-blue-50 font-mono">
            <button
              type="submit"
              id="btn-save-scheduler"
              className={`font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all duration-200 cursor-pointer ${
                isSaved 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/15' 
                  : 'win-btn-primary text-white shadow-blue-500/15 hover:opacity-95'
              }`}
            >
              {isSaved ? 'Saved Successfully! ✓' : 'Apply and Store Schedule configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
