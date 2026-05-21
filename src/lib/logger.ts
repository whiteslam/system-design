type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

function serializeError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { value: String(error) };
}

function log(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    message: payload.message,
    timestamp: new Date().toISOString(),
    ...(payload.context ? { context: payload.context } : {}),
    ...(payload.error ? { error: serializeError(payload.error) } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    if (level === "error" || level === "warn") {
      // Structured JSON for Vercel logs / future Sentry ingestion
      // eslint-disable-next-line no-console -- production observability sink
      console.error(JSON.stringify(entry));
    }
    return;
  }

  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.info;
  fn(entry);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log("info", { message, context }),
  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", { message, context }),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    log("error", { message, error, context }),
  debug: (message: string, context?: Record<string, unknown>) =>
    log("debug", { message, context }),
};

/** Report to Sentry/PostHog when DSN keys are configured */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  logger.error("Unhandled error", error, context);
  // Future: if (process.env.SENTRY_DSN) Sentry.captureException(error)
}
