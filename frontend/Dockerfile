# -------- Build Stage --------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and config files
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:9001/api
ARG NEXT_PUBLIC_APP_URL=http://localhost:9000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build Next.js application
RUN npm run build

# -------- Production Stage --------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
# Copy .next directory (includes .next/static)
COPY --from=builder /app/.next ./.next
# Copy public directory (may be empty but required)
COPY --from=builder /app/public ./public
# Copy Next.js config
COPY --from=builder /app/next.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S nextjs -u 1001 -G appgroup

# Change ownership of app directory
RUN chown -R nextjs:appgroup /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
