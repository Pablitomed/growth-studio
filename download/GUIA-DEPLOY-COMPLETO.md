# 🚀 Growth Studio - Guia Completo de Deploy

## Índice
1. [Preparar o Git](#1-preparar-o-git)
2. [Configurar VPS Hostinger](#2-configurar-vps-hostinger)
3. [Instalar Coolify](#3-instalar-coolify)
4. [Deploy da Aplicação](#4-deploy-da-aplicação)
5. [Integração N8N](#5-integração-n8n)
6. [Configurar Domínio](#6-configurar-domínio)

---

## 1. Preparar o Git

### Opção A: GitHub (Recomendado)

```bash
# 1. Crie um repositório no GitHub
# Acesse: https://github.com/new
# Nome: growth-studio
# Private: marque se quiser privado

# 2. No seu computador local (onde está o projeto)
cd /home/z/my-project

# 3. Inicializar git (se ainda não tiver)
git init

# 4. Adicionar todos os arquivos
git add .

# 5. Fazer commit
git commit -m "Initial commit - Growth Studio"

# 6. Conectar ao GitHub
git remote add origin https://github.com/SEU-USUARIO/growth-studio.git

# 7. Enviar para o GitHub
git branch -M main
git push -u origin main
```

### Opção B: Git na própria VPS (Mais simples)

```bash
# Na VPS, criar repositório bare
mkdir -p ~/repos/growth-studio.git
cd ~/repos/growth-studio.git
git init --bare

# No computador local
cd /home/z/my-project
git remote add vps ssh://root@SEU-IP-VPS/root/repos/growth-studio.git
git push vps main

# Na VPS, clonar para onde o Coolify vai acessar
cd /opt/coolify/applications
git clone ~/repos/growth-studio.git growth-studio
```

---

## 2. Configurar VPS Hostinger

### 2.1 Acessar a VPS via SSH

```bash
# No terminal do seu computador
ssh root@SEU-IP-VPS

# Ou use o terminal web da Hostinger no painel
```

### 2.2 Atualizar o Sistema

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git ufw
```

### 2.3 Configurar Firewall

```bash
# Permitir portas necessárias
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 3000    # Growth Studio
ufw allow 5678    # N8N (se usar container separado)
ufw allow 8000    # Coolify

# Ativar firewall
ufw enable
```

---

## 3. Instalar Coolify

### 3.1 Instalação Automática (Recomendado)

```bash
# Na VPS, execute:
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 3.2 Aguarde a instalação (2-5 minutos)

O script vai:
- Instalar Docker
- Instalar Docker Compose
- Configurar Coolify
- Criar SSL automático

### 3.3 Acessar o Coolify

```bash
# Após instalação, acesse no navegador:
http://SEU-IP-VPS:8000

# Anote a senha gerada (aparece no terminal)
```

---

## 4. Deploy da Aplicação

### Método 1: Via Git (Recomendado)

1. **No painel do Coolify**:
   - Clique em **"New Resource"**
   - Selecione **"Application"**
   - Escolha **"Git Repository"**

2. **Configurar fonte**:
   - Repository: `https://github.com/SEU-USUARIO/growth-studio`
   - Branch: `main`

3. **Configurar Build**:
   - Build Pack: `Docker`
   - Dockerfile Location: `./Dockerfile`

4. **Variáveis de ambiente** (clique em "Environment"):
   ```
   NEXT_PUBLIC_APP_URL=https://seu-dominio.com
   DATABASE_URL=file:/app/data/growth-studio.db
   N8N_API_KEY=sua-chave-secreta-aqui
   ```

5. **Configurar Volume** (para persistir dados):
   - Clique em "Volumes"
   - Add Volume: `/app/data`

6. **Deploy**:
   - Clique em **"Deploy"**
   - Aguarde 3-5 minutos

### Método 2: Via Docker Compose

1. **No painel do Coolify**:
   - Clique em **"New Resource"**
   - Selecione **"Service"**
   - Escolha **"Docker Compose"**

2. **Cole o conteúdo**:

```yaml
version: '3.8'

services:
  growth-studio:
    image: oven/bun:1.3.4-alpine
    container_name: growth-studio
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/growth-studio.db
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - N8N_API_KEY=${N8N_API_KEY}
    volumes:
      - growth-data:/app/data
    working_dir: /app
    command: sh -c "bun install && bunx prisma generate && bunx prisma db push && bun run build && bun run start"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  growth-data:
```

3. **Adicione as variáveis** e clique em **"Deploy"**

---

## 5. Integração N8N

### Opção A: N8N via Docker (no mesmo servidor)

```bash
# Na VPS
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n-data:/home/node/.n8n \
  -e N8N_HOST=seu-dominio.com \
  -e N8N_PROTOCOL=https \
  -e WEBHOOK_URL=https://seu-dominio.com/ \
  -e GENERIC_TIMEZONE=America/Sao_Paulo \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=sua-senha-segura \
  n8nio/n8n
```

### Opção B: Usar N8N Cloud ou N8N nativo da Hostinger

Se sua Hostinger já tem N8N instalado:
1. Anote a URL do seu N8N
2. Configure a variável `N8N_WEBHOOK_URL` no Growth Studio

### Importar Templates N8N

```bash
# 1. Acesse seu N8N
http://SEU-IP:5678

# 2. Clique em "Workflows" → "Import from File"

# 3. Importe os arquivos:
- n8n-templates/growth-studio-main.json
- n8n-templates/growth-studio-scheduler.json

# 4. Ative os workflows
```

---

## 6. Configurar Domínio

### 6.1 DNS (No painel da Hostinger)

Adicione registros DNS:

| Tipo  | Nome         | Valor           |
|-------|--------------|-----------------|
| A     | @            | SEU-IP-VPS      |
| A     | growth       | SEU-IP-VPS      |
| A     | n8n          | SEU-IP-VPS      |

### 6.2 SSL no Coolify

1. No Coolify, vá em **"Domains"**
2. Adicione: `growth.seudominio.com`
3. Clique em **"Generate SSL"** (Let's Encrypt gratuito)

### 6.3 Configurar Proxy Reverso

O Coolify faz isso automaticamente quando você:
1. Adiciona um domínio
2. Seleciona "Generate SSL"

---

## 📋 Checklist de Verificação

```bash
# 1. Verificar se containers estão rodando
docker ps

# Deve mostrar:
# - growth-studio (porta 3000)
# - n8n (porta 5678) se instalou

# 2. Testar API
curl http://localhost:3000/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"...","service":"Growth Studio API","version":"1.0.0"}

# 3. Verificar logs
docker logs growth-studio

# 4. Verificar banco de dados
docker exec growth-studio ls -la /app/data/
```

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker logs -f growth-studio

# Reiniciar aplicação
docker restart growth-studio

# Atualizar aplicação (após novo push no Git)
cd /opt/coolify/applications/growth-studio
git pull
docker-compose up -d --build

# Backup do banco
docker cp growth-studio:/app/data/growth-studio.db ./backup-$(date +%Y%m%d).db

# Restaurar banco
docker cp ./backup-20240115.db growth-studio:/app/data/growth-studio.db
docker restart growth-studio
```

---

## 🆘 Solução de Problemas

### Erro: Porta 3000 já em uso
```bash
# Verificar o que está usando
lsof -i :3000
# Matar processo
kill -9 <PID>
```

### Erro: Docker não inicia
```bash
# Reiniciar Docker
systemctl restart docker
```

### Erro: Banco de dados corrompido
```bash
# Restaurar do backup
docker cp ./backup.db growth-studio:/app/data/growth-studio.db
docker restart growth-studio
```

### Erro: Aplicação não carrega
```bash
# Verificar logs
docker logs growth-studio --tail 100

# Reconstruir
docker-compose down
docker-compose up -d --build
```

---

## 📞 Próximos Passos

1. ✅ Aplicação rodando em `http://SEU-IP:3000`
2. ✅ N8N rodando em `http://SEU-IP:5678`
3. ⏳ Configurar domínio com SSL
4. ⏳ Criar clientes de produção
5. ⏳ Integrar com Meta/Google/TikTok APIs

Precisa de ajuda com alguma etapa específica?
