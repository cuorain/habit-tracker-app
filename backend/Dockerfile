### Description: Habit Tracker Backendアプリケーション用のDockerイメージを構築するためのDockerfileです。

# ベースイメージとしてNode.js 18を使用
FROM node:22

# 必要なシステムパッケージのインストール
# curl: ネットワークリクエストのため
# git: ソースコード管理のため
# locales: ロケール設定のため
# git-secrets: Gitリポジトリで機密情報を検出するため
# sudo: 権限昇格のため
# lsof: 開いているファイルを一覧表示するため
RUN apt-get update && apt-get install -y \
    curl \
    git \
    locales \
    git-secrets \
    sudo \
    lsof \
    # キャッシュをクリアしてイメージサイズを削減
    && apt-get clean \ 
    # APTリストを削除してさらにイメージサイズを削減
    && rm -rf /var/lib/apt/lists/* 

# ロケール設定を完全に行う。UTF-8を有効にし、英語ロケールをデフォルトに設定。
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LANGUAGE=en_US:en

# Git設定 - rootユーザーとしての設定は行わない
# ユーザー固有の設定はpostCreateCommandで行う

# アプリケーションの作業ディレクトリを設定
WORKDIR /workspaces/habit-tracker-app/backend

COPY ./backend/package*.json ./

# 依存関係をインストール
RUN npm install

# 所有者を変更: /workspaces ディレクトリをnodeユーザーが所有するように設定
RUN mkdir -p /workspaces && chown -R node:node /workspaces

# nodeユーザーがパスワードなしでsudoを使えるようにする。開発環境でdockerコマンド利用のため。
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# ユーザーをnodeに変更して、セキュリティを向上
USER node

# アプリケーションがリッスンするポートを公開
EXPOSE 8080

# コンテナ起動時に実行されるコマンド。開発サーバーを起動。
CMD ["npm", "run", "dev"]