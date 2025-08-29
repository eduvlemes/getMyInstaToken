# 🚀 Guia de Deploy - GetMyInstaToken no EasyPanel (Monorepo Node.js)

## Pré-requisitos
- Conta no EasyPanel
- Repositório GitHub
- Acesso ao código da aplicação

## 📋 Passo a Passo

### 1. **Preparar o Repositório GitHub**
```bash
cd c:\DevBox\getMyInstaToken
git init
git add .
git commit -m "🎉 Instagram subscription system - Monorepo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken.git
git push -u origin main
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

#### 🔧 **B. Criar App Service (Node.js)**
1. Crie um novo **Service** > **App**
2. Configure:
   - **Name**: `instagramtoken-app`
   - **Source**: **GitHub Repository**
   - **Repository**: `https://github.com/SEU_USUARIO/getMyInstaToken`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `5000`
   - **Node Version**: `18.x`
   - **Auto Deploy**: ✅ (on push to main)

3. **Environment Variables**:

4. **Domínio**: Configure um subdomínio (ex: `instagramtoken.easypanel.app`)

### 3. **Como Funciona**
- **Single Service**: Uma única aplicação Node.js
- **Frontend**: Servido estaticamente pelo backend em `/`
- **API**: Disponível em `/api/*`
- **Database**: PostgreSQL separado
- **Build Process**: Frontend compilado é integrado ao backend

### 4. **Verificar Deployment**
- **App completa**: `https://seu-app.easypanel.app/`
- **API Health Check**: `https://seu-app.easypanel.app/health`
- **Login Instagram**: `https://seu-app.easypanel.app/api/auth/instagram`

## 🔧 Configurações Adicionais

### **Variáveis de Ambiente Importantes**
- `MERCADO_PAGO_ACCESS_TOKEN`: Token real do Mercado Pago
- `INSTAGRAM_CLIENT_ID/SECRET`: Credenciais do Facebook Developers
- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT

### **Estrutura de URLs**
```
https://seu-app.easypanel.app/          → Frontend (Vue.js)
https://seu-app.easypanel.app/api/      → Backend API
https://seu-app.easypanel.app/health    → Health Check
```

### **Monitoramento**
- Health checks configurados automaticamente
- Logs disponíveis no painel EasyPanel
- Métricas de CPU/RAM/Storage em uma única aplicação

### **Backup**
- Configure backup automático do PostgreSQL no EasyPanel
- Exporte dados importantes regularmente

## 🚨 Troubleshooting

### **Problema: Build Failed**
- Verifique se `npm run build` funciona localmente
- Confirme se todas as dependências estão no package.json
- Verifique logs de build no EasyPanel

### **Problema: App não inicia**
- Verifique se `npm start` funciona localmente
- Confirme a `DATABASE_URL`
- Execute `npx prisma generate` se necessário

### **Problema: Database Connection Failed**
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` 
- Execute `npm run prisma:push` se necessário

### **Problema: Frontend não carrega**
- Verifique se o build foi executado corretamente
- Confirme se a pasta `backend/public` foi criada
- Verifique logs do servidor

### **Problema: Instagram Login Failed**  
- Verifique `INSTAGRAM_REDIRECT_URI` no backend
- Confirme configurações no Facebook Developers
- URLs devem usar HTTPS em produção

## 📞 **Suporte**
- Documentação EasyPanel: https://easypanel.io/docs
- Logs de aplicação disponíveis no dashboard
- Health checks em: `/health`

## ✅ **Checklist Final**
- [ ] Repositório GitHub configurado
- [ ] PostgreSQL criado e rodando
- [ ] App service deployado com health check OK
- [ ] SSL configurado para o domínio
- [ ] Variáveis de ambiente configuradas
- [ ] Instagram OAuth funcionando
- [ ] Mercado Pago configurado
- [ ] Migrations executadas
- [ ] Frontend carregando corretamente
- [ ] API funcionando
- [ ] Testes de login/assinatura funcionando

## 🎯 **Vantagens do Monorepo**
✅ Um único serviço para gerenciar  
✅ Sem problemas de CORS  
✅ Deploy simplificado  
✅ Um único domínio  
✅ Menos configuração  
✅ Menos custos

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
