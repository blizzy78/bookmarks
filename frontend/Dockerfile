FROM node:21.1.0-slim

ENV BACKEND_BASE_URI http://localhost:3000

ENV HOSTNAME 0.0.0.0
ENV PORT 3000
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

LABEL autoheal true
HEALTHCHECK --start-period=30s --interval=10s CMD curl -f "http://localhost:${PORT}" || exit 1

RUN apt update && apt install -y curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

CMD ["node", "server.js"]
