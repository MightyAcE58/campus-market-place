export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export const logger = {
  info(message: string, context: LogContext = {}) {
    console.log(
      JSON.stringify({
        level: "INFO",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
  warn(message: string, context: LogContext = {}) {
    console.warn(
      JSON.stringify({
        level: "WARN",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
  error(message: string, context: LogContext = {}) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
  debug(message: string, context: LogContext = {}) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        JSON.stringify({
          level: "DEBUG",
          timestamp: new Date().toISOString(),
          message,
          ...context,
        })
      );
    }
  },
};
