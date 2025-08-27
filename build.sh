#!/bin/bash

echo "🚀 Building GetMyInstaToken for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm run install:all

# Build frontend
echo "🎨 Building frontend..."
npm run build:frontend

# Setup backend for production
echo "🔧 Setting up backend..."
npm run build:backend

# Copy frontend build to backend public folder
echo "📁 Copying frontend build to backend..."
if [ -d "backend/public" ]; then
    rm -rf backend/public
fi
cp -r frontend/dist backend/public

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run prisma:generate

echo "✅ Build completed!"
echo ""
echo "📋 Para deploy no EasyPanel:"
echo "1. Faça upload do projeto como repositório GitHub"
echo "2. Configure o EasyPanel para usar Node.js"
echo "3. Build Command: npm run build"
echo "4. Start Command: npm start"
echo "5. Configure as variáveis de ambiente"
echo ""
echo "🌐 O backend servirá tanto a API quanto o frontend em uma única porta!"
