import { useState, useEffect, useRef } from 'react';
import { WatchlistItem, InstamartItem, ActivityEvent, SystemStats, SchedulerConfig } from './types';
import { DEFAULT_RULES, INSTAMART_SAMPLE_PRODUCTS } from './lib/mockData';
import { fetchSystemParameters, saveSystemParameters, resetSystemParameters } from './lib/api';
import { WindowsFrame } from './components/WindowsFrame';
import { NavigationSidebar } from './components/NavigationSidebar';
import { DashboardView } from './components/DashboardView';
import { WatchlistView } from './components/WatchlistView';
import { SchedulerView } from './components/SchedulerView';
import { ActivityView } from './components/ActivityView';
import { StatisticsView } from './components/StatisticsView';
import { ScreenshotGalleryView } from './components/ScreenshotGalleryView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist' | 'scheduler' | 'activity' | 'statistics' | 'gallery' | 'settings'>('dashboard');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(4);

  // Instamart Store status and retry states
  const [storeStatus, setStoreStatus] = useState<'online' | 'offline_reopen' | 'offline_retry'>('online');
  const [reopenTimeStr, setReopenTimeStr] = useState<string>('');
  const [offlineCountdown, setOfflineCountdown] = useState<number>(0);
  const [isFastSimulation, setIsFastSimulation] = useState<boolean>(true);

  // Load Watchlist from localStorage or use defaults
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('hw_monitor_watchlist');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });

  // Load Scheduler Config
  const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig>(() => {
    const saved = localStorage.getItem('hw_monitor_scheduler');
    return saved ? JSON.parse(saved) : {
      startTime: '08:00',
      endTime: '22:00',
      refreshInterval: 4,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      autoStart: true,
      autoStop: true,
      orderLimit: 2
    };
  });

  // Load Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hw_monitor_settings_profile');
    return saved ? JSON.parse(saved) : {
      scanIntervalSeconds: 4,
      userLocation: 'Mumbai Central Area, Sector 4',
      autoCheckoutSimulated: true,
      autoCheckoutPaymentMethod: 'COD',
      localChromePort: 9222,
      rememberSession: true,
      headlessMode: false,
      toastAlertsEnabled: true,
      storageCleanTriggerCount: 100,
      enableJitter: true,
      jitterRangeSeconds: 2,
      emulateMouseMovement: true,
      rotateUserAgent: true,
      coolDownAfterScans: 40,
      coolDownDurationMinutes: 2
    };
  });

  // Human fatigue rest cooldown timer state
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState<number>(0);

  // Load Matched Items (Screenshot Gallery)
  const [screenshots, setScreenshots] = useState<InstamartItem[]>(() => {
    const saved = localStorage.getItem('hw_monitor_screenshots');
    if (saved) return JSON.parse(saved);
    
    // Seed with realistic initial match captures for amazing initial presentation
    const seedTime = new Date();
    return [
      {
        id: 'cap-1039',
        title: 'Hot Wheels Premium Car Culture Boulevard - Toyota AE86 Sprinter Trueno',
        price: 499,
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
        category: 'Toys & Collectibles',
        isCollectorPiece: true,
        collectorType: 'Premium Car Culture',
        timestamp: new Date(seedTime.getTime() - 60000 * 45).toISOString()
      },
      {
        id: 'cap-1042',
        title: 'Hot Wheels Super Treasure Hunt - Nissan Skyline GT-R (R34) Spectraflame Blue',
        price: 149,
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
        category: 'Toys & Collectibles',
        isCollectorPiece: true,
        collectorType: 'Super TH',
        timestamp: new Date(seedTime.getTime() - 60000 * 180).toISOString()
      }
    ];
  });

  // Log events stream
  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('hw_monitor_events');
    if (saved) return JSON.parse(saved);
    
    const initialTime = new Date();
    return [
      {
        id: 'ev-1',
        timestamp: new Date(initialTime.getTime() - 1000 * 300).toLocaleTimeString(),
        message: 'Hot Wheels Monitor Core initialized.',
        category: 'info'
      },
      {
        id: 'ev-2',
        timestamp: new Date(initialTime.getTime() - 1000 * 240).toLocaleTimeString(),
        message: 'Successfully attached remote chrome instance on port 9222.',
        category: 'success',
        details: 'Chromium DevTools Protocol connected successfully.\nSession: 5f98cf29-ca77-4be7-ba48-9eb224422e11\nTarget: ws://127.0.0.1:9222/devtools/browser/...'
      },
      {
        id: 'ev-3',
        timestamp: new Date(initialTime.getTime() - 1000 * 180).toLocaleTimeString(),
        message: 'Stealth UA string injection verified (Windows x64).',
        category: 'automation'
      }
    ];
  });

  const [recentItems, setRecentItems] = useState<InstamartItem[]>([]);

  // Real-time Stats
  const [stats, setStats] = useState<SystemStats>({
    status: 'scanning',
    uptimeSeconds: 0,
    totalScans: 48,
    totalMatches: 2,
    ordersCompleted: 1,
    failures: 0,
    retries: 1,
    averageScanTimeMs: 142,
    averageDetectionTimeMs: 1.2,
    chromeStatus: 'connected',
    localPort: settings.localChromePort || 9222,
    storeStatus: 'online',
    offlineCountdown: 0,
    reopenTimeStr: '',
    isFastSimulation: true
  });

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uptimeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load system parameters from backend database on mount
  useEffect(() => {
    fetchSystemParameters()
      .then(fetchedParams => {
        setSettings(fetchedParams);
        addEvent('System parameters retrieved successfully from backend storage.', 'info');
      })
      .catch(err => {
        console.warn('Could not load system parameters from backend API, using cached parameters:', err);
      });
  }, []);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('hw_monitor_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('hw_monitor_scheduler', JSON.stringify(schedulerConfig));
  }, [schedulerConfig]);

  useEffect(() => {
    localStorage.setItem('hw_monitor_settings_profile', JSON.stringify(settings));
    setStats(prev => ({
      ...prev,
      localPort: settings.localChromePort || 9222
    }));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hw_monitor_screenshots', JSON.stringify(screenshots));
  }, [screenshots]);

  useEffect(() => {
    localStorage.setItem('hw_monitor_events', JSON.stringify(events));
  }, [events]);

  // System Uptime & Diagnostics Ticker (updates every second)
  useEffect(() => {
    uptimeTimerRef.current = setInterval(() => {
      setStats(prev => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1
      }));
    }, 1000);

    return () => {
      if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
    };
  }, []);

  // Format uptime to string
  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Log Event helper
  const addEvent = (message: string, category: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'detection', details?: string) => {
    const newEvent: ActivityEvent = {
      id: `ev-${Math.random().toString()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      category,
      details
    };
    setEvents(prev => {
      const truncated = prev.length > 200 ? prev.slice(prev.length - 200) : prev;
      return [...truncated, newEvent];
    });
  };

  // Helper to parse reopening time (e.g. "Opens at 8:30 AM", "Available after 11:15 PM")
  const parseReopeningTime = (timeStr: string): Date | null => {
    try {
      const cleanStr = timeStr.replace(/opens at/gi, '').replace(/available after/gi, '').trim();
      const match = cleanStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      
      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      return targetDate;
    } catch (e) {
      console.error("Error parsing reopening time:", e);
      return null;
    }
  };

  const handleSimulateStoreOffline = (reopenTime: string | null) => {
    // Stop standard countdown
    setCountdown(schedulerConfig.refreshInterval);
    
    if (reopenTime) {
      setStoreStatus('offline_reopen');
      setReopenTimeStr(reopenTime);
      
      const targetDate = parseReopeningTime(reopenTime);
      let seconds = 300; // default 5 mins
      if (targetDate) {
        seconds = Math.max(10, Math.floor((targetDate.getTime() - Date.now()) / 1000));
      }
      
      if (isFastSimulation) {
        seconds = 15;
      }
      
      setOfflineCountdown(seconds);
      setStats(prev => ({
        ...prev,
        status: 'offline_reopen',
        storeStatus: 'offline_reopen',
        offlineCountdown: seconds,
        reopenTimeStr: reopenTime
      }));
      
      addEvent(`Store temporarily unavailable`, 'warning');
      addEvent(`Store expected to reopen at: ${reopenTime}`, 'info');
      addEvent(`Monitoring paused until reopening time`, 'automation', `Pause duration: ${seconds} seconds until reopening at ${reopenTime}.\n(Fast Simulation Mode: ${isFastSimulation ? 'ACTIVE (15s)' : 'DISABLED'}).`);
    } else {
      setStoreStatus('offline_retry');
      setReopenTimeStr('');
      
      let seconds = 15 * 60; // 15 mins
      if (isFastSimulation) {
        seconds = 15;
      }
      
      setOfflineCountdown(seconds);
      setStats(prev => ({
        ...prev,
        status: 'offline_retry',
        storeStatus: 'offline_retry',
        offlineCountdown: seconds,
        reopenTimeStr: ''
      }));
      
      addEvent(`Store temporarily unavailable`, 'warning');
      addEvent(`Next automatic check in 15 minutes`, 'automation', `No reopening time specified. System will retry status checks automatically.\nNext automatic check in ${isFastSimulation ? '15 seconds' : '15 minutes'}.\n(Fast Simulation Mode: ${isFastSimulation ? 'ACTIVE (15s)' : 'DISABLED'}).`);
    }
  };

  const handleSimulateStoreOnline = () => {
    setStoreStatus('online');
    setReopenTimeStr('');
    setOfflineCountdown(0);
    
    setStats(prev => ({
      ...prev,
      status: 'scanning',
      storeStatus: 'online',
      offlineCountdown: 0,
      reopenTimeStr: ''
    }));
    
    addEvent(`Store is live again`, 'success', 'Simulated store status restored to Live/Online.');
    addEvent(`Monitoring resumed`, 'success');
  };

  const handleToggleFastSimulation = (enabled: boolean) => {
    setIsFastSimulation(enabled);
    setStats(prev => ({
      ...prev,
      isFastSimulation: enabled
    }));
    addEvent(`Fast Simulation Mode ${enabled ? 'ENABLED' : 'DISABLED'}`, 'info', `When store is offline, retry timers and reopen wait times are mapped to ${enabled ? '15 seconds' : 'actual clock differences'} for convenient evaluation.`);
  };

  // Polling simulation logic step
  const triggerSimulationQuery = () => {
    // Pick standard item from sample list
    const randomIndex = Math.floor(Math.random() * INSTAMART_SAMPLE_PRODUCTS.length);
    const candidateItem = INSTAMART_SAMPLE_PRODUCTS[randomIndex];
    
    const itemId = `im-item-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentTimestamp = new Date().toISOString();

    const scannedItem: InstamartItem = {
      ...candidateItem,
      id: itemId,
      timestamp: currentTimestamp
    };

    // Keep active console stream length to 6
    setRecentItems(prev => {
      const updated = [scannedItem, ...prev];
      return updated.slice(0, 6);
    });

    // Check for watchlist match
    let matchFound = false;
    let matchedItemRule: WatchlistItem | null = null;

    for (const item of watchlist) {
      if (!item.active) continue;

      let keywordMatched = false;
      if (item.matchType === 'exact') {
        keywordMatched = scannedItem.title.toLowerCase() === item.keyword.toLowerCase();
      } else {
        keywordMatched = scannedItem.title.toLowerCase().includes(item.keyword.toLowerCase());
      }

      // Check Exclude keywords
      const excluded = item.excludeKeywords.some(ex => scannedItem.title.toLowerCase().includes(ex.toLowerCase()));

      // Check Price Guard
      const withinPrice = scannedItem.price <= item.maxPrice;

      if (keywordMatched && !excluded && withinPrice) {
        matchFound = true;
        matchedItemRule = item;
        break;
      }
    }

    if (matchFound && matchedItemRule) {
      // Add screenshot
      setScreenshots(prev => {
        // Guard against overflow ceiling
        const overLimit = prev.length >= settings.storageCleanTriggerCount;
        const cleaned = overLimit ? prev.slice(0, prev.length - 1) : prev;
        return [scannedItem, ...cleaned];
      });

      // Update rule stats
      setWatchlist(prev => prev.map(item => 
        item.id === matchedItemRule!.id 
          ? { ...item, detectionCount: item.detectionCount + 1, lastDetected: currentTimestamp }
          : item
      ));

      // Update System Stats
      setStats(prev => {
        const newTotalScans = prev.totalScans + 1;
        const cooldownThreshold = settings.coolDownAfterScans ?? 40;
        const triggerCooldown = newTotalScans > 0 && newTotalScans % cooldownThreshold === 0;
        
        if (triggerCooldown) {
          const breakDurationSeconds = (settings.coolDownDurationMinutes ?? 2) * 60;
          setTimeout(() => {
            setCooldownRemainingSeconds(breakDurationSeconds);
            addEvent(
              `HUMAN FATIGUE COOLDOWN INITIATED: Scans completed: ${newTotalScans}. Entering a ${settings.coolDownDurationMinutes} min rest break.`,
              'automation',
              `Emulating organic browsing fatigue. Pause duration: ${breakDurationSeconds} seconds.\nTo bypass automated traffic heuristic metrics analyzed by cloud-side Web Application Firewalls.`
            );
          }, 10);
          return {
            ...prev,
            totalScans: newTotalScans,
            totalMatches: prev.totalMatches + 1,
            status: 'cooldown'
          };
        }
        return {
          ...prev,
          totalScans: newTotalScans,
          totalMatches: prev.totalMatches + 1
        };
      });

      addEvent(
        `TARGET DETECTED: "${scannedItem.title}"! Matches Watchlist Rule: "${matchedItemRule.name}"`, 
        'detection',
        `Matched Product: ${scannedItem.title}\nPrice: ₹${scannedItem.price}\nSimilarity Confidence: 100%\nActive Stock: ${scannedItem.stock} items\nTriggered watch filter keyword: "${matchedItemRule.keyword}"`
      );

      // Automated Checkout Trigger
      if (matchedItemRule.autoPurchase || settings.autoCheckoutSimulated) {
        setTimeout(() => {
          const orderNum = `OD-SWGY-${Math.floor(100000 + Math.random() * 899999)}`;
          setStats(prev => ({
            ...prev,
            ordersCompleted: prev.ordersCompleted + 1
          }));

          addEvent(
            `AUTOMATION PURCHASE COMPLETED: Order #${orderNum} verified.`, 
            'automation',
            `Swiggy Instamart Gateway Response: 200 OK\nOrder ID: ${orderNum}\nPayment Profile: ${settings.autoCheckoutPaymentMethod}\nLocal Remote Port Interface: ${settings.localChromePort}\nItem Secured: "${scannedItem.title}"`
          );
        }, 1200);
      }
    } else {
      // Standard run
      setStats(prev => {
        const newTotalScans = prev.totalScans + 1;
        const cooldownThreshold = settings.coolDownAfterScans ?? 40;
        const triggerCooldown = newTotalScans > 0 && newTotalScans % cooldownThreshold === 0;
        
        if (triggerCooldown) {
          const breakDurationSeconds = (settings.coolDownDurationMinutes ?? 2) * 60;
          setTimeout(() => {
            setCooldownRemainingSeconds(breakDurationSeconds);
            addEvent(
              `HUMAN FATIGUE COOLDOWN INITIATED: Scans completed: ${newTotalScans}. Entering a ${settings.coolDownDurationMinutes} min rest break.`,
              'automation',
              `Emulating organic browsing fatigue. Pause duration: ${breakDurationSeconds} seconds.\nTo bypass automated traffic heuristic metrics analyzed by cloud-side Web Application Firewalls.`
            );
          }, 10);
          return {
            ...prev,
            totalScans: newTotalScans,
            status: 'cooldown'
          };
        }
        return {
          ...prev,
          totalScans: newTotalScans
        };
      });
    }
  };

  // Countdown clock & Interval processor with Jitter, Cooldown, and Store Offline support
  useEffect(() => {
    if (isScanning) {
      countdownTimerRef.current = setInterval(() => {
        // 1. If store is offline (reopen or retry), count down the offline timer
        if (storeStatus !== 'online') {
          setOfflineCountdown(prevCount => {
            const nextCount = prevCount - 1;
            
            // Sync with stats
            setStats(prevStats => ({
              ...prevStats,
              offlineCountdown: Math.max(0, nextCount)
            }));
            
            if (nextCount <= 0) {
              if (storeStatus === 'offline_reopen') {
                setStoreStatus('online');
                setReopenTimeStr('');
                setStats(prevStats => ({
                  ...prevStats,
                  status: 'scanning',
                  storeStatus: 'online',
                  offlineCountdown: 0,
                  reopenTimeStr: ''
                }));
                addEvent('Monitoring resumed', 'success');
                addEvent('Store is live again', 'success', 'Reopening time reached. Normal inventory scanning resumed.');
              } else {
                // offline_retry
                addEvent('Next automatic check: Retrying store status check...', 'info');
                
                // Automatically restore online status to simulate recovery on retry
                setStoreStatus('online');
                setStats(prevStats => ({
                  ...prevStats,
                  status: 'scanning',
                  storeStatus: 'online',
                  offlineCountdown: 0,
                  reopenTimeStr: ''
                }));
                addEvent('Store is live again', 'success', 'Store status check succeeded. Instamart is accepting orders.');
                addEvent('Monitoring resumed', 'success');
              }
              return 0;
            }
            return nextCount;
          });
          return;
        }

        // 2. If human rest fatigue cooldown is active, countdown the break instead of scanning
        if (cooldownRemainingSeconds > 0) {
          setCooldownRemainingSeconds(prevCo => {
            if (prevCo <= 1) {
              // restore scanning state
              setStats(prevStats => ({ ...prevStats, status: 'scanning' }));
              addEvent('Fatigue rest period completed. Restoring standard scanning operations.', 'success');
              return 0;
            }
            return prevCo - 1;
          });
          return;
        }

        // 3. Normal polling countdown
        setCountdown(prev => {
          if (prev <= 1) {
            triggerSimulationQuery();
            
            // Calculate next interval with human emulation jitter
            const baseInterval = schedulerConfig.refreshInterval;
            if (settings.enableJitter) {
              const range = settings.jitterRangeSeconds ?? 2;
              const offset = (Math.random() * 2 - 1) * range;
              const randomized = Math.max(1, Math.round(baseInterval + offset));
              if (randomized !== baseInterval) {
                // Occasionally log jitter offsets so user visually sees it emulating a human timing query
                if (Math.random() > 0.6) {
                  addEvent(`Anti-detection timing jitter: scheduled next scan in ${randomized}s (offset: ${(randomized - baseInterval).toFixed(1)}s).`, 'info');
                }
              }
              return randomized;
            }
            return baseInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isScanning, watchlist, schedulerConfig, settings, cooldownRemainingSeconds, storeStatus, offlineCountdown, isFastSimulation]);

  // Actions
  const handleToggleScan = () => {
    const newState = !isScanning;
    setIsScanning(newState);
    if (!newState) {
      setCountdown(schedulerConfig.refreshInterval);
    }
    addEvent(
      `Automation Engine state updated to: ${newState ? 'ACTIVE RUNNING' : 'SUSPENDED/IDLE'}`, 
      newState ? 'success' : 'warning'
    );
  };

  const handleManualScan = () => {
    if (isScanning) return;
    triggerSimulationQuery();
    addEvent('Manual diagnostic query sent to Chrome debug port.', 'info');
  };

  const handlePanicStop = () => {
    setIsScanning(false);
    setCountdown(schedulerConfig.refreshInterval);
    addEvent(
      'EMERGENCY PANIC KILL: All automation intervals, checkouts, and socket queries terminated immediately.', 
      'error',
      'The loop was halted by the collector panic trigger.\nRemote Chrome debug port remains listening but all scraper timers have been safely flushed.'
    );
  };

  const handleAddRule = (newRuleFields: Omit<WatchlistItem, 'id' | 'detectionCount'>) => {
    const newRule: WatchlistItem = {
      ...newRuleFields,
      id: `rule-${Math.random().toString()}`,
      detectionCount: 0
    };
    setWatchlist(prev => [...prev, newRule]);
    addEvent(`New Watchlist Target created: "${newRule.name}" matching keyword "${newRule.keyword}"`, 'info');
  };

  const handleUpdateRule = (id: string, updatedFields: Partial<WatchlistItem>) => {
    setWatchlist(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    const target = watchlist.find(item => item.id === id);
    if (target) {
      addEvent(`Watchlist Rule "${target.name}" parameters modified in registry.`, 'info');
    }
  };

  const handleDeleteRule = (id: string) => {
    const target = watchlist.find(item => item.id === id);
    setWatchlist(prev => prev.filter(item => item.id !== id));
    if (target) {
      addEvent(`Watchlist Rule "${target.name}" removed from local storage profiles.`, 'warning');
    }
  };

  const handleDuplicateRule = (id: string) => {
    const target = watchlist.find(item => item.id === id);
    if (target) {
      const duplicated: WatchlistItem = {
        ...target,
        id: `rule-${Math.random().toString()}`,
        name: `${target.name} (Copy)`,
        detectionCount: 0,
        lastDetected: undefined
      };
      setWatchlist(prev => [...prev, duplicated]);
      addEvent(`Watchlist Rule duplicated: "${duplicated.name}"`, 'info');
    }
  };

  const handleDeleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(shot => shot.id !== id));
    addEvent('Screenshot capture purged from local disk storage space.', 'warning');
  };

  const handleClearGallery = () => {
    setScreenshots([]);
    addEvent('Screenshot gallery memory successfully flushed.', 'warning');
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  const handleUpdateSchedulerConfig = (newConfig: SchedulerConfig) => {
    setSchedulerConfig(newConfig);
    setCountdown(newConfig.refreshInterval);
    addEvent(`Scheduler settings committed. Interval is now set to ${newConfig.refreshInterval} seconds.`, 'success');
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      const updated = await saveSystemParameters(newSettings);
      setSettings(updated);
      addEvent('System parameters updated and persisted in backend database.', 'success');
    } catch (err: any) {
      addEvent(`Failed to persist system parameters: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleResetSettings = async () => {
    try {
      const resetParams = await resetSystemParameters();
      setSettings(resetParams);
      addEvent('System parameters reset to factory default values in database.', 'warning');
    } catch (err: any) {
      addEvent(`Failed to reset system parameters: ${err.message}`, 'error');
      throw err;
    }
  };

  return (
    <WindowsFrame
      uptime={formatUptime(stats.uptimeSeconds)}
      isScanning={isScanning}
      onStartScanner={() => {
        setIsScanning(true);
        addEvent('Windows native command: Resume All Loops.', 'success');
      }}
      onStopScanner={() => {
        setIsScanning(false);
        addEvent('Windows native command: Pause Background Loops.', 'warning');
      }}
    >
      {/* Side Control Sidebar */}
      <NavigationSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isScanning={isScanning}
        totalMatches={screenshots.length}
        watchlistCount={watchlist.length}
      />

      {/* Frame Client Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {activeTab === 'dashboard' && (
          <DashboardView 
            stats={stats}
            isScanning={isScanning}
            onToggleScan={handleToggleScan}
            onManualScan={handleManualScan}
            onPanicStop={handlePanicStop}
            recentItems={recentItems}
            recentEvents={events}
            scanInterval={schedulerConfig.refreshInterval}
            watchlistCount={watchlist.length}
            location={settings.userLocation}
            countdown={countdown}
            cooldownRemainingSeconds={cooldownRemainingSeconds}
            enableJitter={settings.enableJitter}
            onSimulateStoreOffline={handleSimulateStoreOffline}
            onSimulateStoreOnline={handleSimulateStoreOnline}
            onToggleFastSimulation={handleToggleFastSimulation}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView 
            watchlist={watchlist}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={handleDeleteRule}
            onDuplicateRule={handleDuplicateRule}
          />
        )}

        {activeTab === 'scheduler' && (
          <SchedulerView 
            config={schedulerConfig}
            onUpdateConfig={handleUpdateSchedulerConfig}
            isScanning={isScanning}
            countdown={countdown}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityView 
            events={events}
            onClearEvents={handleClearEvents}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView 
            stats={stats}
            watchlistCount={watchlist.length}
            uptime={formatUptime(stats.uptimeSeconds)}
          />
        )}

        {activeTab === 'gallery' && (
          <ScreenshotGalleryView 
            screenshots={screenshots}
            onDeleteScreenshot={handleDeleteScreenshot}
            onClearGallery={handleClearGallery}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettings={handleResetSettings}
          />
        )}

      </div>
    </WindowsFrame>
  );
}
