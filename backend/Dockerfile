# Backend Dockerfile (used for api, socket server and persistence server)
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy backend sources
COPY . .

# Expose ports used by the backend processes (for docker-compose)
EXPOSE 3000 5001

# Default command can be overridden by docker-compose service command
CMD ["node", "server.js"]
