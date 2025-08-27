# GetMyInstaToken - Sistema de Monetização Instagram

Sistema completo de assinatura recorrente para tokens do Instagram usando Mercado Pago.

## 🚀 Deploy via GitHub + EasyPanel

### **Estrutura do Projeto (Monorepo)**
```
getMyInstaToken/
├── backend/          # API Node.js + Prisma
├── frontend/         # Vue.js SPA
├── .github/          # GitHub Actions
├── docker-compose.yml
└── README.md
```

# GetMyInstaToken - Sistema de Monetização Instagram

Sistema completo de assinatura recorrente para tokens do Instagram usando Mercado Pago.

## 🚀 Deploy Monorepo no EasyPanel (Node.js)

### **Estrutura do Projeto**
```
getMyInstaToken/
├── backend/          # API Node.js + Prisma + Serve Frontend
├── frontend/         # Vue.js SPA (build integrado ao backend)
├── package.json      # Monorepo root
├── build.sh          # Script de build
└── README.md
```

### **🔧 Configuração do Deploy**

#### **1. Preparar o Repositório GitHub**
```bash
cd c:\DevBox\getMyInstaToken
git init
git add .
git commit -m "🎉 Instagram subscription system - Monorepo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/getMyInstaToken.git
git push -u origin main
```

#### **2. Deploy no EasyPanel**

##### **App Configuration**
1. **New Project** → `instagram-token-system`
2. **Add Service** → **App** (Node.js)
3. **Add Service** → **Database** → **PostgreSQL**

##### **App Service Settings**
```yaml
Name: instagramtoken-app
Source Type: GitHub Repository
Repository: https://github.com/SEU_USUARIO/getMyInstaToken
Build Command: npm run build
Start Command: npm start
Port: 5000
Node Version: 18.x
Auto Deploy: ✅ (on push to main)
```

##### **Database Service**
```yaml
Service: PostgreSQL
Name: instagramtoken-db
Database: instagramtoken
Username: postgres
Password: [gerar senha segura]
Port: 5432
```

### **📋 Environment Variables**

#### **App Service Environment Variables**
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:SUA_SENHA@instagramtoken-db:5432/instagramtoken?sslmode=disable
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
INSTAGRAM_CLIENT_ID=1271140675015743
INSTAGRAM_CLIENT_SECRET=a75c732e2073950f9a7cd7d20950dead
MERCADO_PAGO_ACCESS_TOKEN=SEU_TOKEN_MERCADO_PAGO_REAL
FRONTEND_URL=https://seu-app.easypanel.app
BACKEND_URL=https://seu-app.easypanel.app
INSTAGRAM_REDIRECT_URI=https://seu-app.easypanel.app/api/auth/instagram/callback
```

### **🔄 Como funciona o Deploy**

1. **Push para GitHub** → Trigger automático no EasyPanel
2. **Build Process**:
   - `npm install` (instala dependências)
   - `npm run build` (builda frontend e configura backend)
   - Frontend compilado é servido pelo backend
3. **Single Service**: Uma única aplicação Node.js serve tudo
4. **Single Domain**: Frontend e API no mesmo domínio

### **🌐 Estrutura da Aplicação**
- **Frontend**: `https://seu-app.easypanel.app/`
- **API**: `https://seu-app.easypanel.app/api/`
- **Health Check**: `https://seu-app.easypanel.app/health`

### **📊 Vantagens do Monorepo**
✅ Um único serviço para gerenciar  
✅ Sem problemas de CORS  
✅ Deploy simplificado  
✅ Um único domínio  
✅ Menos configuração  
✅ Menos custos  

## Features

- Login with Instagram using OAuth 2.0
- Store user data and token in PostgreSQL database
- Automatically refresh tokens before expiration
- Generate a JavaScript snippet for easy token embedding in external websites
- View profile information and stats
- Secure token sharing via a JavaScript endpoint

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vue.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Instagram Graph API (OAuth 2.0)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL server
- Instagram Developer account and app

## Setup Instructions

### 1. Instagram App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/) and create a new app
2. Add Instagram Basic Display product to your app
3. Configure the app settings:
   - Valid OAuth Redirect URIs: `https://localhost:5000/api/auth/instagram/callback`
   - Deauthorize Callback URL: `https://localhost:5000/api/auth/instagram/deauthorize`
   - Data Deletion Request URL: `https://localhost:5000/api/auth/instagram/data-deletion`
   
   **IMPORTANTE**: O Instagram exige que os callbacks sejam HTTPS, mesmo em desenvolvimento local.
4. Note your Instagram App ID and App Secret

### 2. Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE instagramtoken;
```

### 3. Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` and update with your values
   - Update the Instagram app credentials and database connection
   - Certifique-se de usar `https` na URL de redirecionamento do Instagram:
     ```
     INSTAGRAM_REDIRECT_URI=https://localhost:5000/api/auth/instagram/callback
     ```

4. Gerar certificados SSL para HTTPS:

```bash
npm run generate-certs
```

5. Run database migrations:

```bash
npm run prisma:migrate
```

6. Start the backend server:

```bash
npm run dev
```

7. Visite `https://localhost:5000/ssl-setup` para instruções sobre como confiar no certificado SSL

### 4. Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
yarn install
```

3. Start the frontend development server:

```bash
yarn serve
```

## Usage

1. Para iniciar toda a aplicação de uma vez, você pode usar o script `start-app.bat`:

```bash
./start-app.bat
```

2. Abra seu navegador e acesse `https://localhost:5000/ssl-setup` para configurar o certificado SSL
3. Depois acesse `http://localhost:8080` para usar a aplicação
4. Clique em "Connect with Instagram" para autorizar sua conta Instagram
5. Após a autenticação bem-sucedida, você será redirecionado para sua página de perfil
6. Use a tag de script fornecida para incorporar seu token Instagram em qualquer site

## Token Usage Example

Once you have the token script embedded in your website:

```html
<script src="https://localhost:5000/api/user/{your_id}/token.js"></script>
```

You can use the token to fetch user media:

```javascript
async function fetchInstagramMedia() {
  const token = window.myInstagramToken;
  
  if (!token) {
    console.error('Instagram token not found');
    return;
  }
  
  try {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}`);
    const data = await response.json();
    
    // Process and display media
    console.log(data);
  } catch (error) {
    console.error('Error fetching Instagram media:', error);
  }
}

// Call when the page loads
document.addEventListener('DOMContentLoaded', fetchInstagramMedia);
```

## License

MIT
