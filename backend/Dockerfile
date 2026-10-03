FROM node:24-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDeps like prisma CLI)
RUN npm install

# Copy Prisma schema and v7 config first so generate works
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the app
COPY . .

EXPOSE 5000

# Migrations are run at container startup via docker-compose command
CMD ["npm", "start"]
