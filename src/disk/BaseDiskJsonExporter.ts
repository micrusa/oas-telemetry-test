import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { DiskJsonStreamWriter } from "./DiskJsonStreamWriter.js";

export type BaseExporterOptions = {
  directoryPath: string;
  flushIntervalMs?: number;
  batchSize?: number;
  maxSegmentBytes?: number;
};

export abstract class BaseDiskJsonExporter {
  protected readonly writer: DiskJsonStreamWriter;
  protected readonly flushIntervalMs: number;
  protected readonly batchSize: number;
  protected readonly rootKey: string;

  protected queuedRecords: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private flushing = false;

  constructor(rootKey: string, prefix: string, options: BaseExporterOptions) {
    this.rootKey = rootKey;
    this.flushIntervalMs = options.flushIntervalMs || 1000;
    this.batchSize = options.batchSize || 500;
    this.writer = new DiskJsonStreamWriter({
      directoryPath: options.directoryPath,
      segmentPrefix: prefix,
      maxSegmentBytes: options.maxSegmentBytes,
    });
  }

  protected addToQueue(records: any[]): void {
    if (records.length === 0) return;

    this.queuedRecords.push(...records);
    if (this.queuedRecords.length >= this.batchSize) {
      void this.flushPending();
    } else {
      this.scheduleFlush();
    }
  }

  public async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushPending(true);
  }

  public async forceFlush(): Promise<void> {
    await this.flushPending(true);
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flushPending(true);
    }, this.flushIntervalMs);
  }

  private async flushPending(forceAll = false): Promise<void> {
    if (this.flushing) return;
    if (this.queuedRecords.length === 0) return;

    this.flushing = true;
    try {
      while (this.queuedRecords.length > 0) {
        if (!forceAll && this.queuedRecords.length < this.batchSize) {
          this.scheduleFlush();
          break;
        }

        const size = forceAll ? this.queuedRecords.length : this.batchSize;
        const batch = this.queuedRecords.splice(0, size);

        // Agrega incrementalmente modificando los punteros del archivo directo en disco
        await this.writer.appendRecords(this.rootKey, batch);
      }
    } catch (error: any) {
      console.error(
        `[BaseDiskJsonExporter] Failed writing incremental JSON ${this.rootKey}: ${error?.message || error}`,
      );
    } finally {
      this.flushing = false;
    }
  }
}
