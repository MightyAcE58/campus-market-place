FROM node:22-alpine AS builder

WORKDIR /app

# Copy server package files and prisma schema
COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN npm ci

COPY server/ ./
RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

COPY server/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
