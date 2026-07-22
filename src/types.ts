export interface WatchlistItem {
  id: string;
  name: string;
  keyword: string;
  matchType: 'contains' | 'exact';
  excludeKeywords: string[];
  autoPurchase: boolean;
  active: boolean;
  priority: 'low' | 'medium' | 'high';
  similarityThreshold: number; // e.g. 85%
  maxPrice: number;
  quantity: number;
  codToggle: boolean;
  notes: string;
  lastDetected?: string;
  detectionCount: number;
}

export interface InstamartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  rating?: number;
  category: string;
  isCollectorPiece: boolean;
  collectorType?: 'Regular TH' | 'Super TH' | 'Premium Car Culture' | 'Red Line Club' | 'Mainline Match';
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  category: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'detection';
  details?: string;
}

export interface SystemStats {
  status: 'idle' | 'scanning' | 'paused' | 'cooldown' | 'offline_reopen' | 'offline_retry';
  uptimeSeconds: number;
  totalScans: number;
  totalMatches: number;
  ordersCompleted: number;
  failures: number;
  retries: number;
  averageScanTimeMs: number;
  averageDetectionTimeMs: number;
  chromeStatus: 'connected' | 'disconnected';
  localPort: number;
  storeStatus?: 'online' | 'offline_reopen' | 'offline_retry';
  offlineCountdown?: number;
  reopenTimeStr?: string;
  isFastSimulation?: boolean;
}

export interface SchedulerConfig {
  startTime: string; // "08:00"
  endTime: string;   // "22:00"
  refreshInterval: number; // seconds
  workingDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  autoStart: boolean;
  autoStop: boolean;
  orderLimit: number;
}
