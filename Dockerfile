# ============================================
# Stage 1: Base — Node.js + system dependencies
# ============================================
FROM node:22-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    unixodbc \
    unixodbc-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ============================================
# Stage 2: Build — Install deps + compile
# ============================================
FROM base AS build

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# ============================================
# Stage 3: Production — Minimal runtime image
# ============================================
FROM node:22-slim AS production

# Install runtime-only system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    unixodbc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------
# IBM Informix ODBC Driver Installation
# -----------------------------------------------------------
# Option A (recommended): Embed the driver in the image.
#
# 1. Download the Informix Client SDK from IBM's website
# 2. Place the .tar.gz file at: docker/informix-csdk.tar.gz
# 3. Uncomment the lines below:
#
# COPY docker/informix-csdk.tar.gz /tmp/informix-csdk.tar.gz
# RUN mkdir -p /opt/informix && \
#     tar -xzf /tmp/informix-csdk.tar.gz -C /opt/informix && \
#     rm /tmp/informix-csdk.tar.gz
#
# ENV INFORMIXDIR=/opt/informix
# ENV LD_LIBRARY_PATH=$INFORMIXDIR/lib:$INFORMIXDIR/lib/esql:$LD_LIBRARY_PATH
# ENV PATH=$INFORMIXDIR/bin:$PATH
#
# RUN echo "[Informix]" > /etc/odbcinst.ini && \
#     echo "Description = IBM Informix ODBC Driver" >> /etc/odbcinst.ini && \
#     echo "Driver = /opt/informix/lib/cli/iclis09b.so" >> /etc/odbcinst.ini
# -----------------------------------------------------------
#
# Option B: Mount the driver from the host via docker-compose.
# See the volumes section in docker-compose.yml for details.
# -----------------------------------------------------------

WORKDIR /app

# Copy only production dependencies manifest
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only (includes native odbc rebuild)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    unixodbc-dev \
    && npm ci --omit=dev \
    && npx prisma generate \
    && apt-get purge -y build-essential python3 unixodbc-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Expose API port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3333/docs || exit 1

# Start the application
CMD ["node", "dist/main.js"]
