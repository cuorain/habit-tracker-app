FROM node:18

# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    git \
    locales \
    git-secrets \
    sudo \
    lsof \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ロケール設定を完全に行う
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LANGUAGE=en_US:en

# Git設定 - rootユーザーとしての設定は行わない
# ユーザー固有の設定はpostCreateCommandで行う

WORKDIR /workspaces/habit-tracker-app/backend

COPY ./backend/package*.json ./

RUN npm install

# 所有者を変更
RUN mkdir -p /workspaces && chown -R node:node /workspaces

# nodeユーザーがパスワードなしでsudoを使えるようにする
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

USER node

EXPOSE 8080

CMD ["npm", "run", "dev"]