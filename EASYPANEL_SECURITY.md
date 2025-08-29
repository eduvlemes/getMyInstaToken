# EasyPanel Security Configuration

## ⚠️ IMPORTANTE: Como configurar variáveis de ambiente no EasyPanel

As variáveis sensíveis (secrets) devem ser configuradas **APENAS** na interface do EasyPanel, não como build arguments.

### 1. No EasyPanel Dashboard

1. Vá para seu projeto: `storeboost/get-my-token`
2. Clique em **Settings** → **Environment Variables**
3. Configure as variáveis **RUNTIME** (não build-time):

```
DATABASE_URL=postgres://postgres:instagramtoken!@12QW@easypanel.alpix.dev:5432/instagramtoken?sslmode=disable
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://storeboost-get-my-token.07h86n.easypanel.host
INSTAGRAM_CLIENT_ID=1271140675015743
INSTAGRAM_CLIENT_SECRET=a75c732e2073950f9a7cd7d20950dead
INSTAGRAM_REDIRECT_URI=https://storeboost-get-my-token.07h86n.easypanel.host/api/auth/instagram/callback
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
JWT_EXPIRES_IN=7d
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-5201520654528090-082708-2c7abbb5a3954b6520c6482cf08d1967-504308919
BACKEND_URL=https://storeboost-get-my-token.07h86n.easypanel.host
```

### 2. Configuração de Segurança

- ✅ **RUNTIME**: Variáveis disponíveis quando a aplicação roda
- ❌ **BUILD-TIME**: Variáveis expostas durante o build do Docker (inseguro)

### 3. Nixpacks Configuration

O arquivo `.nixpacks.toml` está configurado para:
- **Build Phase**: Apenas compilar frontend (sem secrets)
- **Start Phase**: Gerar Prisma client e iniciar servidor (com secrets)

### 4. Verificação

Após configurar as variáveis no EasyPanel:
1. O build não deve mostrar warnings de security
2. A aplicação deve iniciar corretamente
3. Teste: `https://storeboost-get-my-token.07h86n.easypanel.host/api/health`

## Arquivos de Segurança

- `.dockerignore`: Exclui arquivos sensíveis do build
- `.gitignore`: Impede commit de arquivos `.env`
- `.env.example`: Template seguro para desenvolvimento
