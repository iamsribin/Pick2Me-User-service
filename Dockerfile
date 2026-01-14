# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build


# FROM node:20-alpine

# WORKDIR /app

# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/dist ./dist

# EXPOSE 3001

# CMD ["node", "dist/server.js"]


FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3001

COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]
