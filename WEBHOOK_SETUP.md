# 🔗 Configuração de Webhooks - Mercado Pago

## 📋 Endpoints de Webhook Disponíveis

### **Webhook Principal**
```
POST https://seu-app.easypanel.app/api/subscription/webhook
```

### **Logs de Debug** (Protegido)
```
GET https://seu-app.easypanel.app/api/subscription/webhook/logs
```

## ⚙️ **Como Configurar no Mercado Pago**

### **1. Acessar o Painel do Mercado Pago**
1. Entre em https://www.mercadopago.com.br/developers
2. Vá em **Suas integrações** > **Aplicação**
3. Acesse **Webhooks**

### **2. Configurar Webhook**

#### **URL do Webhook:**
```
https://seu-app.easypanel.app/api/subscription/webhook
```

#### **Eventos para Configurar:**
- ✅ **Pagamentos** (`payment`)
- ✅ **Assinaturas** (`subscription_preapproval`) 
- ✅ **Pagamentos Autorizados** (`subscription_authorized_payment`)

#### **Versão da API:**
- Usar **v1** (mais estável para webhooks)

### **3. Configuração Detalhada**

```json
{
  "url": "https://seu-app.easypanel.app/api/subscription/webhook",
  "events": [
    "payment",
    "subscription_preapproval", 
    "subscription_authorized_payment"
  ],
  "version": "v1"
}
```

## 🔄 **Tipos de Webhooks Suportados**

### **1. Pagamento Único (`payment`)**
Disparado quando:
- Pagamento aprovado
- Pagamento rejeitado  
- Pagamento cancelado

**Processamento:**
- Registra o pagamento no banco
- Ativa/desativa assinatura conforme status
- Atualiza data de vencimento

### **2. Assinatura Recorrente (`subscription_preapproval`)**
Disparado quando:
- Assinatura autorizada
- Assinatura cancelada
- Assinatura pausada

**Processamento:**
- Atualiza status da assinatura
- Gerencia ciclo de cobrança recorrente

### **3. Pagamento Autorizado (`subscription_authorized_payment`)**
Disparado quando:
- Cobrança recorrente aprovada
- Cobrança recorrente falhou

**Processamento:**
- Registra pagamento recorrente
- Renova período da assinatura

## 🛠️ **Estrutura de Dados Recebidas**

### **Webhook de Pagamento:**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

### **Webhook de Assinatura:**
```json
{
  "type": "subscription_preapproval",
  "data": {
    "id": "preapproval_id_123"
  }
}
```

### **Webhook de Pagamento Autorizado:**
```json
{
  "type": "subscription_authorized_payment", 
  "data": {
    "id": "payment_id_456"
  }
}
```

## 🔍 **Como Testar**

### **1. Teste Local (ngrok)**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 5000

# URL temporária: https://abc123.ngrok.io
# Configurar: https://abc123.ngrok.io/api/subscription/webhook
```

### **2. Teste em Produção**
```bash
# URL de produção
https://seu-app.easypanel.app/api/subscription/webhook
```

### **3. Verificar Logs**
```bash
# Endpoint protegido para ver logs
GET https://seu-app.easypanel.app/api/subscription/webhook/logs
Authorization: Bearer SEU_JWT_TOKEN
```

## 🚨 **Troubleshooting**

### **Webhook não está sendo chamado:**
1. Verificar se a URL está acessível externamente
2. Confirmar se o HTTPS está configurado
3. Verificar logs do EasyPanel
4. Testar URL manualmente: `curl -X POST sua-url/webhook`

### **Webhook retornando erro:**
1. Verificar logs no endpoint `/webhook/logs`
2. Conferir se `DATABASE_URL` está correta
3. Verificar se as tabelas Prisma existem
4. Testar conexão com banco de dados

### **Assinatura não ativando:**
1. Verificar `external_reference` no pagamento
2. Confirmar formato: `user_id:123:plan_type:monthly`
3. Verificar se usuário existe no banco
4. Conferir status do pagamento no Mercado Pago

## 📊 **Monitoramento**

### **Logs Automáticos:**
- Todos os webhooks são logados no console
- Informações de pagamento são salvas no banco
- Erros são registrados com stack trace

### **Métricas Importantes:**
- Taxa de sucesso dos webhooks
- Tempo de resposta do endpoint
- Pagamentos processados vs. falhados
- Assinaturas ativas vs. canceladas

## 🔒 **Segurança**

### **Validação de Assinatura (Recomendado):**
```javascript
// Headers enviados pelo Mercado Pago
x-signature: hash_assinatura
x-request-id: id_unico_requisicao

// Validar usando secret do webhook
```

### **Proteções Implementadas:**
- ✅ Validação de dados obrigatórios
- ✅ Verificação de usuário existente
- ✅ Prevenção de processamento duplicado
- ✅ Logs detalhados para auditoria

## 🎯 **URLs de Configuração Final**

### **Produção:**
```
Webhook URL: https://seu-app.easypanel.app/api/subscription/webhook
Logs URL: https://seu-app.easypanel.app/api/subscription/webhook/logs
```

### **Sandbox/Teste:**
```
Webhook URL: https://seu-app-staging.easypanel.app/api/subscription/webhook  
```

---

💡 **Dica:** Sempre teste os webhooks primeiro em ambiente de sandbox antes de configurar em produção!
