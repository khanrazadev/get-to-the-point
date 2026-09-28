FROM denoland/deno:latest

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-pip \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --break-system-packages --no-cache-dir \
    "yt-dlp[default]" \
    "bgutil-ytdlp-pot-provider"

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "bgutil-ytdlp-pot-provider --host 0.0.0.0 --port 4416 & exec npm start"]