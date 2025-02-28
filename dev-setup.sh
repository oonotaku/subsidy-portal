#!/bin/bash

# バックエンド環境のセットアップ
echo "Setting up backend environment..."
python manage.py migrate
python manage.py create_test_user
python manage.py create_test_data

# 開発サーバー起動
echo "Starting development servers..."
python manage.py runserver &
cd frontend && npm run dev 