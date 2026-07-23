export interface SystemParameters {
  scanIntervalSeconds: number;
  userLocation: string;
  autoCheckoutSimulated: boolean;
  autoCheckoutPaymentMethod: string;
  localChromePort: number;
  rememberSession: boolean;
  headlessMode: boolean;
  toastAlertsEnabled: boolean;
  storageCleanTriggerCount: number;
  enableJitter: boolean;
  jitterRangeSeconds: number;
  emulateMouseMovement: boolean;
  rotateUserAgent: boolean;
  coolDownAfterScans: number;
  coolDownDurationMinutes: number;
  updatedAt?: string;
}

export interface EngineState {
  isScanning: boolean;
  status: 'idle' | 'scanning' | 'paused' | 'cooldown' | 'offline_reopen' | 'offline_retry';
  storeStatus: 'online' | 'offline_reopen' | 'offline_retry';
  countdown: number;
  offlineCountdown: number;
  reopenTimeStr: string;
  isFastSimulation: boolean;
  cooldownRemainingSeconds: number;
  uptimeStart: string;
  totalScans: number;
  totalMatches: number;
  ordersCompleted: number;
  failures: number;
  retries: number;
  averageScanTimeMs: number;
  averageDetectionTimeMs: number;
  chromeStatus: 'connected' | 'disconnected';
}

export const DEFAULT_SYSTEM_PARAMETERS: SystemParameters = {
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
  coolDownDurationMinutes: 2,
  updatedAt: new Date().toISOString()
};

export const DEFAULT_ENGINE_STATE: EngineState = {
  isScanning: true,
  status: 'scanning',
  storeStatus: 'online',
  countdown: 4,
  offlineCountdown: 0,
  reopenTimeStr: '',
  isFastSimulation: true,
  cooldownRemainingSeconds: 0,
  uptimeStart: new Date().toISOString(),
  totalScans: 124,
  totalMatches: 8,
  ordersCompleted: 3,
  failures: 0,
  retries: 2,
  averageScanTimeMs: 142,
  averageDetectionTimeMs: 1.2,
  chromeStatus: 'connected'
};

export const DEFAULT_INITIAL_ACTIVITIES = [
  {
    id: 'ev-1',
    timestamp: new Date(Date.now() - 1000 * 300).toLocaleTimeString(),
    message: 'Hot Wheels Collector Engine backend initialized.',
    category: 'info' as const
  },
  {
    id: 'ev-2',
    timestamp: new Date(Date.now() - 1000 * 240).toLocaleTimeString(),
    message: 'Attached remote Chrome instance on port 9222 via CDP.',
    category: 'success' as const,
    details: 'Chromium DevTools Protocol bridge verified.\nTarget: ws://127.0.0.1:9222/devtools/browser/...'
  },
  {
    id: 'ev-3',
    timestamp: new Date(Date.now() - 1000 * 180).toLocaleTimeString(),
    message: 'Stealth UA header rotation & TLS fingerprint verification complete.',
    category: 'automation' as const
  },
  {
    id: 'ev-4',
    timestamp: new Date(Date.now() - 1000 * 60).toLocaleTimeString(),
    message: 'Watchlist rule evaluation matrix synced with database.',
    category: 'detection' as const
  }
];

export const SAMPLE_CATALOG = [
  {
    id: 'prod-1',
    title: 'Hot Wheels Premium Car Culture Boulevard - Toyota AE86 Sprinter Trueno',
    price: 499,
    originalPrice: 599,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture' as const,
    timestamp: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Hot Wheels Super Treasure Hunt - Nissan Skyline GT-R (R34) Spectraflame Blue',
    price: 149,
    originalPrice: 149,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Super TH' as const,
    timestamp: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Hot Wheels 1:64 Mainline Assorted Die-Cast Toy Car (Styles May Vary)',
    price: 149,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: false,
    collectorType: 'Mainline Match' as const,
    timestamp: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Hot Wheels Boulevard Mercedes-Benz 190E 2.5-16 Evolution II Black',
    price: 499,
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture' as const,
    timestamp: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'Hot Wheels Regular Treasure Hunt - Mad Propz Airplane Chrome Edition',
    price: 149,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Regular TH' as const,
    timestamp: new Date().toISOString()
  }
];

