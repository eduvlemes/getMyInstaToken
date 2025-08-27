@echo off
echo Gerando certificados SSL para localhost...
cd backend
call npm run generate-certs

echo.
echo Iniciando o servidor backend...
start cmd /k "cd backend && npm run dev"

echo.
echo Aguardando o backend iniciar (5 segundos)...
timeout /t 5 /nobreak > nul

echo.
echo Iniciando o frontend...
cd frontend
call npm run serve

echo.
echo Aplicação iniciada!
echo Backend: https://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo IMPORTANTE: Para que o Instagram aceite o callback, você precisa confiar no certificado SSL.
echo Visite https://localhost:5000/api/health em seu navegador e aceite o certificado como confiável.
