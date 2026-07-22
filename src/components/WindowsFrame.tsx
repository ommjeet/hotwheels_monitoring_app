import React from 'react';
import { Minus, Square, X, Shield, Radio, Cpu, Feather } from 'lucide-react';

interface WindowsFrameProps {
  children: React.ReactNode;
  uptime: string;
  isScanning: boolean;
  onStopScanner: () => void;
  onStartScanner: () => void;
}

export const WindowsFrame: React.FC<WindowsFrameProps> = ({
  children,
  uptime,
  isScanning,
  onStopScanner,
  onStartScanner
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#EEF5FF] overflow-hidden text-sm font-sans">
      {/* Modern Soft UI Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-blue-100 select-none shadow-[0_4px_20px_rgba(59,130,246,0.02)] relative z-10">
        {/* App Title & Elegant Display Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center bg-blue-500 text-white rounded-full p-2 w-10 h-10 shadow-md shadow-blue-500/20">
            <Feather className="h-5 w-5 text-white" />
            {isScanning && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-slate-800 leading-tight">
              The Instamart Collector
            </span>
            <span className="text-[10px] text-blue-500 font-mono tracking-wider uppercase font-semibold">
              Hot Wheels Core Monitor · v1.2.4
            </span>
          </div>
        </div>

        {/* Status indicators styled like high-fashion label tags */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-1.5 rounded-full shadow-sm shadow-blue-500/10">
            <Radio className={`h-3.5 w-3.5 ${isScanning ? 'animate-pulse text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              STATUS: {isScanning ? 'ACTIVE SCAN' : 'IDLE'}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 text-slate-700 px-4 py-1.5 rounded-full border border-blue-50 shadow-sm">
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] tracking-wider uppercase font-bold">UPTIME: <span className="font-mono text-slate-800 font-bold">{uptime}</span></span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onStopScanner}
            title="Pause Scanning Feed"
            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-full transition-all duration-200"
          >
            <Minus className="h-4 w-4 stroke-[2.5]" />
          </button>
          <button 
            onClick={onStartScanner}
            title="Resume Scanning Feed"
            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-full transition-all duration-200"
          >
            <Square className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to stop the monitor? Active scanning feeds will be paused.")) {
                onStopScanner();
              }
            }}
            title="Exit App"
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden bg-[#EEF5FF]">
        {children}
      </div>
    </div>
  );
};
