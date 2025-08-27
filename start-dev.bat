@echo off
echo 🚀 Iniciando GetMyInstaToken em modo desenvolvimento...
echo.

echo 📦 Instalando dependências...
call npm install

echo.
echo 🔧 Gerando Prisma client...
cd backend
call npx prisma generate
cd ..

echo.
echo 🌟 Iniciando aplicação...
echo 🎨 Frontend: http://localhost:8080
echo 🔧 Backend: http://localhost:5000
echo.

start npm run dev
pause
