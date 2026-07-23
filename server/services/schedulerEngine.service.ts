import { getDatabase } from '../db/database';
import { 
  SchedulerConfig, 
  ScheduledJob, 
  JobExecutionRecord 
} from '../config/defaults';
import { 
  SchedulerConfigInput, 
  CreateScheduledJobInput, 
  UpdateScheduledJobInput 
} from '../models/scheduler.model';

class SchedulerEngineService {
  private tickerTimer: NodeJS.Timeout | null = null;
  private runningJobIds: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    // Background ticker starts on initialization
  }

  public async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[SchedulerEngineService] Initializing background scheduler ticker...');
    
    // Start interval ticker every 1000ms
    this.tickerTimer = setInterval(() => {
      this.evaluateAndRunJobs().catch(err => {
        console.error('[SchedulerEngineService] Error in ticker evaluation loop:', err);
      });
    }, 1000);

    // Initial check
    await this.evaluateAndRunJobs().catch(err => {
      console.error('[SchedulerEngineService] Error in initial evaluation:', err);
    });
  }

  public stopTicker() {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
      this.tickerTimer = null;
    }
    this.isInitialized = false;
  }

  // --- Configuration Management ---
  public async getConfig(): Promise<SchedulerConfig> {
    const db = await getDatabase();
    await db.read();
    return db.data.schedulerConfig;
  }

  public async updateConfig(input: SchedulerConfigInput): Promise<SchedulerConfig> {
    const db = await getDatabase();
    await db.read();

    const updated: SchedulerConfig = {
      ...db.data.schedulerConfig,
      ...input,
      updatedAt: new Date().toISOString()
    };

    db.data.schedulerConfig = updated;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Scheduler Engine parameters updated: Working window ${updated.startTime} - ${updated.endTime}, Poll interval ${updated.refreshInterval}s`,
      category: 'info'
    });

    await db.write();
    return updated;
  }

  // --- Scheduled Jobs Management ---
  public async getAllJobs(): Promise<ScheduledJob[]> {
    const db = await getDatabase();
    await db.read();
    return db.data.scheduledJobs || [];
  }

  public async getJobById(id: string): Promise<ScheduledJob | null> {
    const db = await getDatabase();
    await db.read();
    return (db.data.scheduledJobs || []).find(j => j.id === id) || null;
  }

  public async createJob(input: CreateScheduledJobInput): Promise<ScheduledJob> {
    const db = await getDatabase();
    await db.read();

    const now = new Date();
    const newJob: ScheduledJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: input.name,
      targetRuleId: input.targetRuleId || 'all',
      scheduleType: input.scheduleType || 'recurring',
      intervalSeconds: input.intervalSeconds || 4,
      cronExpression: input.cronExpression,
      oneTimeTime: input.oneTimeTime,
      status: input.enabled ? 'active' : 'paused',
      enabled: input.enabled ?? true,
      maxRetries: input.maxRetries ?? 3,
      retryCount: 0,
      retryDelaySeconds: input.retryDelaySeconds ?? 5,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      nextRunAt: new Date(now.getTime() + (input.intervalSeconds || 4) * 1000).toISOString(),
      createdAt: now.toISOString()
    };

    if (!db.data.scheduledJobs) {
      db.data.scheduledJobs = [];
    }

    db.data.scheduledJobs.unshift(newJob);

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `New Scheduled Job created: "${newJob.name}" (Interval: ${newJob.intervalSeconds}s)`,
      category: 'info'
    });

    await db.write();
    return newJob;
  }

  public async updateJob(id: string, input: UpdateScheduledJobInput): Promise<ScheduledJob> {
    const db = await getDatabase();
    await db.read();

    const index = (db.data.scheduledJobs || []).findIndex(j => j.id === id);
    if (index === -1) {
      const error: any = new Error(`Scheduled job with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const current = db.data.scheduledJobs[index];
    const updated: ScheduledJob = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString()
    };

    if (input.enabled !== undefined) {
      updated.status = input.enabled ? 'active' : 'paused';
    }

    db.data.scheduledJobs[index] = updated;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Scheduled Job "${updated.name}" settings updated.`,
      category: 'info'
    });

    await db.write();
    return updated;
  }

  public async pauseJob(id: string): Promise<ScheduledJob> {
    return this.updateJob(id, { enabled: false });
  }

  public async resumeJob(id: string): Promise<ScheduledJob> {
    const db = await getDatabase();
    await db.read();
    const index = (db.data.scheduledJobs || []).findIndex(j => j.id === id);
    if (index === -1) {
      const error: any = new Error(`Scheduled job with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const current = db.data.scheduledJobs[index];
    const updated: ScheduledJob = {
      ...current,
      enabled: true,
      status: 'active',
      nextRunAt: new Date(Date.now() + current.intervalSeconds * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.data.scheduledJobs[index] = updated;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Scheduled Job "${updated.name}" resumed.`,
      category: 'info'
    });

    await db.write();
    return updated;
  }

  public async deleteJob(id: string): Promise<ScheduledJob> {
    const db = await getDatabase();
    await db.read();

    const index = (db.data.scheduledJobs || []).findIndex(j => j.id === id);
    if (index === -1) {
      const error: any = new Error(`Scheduled job with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const removed = db.data.scheduledJobs[index];
    db.data.scheduledJobs.splice(index, 1);

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Scheduled Job "${removed.name}" deleted.`,
      category: 'warning'
    });

    await db.write();
    return removed;
  }

  // --- Execution & History ---
  public async getExecutionHistory(limit = 50): Promise<JobExecutionRecord[]> {
    const db = await getDatabase();
    await db.read();
    const history = db.data.jobExecutionHistory || [];
    return history.slice(0, limit);
  }

  public async triggerJobNow(id: string): Promise<JobExecutionRecord> {
    const db = await getDatabase();
    await db.read();

    const job = (db.data.scheduledJobs || []).find(j => j.id === id);
    if (!job) {
      const error: any = new Error(`Scheduled job with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    return await this.executeJob(job, true);
  }

  public async getHealthAndStatus() {
    const db = await getDatabase();
    await db.read();

    const config = db.data.schedulerConfig;
    const jobs = db.data.scheduledJobs || [];
    const history = db.data.jobExecutionHistory || [];

    const isInsideWindow = this.isCurrentlyInsideWindow(config);
    const activeJobsCount = jobs.filter(j => j.enabled && j.status === 'active').length;
    const totalExecutions = jobs.reduce((sum, j) => sum + j.totalExecutions, 0);
    const failedExecutions = jobs.reduce((sum, j) => sum + j.failedExecutions, 0);

    return {
      status: 'online',
      tickerActive: this.tickerTimer !== null,
      isInsideWorkingWindow: isInsideWindow,
      config,
      activeJobsCount,
      totalJobsCount: jobs.length,
      runningJobIds: Array.from(this.runningJobIds),
      totalExecutions,
      failedExecutions,
      recentHistory: history.slice(0, 10),
      timestamp: new Date().toISOString()
    };
  }

  // --- Working Window Helper ---
  public isCurrentlyInsideWindow(config: SchedulerConfig): boolean {
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];

    if (!config.workingDays.includes(currentDay)) {
      return false;
    }

    const [startH, startM] = config.startTime.split(':').map(Number);
    const [endH, endM] = config.endTime.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight window (e.g. 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  // --- Ticker Evaluation Loop ---
  private async evaluateAndRunJobs() {
    const db = await getDatabase();
    await db.read();

    const config = db.data.schedulerConfig;
    const isInsideWindow = this.isCurrentlyInsideWindow(config);

    // Auto-Start / Auto-Stop engine synchronization
    if (config.autoStop && !isInsideWindow) {
      if (db.data.engineState.isScanning) {
        db.data.engineState.isScanning = false;
        db.data.engineState.status = 'paused';
        db.data.activityEvents.push({
          id: `ev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: `Scheduler Engine auto-paused: Current time is outside active working hours (${config.startTime} - ${config.endTime}).`,
          category: 'warning'
        });
        await db.write();
      }
      return;
    }

    if (config.autoStart && isInsideWindow) {
      if (!db.data.engineState.isScanning && db.data.engineState.status === 'paused') {
        db.data.engineState.isScanning = true;
        db.data.engineState.status = 'scanning';
        db.data.activityEvents.push({
          id: `ev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: `Scheduler Engine auto-resumed: Entered active working hours window (${config.startTime} - ${config.endTime}).`,
          category: 'info'
        });
        await db.write();
      }
    }

    const now = new Date().getTime();
    const jobs = db.data.scheduledJobs || [];

    for (const job of jobs) {
      if (!job.enabled || job.status !== 'active') continue;
      if (this.runningJobIds.has(job.id)) continue;

      const nextRun = job.nextRunAt ? new Date(job.nextRunAt).getTime() : 0;
      if (now >= nextRun) {
        // Fire job in background safely
        this.executeJob(job, false).catch(err => {
          console.error(`[SchedulerEngineService] Error executing job ${job.id}:`, err);
        });
      }
    }
  }

  // --- Job Execution Workhorse ---
  private async executeJob(job: ScheduledJob, manualTrigger = false): Promise<JobExecutionRecord> {
    this.runningJobIds.add(job.id);
    const startTime = Date.now();

    try {
      const db = await getDatabase();
      await db.read();

      // Simulate real scraper/engine scan execution against active watchlist rules
      const activeWatchlist = (db.data.watchlist || []).filter(w => w.active);
      const catalog = db.data.recentItems || [];

      let matchedCount = 0;
      for (const rule of activeWatchlist) {
        const matches = catalog.filter(item => 
          item.title.toLowerCase().includes(rule.keyword.toLowerCase())
        );
        matchedCount += matches.length;
      }

      const durationMs = Date.now() - startTime;
      const executionRecord: JobExecutionRecord = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        jobId: job.id,
        jobName: job.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        durationMs,
        matchedCount,
        attemptNumber: job.retryCount + 1,
        details: `Polled target rules. Evaluated ${activeWatchlist.length} active watchlist keywords against catalog. Found ${matchedCount} match(es).`
      };

      // Update Job state
      const jobIndex = db.data.scheduledJobs.findIndex(j => j.id === job.id);
      if (jobIndex !== -1) {
        const j = db.data.scheduledJobs[jobIndex];
        j.totalExecutions += 1;
        j.successfulExecutions += 1;
        j.retryCount = 0;
        j.lastRunAt = new Date().toISOString();
        j.nextRunAt = new Date(Date.now() + (j.intervalSeconds || 4) * 1000).toISOString();
        if (j.scheduleType === 'one-time') {
          j.status = 'completed';
          j.enabled = false;
        }
        db.data.scheduledJobs[jobIndex] = j;
      }

      // Record in history (max 100 records)
      if (!db.data.jobExecutionHistory) {
        db.data.jobExecutionHistory = [];
      }
      db.data.jobExecutionHistory.unshift(executionRecord);
      if (db.data.jobExecutionHistory.length > 100) {
        db.data.jobExecutionHistory = db.data.jobExecutionHistory.slice(0, 100);
      }

      // Update engine scans count
      db.data.engineState.totalScans += 1;
      if (matchedCount > 0) {
        db.data.engineState.totalMatches += matchedCount;
      }

      await db.write();
      return executionRecord;

    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      const db = await getDatabase();
      await db.read();

      const jobIndex = db.data.scheduledJobs.findIndex(j => j.id === job.id);
      let isRetryable = false;

      if (jobIndex !== -1) {
        const j = db.data.scheduledJobs[jobIndex];
        j.totalExecutions += 1;
        j.failedExecutions += 1;
        j.lastError = error.message || 'Unknown execution failure';

        if (j.retryCount < j.maxRetries) {
          j.retryCount += 1;
          j.nextRunAt = new Date(Date.now() + j.retryDelaySeconds * 1000).toISOString();
          j.status = 'active';
          isRetryable = true;
        } else {
          j.status = 'failed';
          j.enabled = false;
        }
        db.data.scheduledJobs[jobIndex] = j;
      }

      const failureRecord: JobExecutionRecord = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        jobId: job.id,
        jobName: job.name,
        timestamp: new Date().toISOString(),
        status: isRetryable ? 'retrying' : 'failed',
        durationMs,
        matchedCount: 0,
        attemptNumber: (jobIndex !== -1 ? db.data.scheduledJobs[jobIndex].retryCount : 1),
        errorMessage: error.message || 'Job execution error'
      };

      if (!db.data.jobExecutionHistory) {
        db.data.jobExecutionHistory = [];
      }
      db.data.jobExecutionHistory.unshift(failureRecord);

      await db.write();
      return failureRecord;

    } finally {
      this.runningJobIds.delete(job.id);
    }
  }
}

export const schedulerEngineService = new SchedulerEngineService();
