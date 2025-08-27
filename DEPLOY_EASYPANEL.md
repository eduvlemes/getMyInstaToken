# 🚀 Guia de Deploy - GetMyInstaToken no EasyPanel

## Pré-requisitos
- Conta no EasyPanel
- Docker instalado localmente (para build das imagens)
- Acesso ao código da aplicação

## 📋 Passo a Passo

### 1. **Preparar o Ambiente**

#### **Opção A: Deploy via GitHub (Recomendado)**
```bash
# Clone/acesse o projeto
cd c:\DevBox\getMyInstaToken

# Setup Git e GitHub
git init
git add .
git commit -m "🎉 Instagram subscription system"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken.git
git push -u origin main
```

#### **Opção B: Deploy via Docker Images**
```bash
# Execute o script de deploy
bash deploy.sh
```

### 2. **Configurar no EasyPanel**

#### 🗄️ **A. Criar Database (PostgreSQL)**
1. Acesse seu painel EasyPanel
2. Crie um novo **Service** > **Database** > **PostgreSQL**
3. Configure:
   - **Name**: `instagramtoken-db`
   - **Database**: `instagramtoken`
   - **Username**: `postgres`
   - **Password**: (gere uma senha segura)
   - **Port**: `5432`

#### 🔧 **B. Deploy do Backend**

##### **Via GitHub Repository (Recomendado)**
1. Crie um novo **Service** > **App**
2. Configure:
   - **Name**: `instagramtoken-backend`
   - **Source**: **GitHub Repository**
   - **Repository**: `https://github.com/SEU_USUARIO/getMyInstaToken`
   - **Build Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Port**: `5000`
   - **Auto Deploy**: ✅ (on push to main)

##### **Via Docker Image**
1. Crie um novo **Service** > **App**
2. Configure:
   - **Name**: `instagramtoken-backend`
   - **Source**: Upload Docker Image
   - **Image**: `getmyinstatoken-backend:latest`
   - **Port**: `5000`

3. **Environment Variables**:
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:senha@instagramtoken-db:5432/instagramtoken?sslmode=disable
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
INSTAGRAM_CLIENT_ID=1271140675015743
INSTAGRAM_CLIENT_SECRET=a75c732e2073950f9a7cd7d20950dead
MERCADO_PAGO_ACCESS_TOKEN=seu-token-real-aqui
FRONTEND_URL=https://seu-frontend-domain.easypanel.app
BACKEND_URL=https://seu-backend-domain.easypanel.app
INSTAGRAM_REDIRECT_URI=https://seu-backend-domain.easypanel.app/api/auth/instagram/callback
```

4. **Domínio**: Configure um subdomínio (ex: `api.seuapp.com`)

#### 🎨 **C. Deploy do Frontend**

##### **Via GitHub Repository (Recomendado)**
1. Crie um novo **Service** > **App**
2. Configure:
   - **Name**: `instagramtoken-frontend`
   - **Source**: **GitHub Repository**
   - **Repository**: `https://github.com/SEU_USUARIO/getMyInstaToken`
   - **Build Context**: `./frontend`
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Port**: `80`
   - **Auto Deploy**: ✅ (on push to main)

##### **Via Docker Image**
1. Crie um novo **Service** > **App**
2. Configure:
   - **Name**: `instagramtoken-frontend`
   - **Source**: Upload Docker Image  
   - **Image**: `getmyinstatoken-frontend:latest`
   - **Port**: `80`

3. **Environment Variables**:
```env
VUE_APP_API_URL=https://seu-backend-domain.easypanel.app
```

4. **Domínio**: Configure um subdomínio (ex: `app.seuapp.com`)

### 3. **Configurar SSL**
- EasyPanel automaticamente configura SSL via Let's Encrypt
- Certifique-se de que os domínios estão apontando corretamente

### 4. **Executar Migrações do Banco**
```bash
# Conecte no container do backend e execute:
npx prisma db push
npx prisma db seed
```

### 5. **Verificar Deployment**
- Backend Health Check: `https://seu-backend-domain.easypanel.app/health`
- Frontend: `https://seu-frontend-domain.easypanel.app`

## 🔧 Configurações Adicionais

### **Variáveis de Ambiente Importantes**
- `MERCADO_PAGO_ACCESS_TOKEN`: Token real do Mercado Pago
- `INSTAGRAM_CLIENT_ID/SECRET`: Credenciais do Facebook Developers
- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT

### **Monitoramento**
- Health checks configurados automaticamente
- Logs disponíveis no painel EasyPanel
- Métricas de CPU/RAM/Storage

### **Backup**
- Configure backup automático do PostgreSQL no EasyPanel
- Exporte dados importantes regularmente

## 🚨 Troubleshooting

### **Problema: Database Connection Failed**
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` 
- Execute `npx prisma db push` se necessário

### **Problema: CORS Errors**
- Verifique se `FRONTEND_URL` está correto no backend
- Confirme se `VUE_APP_API_URL` está correto no frontend

### **Problema: Instagram Login Failed**  
- Verifique `INSTAGRAM_REDIRECT_URI` no backend
- Confirme configurações no Facebook Developers
- URLs devem usar HTTPS em produção

## 📞 **Suporte**
- Documentação EasyPanel: https://easypanel.io/docs
- Logs de aplicação disponíveis no dashboard
- Health checks em: `/health` e `/api/health`

## ✅ **Checklist Final**
- [ ] PostgreSQL configurado e rodando
- [ ] Backend deployado com health check OK
- [ ] Frontend deployado e acessível  
- [ ] SSL configurado para ambos domínios
- [ ] Variáveis de ambiente configuradas
- [ ] Instagram OAuth funcionando
- [ ] Mercado Pago configurado
- [ ] Migrations executadas
- [ ] Testes de login/assinatura funcionando
