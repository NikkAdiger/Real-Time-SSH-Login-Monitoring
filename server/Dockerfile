# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /opt

# Update, install dependencies
RUN apk update

# Cache dependencies
COPY package*.json ./
RUN npm ci

# Build source code
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Main
FROM node:18-alpine

WORKDIR /opt

# Copy required files and folders from the builder stage
COPY --from=builder /opt/dist ./dist
COPY --from=builder /opt/node_modules ./node_modules
COPY --from=builder /opt/package*.json \
					/opt/ormconfig.docker.js \
					./

CMD ["npm", "run", "start:prod"]
EXPOSE 3010