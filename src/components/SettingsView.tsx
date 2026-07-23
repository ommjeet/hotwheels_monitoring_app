import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Chrome, 
  Bell, 
  Sliders, 
  Database, 
  Info, 
  Save, 
  RotateCcw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { resetSystemParameters } from '../lib/api';

interface SettingsViewProps {
  settings: {
    scanIntervalSeconds: number;
    userLocation: string;
    autoCheckoutSimulated: boolean;
    autoCheckoutPaymentMethod: string;
    localChromePort: number;
    rememberSession: boolean;
    headlessMode: boolean;
    toastAlertsEnabled: boolean;
    storageCleanTriggerCount: number;
    enableJitter?: boolean;
    jitterRangeSeconds?: number;
    emulateMouseMovement?: boolean;
    rotateUserAgent?: boolean;
    coolDownAfterScans?: number;
    coolDownDurationMinutes?: number;
  };
  onUpdateSettings: (updatedSettings: any) => Promise<void> | void;
  onResetSettings?: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  const [rememberSession, setRememberSession] = useState(settings.rememberSession ?? true);
  const [localChromePort, setLocalChromePort] = useState(settings.localChromePort ?? 9222);
  const [headlessMode, setHeadlessMode] = useState(settings.headlessMode ?? false);
  const [userLocation, setUserLocation] = useState(settings.userLocation);
  const [toastAlertsEnabled, setToastAlertsEnabled] = useState(settings.toastAlertsEnabled ?? true);
  const [autoCheckoutSimulated, setAutoCheckoutSimulated] = useState(settings.autoCheckoutSimulated);
  const [autoCheckoutPaymentMethod, setAutoCheckoutPaymentMethod] = useState(settings.autoCheckoutPaymentMethod);
  const [storageCleanTriggerCount, setStorageCleanTriggerCount] = useState(settings.storageCleanTriggerCount ?? 100);

