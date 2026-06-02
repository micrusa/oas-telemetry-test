import { Context } from "@opentelemetry/api";
import {
  ReadableSpan,
  Span,
  SpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { execSync } from "child_process";

export class TestSpanProcessor implements SpanProcessor {
  forceFlush(): Promise<void> {
    execSync('notify-send "Force flushing"');
    return Promise.resolve();
  }
  onStart(span: Span, parentContext: Context): void {
    execSync(`notify-send "onStart span ${span.name}"`);
  }
  onEnding?(span: Span): void {
    execSync(`notify-send "onEnding span ${span.name}"`);
  }
  onEnd(span: ReadableSpan): void {
    execSync(`notify-send "onEnd span ${span.name}"`);
  }
  shutdown(): Promise<void> {
    execSync('notify-send "Shutdown span processor"');
    return Promise.resolve();
  }
}