export const DEFAULT_INITIAL_WATCHLIST = [
  {
    id: 'rule-1',
    name: 'Super Treasure Hunts (STH)',
    keyword: 'Super Treasure Hunt',
    matchType: 'contains' as const,
    excludeKeywords: ['damaged', 'loose'],
    autoPurchase: true,
    active: true,
    priority: 'high' as const,
    similarityThreshold: 90,
    maxPrice: 200,
    quantity: 1,
    codToggle: false,
    notes: 'Prioritize Spectraflame blue editions if available.',
    detectionCount: 3,
    lastDetected: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'rule-2',
    name: 'Nissan Skyline GT-R',
    keyword: 'Skyline GT-R',
    matchType: 'contains' as const,
    excludeKeywords: [],
    autoPurchase: true,
    active: true,
    priority: 'high' as const,
    similarityThreshold: 85,
    maxPrice: 499,
    quantity: 2,
    codToggle: false,
    notes: 'Automatic buy on stock matching.',
    detectionCount: 5,
    lastDetected: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'rule-3',
    name: 'Toyota AE86 Trueno',
    keyword: 'AE86',
    matchType: 'contains' as const,
    excludeKeywords: [],
    autoPurchase: false,
    active: true,
    priority: 'medium' as const,
    similarityThreshold: 85,
    maxPrice: 599,
    quantity: 1,
    codToggle: true,
    notes: 'Premium boulevard release only.',
    detectionCount: 1,
    lastDetected: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export interface SchedulerConfig {
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "22:00"
  refreshInterval: number; // in seconds
  workingDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  autoStart: boolean;
  autoStop: boolean;
  orderLimit: number;
  updatedAt?: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  targetRuleId?: string;
  scheduleType: 'recurring' | 'one-time';
  intervalSeconds: number;
  cronExpression?: string;
  oneTimeTime?: string;
  status: 'active' | 'paused' | 'disabled' | 'completed' | 'failed';
  enabled: boolean;
  maxRetries: number;
  retryCount: number;
  retryDelaySeconds: number;
  lastRunAt?: string;
  nextRunAt?: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastError?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JobExecutionRecord {
  id: string;
  jobId: string;
  jobName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'retrying';
  durationMs: number;
  matchedCount: number;
  attemptNumber: number;
  details?: string;
  errorMessage?: string;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  startTime: '08:00',
  endTime: '22:00',
  refreshInterval: 4,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  autoStart: true,
  autoStop: true,
  orderLimit: 2,
  updatedAt: new Date().toISOString()
};

export const DEFAULT_SCHEDULED_JOBS: ScheduledJob[] = [
  {
    id: 'job-1',
    name: 'Mainline & STH Scraper Loop',
    targetRuleId: 'all',
    scheduleType: 'recurring',
    intervalSeconds: 4,
    status: 'active',
    enabled: true,
    maxRetries: 3,
    retryCount: 0,
    retryDelaySeconds: 5,
    lastRunAt: new Date().toISOString(),
    nextRunAt: new Date(Date.now() + 4000).toISOString(),
    totalExecutions: 48,
    successfulExecutions: 47,
    failedExecutions: 1,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'job-2',
    name: 'Nightly Watchlist Sync & Inventory Audit',
    targetRuleId: 'rule-1',
    scheduleType: 'recurring',
    intervalSeconds: 3600,
    status: 'active',
    enabled: true,
    maxRetries: 2,
    retryCount: 0,
    retryDelaySeconds: 10,
    lastRunAt: new Date(Date.now() - 1800000).toISOString(),
    nextRunAt: new Date(Date.now() + 1800000).toISOString(),
    totalExecutions: 12,
    successfulExecutions: 12,
    failedExecutions: 0,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const DEFAULT_JOB_HISTORY: JobExecutionRecord[] = [
  {
    id: 'exec-101',
    jobId: 'job-1',
    jobName: 'Mainline & STH Scraper Loop',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'success',
    durationMs: 138,
    matchedCount: 1,
    attemptNumber: 1,
    details: 'Polled Instamart endpoint. Matched STH rule "Nissan Skyline GT-R".'
  },
  {
    id: 'exec-100',
    jobId: 'job-1',
    jobName: 'Mainline & STH Scraper Loop',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'success',
    durationMs: 145,
    matchedCount: 0,
    attemptNumber: 1,
    details: 'Polled Instamart endpoint. No matches found.'
  }
];


