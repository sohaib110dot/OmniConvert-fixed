FROM node:22-slim

WORKDIR /app

# sharp and other native modules may need certs on slim images
# TODO Phase 6 (FFmpeg): uncomment when audio/video converters are implemented:
#   apt-get install -y --no-install-recommends ffmpeg
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
