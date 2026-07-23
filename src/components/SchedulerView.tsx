import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause,
  RotateCcw, 
  Check,
  Plus,
  Trash2,
  List,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { SchedulerConfig } from '../types';
import { 
  ScheduledJob, 
  JobExecutionRecord, 
  fetchScheduledJobs, 
  createScheduledJobApi, 
  pauseScheduledJobApi, 
  resumeScheduledJobApi, 
  deleteScheduledJobApi, 
  runJobNowApi, 
  fetchSchedulerHistory 
} from '../lib/schedulerApi';

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

  // Scheduled Jobs & History State
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [history, setHistory] = useState<JobExecutionRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Job Form State
  const [newJobName, setNewJobName] = useState('');
  const [newJobType, setNewJobType] = useState<'recurring' | 'one-time'>('recurring');
  const [newJobInterval, setNewJobInterval] = useState(4);
  const [newJobMaxRetries, setNewJobMaxRetries] = useState(3);
  const [newJobRetryDelay, setNewJobRetryDelay] = useState(5);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

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

  // Load Jobs and History from Backend API
  const loadJobsAndHistory = async () => {
    try {
      setLoadingJobs(true);
      const [jobsData, historyData] = await Promise.all([
        fetchScheduledJobs(),
        fetchSchedulerHistory(20)
      ]);
      setJobs(jobsData);
      setHistory(historyData);
    } catch (err) {
      console.warn('Error loading scheduler jobs or history:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobsAndHistory();
    const interval = setInterval(loadJobsAndHistory, 5000);
    return () => clearInterval(interval);
  }, []);

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
    const queries = Math.floor(totalSeconds / (refreshInterval || 1));
    const hours = (totalMinutes / 60).toFixed(1);

    return { hours, queries };
  };

  const { hours, queries } = calculateEstimatedDailyQueries();

  // Scheduled Job actions
  const handleTogglePauseResume = async (job: ScheduledJob) => {
    try {
      if (job.enabled) {
        await pauseScheduledJobApi(job.id);
      } else {
        await resumeScheduledJobApi(job.id);
      }
      await loadJobsAndHistory();
    } catch (err) {
      console.error('Failed to toggle job pause/resume:', err);
    }
  };

  const handleRunJobNow = async (jobId: string) => {
    try {
      await runJobNowApi(jobId);
      await loadJobsAndHistory();
    } catch (err) {
      console.error('Failed to execute job on demand:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this scheduled job?')) {
      try {
        await deleteScheduledJobApi(jobId);
        await loadJobsAndHistory();
      } catch (err) {
        console.error('Failed to delete job:', err);
      }
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) return;

    try {
      setIsSubmittingJob(true);
      await createScheduledJobApi({
        name: newJobName.trim(),
        scheduleType: newJobType,
        intervalSeconds: Number(newJobInterval),
        maxRetries: Number(newJobMaxRetries),
        retryDelaySeconds: Number(newJobRetryDelay),
        enabled: true
      });
      setNewJobName('');
      setShowCreateModal(false);
      await loadJobsAndHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to create scheduled job.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-6 py-5 bg-white/85 backdrop-blur-md border-b border-blue-50 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Local Session Scheduler & Job Engine</span>
          </h1>
          <p className="text-[11px] text-slate-450 font-mono mt-1">
            Limit automated loop queries to organic working hours & execute background scheduled tasks.
          </p>
        </div>

        <button
          onClick={loadJobsAndHistory}
          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
          title="Refresh Scheduler State"
        >
          <RefreshCw className={`h-4 w-4 ${loadingJobs ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content Stage */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Scheduler Form Stage */}
        <form onSubmit={handleSave} className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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

        {/* Scheduled Jobs Management Engine */}
        <div className="max-w-6xl bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-50 pb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-800 flex items-center space-x-2">
                <List className="h-5 w-5 text-blue-500" />
                <span>SCHEDULED JOBS & AUTOMATED TASKS</span>
              </h2>
              <p className="text-[11px] text-slate-450 font-mono mt-0.5">
                Manage background jobs, execution intervals, and retry policies.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="win-btn-primary text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/10"
            >
              <Plus className="h-4 w-4" />
              <span>Create Scheduled Job</span>
            </button>
          </div>

          {/* Jobs Table */}
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-mono text-xs">
              No scheduled jobs defined. Click "Create Scheduled Job" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Job Name</th>
                    <th className="py-3 px-3">Schedule</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Executions</th>
                    <th className="py-3 px-3">Next Run</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobs.map(job => {
                    const isRunning = job.enabled && job.status === 'active';
                    return (
                      <tr key={job.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          {job.name}
                          {job.lastError && (
                            <span className="block text-[9px] text-rose-500 font-normal truncate max-w-xs" title={job.lastError}>
                              Err: {job.lastError}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {job.scheduleType === 'recurring' ? `Every ${job.intervalSeconds}s` : 'One-time'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {job.status === 'active' && (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>ACTIVE</span>
                            </span>
                          )}
                          {job.status === 'paused' && (
                            <span className="inline-flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <Pause className="h-3 w-3" />
                              <span>PAUSED</span>
                            </span>
                          )}
                          {job.status === 'failed' && (
                            <span className="inline-flex items-center space-x-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <XCircle className="h-3 w-3" />
                              <span>FAILED</span>
                            </span>
                          )}
                          {job.status === 'completed' && (
                            <span className="inline-flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <Check className="h-3 w-3" />
                              <span>DONE</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <span className="text-slate-800 font-bold">{job.totalExecutions}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({job.successfulExecutions} ok / {job.failedExecutions} err)</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[10px]">
                          {job.nextRunAt ? new Date(job.nextRunAt).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleRunJobNow(job.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Trigger Immediately"
                            >
                              <Play className="h-3.5 w-3.5 fill-blue-600" />
                            </button>

                            <button
                              onClick={() => handleTogglePauseResume(job)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition"
                              title={job.enabled ? "Pause Job" : "Resume Job"}
                            >
                              {job.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition"
                              title="Delete Job"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Execution History Log Panel */}
        <div className="max-w-6xl bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-50 pb-3">
            <h2 className="font-display font-bold text-base text-slate-800 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>SCHEDULER EXECUTION AUDIT HISTORY</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Last {history.length} execution events
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-mono text-xs">
              No execution records stored yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {history.map(record => (
                <div key={record.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    {record.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                    {record.status === 'retrying' && <RefreshCw className="h-4 w-4 text-amber-500 animate-spin shrink-0" />}
                    {record.status === 'failed' && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}

                    <div>
                      <div className="font-bold text-slate-800 flex items-center space-x-2">
                        <span>{record.jobName}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {record.details || record.errorMessage}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-slate-700 font-bold">{record.durationMs}ms</span>
                    <span className="block text-[9px] text-slate-400">
                      Matches: {record.matchedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-blue-100 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="h-5 w-5 text-blue-500" />
              <span>Create Scheduled Job</span>
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Job Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Midnight STH Scraper"
                  value={newJobName}
                  onChange={e => setNewJobName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Schedule Type</label>
                  <select
                    value={newJobType}
                    onChange={e => setNewJobType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-slate-800"
                  >
                    <option value="recurring">Recurring</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Interval (Sec)</label>
                  <input 
                    type="number"
                    min="1"
                    max="3600"
                    value={newJobInterval}
                    onChange={e => setNewJobInterval(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Max Retries</label>
                  <input 
                    type="number"
                    min="0"
                    max="10"
                    value={newJobMaxRetries}
                    onChange={e => setNewJobMaxRetries(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Retry Delay (s)</label>
                  <input 
                    type="number"
                    min="1"
                    max="300"
                    value={newJobRetryDelay}
                    onChange={e => setNewJobRetryDelay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="win-btn-primary text-white px-5 py-2 rounded-xl font-bold shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {isSubmittingJob ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
