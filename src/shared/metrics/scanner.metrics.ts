import { Histogram } from 'prom-client';

export const scannerRunDuration = new Histogram({
  name: 'scanner_run_duration_seconds',
  help: 'Duration of scanner run in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
});
