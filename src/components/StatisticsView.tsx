import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Clock, 
  Cpu, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Layers,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileSpreadsheet,
  FileCode,
  FileText,
  ChevronDown,
  Sliders,
  Target,
  Zap
} from 'lucide-react';
import { SystemStats } from '../types';
import { analyticsApi, AnalyticsQueryOptions } from '../lib/analyticsApi';
import { AnalyticsSummary } from '../../server/models/analytics.model';

interface StatisticsViewProps {
  stats: SystemStats;
  watchlistCount: number;
  uptime: string;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  stats: fallbackStats,
  watchlistCount,
  uptime
}) => {
  const [range, setRange] = useState<'today' | 'yesterday' | '7d' | '30d'>('today');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'csv' | 'json'>('csv');
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<'scans' | 'matches' | 'latency'>('scans');

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsApi.fetchAnalyticsDashboard({ range, compare: true });
      setAnalytics(data);
    } catch (err) {
      console.warn('Failed to fetch backend analytics metrics, using fallback stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(() => {
      loadAnalytics();
    }, 5000);
    return () => clearInterval(interval);
  }, [range]);

  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    setShowExportMenu(false);
    const url = analyticsApi.getExportUrl({ range }, format);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotwheels_analytics_${range}_${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic values or fallback
  const kpis = analytics?.kpis;
  const totalScansVal = kpis?.totalScans.value ?? fallbackStats.totalScans;
  const totalMatchesVal = kpis?.totalMatches.value ?? fallbackStats.totalMatches;
  const ordersCompletedVal = kpis?.ordersCompleted.value ?? fallbackStats.ordersCompleted;
  const avgScanLatencyVal = kpis?.averageScanTimeMs.value ?? fallbackStats.averageScanTimeMs;
  const avgFilterLatencyVal = kpis?.averageDetectionTimeMs.value ?? fallbackStats.averageDetectionTimeMs;
  const failuresVal = kpis?.failuresCount.value ?? fallbackStats.failures;
  const retriesVal = kpis?.retriesCount.value ?? fallbackStats.retries;

  // Trend badge rendering helper
  const renderTrendBadge = (metric?: { changePercentage: number; trend: 'up' | 'down' | 'stable'; isPositive: boolean }) => {
    if (!metric) return null;
    const { changePercentage, trend, isPositive } = metric;
    
    if (trend === 'stable' || changePercentage === 0) {
      return (
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-bold flex items-center space-x-0.5">
          <Minus className="h-2.5 w-2.5" />
          <span>STABLE</span>
        </span>
      );
    }

    const badgeBg = isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100';
    const Icon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border flex items-center space-x-0.5 ${badgeBg}`}>
        <Icon className="h-3 w-3" />
        <span>{changePercentage > 0 ? `+${changePercentage}` : changePercentage}%</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      
      {/* Header Bar */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-blue-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Operational Analytics Desk</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-100 font-bold">
              REAL-TIME ENGINE
            </span>
          </h1>
          <p className="text-[11px] text-slate-450 font-mono mt-1">
            Real-time execution diagnostics, conversion metrics, and time-series telemetry for Swiggy Instamart checkouts.
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3 font-mono">
          {/* Time Range Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            {(['today', 'yesterday', '7d', '30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-[10.5px] font-bold rounded-full transition cursor-pointer uppercase ${
                  range === r 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50/50'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2 font-bold text-xs flex items-center rounded-full transition shadow-sm cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-4 w-4 text-blue-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="win-btn-primary hover:opacity-95 text-white px-4 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer uppercase tracking-wider shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-blue-50 py-1.5 z-20 font-mono text-xs">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2 text-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                  <span>CSV Dataset (.CSV)</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2 text-slate-700 cursor-pointer"
                >
                  <FileCode className="h-3.5 w-3.5 text-purple-500" />
                  <span>JSON Payload (.JSON)</span>
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2 text-slate-700 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span>Executive Report (.TXT)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Total Scans Processed */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Scans Processed</p>
              <div className="p-1.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {totalScansVal.toLocaleString()}
              </span>
              {renderTrendBadge(kpis?.totalScans)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Active inventory polling cycles</span>
              <span className="text-blue-500 font-bold">LIVE STREAMING</span>
            </div>
          </div>

          {/* Matched Detections */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Matched Detections</p>
              <div className="p-1.5 bg-purple-50 rounded-xl text-purple-500 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {totalMatchesVal.toLocaleString()}
              </span>
              {renderTrendBadge(kpis?.totalMatches)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Items flagged in watchlist rules</span>
              <span className="text-purple-500 font-bold">RULE MATCHED</span>
            </div>
          </div>

          {/* Orders Completed */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Checkout Orders Completed</p>
              <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-500 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {ordersCompletedVal.toLocaleString()}
              </span>
              {renderTrendBadge(kpis?.ordersCompleted)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Dispatched through native sandbox</span>
              <span className="text-emerald-500 font-bold">DISPATCHED</span>
            </div>
          </div>

          {/* Average scan time */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Scan Latency</p>
              <div className="p-1.5 bg-amber-50 rounded-xl text-amber-500 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {avgScanLatencyVal}ms
              </span>
              {renderTrendBadge(kpis?.averageScanTimeMs)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>Socket round-trip payload latency</span>
              <span className="text-amber-500 font-bold">OPTIMIZED</span>
            </div>
          </div>

          {/* Average detection time */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Filter Latency</p>
              <div className="p-1.5 bg-sky-50 rounded-xl text-sky-500 shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-display font-bold text-slate-800">
                {avgFilterLatencyVal}ms
              </span>
              {renderTrendBadge(kpis?.averageDetectionTimeMs)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>String pattern execution speed</span>
              <span className="text-sky-500 font-bold">PARSING</span>
            </div>
          </div>

          {/* Session Time / Uptime */}
          <div className="bg-white/95 border border-blue-50/50 p-6 flex flex-col justify-between h-38 relative shadow-sm rounded-[24px] hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Session Duration</p>
              <div className="p-1.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
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

        {/* Time-Series Volume & Latency Trend Chart */}
        <div className="bg-white/95 border border-blue-50/50 p-6 space-y-5 shadow-sm rounded-[24px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-50/50 pb-4 gap-3">
            <div>
              <h2 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
                <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                <span>Polling Volume & Execution Trends</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Time-series dataset generated dynamically from backend LowDB analytics snapshots.
              </p>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={() => setSelectedChartMetric('scans')}
                className={`px-3 py-1 rounded-full border transition cursor-pointer text-[10.5px] font-bold ${
                  selectedChartMetric === 'scans'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                SCANS
              </button>
              <button
                onClick={() => setSelectedChartMetric('matches')}
                className={`px-3 py-1 rounded-full border transition cursor-pointer text-[10.5px] font-bold ${
                  selectedChartMetric === 'matches'
                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                MATCHES
              </button>
              <button
                onClick={() => setSelectedChartMetric('latency')}
                className={`px-3 py-1 rounded-full border transition cursor-pointer text-[10.5px] font-bold ${
                  selectedChartMetric === 'latency'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                LATENCY (ms)
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          {analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
            <div className="space-y-3 font-mono">
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
                {analytics.timeSeries.map((point, idx) => {
                  let val = point.scans;
                  let maxVal = Math.max(...analytics.timeSeries.map(p => p.scans), 1);
                  let barColor = 'bg-blue-500 hover:bg-blue-600';

                  if (selectedChartMetric === 'matches') {
                    val = point.matches;
                    maxVal = Math.max(...analytics.timeSeries.map(p => p.matches), 1);
                    barColor = 'bg-purple-500 hover:bg-purple-600';
                  } else if (selectedChartMetric === 'latency') {
                    val = point.avgScanLatency;
                    maxVal = Math.max(...analytics.timeSeries.map(p => p.avgScanLatency), 200);
                    barColor = 'bg-amber-500 hover:bg-amber-600';
                  }

                  const heightPercent = Math.max(8, Math.min(100, Math.round((val / maxVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9.5px] py-1 px-2.5 rounded-lg shadow-lg pointer-events-none z-10 whitespace-nowrap">
                        <span className="font-bold">{point.label}</span>: {val} {selectedChartMetric === 'latency' ? 'ms' : ''}
                      </div>

                      {/* Bar */}
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-md ${barColor} transition-all duration-300 shadow-sm`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between px-2 text-[9.5px] text-slate-400 font-mono">
                <span>{analytics.timeSeries[0]?.label || 'Start'}</span>
                <span>{analytics.timeSeries[Math.floor(analytics.timeSeries.length / 2)]?.label || 'Mid'}</span>
                <span>{analytics.timeSeries[analytics.timeSeries.length - 1]?.label || 'Now'}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Loading analytics time series dataset...
            </div>
          )}
        </div>

        {/* Collector Type Distribution & Conversion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Collector Distribution */}
          <div className="bg-white/95 border border-blue-50/50 p-6 space-y-4 shadow-sm rounded-[24px]">
            <h2 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2 border-b border-blue-50/50 pb-3">
              <PieChart className="h-4.5 w-4.5 text-purple-500" />
              <span>Collector Piece Distribution</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              {(analytics?.collectorDistribution || [
                { type: 'Super TH', count: 4, percentage: 40 },
                { type: 'Regular TH', count: 3, percentage: 30 },
                { type: 'Premium Car Culture', count: 2, percentage: 20 },
                { type: 'Mainline Match', count: 1, percentage: 10 }
              ]).map((item, i) => {
                const colors = ['bg-purple-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>{item.type}</span>
                      <span>{item.count} items ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} transition-all duration-500`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance & Conversion Ratios */}
          <div className="bg-white/95 border border-blue-50/50 p-6 space-y-4 shadow-sm rounded-[24px]">
            <h2 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2 border-b border-blue-50/50 pb-3">
              <Zap className="h-4.5 w-4.5 text-amber-500" />
              <span>Automation Engine Efficiency</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-blue-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Match Hit Ratio</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {kpis?.conversionRatePercentage.formattedValue || '6.5%'}
                </p>
                <p className="text-[9.5px] text-slate-400 mt-1">Matches per 100 scans</p>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-blue-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Checkout Success</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {kpis?.orderSuccessRatePercentage.formattedValue || '37.5%'}
                </p>
                <p className="text-[9.5px] text-slate-400 mt-1">Orders per detection</p>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-blue-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">System Reliability</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {kpis?.systemReliabilityPercentage.formattedValue || '100%'}
                </p>
                <p className="text-[9.5px] text-slate-400 mt-1">Zero unhandled exceptions</p>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-blue-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Hourly Average</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {analytics?.recentTrends.hourlyScansAverage || 24}
                </p>
                <p className="text-[9.5px] text-slate-400 mt-1">Scans processed / hr</p>
              </div>
            </div>
          </div>

        </div>

        {/* Connection Security & Error Records */}
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
                <span className={`text-xl font-bold ${failuresVal > 0 ? 'text-rose-500 font-extrabold underline animate-pulse' : 'text-slate-700'}`}>
                  {failuresVal}
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
                  {retriesVal}
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
