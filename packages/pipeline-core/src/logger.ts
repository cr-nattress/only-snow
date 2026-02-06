export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

/**
 * Structured JSON logger for GCP Cloud Functions.
 * GCP Cloud Logging parses JSON logs and extracts severity automatically.
 */
export const logger: Logger = {
  info(message: string, data?: Record<string, unknown>) {
    console.log(JSON.stringify({ severity: 'INFO', message, ...data }));
  },

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(JSON.stringify({ severity: 'WARNING', message, ...data }));
  },

  error(message: string, data?: Record<string, unknown>) {
    console.error(JSON.stringify({ severity: 'ERROR', message, ...data }));
  },
};
