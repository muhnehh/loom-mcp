# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S loom && \
    adduser -S loom -u 1001

COPY --from=builder --chown=loom:loom /app/dist ./dist
COPY --from=builder --chown=loom:loom /app/prompts ./prompts
COPY --from=builder --chown=loom:loom /app/packs ./packs
COPY --from=builder --chown=loom:loom /app/node_modules ./node_modules
COPY --from=builder --chown=loom:loom /app/package.json ./package.json

USER loom
EXPOSE 2337

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:2337/health || exit 1

ENTRYPOINT ["node", "dist/index.js"]
CMD ["start"]