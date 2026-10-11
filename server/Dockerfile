FROM docker.io/library/node:20-alpine

WORKDIR /app/server

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Overrides "download_folder" from config.json, mounted as a volume by docker-compose
ENV DOWNLOAD_FOLDER=/downloads

EXPOSE 3000
CMD ["node", "server.js"]
