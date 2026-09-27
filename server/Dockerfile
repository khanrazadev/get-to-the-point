FROM brainicism/bgutil-ytdlp-pot-provider:2.0.0 AS bgutil

FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        python3 \
        python3-pip \
        ca-certificates \
        curl \
        unzip \
    && pip3 install --break-system-packages \
        "yt-dlp[default]" \
        "bgutil-ytdlp-pot-provider==2.0.0" \
    && curl -fsSL https://deno.land/install.sh | sh \
    && ln -s /root/.deno/bin/deno /usr/local/bin/deno \
    && rm -rf /var/lib/apt/lists/*

COPY --from=bgutil /app /opt/bgutil

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "node /opt/bgutil/build/main.js --host 127.0.0.1 & exec npm start"]