  // Anti-bot parameters
  const [enableJitter, setEnableJitter] = useState(settings.enableJitter ?? true);
  const [jitterRangeSeconds, setJitterRangeSeconds] = useState(settings.jitterRangeSeconds ?? 2);
  const [emulateMouseMovement, setEmulateMouseMovement] = useState(settings.emulateMouseMovement ?? true);
  const [rotateUserAgent, setRotateUserAgent] = useState(settings.rotateUserAgent ?? true);
  const [coolDownAfterScans, setCoolDownAfterScans] = useState(settings.coolDownAfterScans ?? 40);
  const [coolDownDurationMinutes, setCoolDownDurationMinutes] = useState(settings.coolDownDurationMinutes ?? 2);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep state synchronized with incoming settings prop
  useEffect(() => {
    setRememberSession(settings.rememberSession ?? true);
    setLocalChromePort(settings.localChromePort ?? 9222);
    setHeadlessMode(settings.headlessMode ?? false);
    setUserLocation(settings.userLocation || '');
    setToastAlertsEnabled(settings.toastAlertsEnabled ?? true);
    setAutoCheckoutSimulated(settings.autoCheckoutSimulated ?? true);
    setAutoCheckoutPaymentMethod(settings.autoCheckoutPaymentMethod || 'COD');
    setStorageCleanTriggerCount(settings.storageCleanTriggerCount ?? 100);
    setEnableJitter(settings.enableJitter ?? true);
    setJitterRangeSeconds(settings.jitterRangeSeconds ?? 2);
    setEmulateMouseMovement(settings.emulateMouseMovement ?? true);
    setRotateUserAgent(settings.rotateUserAgent ?? true);
    setCoolDownAfterScans(settings.coolDownAfterScans ?? 40);
    setCoolDownDurationMinutes(settings.coolDownDurationMinutes ?? 2);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const payload = {
        rememberSession,
        localChromePort: Number(localChromePort),
        headlessMode,
        userLocation,
        toastAlertsEnabled,
        autoCheckoutSimulated,
        autoCheckoutPaymentMethod: 'COD',
        storageCleanTriggerCount: Number(storageCleanTriggerCount),
        enableJitter,
        jitterRangeSeconds: Number(jitterRangeSeconds),
        emulateMouseMovement,
        rotateUserAgent,
        coolDownAfterScans: Number(coolDownAfterScans),
        coolDownDurationMinutes: Number(coolDownDurationMinutes)
      };
      await onUpdateSettings(payload);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to persist settings profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all system parameters to default factory settings?')) {
      return;
    }
    setErrorMessage(null);
    setIsResetting(true);
    try {
      if (onResetSettings) {
        await onResetSettings();
      } else {
        await resetSystemParameters();
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset settings');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden select-none">
      
      {/* Header Bar */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-blue-50">
        <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
          <Settings className="h-5 w-5 text-blue-500" />
          <span>System Settings & Parameters</span>
        </h1>
        <p className="text-[11px] text-slate-450 font-mono mt-1">
          Adjust local browser session remote ports, storage purges, and automated safety limits.
        </p>
      </div>

      {/* Main settings grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Session & Browser Integration */}
          <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-5 shadow-sm">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <Chrome className="h-4.5 w-4.5 text-blue-500" />
              <span>LOCAL CHROMIUM CONNECTIVITY</span>
            </h2>

            {/* Remember Session checkbox */}
            <label className="flex items-start space-x-3.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberSession}
                onChange={e => setRememberSession(e.target.checked)}
                className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-xs text-slate-700 font-bold uppercase">Remember Login Session Cookies</span>
                <span className="text-[9px] text-slate-400 font-mono">Retains your local checkout sessions and OTP tokens</span>
              </div>
            </label>

            {/* Remote debugging port */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide">
                Chrome Remote Debugging Port (`--remote-debugging-port`)
              </label>
              <input 
                type="number"
                required
                value={localChromePort}
                onChange={e => setLocalChromePort(Number(e.target.value))}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
              />
              <p className="text-[9px] text-slate-400 font-mono">Port assigned to spawn Chromium process bounds</p>
            </div>

            {/* Headless check */}
            <label className="flex items-start space-x-3.5 cursor-pointer pt-2">
              <input 
                type="checkbox" 
                checked={headlessMode}
                onChange={e => setHeadlessMode(e.target.checked)}
                className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-xs text-slate-700 font-bold uppercase">Launch Browser Headless</span>
                <span className="text-[9px] text-slate-400 font-mono">Runs quietly in background without visual Chrome window frame</span>
              </div>
            </label>
          </div>

          {/* Section 2: Automation Parameters & GPS */}
          <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-5 shadow-sm">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              <span>AUTOMATION PROFILE VALUES</span>
            </h2>

            {/* Simulated target location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide">
                Target Simulated GPS Location (Pin Address)
              </label>
              <input 
                type="text"
                required
                value={userLocation}
                onChange={e => setUserLocation(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
              />
              <p className="text-[9px] text-slate-400 font-mono">Used to bind delivery address limits on the scraper engine</p>
            </div>

            {/* Payment profile */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">
                Simulated Default Payment Method
              </label>
              <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 font-bold font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>CASH ON DELIVERY (FORCED)</span>
              </div>
              <p className="text-[9px] text-slate-400">Strict Cash on Delivery rule is active. Alternative payment gateways are disabled for stealth safety.</p>
            </div>

            {/* Checkout delays */}
            <label className="flex items-start space-x-3.5 cursor-pointer pt-2">
              <input 
                type="checkbox" 
                checked={autoCheckoutSimulated}
                onChange={e => setAutoCheckoutSimulated(e.target.checked)}
                className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-xs text-slate-700 font-bold uppercase">Emulate Organic Click Latencies</span>
                <span className="text-[9px] text-slate-400 font-mono">Adds randomized 150ms-400ms delay cycles during checkout clicks</span>
              </div>
            </label>
          </div>

          {/* Section 3: Storage Guardians */}
          <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-5 shadow-sm">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <Database className="h-4.5 w-4.5 text-blue-500" />
              <span>STORAGE DISK SENTINELS</span>
            </h2>

            {/* Max screenshot slider */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wide flex justify-between">
                <span>Rolling Gallery Ceiling Size</span>
                <span className="font-bold text-blue-500 bg-blue-50 px-2 rounded">{storageCleanTriggerCount} screenshots</span>
              </label>
              <input 
                type="range"
                min="20"
                max="200"
                step="10"
                value={storageCleanTriggerCount}
                onChange={e => setStorageCleanTriggerCount(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg cursor-pointer mt-3"
              />
              <p className="text-[9px] text-slate-400 font-mono mt-1">Auto-purges oldest images when limit is breached to protect space</p>
            </div>
          </div>

          {/* Section 4: Toast Notifications Alerts */}
          <div className="bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-5 shadow-sm">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <Bell className="h-4.5 w-4.5 text-blue-500" />
              <span>OPERATING SYSTEM ALERT INTEGRATIONS</span>
            </h2>

            {/* Native OS toast alerts toggle */}
            <label className="flex items-start space-x-3.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toastAlertsEnabled}
                onChange={e => setToastAlertsEnabled(e.target.checked)}
                className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-xs text-slate-700 font-bold uppercase">Enable Windows Toast Alerts</span>
                <span className="text-[9px] text-slate-400 font-mono">Push system tray desktop notifications immediately upon watchlist detection</span>
              </div>
            </label>
          </div>

          {/* Section 5: Anti-Detection & Human Emulation Engine */}
          <div className="md:col-span-2 bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-6 shadow-sm">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
              <span>ANTI-DETECTION & HUMAN BEHAVIOR EMULATION</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Temporal Randomness */}
              <div className="space-y-4 font-mono">
                {/* Enable Jitter */}
                <label className="flex items-start space-x-3.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableJitter}
                    onChange={e => setEnableJitter(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold uppercase font-sans">Dynamic Query Jitter (Anti-Fingerprint)</span>
                    <span className="text-[9px] text-slate-400">Adds random +/- variance to scan intervals to bypass rigid query patterns</span>
                  </div>
                </label>

                {/* Jitter range */}
                {enableJitter && (
                  <div className="pl-7 space-y-1.5">
                    <label className="text-[9.5px] text-slate-700 font-bold flex justify-between">
                      <span>JITTER RANGE DEPTH</span>
                      <span className="font-bold text-blue-500">±{jitterRangeSeconds} seconds</span>
                    </label>
                    <input 
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={jitterRangeSeconds}
                      onChange={e => setJitterRangeSeconds(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg cursor-pointer mt-1"
                    />
                  </div>
                )}

                {/* Fatigue / Cooldown Rest settings */}
                <div className="space-y-3.5 pt-4 border-t border-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-450 font-bold uppercase tracking-wide">Cool-down Threshold</label>
                      <input 
                        type="number"
                        min="10"
                        max="200"
                        value={coolDownAfterScans}
                        onChange={e => setCoolDownAfterScans(Number(e.target.value))}
                        className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[8px] text-slate-400">Continuous scans before taking a break</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-450 font-bold uppercase tracking-wide">Break Duration</label>
                      <input 
                        type="number"
                        min="1"
                        max="15"
                        value={coolDownDurationMinutes}
                        onChange={e => setCoolDownDurationMinutes(Number(e.target.value))}
                        className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[8px] text-slate-400">Minutes to rest (Cooldown state)</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Interaction & Identifiers */}
              <div className="space-y-4 font-mono">
                {/* Premium Browser Fingerprint Rotation */}
                <label className="flex items-start space-x-3.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rotateUserAgent}
                    onChange={e => setRotateUserAgent(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold uppercase font-sans">Rotate User-Agent Identifiers</span>
                    <span className="text-[9px] text-slate-400">Rotates premium desktop User-Agents to mimic multi-browser desktop client traffic</span>
                  </div>
                </label>

                {/* Human interaction simulation (mouse movement) */}
                <label className="flex items-start space-x-3.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emulateMouseMovement}
                    onChange={e => setEmulateMouseMovement(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold uppercase font-sans">Simulate Organic Mouse Trajectories</span>
                    <span className="text-[9px] text-slate-400">Emulates random bezier mouse paths and cursor speed deceleration profiles</span>
                  </div>
                </label>

                <div className="bg-blue-50/30 border border-blue-50/50 p-4 rounded-2xl text-[10px] text-slate-450 leading-relaxed space-y-1.5">
                  <p className="text-blue-600 font-bold uppercase">🛡️ STEALTH CORE ACTIVE</p>
                  <p>
                    These safety controllers run directly inside the local browser process context to intercept bot scanners and prevent sudden account suspensions.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* About Panel (Information first, humbleness, architectural honesty) */}
          <div className="md:col-span-2 bg-white rounded-[24px] border border-blue-50/50 p-6 space-y-3.5 shadow-sm font-mono">
            <h2 className="font-display font-bold text-sm text-slate-800 border-b border-blue-50 pb-3 flex items-center space-x-2.5">
              <Info className="h-4.5 w-4.5 text-blue-500" />
              <span>ABOUT - HOT WHEELS MONITOR</span>
            </h2>

            <div className="text-[11.5px] text-slate-650 space-y-2 leading-relaxed">
              <p>
                Hot Wheels Monitor is a local sandboxed diagnostic desktop controller programmed inside a Python PySide6 (Qt) wrapper window context on Windows Desktop environments. 
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-[10.5px] text-slate-400">
                <div>
                  <span className="block font-bold text-slate-700 uppercase">Target Framework</span>
                  <span>PySide6 (Qt) Core</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-700 uppercase">IPC Gateway</span>
                  <span>Chromium (CDP)</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-700 uppercase">Local Workspace</span>
                  <span>C:\Users\Collector</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-700 uppercase">Compiled Status</span>
                  <span>Build v1.2.4-BETA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="md:col-span-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 text-xs font-mono">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="md:col-span-2 flex items-center justify-between pt-5 border-t border-blue-50 font-mono">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isResetting ? 'Resetting...' : 'Reset to Defaults'}</span>
            </button>

            <button
              type="submit"
              id="btn-save-settings"
              disabled={isSaving || isResetting}
              className={`font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full flex items-center space-x-2 transition cursor-pointer shadow-lg transition-all duration-200 ${
                isSaved 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/15' 
                  : 'win-btn-primary text-white shadow-blue-500/15 hover:opacity-95'
              }`}
            >
              <Save className="h-4 w-4 stroke-[2.5]" />
              <span>{isSaving ? 'Persisting...' : isSaved ? 'Saved Successfully! ✓' : 'Commit Settings Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
