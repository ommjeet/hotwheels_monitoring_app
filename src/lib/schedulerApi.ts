import { SchedulerConfig } from '../types';

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

export interface SchedulerHealth {
  status: string;
  tickerActive: boolean;
  isInsideWorkingWindow: boolean;
  config: SchedulerConfig;
  activeJobsCount: number;
  totalJobsCount: number;
  runningJobIds: string[];
  totalExecutions: number;
  failedExecutions: number;
  recentHistory: JobExecutionRecord[];
  timestamp: string;
}

export async function fetchSchedulerConfig(): Promise<SchedulerConfig> {
  const response = await fetch('/api/scheduler/config');
  if (!response.ok) {
    throw new Error(`Failed to fetch scheduler config: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function updateSchedulerConfigApi(config: Partial<SchedulerConfig>): Promise<SchedulerConfig> {
  const response = await fetch('/api/scheduler/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update scheduler config: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchScheduledJobs(): Promise<ScheduledJob[]> {
  const response = await fetch('/api/scheduler/jobs');
  if (!response.ok) {
    throw new Error(`Failed to fetch scheduled jobs: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function createScheduledJobApi(job: Partial<ScheduledJob>): Promise<ScheduledJob> {
  const response = await fetch('/api/scheduler/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create scheduled job: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function updateScheduledJobApi(id: string, updates: Partial<ScheduledJob>): Promise<ScheduledJob> {
  const response = await fetch(`/api/scheduler/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update scheduled job: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function pauseScheduledJobApi(id: string): Promise<ScheduledJob> {
  const response = await fetch(`/api/scheduler/jobs/${id}/pause`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to pause job ${id}`);
  const result = await response.json();
  return result.data;
}

export async function resumeScheduledJobApi(id: string): Promise<ScheduledJob> {
  const response = await fetch(`/api/scheduler/jobs/${id}/resume`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to resume job ${id}`);
  const result = await response.json();
  return result.data;
}

export async function deleteScheduledJobApi(id: string): Promise<ScheduledJob> {
  const response = await fetch(`/api/scheduler/jobs/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete job ${id}`);
  const result = await response.json();
  return result.data;
}

export async function runJobNowApi(id: string): Promise<JobExecutionRecord> {
  const response = await fetch(`/api/scheduler/jobs/${id}/run`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to execute job ${id}`);
  const result = await response.json();
  return result.data;
}

export async function fetchSchedulerHistory(limit = 50): Promise<JobExecutionRecord[]> {
  const response = await fetch(`/api/scheduler/history?limit=${limit}`);
  if (!response.ok) throw new Error(`Failed to fetch scheduler history`);
  const result = await response.json();
  return result.data;
}

export async function fetchSchedulerHealth(): Promise<SchedulerHealth> {
  const response = await fetch('/api/scheduler/health');
  if (!response.ok) throw new Error(`Failed to fetch scheduler health`);
  const result = await response.json();
  return result.data;
}
