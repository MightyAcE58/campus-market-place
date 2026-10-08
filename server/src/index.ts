import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./db/prisma.js";

let server: ReturnType<typeof app.listen> | null = null;

if (!process.env.VERCEL) {
  server = app.listen(env.PORT, () => {
    logger.info(`Campus Commerce Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`, {
      port: env.PORT,
      env: env.NODE_ENV,
      url: env.APP_BASE_URL,
    });
  });

  async function shutdown(signal: string) {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed.");
        await prisma.$disconnect();
        logger.info("Prisma database disconnected.");
        process.exit(0);
      });
    }

    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export { app };
export default app;
