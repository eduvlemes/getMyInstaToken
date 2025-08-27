#!/bin/bash

# Script de deploy para EasyPanel
# Este script prepara a aplicação para deploy

echo "🚀 Preparando deploy para EasyPanel..."

# 1. Build das imagens Docker
echo "📦 Construindo imagens Docker..."

# Backend
echo "🔧 Building backend..."
cd backend
docker build -t getmyinstatoken-backend:latest .
cd ..

# Frontend  
echo "🎨 Building frontend..."
cd frontend
docker build -t getmyinstatoken-frontend:latest .
cd ..

echo "✅ Imagens Docker construídas com sucesso!"

# 2. Verificar se as imagens foram criadas
echo "🔍 Verificando imagens..."
docker images | grep getmyinstatoken

echo "📋 Próximos passos para EasyPanel:"
echo "1. Acesse seu painel EasyPanel"
echo "2. Crie um novo projeto"
echo "3. Configure as seguintes services:"
echo ""
echo "🗄️  DATABASE (PostgreSQL):"
echo "   - Service: PostgreSQL"
echo "   - Database: instagramtoken"
echo "   - Port: 5432"
echo ""
echo "🔧 BACKEND:"
echo "   - Type: Docker Image"
echo "   - Image: getmyinstatoken-backend:latest"
echo "   - Port: 5000"
echo "   - Environment Variables:"
echo "     DATABASE_URL=postgresql://user:password@postgres:5432/instagramtoken"
echo "     JWT_SECRET=your-jwt-secret"
echo "     INSTAGRAM_CLIENT_ID=your-instagram-client-id"
echo "     INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret"
echo "     MERCADO_PAGO_ACCESS_TOKEN=your-mercado-pago-token"
echo "     FRONTEND_URL=https://your-frontend-domain.com"
echo "     BACKEND_URL=https://your-backend-domain.com"
echo ""
echo "🎨 FRONTEND:"
echo "   - Type: Docker Image" 
echo "   - Image: getmyinstatoken-frontend:latest"
echo "   - Port: 80"
echo "   - Environment Variables:"
echo "     VUE_APP_API_URL=https://your-backend-domain.com"
echo ""
echo "🌐 Configure os domínios e SSL no EasyPanel"
echo "✅ Deploy concluído!"
