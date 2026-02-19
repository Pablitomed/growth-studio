# 🚀 Growth Studio - Deploy no Coolify/Hostinger

## 📋 Pré-requisitos

- ✅ VPS Hostinger com Coolify instalado
- ✅ Acesso ao painel do Coolify
- ✅ Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🔧 Passo 1: Obter API Token do Coolify

1. Acesse o painel do Coolify:
   ```
   http://SEU-IP-VPS:8000
   ```

2. Vá em **Profile** (canto superior direito)

3. Clique em **API Tokens**

4. Clique em **Create Token**

5. Dê um nome (ex: "deploy-cli") e clique em **Create**

6. **Copie o token** (só aparece uma vez!)

---

## 🔧 Passo 2: Obter UUIDs

### Server UUID:
1. Vá em **Settings** → **Servers**
2. Clique no nome do seu servidor
3. Copie o **UUID**

### Project UUID:
1. Vá em **Projects**
2. Clique no projeto (ou crie um novo)
3. Copie o **UUID**

### App UUID (após criar a aplicação):
1. Vá em **Applications** dentro do projeto
2. Clique na aplicação
3. Vá em **Configuration** → **General**
4. Copie o **UUID**

---

## 🔧 Passo 3: Configurar o Script

```bash
# 1. Copie o arquivo de configuração
cp .coolify.env.example .coolify.env

# 2. Edite com seus dados
nano .coolify.env
```

Preencha:
```bash
COOLIFY_URL=http://SEU-IP-VPS:8000
COOLIFY_API_TOKEN=seu-token-copiado
COOLIFY_SERVER_UUID=uuid-do-servidor
COOLIFY_PROJECT_UUID=uuid-do-projeto
APP_URL=https://growth.seudominio.com
```

---

## 🚀 Passo 4: Deploy

### Opção A: Via Script CLI

```bash
# Dê permissão
chmod +x deploy-coolify.sh

# Setup inicial
./deploy-coolify.sh setup

# Deploy
./deploy-coolify.sh deploy
```

### Opção B: Via Painel Coolify (Manual)

1. **Acesse o Coolify** → **Projects** → **Seu Projeto**

2. **New Resource** → **Application**

3. **Escolha a fonte**:
   - **Git Repository**: Conecte seu GitHub/GitLab
   - **Public Git**: Cole a URL do repo

4. **Configure a aplicação**:

| Campo | Valor |
|-------|-------|
| Name | `growth-studio` |
| Repository | URL do seu Git |
| Branch | `main` |
| Build Pack | `Docker` |
| Dockerfile Location | `./Dockerfile` |
| Exposed Port | `3000` |

5. **Variáveis de Ambiente** (Environment):

```env
NODE_ENV=production
DATABASE_URL=file:/app/data/growth-studio.db
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
N8N_API_KEY=sua-chave
```

6. **Volumes Persistentes**:

| Name | Mount Path |
|------|------------|
| growth-data | `/app/data` |

7. **Clique em Save → Deploy**

---

## 🔗 Passo 5: Configurar Domínio (Opcional)

### No Coolify:

1. Vá na aplicação → **Configuration** → **Domains**

2. Adicione seu domínio:
   ```
   growth.seudominio.com
   ```

3. Marque **Generate SSL Certificate** (Let's Encrypt gratuito)

4. Clique em **Save**

### No DNS (Hostinger):

Adicione um registro A:

| Tipo | Nome | Valor |
|------|------|-------|
| A | growth | IP-DA-VPS |

---

## 🔄 Deploy Automático (Webhook)

### Configurar Webhook no GitHub:

1. Vá no seu repositório → **Settings** → **Webhooks**

2. **Add webhook**:
   - **Payload URL**: 
     ```
     https://SEU-COOLIFY/api/v1/webhooks/deploy?uuid=APP_UUID
     ```
   - **Content type**: `application/json`
   - **Secret**: (deixe vazio)
   - **Events**: Just the push event

3. **Add webhook**

Agora cada `git push` vai disparar deploy automático!

---

## 📊 Comandos Úteis

```bash
# Ver status
./deploy-coolify.sh status

# Ver logs
./deploy-coolify.sh logs

# Reiniciar aplicação
./deploy-coolify.sh restart

# Backup do banco
./deploy-coolify.sh backup

# Listar aplicações
./deploy-coolify.sh list
```

---

## ✅ Verificar Deploy

```bash
# Health check
curl http://SEU-IP:3000/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"...","service":"Growth Studio API"}
```

---

## 🆘 Troubleshooting

### Erro: "Application failed to start"

```bash
# Ver logs
./deploy-coolify.sh logs

# Ou no painel Coolify:
# Applications → growth-studio → Logs
```

### Erro: "Database not found"

```bash
# SSH na VPS
ssh root@SEU-IP

# Executar migrate
docker exec growth-studio bunx prisma db push
```

### Erro: "Port 3000 already in use"

```bash
# Verificar o que está usando
lsof -i :3000

# Parar container antigo
docker stop growth-studio
```

---

## 📱 Próximos Passos

1. ✅ Aplicação rodando em `http://SEU-IP:3000`
2. ⏳ Configure domínio com SSL
3. ⏳ Configure N8N (se necessário)
4. ⏳ Integre APIs (Meta, Google, TikTok)
5. ⏳ Crie clientes de produção
