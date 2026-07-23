import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  Trash2, 
  FolderOpen, 
  Eye, 
  X, 
  Calendar,
  Sparkles,
  DollarSign,
  Maximize2,
  Camera,
  CameraOff,
  RefreshCw
} from 'lucide-react';
import { InstamartItem } from '../types';
import { screenshotApi } from '../lib/screenshotApi';

interface ScreenshotGalleryViewProps {
  screenshots: InstamartItem[];
  onDeleteScreenshot: (id: string) => void;
  onClearGallery: () => void;
}

export const ScreenshotGalleryView: React.FC<ScreenshotGalleryViewProps> = ({
  screenshots,
  onDeleteScreenshot,
  onClearGallery
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState<InstamartItem | null>(null);
  const [isCaptureEnabled, setIsCaptureEnabled] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [capturesDirectory, setCapturesDirectory] = useState<string>('C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\');

  const loadCaptureStatus = async () => {
    try {
      const status = await screenshotApi.getCaptureStatus();
      setIsCaptureEnabled(status.isCaptureEnabled);
      if (status.capturesDirectory) {
        setCapturesDirectory(status.capturesDirectory);
      }
    } catch (err) {
      console.warn('Failed to load screenshot capture status:', err);
    }
  };

  useEffect(() => {
    loadCaptureStatus();
  }, []);

  const handleToggleCapture = async () => {
    try {
      setIsToggling(true);
      const nextState = !isCaptureEnabled;
      await screenshotApi.setCaptureStatus(nextState);
      setIsCaptureEnabled(nextState);
    } catch (err) {
      console.error('Failed to toggle screenshot capture:', err);
      alert('Failed to update capture status on server');
    } finally {
      setIsToggling(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Hits' },
    { id: 'Super TH', label: 'Super Treasure Hunt' },
    { id: 'Regular TH', label: 'Regular Treasure Hunt' },
    { id: 'Premium Car Culture', label: 'Premium Car Culture' },
    { id: 'Red Line Club', label: 'Red Line Club' }
  ];

  const handleOpenFolder = () => {
    alert(`Executing subprocess action: \nexplorer.exe "${capturesDirectory}"`);
  };

  const filteredScreenshots = screenshots.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.collectorType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      
      {/* View Header */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            <span>Screenshot Shelf</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold ${
              isCaptureEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isCaptureEnabled ? 'AUTO-CAPTURE ACTIVE' : 'CAPTURE SUSPENDED'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-450 font-mono mt-1">
            Automatic high-fidelity listings captured at the exact millisecond of matching.
          </p>
        </div>

        {/* Directory Operations & Capture Control */}
        <div className="flex items-center space-x-2 font-mono">
          {/* Screenshot Capture Engine Toggle */}
          <button
            onClick={handleToggleCapture}
            disabled={isToggling}
            className={`px-4 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer uppercase tracking-wider shadow-sm font-mono border ${
              isCaptureEnabled 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' 
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'
            }`}
            title={isCaptureEnabled ? "Screenshot capture is ENABLED. Click to disable automatic captures." : "Screenshot capture is DISABLED. Click to enable automatic captures."}
          >
            {isToggling ? (
              <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />
            ) : isCaptureEnabled ? (
              <Camera className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
            ) : (
              <CameraOff className="h-4 w-4 text-rose-600 stroke-[2.5]" />
            )}
            <span>
              CAPTURE: {isCaptureEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </button>

          <button
            onClick={handleOpenFolder}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 px-4 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer uppercase tracking-wider shadow-sm"
            title="Open local directory on host Windows PC"
          >
            <FolderOpen className="h-4 w-4 text-blue-500 stroke-[2.5]" />
            <span>Open captures Folder</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to flush all saved screenshots in local gallery space? This cleans up host disk resources.")) {
                onClearGallery();
              }
            }}
            disabled={screenshots.length === 0}
            className="win-btn-primary hover:opacity-95 text-white px-5 py-2 font-bold text-xs flex items-center space-x-2 transition rounded-full cursor-pointer disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider shadow-md shadow-blue-500/10"
          >
            <Trash2 className="h-4 w-4 stroke-[2.5]" />
            <span>Flush Gallery</span>
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="p-6 bg-white/50 border-b border-blue-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-sm font-mono">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search captures by title keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 border border-slate-250 text-slate-800 pl-10 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
          />
        </div>

        {/* Category filtering pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
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

      {/* Bento Grid layout */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredScreenshots.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center">
            <ImageIcon className="h-10 w-10 text-slate-350 mb-3" />
            <p className="font-display font-bold text-base text-slate-850">No matched screenshots stored</p>
            <p className="text-[10px] text-slate-400 mt-2 max-w-xs leading-relaxed font-mono">Screenshots populate automatically when items on your Watchlist are detected in the active Swiggy feed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredScreenshots.map(shot => (
              <div 
                key={shot.id}
                className="bg-white/95 rounded-[24px] border border-blue-50/50 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group shadow-sm"
              >
                {/* Captured Image Frame */}
                <div className="relative aspect-video bg-slate-50 border-b border-blue-50/50 overflow-hidden">
                  <img 
                    src={shot.imageUrl} 
                    alt={shot.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setSelectedScreenshot(shot)}
                      className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full transition cursor-pointer shadow"
                      title="Enlarge screen capture"
                    >
                      <Maximize2 className="h-4 w-4 text-blue-500 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => onDeleteScreenshot(shot.id)}
                      className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition cursor-pointer shadow"
                      title="Remove capture"
                    >
                      <Trash2 className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Hot Wheels Segment pill */}
                  {shot.collectorType && (
                    <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[9px] font-bold font-mono px-2.5 py-1 rounded-md border border-slate-800">
                      {shot.collectorType.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Listing metadata details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 font-mono">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800 leading-snug line-clamp-2" title={shot.title}>
                      {shot.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-slate-400 pt-3 border-t border-blue-50/40">
                    <div className="flex justify-between items-center">
                      <span>PRICE:</span>
                      <span className="text-blue-600 font-extrabold text-[11px]">₹{shot.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>STOCK MATCHED:</span>
                      <span className="text-slate-700 font-bold">{shot.stock} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>CAPTIME:</span>
                      <span className="text-slate-500">{new Date(shot.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] border border-blue-50 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-blue-50 flex items-center justify-between font-mono bg-slate-50/50">
              <span className="text-xs font-bold text-slate-500">
                PREVIEW_METADATA: {selectedScreenshot.id}
              </span>
              <button 
                onClick={() => setSelectedScreenshot(null)}
                className="p-1.5 hover:bg-slate-200/50 text-slate-600 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 bg-slate-50/50 overflow-hidden flex items-center justify-center p-6">
              <img 
                src={selectedScreenshot.imageUrl} 
                alt={selectedScreenshot.title} 
                referrerPolicy="no-referrer"
                className="max-h-[55vh] max-w-full object-contain rounded-2xl border border-blue-100 shadow"
              />
            </div>

            {/* Modal Metadata Panel */}
            <div className="p-6 border-t border-blue-50 bg-white select-text font-mono text-xs text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">MATCHED ITEM TITLE</p>
                <p className="text-slate-850 font-display font-bold text-sm leading-snug">{selectedScreenshot.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">STORE PRICING</p>
                  <p className="text-blue-600 font-extrabold text-base">₹{selectedScreenshot.price}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">TIMESTAMP</p>
                  <p className="text-slate-700 font-bold">{selectedScreenshot.timestamp}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
