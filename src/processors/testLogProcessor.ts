import { Context } from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { InstrumentationScope } from "@opentelemetry/core";
import { LogRecordProcessor, SdkLogRecord } from "@opentelemetry/sdk-logs";
import { execSync } from "child_process";

export class TestLogProcessor implements LogRecordProcessor {
  count: number = 0;

  forceFlush(): Promise<void> {
    execSync('notify-send "Logs - Force flush"');
    return Promise.resolve();
  }
  onEmit(logRecord: SdkLogRecord, context?: Context): void {
    execSync(
      `notify-send "Log: onEmit: ${logRecord.severityText} ${logRecord.body?.toString().substring(0, 20)}"`,
    );
  }
  shutdown(): Promise<void> {
    execSync('notify-send "Logs - Shutdown"');
    return Promise.resolve();
  }

  enabled?(options: {
    context: Context;
    instrumentationScope: InstrumentationScope;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean {
    return this.count++ % 5 == 0;
  }
}
