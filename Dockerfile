# Stage 1: Frontend builder
FROM node:22-slim AS frontend-builder

# Install dependencies in frontend directory
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./

# Build the frontend (outputs to /app/dist as per vite.config.ts)
RUN npm run build

# Stage 2: Node.js/Express runtime
FROM node:22-slim AS runtime
LABEL name="playwright-web-runner" \
      description="Web-based Playwright script runner with Express backend"
WORKDIR /app

# Install system dependencies required for Chromium/Playwright on Debian
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxinerama1 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxss1 \
    libnss3 \
    libnspr4 \
    libgconf-2-4 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgl1 \
    libdrm2 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy server dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Install Playwright browsers with dependencies
RUN npx playwright install chromium --with-deps

# Copy server source code
COPY app.js .
COPY core ./core

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Expose port
EXPOSE 8089

# Start the server
CMD ["node", "app.js"]
