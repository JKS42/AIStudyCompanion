const MAX_SAMPLES = 200;
const latenciesMs = [];

export function recordLatency(ms) {
  latenciesMs.push(ms);
  if (latenciesMs.length > MAX_SAMPLES) {
    latenciesMs.shift();
  }
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function getLatencyStats() {
  return {
    count: latenciesMs.length,
    p50Ms: percentile(latenciesMs, 50),
    p95Ms: percentile(latenciesMs, 95),
    maxMs: latenciesMs.length ? Math.max(...latenciesMs) : 0
  };
}
