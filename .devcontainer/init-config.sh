#!/bin/bash

# Git設定が存在しない場合はホストから設定をコピー
if [ ! -f ~/.gitconfig ]; then
  echo "Copying Git configuration..."
  if [ -f /home/node/.gitconfig ]; then
    cp /home/node/.gitconfig ~/.gitconfig
    # 'secrets' 関連の設定を削除
    sed -i '/secrets/d' ~/.gitconfig
  fi
fi

# Git認証情報ファイルの確認
if [ ! -f ~/.git-credentials ] && [ -f /home/node/.git-credentials ]; then
  echo "Copying Git credentials..."
  cp /home/node/.git-credentials ~/.git-credentials
  chmod 600 ~/.git-credentials
fi

# Cursor設定が存在しない場合はホストから設定をコピー
if [ ! -d ~/.cursor ]; then
  echo "Copying Cursor configuration..."
  if [ -d /home/node/.cursor ]; then
    cp -r /home/node/.cursor ~/.cursor
  fi
fi

# Git設定の初期化
echo "Initializing Git configuration..."
git config --global credential.helper store
git config --global --add safe.directory /workspaces/habit-tracker-app
git config --global --unset-all credential.helper gcm
git config --global --unset-all credential.helper manager
git config --global --unset-all credential.helper secrets


echo "Setup completed!"