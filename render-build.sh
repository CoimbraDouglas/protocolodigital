#!/usr/bin/env bash
# Script de build executado pelo Render
set -o errexit

# 1. Build do frontend (gera frontend/dist)
cd frontend
npm install
npm run build
cd ..

# 2. Backend: dependencias + Prisma
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
cd ..
