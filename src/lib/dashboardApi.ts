import { SystemStats, InstamartItem, ActivityEvent } from '../types';

export interface DashboardSummaryResponse {
  stats: SystemStats;
  isScanning: boolean;
  scanInterval: number;
  location: string;
  watchlistCount: number;
  countdown: number;
  cooldownRemainingSeconds: number;
  enableJitter: boolean;
  recentItems: InstamartItem[];
  recentEvents: ActivityEvent[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/summary');
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function toggleEngineScan(isScanning: boolean): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/engine/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isScanning })
  });
  if (!response.ok) {
    throw new Error(`Failed to toggle engine scan: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function triggerManualScan(): Promise<{ scannedItem: InstamartItem; summary: DashboardSummaryResponse }> {
  const response = await fetch('/api/dashboard/engine/manual-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger manual scan: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function triggerPanicStop(): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/engine/panic-stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger panic stop: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function simulateOutage(reopenTime: string | null): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/engine/simulate-outage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reopenTime })
  });
  if (!response.ok) {
    throw new Error(`Failed to simulate store outage: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function restoreOnline(): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/engine/restore-online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Failed to restore store online: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function toggleFastSimulation(enabled: boolean): Promise<DashboardSummaryResponse> {
  const response = await fetch('/api/dashboard/engine/toggle-fast-sim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
  if (!response.ok) {
    throw new Error(`Failed to toggle fast simulation mode: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function postActivityLog(
  message: string, 
  category: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'detection',
  details?: string
): Promise<ActivityEvent> {
  const response = await fetch('/api/dashboard/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, category, details })
  });
  if (!response.ok) {
    throw new Error(`Failed to post activity log: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}
