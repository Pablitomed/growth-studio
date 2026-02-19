# 🚀 Growth Studio - Deploy CLI

## Instalação Rápida

```bash
# 1. Copie o arquivo de configuração
cp .deploy.env.example .deploy.env

# 2. Edite com seus dados
nano .deploy.env

# 3. Dê permissão ao script
chmod +x deploy-cli.sh

# 4. Execute!
./deploy-cli.sh deploy
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `deploy` | Deploy completo na VPS |
| `build` | Build local apenas |
| `status` | Status dos serviços |
| `logs` | Ver logs da aplicação |
| `backup` | Backup do banco de dados |
| `restore` | Restaurar backup |
| `setup-vps` | Configurar VPS pela primeira vez |
| `setup-n8n` | Configurar N8N |
| `ssh` | Abrir SSH interativo |

## Fluxo Completo

### Primeira vez:

```bash
# 1. Configure a VPS
./deploy-cli.sh setup-vps --vps-ip SEU_IP

# 2. Configure o N8N
./deploy-cli.sh setup-n8n

# 3. Faça o deploy
./deploy-cli.sh deploy
```

### Atualizações:

```bash
# Deploy simples
./deploy-cli.sh deploy

# Verificar status
./deploy-cli.sh status

# Ver logs em tempo real
./deploy-cli.sh logs --follow
```

### Backup e Restore:

```bash
# Fazer backup e baixar para máquina local
./deploy-cli.sh backup --download

# Restaurar backup específico
./deploy-cli.sh restore backups/growth-studio-backup-20240115.db
```

## CI/CD Automático

O GitHub Actions está configurado para:

1. **Build & Test** a cada push
2. **Docker Build** e push para GitHub Container Registry
3. **Deploy automático** na VPS após merge na main
4. **Health Check** automático
5. **Notificação** via Slack (opcional)

### Secrets Necessários no GitHub:

| Secret | Descrição |
|--------|-----------|
| `VPS_IP` | IP da sua VPS |
| `VPS_USER` | Usuário SSH (geralmente `root`) |
| `VPS_SSH_KEY` | Chave SSH privada |
| `APP_URL` | URL da aplicação |
| `N8N_URL` | URL do N8N |
| `N8N_API_KEY` | API Key do N8N |
| `SLACK_WEBHOOK` | Webhook do Slack (opcional) |

### Configurar Secrets:

1. Vá em Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret

## Exemplo de .deploy.env

```bash
# VPS Configuration
VPS_IP=192.168.1.100
VPS_USER=root
VPS_KEY=~/.ssh/id_rsa

# Application
APP_URL=https://growth.seudominio.com

# N8N
N8N_URL=https://n8n.seudominio.com
N8N_API_KEY=sua-chave-secreta
```

## Troubleshooting

### Erro de SSH:
```bash
# Gere uma chave SSH
ssh-keygen -t rsa -b 4096

# Copie para a VPS
ssh-copy-id root@SEU_IP

# Teste a conexão
ssh root@SEU_IP
```

### Erro de Docker:
```bash
# Verifique se Docker está rodando
systemctl status docker

# Reinicie Docker
systemctl restart docker
```

### Ver logs detalhados:
```bash
./deploy-cli.sh logs --follow
```
