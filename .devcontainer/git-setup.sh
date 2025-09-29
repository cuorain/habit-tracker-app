#!/bin/bash

# すべての既存のGit credential helperの設定を削除
git config --global --unset-all credential.helper

# storeヘルパーのみを設定
git config --global credential.helper store

# ワークスペースを安全なディレクトリとして追加
git config --global --add safe.directory /workspaces/habit-tracker-app

# Git認証情報ファイルのパーミッションを設定
if [ -f ~/.git-credentials ]; then
  chmod 600 ~/.git-credentials
  echo "Git credentials file permissions set to 600"
fi

# Git設定を表示
echo "Current Git configuration:"
git config --list

# Git secrets関連のエイリアスを削除（もし存在すれば）
if [ -f ~/.gitconfig ]; then
  sed -i '/secrets/d' ~/.gitconfig
  echo "Removed any 'secrets' references from .gitconfig"
fi

# Git設定ファイルのパーミッションを確認
if [ -f ~/.gitconfig ]; then
  chmod 600 ~/.gitconfig
  echo "Git config file permissions set to 600"
fi

echo "Git setup completed successfully!"