import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Copy, 
  Check,
  Download, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  Activity as ActivityIcon,
  Sparkles
} from 'lucide-react';
import { ActivityEvent } from '../types';

interface ActivityViewProps {
  events: ActivityEvent[];
  onClearEvents: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  events,
  onClearEvents
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'info', label: 'Info' },
    { id: 'success', label: 'Success' },
    { id: 'warning', label: 'Warning' },
    { id: 'error', label: 'Error' },
    { id: 'automation', label: 'Automation' },
    { id: 'detection', label: 'Detection' }
  ];

  const handleCopyEvent = (ev: ActivityEvent) => {
    const text = `[${ev.timestamp}] [${ev.category.toUpperCase()}] ${ev.message} ${ev.details ? `\nDetails: ${ev.details}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedEventId(ev.id);
    setTimeout(() => {
      setCopiedEventId(null);
    }, 2000);
  };

  const handleExportEvents = () => {
    const lines = filteredEvents.map(ev => 
      `[${ev.timestamp}] [${ev.category.toUpperCase()}] ${ev.message} ${ev.details ? `| Details: ${ev.details}` : ''}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotwheels_monitor_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpandEvent = (id: string) => {
    setExpandedEventId(prev => prev === id ? null : id);
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ev.details && ev.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      
      {/* Upper Panel: Control Strip */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-blue-50 flex flex-col space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
              <Terminal className="h-5 w-5 text-blue-500" />
              <span>Diagnostic Activity Stream</span>
            </h1>
            <p className="text-[11px] text-slate-450 font-mono mt-1">
              High-resolution system activity logs for active local browser sessions.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <button
              onClick={handleExportEvents}
              disabled={filteredEvents.length === 0}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 px-4 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider shadow-sm"
              title="Export filtered logs as flat text file"
            >
              <Download className="h-4 w-4 text-blue-500 stroke-[2.5]" />
              <span>Export (TXT)</span>
            </button>

            <button
              onClick={onClearEvents}
              disabled={events.length === 0}
              className="win-btn-primary hover:opacity-95 text-white px-5 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider shadow-md shadow-blue-500/10"
              title="Flush current session console memory"
            >
              <Trash2 className="h-4 w-4 stroke-[2.5]" />
              <span>Clear Console</span>
            </button>
          </div>
        </div>

        {/* Filter / Search parameters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm font-mono">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search logs by keyword or phrases..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-slate-250 text-slate-800 pl-10 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
            />
          </div>

          {/* Horizontal Category selectors */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map(cat => {
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-2 text-[11px] font-mono rounded-full border transition shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500 font-bold shadow-md shadow-blue-500/15' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-500'
                  }`}
                >
                  {cat.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text font-mono text-[11.5px]">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-24 select-none">
            <ActivityIcon className="h-10 w-10 text-slate-350 mb-3 animate-pulse" />
            <p className="font-display font-bold text-base text-slate-850">Waiting for automation engine triggers...</p>
            <p className="text-[10px] text-slate-400 mt-2 max-w-xs leading-relaxed">No active logs matched your filter. Verify your browser loop is running.</p>
          </div>
        ) : (
          <div className="bg-white/95 rounded-[24px] border border-blue-50/50 p-5 divide-y divide-blue-50/40 shadow-sm">
            {filteredEvents.map(ev => {
              const isExpanded = expandedEventId === ev.id;
              const isCopied = copiedEventId === ev.id;
              
              // Map Category style
              let categoryColor = 'text-slate-600 bg-slate-50 border-slate-100';
              let CategoryIcon = Info;

              if (ev.category === 'success') {
                categoryColor = 'text-emerald-700 bg-emerald-50 border-emerald-100 font-bold';
                CategoryIcon = CheckCircle2;
              } else if (ev.category === 'warning') {
                categoryColor = 'text-amber-700 bg-amber-50 border-amber-100';
                CategoryIcon = AlertTriangle;
              } else if (ev.category === 'error') {
                categoryColor = 'text-rose-700 bg-rose-50 border-rose-100 font-bold';
                CategoryIcon = XCircle;
              } else if (ev.category === 'automation') {
                categoryColor = 'text-blue-700 bg-blue-50 border-blue-100';
                CategoryIcon = ActivityIcon;
              } else if (ev.category === 'detection') {
                categoryColor = 'text-purple-700 bg-purple-50 border-purple-100 font-bold';
                CategoryIcon = Sparkles;
              }

              return (
                <div 
                  key={ev.id}
                  className={`pt-3 pb-3 px-3 rounded-2xl hover:bg-blue-50/30 transition-all duration-150 flex flex-col ${
                    isExpanded ? 'bg-blue-50/10' : ''
                  }`}
                >
                  {/* Top line summary */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 truncate flex-1">
                      {/* Dropdown toggle (Only if details exist) */}
                      {ev.details ? (
                        <button 
                          onClick={() => toggleExpandEvent(ev.id)}
                          className="text-slate-600 hover:text-blue-500 transition cursor-pointer shrink-0 p-1 hover:bg-slate-100 rounded-lg"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      ) : (
                        <span className="w-6 h-6 inline-block shrink-0"></span>
                      )}

                      {/* Timestamp */}
                      <span className="text-slate-400 shrink-0 font-mono">[{ev.timestamp}]</span>

                      {/* Category Label */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase shrink-0 ${categoryColor}`}>
                        {ev.category}
                      </span>

                      {/* Message */}
                      <span className="text-slate-700 truncate font-mono text-[12px]" title={ev.message}>
                        {ev.message}
                      </span>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyEvent(ev)}
                      className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isCopied ? "Copied!" : "Copy log chunk to clipboard"}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && ev.details && (
                    <div className="mt-3 ml-10 p-4 bg-slate-50/70 border border-blue-50/50 rounded-xl text-[10.5px] text-slate-600 whitespace-pre-wrap leading-relaxed select-text font-mono">
                      {ev.details}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
