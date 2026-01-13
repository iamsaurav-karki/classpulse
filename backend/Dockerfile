# -------- Build Stage --------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and TypeScript config
COPY package*.json tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# -------- Production Stage --------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Create upload directories (will be mounted as volume in production)
RUN mkdir -p uploads/images uploads/documents uploads/profiles && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 9001

CMD ["node", "dist/server.js"]
