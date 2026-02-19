# 🚀 Growth Studio - Guia Rápido Coolify

## ⚡ Setup Rápido (5 minutos)

### 1. Configure o arquivo
```bash
cp .coolify.env.example .coolify.env
nano .coolify.env
```

### 2. Preencha estes campos:
```bash
COOLIFY_URL=http://SEU-IP:8000
COOLIFY_API_TOKEN=seu-token
COOLIFY_SERVER_UUID=uuid-servidor
COOLIFY_PROJECT_UUID=uuid-projeto
APP_URL=http://SEU-IP:3000
```

### 3. Deploy!
```bash
chmod +x deploy-coolify.sh
./deploy-coolify.sh deploy
```

---

## 🔑 Obter Token no Coolify

```
Painel Coolify → Profile → API Tokens → Create Token
```

---

## 🔗 Deploy via Painel (Alternativa)

### New Resource → Application

| Configuração | Valor |
|--------------|-------|
| Repository | URL do Git |
| Branch | main |
| Build Pack | Docker |
| Dockerfile | ./Dockerfile |
| Port | 3000 |

### Environment Variables:
```env
NODE_ENV=production
DATABASE_URL=file:/app/data/growth-studio.db
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### Volume:
```
/app/data
```

---

## 📊 Comandos CLI

| Comando | Função |
|---------|--------|
| `./deploy-coolify.sh deploy` | Fazer deploy |
| `./deploy-coolify.sh status` | Ver status |
| `./deploy-coolify.sh logs` | Ver logs |
| `./deploy-coolify.sh restart` | Reiniciar |
| `./deploy-coolify.sh backup` | Backup banco |

---

## ✅ Verificar

```bash
curl http://SEU-IP:3000/api/health
# {"status":"ok"...}
```

---

## 🔄 Deploy Automático

### GitHub → Settings → Webhooks

**Payload URL:**
```
https://SEU-COOLIFY/api/v1/webhooks/deploy?uuid=APP_UUID
```

---

## 🆘 Problemas?

```bash
# Ver logs
./deploy-coolify.sh logs

# Ou SSH direto
ssh root@SEU-IP
docker logs growth-studio
```
