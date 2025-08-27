# 📱 Deploy via GitHub → EasyPanel

## 🤔 **Monorepo vs Repositórios Separados**

### **✅ Monorepo (Recomendado)**
- **Vantagens**: 
  - Versionamento sincronizado
  - Deploy conjunto simplificado
  - Compartilhamento de configs
  - Menos repositórios para gerenciar

### **📂 Repositórios Separados**
- **Quando usar**: Equipes diferentes, deploy independente
- **Setup**: Dois repos separados com workflows próprios

---

## 🚀 **Opção 1: Monorepo (Um repositório)**

### **1. Setup Inicial**
```bash
cd c:\DevBox\getMyInstaToken

# Inicializar Git
git init
git add .
git commit -m "🎉 Initial commit - Instagram subscription system"

# Conectar ao GitHub
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken.git
git push -u origin main
```

### **2. EasyPanel Configuration**

#### **📊 Dashboard EasyPanel**
1. **New Project** → `instagram-token-system`
2. **Add Service** → **App** (para backend)
3. **Add Service** → **App** (para frontend)  
4. **Add Service** → **Database** → **PostgreSQL**

#### **🔧 Backend Service**
```yaml
Name: instagramtoken-backend
Source Type: GitHub Repository
Repository: https://github.com/SEU_USUARIO/getMyInstaToken
Build Context: ./backend
Dockerfile Path: ./backend/Dockerfile
Port: 5000
Auto Deploy: ✅ (on push to main)
```

#### **🎨 Frontend Service**
```yaml
Name: instagramtoken-frontend
Source Type: GitHub Repository  
Repository: https://github.com/SEU_USUARIO/getMyInstaToken
Build Context: ./frontend
Dockerfile Path: ./frontend/Dockerfile
Port: 80
Auto Deploy: ✅ (on push to main)
```

#### **🗄️ Database Service**
```yaml
Service: PostgreSQL
Name: instagramtoken-db
Database: instagramtoken
Username: postgres
Password: [gerar senha segura]
Port: 5432
```

### **3. Environment Variables**

#### **Backend (`instagramtoken-backend`)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:SUA_SENHA@instagramtoken-db:5432/instagramtoken?sslmode=disable
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
INSTAGRAM_CLIENT_ID=1271140675015743
INSTAGRAM_CLIENT_SECRET=a75c732e2073950f9a7cd7d20950dead
MERCADO_PAGO_ACCESS_TOKEN=SEU_TOKEN_MERCADO_PAGO_REAL
FRONTEND_URL=https://seu-frontend.easypanel.app
BACKEND_URL=https://seu-backend.easypanel.app
INSTAGRAM_REDIRECT_URI=https://seu-backend.easypanel.app/api/auth/instagram/callback
```

#### **Frontend (`instagramtoken-frontend`)**
```env
VUE_APP_API_URL=https://seu-backend.easypanel.app
```

---

## 🔄 **Opção 2: Repositórios Separados**

### **Backend Repository**
```bash
# Criar repo backend
cd c:\DevBox\getMyInstaToken\backend
git init
git add .
git commit -m "🔧 Backend - Instagram token API"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken-backend.git
git push -u origin main
```

### **Frontend Repository**  
```bash
# Criar repo frontend
cd c:\DevBox\getMyInstaToken\frontend
git init
git add .
git commit -m "🎨 Frontend - Instagram token UI"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken-frontend.git
git push -u origin main
```

### **EasyPanel Setup (Repos Separados)**
```yaml
# Backend Service
Repository: https://github.com/SEU_USUARIO/getMyInstaToken-backend
Build Context: ./
Dockerfile Path: ./Dockerfile

# Frontend Service  
Repository: https://github.com/SEU_USUARIO/getMyInstaToken-frontend
Build Context: ./
Dockerfile Path: ./Dockerfile
```

---

## ⚡ **Deploy Automático**

### **Trigger de Deploy**
```bash
# Qualquer push para main fará deploy automático
git add .
git commit -m "✨ Nova feature"
git push origin main
```

### **Workflow GitHub Actions** (Já configurado)
- ✅ Build automatizado
- ✅ Testes de health check
- ✅ Cache de Docker layers
- ✅ Deploy para EasyPanel

---

## 🔍 **Monitoramento**

### **Health Checks**
- Backend: `https://seu-backend.easypanel.app/health`
- Frontend: `https://seu-frontend.easypanel.app`
- Database: Automaticamente monitorado

### **Logs**
- Acessível via EasyPanel Dashboard
- Real-time logging
- Error tracking

---

## 🌐 **Domínios Customizados**

### **Configurar DNS**
```
A record: api.seudominio.com → IP-do-EasyPanel
A record: app.seudominio.com → IP-do-EasyPanel
```

### **SSL Certificate**
- Automático via Let's Encrypt
- Configurado no EasyPanel

---

## 🚨 **Troubleshooting**

### **Build Failed**
```bash
# Verificar Dockerfiles localmente
docker build -t test-backend ./backend
docker build -t test-frontend ./frontend
```

### **Deploy Failed**
- Verificar logs no EasyPanel
- Confirmar environment variables
- Testar health checks

### **Database Connection Failed**
- Verificar `DATABASE_URL`
- Confirmar se PostgreSQL está rodando
- Executar migrations: `npx prisma db push`

---

## ✅ **Checklist de Deploy**

- [ ] Código commitado no GitHub
- [ ] Secrets configurados no GitHub (se usando Actions)
- [ ] Services criados no EasyPanel
- [ ] Environment variables configuradas
- [ ] Database PostgreSQL criado
- [ ] Auto-deploy habilitado
- [ ] Domínios configurados
- [ ] SSL ativo
- [ ] Health checks passando
- [ ] Testes de login/pagamento funcionando

## 🎯 **Próximos Passos**
1. **Escolha**: Monorepo ou repos separados
2. **Crie** o(s) repositório(s) no GitHub  
3. **Configure** services no EasyPanel
4. **Teste** o deploy automático
5. **Configure** domínios e SSL
