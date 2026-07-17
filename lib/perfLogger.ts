/**
 * Performance Logger for SSS Boutique
 * Logs query durations and failures for monitoring.
 */

export function perfLog(
  queryName: string,
  startTime: number,
  success: boolean,
  error?: unknown
) {
  const duration = Date.now() - startTime;
  const status = success ? "✓" : "✗";
  const emoji = success ? "" : " ⚠";

  if (success) {
    if (duration > 2000) {
      console.warn(`[PERF]${emoji} ${queryName}: ${duration}ms ${status} (SLOW)`);
    } else {
      console.log(`[PERF] ${queryName}: ${duration}ms ${status}`);
    }
  } else {
    console.error(
      `[PERF]${emoji} ${queryName}: ${duration}ms ${status}`,
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Wraps an async function with performance logging.
 */
export async function withPerfLog<T>(
  queryName: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    perfLog(queryName, start, true);
    return result;
  } catch (error) {
    perfLog(queryName, start, false, error);
    return fallback;
  }
}
