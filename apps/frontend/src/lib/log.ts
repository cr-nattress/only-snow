"use client";

interface LogEvent {
  event: string;
  properties?: Record<string, string>;
  timestamp: string;
}

let buffer: LogEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (buffer.length === 0) return;
  const events = buffer;
  buffer = [];

  const body = JSON.stringify({ events });

  // Use sendBeacon if available (works during page unload), else fetch
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/log", body);
  } else {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 5000);
}

export function log(event: string, properties?: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[log] ${event}`, properties ?? "");
  }

  buffer.push({
    event,
    properties,
    timestamp: new Date().toISOString(),
  });
  scheduleFlush();
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
