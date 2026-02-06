export interface PipelineMetrics {
  pipeline: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  itemsProcessed: number;
  rowsUpserted: number;
  errors: number;
  warnings: number;
}

/** Promise-based delay for rate limiting between API calls */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process items in batches with a delay between each item.
 * Returns results and any errors encountered.
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: { delayMs?: number; onError?: (item: T, error: unknown) => void } = {},
): Promise<{ results: R[]; errors: Array<{ item: T; error: unknown }> }> {
  const { delayMs = 200, onError } = options;
  const results: R[] = [];
  const errors: Array<{ item: T; error: unknown }> = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processor(items[i], i);
      results.push(result);
    } catch (error) {
      errors.push({ item: items[i], error });
      onError?.(items[i], error);
    }

    if (delayMs > 0 && i < items.length - 1) {
      await delay(delayMs);
    }
  }

  return { results, errors };
}
