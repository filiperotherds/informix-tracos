FROM node:22-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    unixodbc \
    unixodbc-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS build

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:22-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    unixodbc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY docker/informix-csdk.tar.gz /tmp/informix-csdk.tar.gz
RUN mkdir -p /opt/informix && \
    tar -xzf /tmp/informix-csdk.tar.gz -C /opt/informix && \
    rm /tmp/informix-csdk.tar.gz

ENV INFORMIXDIR=/opt/informix
ENV LD_LIBRARY_PATH=$INFORMIXDIR/lib:$INFORMIXDIR/lib/esql:$LD_LIBRARY_PATH
ENV PATH=$INFORMIXDIR/bin:$PATH

RUN echo "[Informix]" > /etc/odbcinst.ini && \
    echo "Description = IBM Informix ODBC Driver" >> /etc/odbcinst.ini && \
    echo "Driver = /opt/informix/lib/cli/iclis09b.so" >> /etc/odbcinst.ini

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    unixodbc-dev \
    && npm ci --omit=dev \
    && npx prisma generate \
    && apt-get purge -y build-essential python3 unixodbc-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist

RUN groupadd --system appgroup && \
    useradd --system --gid appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3333/docs || exit 1

CMD ["node", "dist/main.js"]
