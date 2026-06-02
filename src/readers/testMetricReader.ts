import {
  AggregationOption,
  AggregationTemporality,
  AggregationType,
  CollectionResult,
  IMetricReader,
  InstrumentType,
  MetricProducer,
} from "@opentelemetry/sdk-metrics";
import {
  CollectionOptions,
  ShutdownOptions,
  ForceFlushOptions,
} from "@opentelemetry/sdk-metrics/build/src/types";
import { exec, execSync } from "child_process";
import e from "express";

export class TestMetricReader implements IMetricReader {
  metricProducer: MetricProducer | undefined;

  setMetricProducer(metricProducer: MetricProducer): void {
    this.metricProducer = metricProducer;
  }
  selectAggregation(instrumentType: InstrumentType): AggregationOption {
    execSync(`notify-send "Select aggregation ${instrumentType}"`);
    return { type: AggregationType.DEFAULT };
  }
  selectAggregationTemporality(
    instrumentType: InstrumentType,
  ): AggregationTemporality {
    execSync('notify-send "Select aggregation temporality"');
    return AggregationTemporality.CUMULATIVE;
  }
  selectCardinalityLimit(instrumentType: InstrumentType): number {
    execSync('notify-send "Select cardinality limit"');
    return 0;
  }
  collect(options?: CollectionOptions): Promise<CollectionResult> {
    execSync('notify-send "Collect metric reader"');
    if (!this.metricProducer) {
      throw new Error("MetricProducer not set.");
    }
    return this.metricProducer.collect(options);
  }
  shutdown(options?: ShutdownOptions): Promise<void> {
    execSync('notify-send "Shutdown metric reader"');
    return Promise.resolve();
  }
  forceFlush(options?: ForceFlushOptions): Promise<void> {
    execSync('notify-send "Force flush metric reader"');
    return Promise.resolve();
  }
}
