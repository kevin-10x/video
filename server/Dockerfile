FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    ffmpeg

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]