FROM node:18

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    lsb-release \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/habit-tracker-app/backend

COPY ./backend/package*.json ./

RUN npm install

# 所有者を変更
RUN mkdir -p /workspaces && chown -R node:node /workspaces

USER node

EXPOSE 8080

CMD ["npm", "run", "dev"]