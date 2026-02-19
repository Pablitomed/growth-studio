# 🚀 Growth Studio - Deploy Rápido

## Método 1: Deploy CLI (Mais Simples)

```bash
# 1. Configure o arquivo
cp .deploy.env.example .deploy.env
nano .deploy.env  # Edite com IP da sua VPS

# 2. Execute o deploy
chmod +x deploy-cli.sh
./deploy-cli.sh setup-vps    # Primeira vez
./deploy-cli.sh deploy       # Deploy completo
./deploy-cli.sh status       # Verificar status
```

## Método 2: CI/CD Automático (GitHub Actions)

### 2.1 Configurar Secrets no GitHub

Vá em: **Settings → Secrets and variables → Actions**

| Secret | Valor |
|--------|-------|
| `VPS_IP` | IP da sua VPS |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Sua chave SSH privada |
| `APP_URL` | `https://seu-dominio.com` |
| `N8N_API_KEY` | Chave de API do N8N |

### 2.2 Push e Deploy Automático

```bash
git add .
git commit -m "Update"
git push origin main
# Deploy acontece automaticamente!
```

## Método 3: Docker Compose Manual

```bash
# Na VPS
curl -L https://github.com/seu-usuario/growth-studio/archive/main.tar.gz | tar xz
cd growth-studio-main
docker-compose up -d
```

## Comandos Úteis

```bash
# Ver logs
./deploy-cli.sh logs --follow

# Fazer backup
./deploy-cli.sh backup --download

# Acessar SSH
./deploy-cli.sh ssh

# Ver status
./deploy-cli.sh status
```

## Após o Deploy

1. Acesse: `http://SEU_IP:3000`
2. Crie um cliente de teste
3. Acesse o link do cliente para ver o portal HITL
