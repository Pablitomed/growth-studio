#!/bin/bash

# ================================================
# Growth Studio - Deploy CLI
# Uso: ./deploy-cli.sh [comando] [opções]
# ================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações (pode ser sobrescrito por .env ou argumentos)
CONFIG_FILE=".deploy.env"
LOG_FILE="deploy.log"

# Carregar configurações
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        export $(cat $CONFIG_FILE | grep -v '^#' | xargs)
    fi
}

# Log
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" >> $LOG_FILE
    
    case $level in
        INFO)  echo -e "${BLUE}ℹ ${message}${NC}" ;;
        SUCCESS) echo -e "${GREEN}✓ ${message}${NC}" ;;
        WARNING) echo -e "${YELLOW}⚠ ${message}${NC}" ;;
        ERROR) echo -e "${RED}✗ ${message}${NC}" ;;
        DEPLOY) echo -e "${PURPLE}🚀 ${message}${NC}" ;;
    esac
}

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║          🚀 Growth Studio - Deploy CLI v1.0                  ║"
    echo "║                                                               ║"
    echo "║  Sistema Agêntico de Marketing com HITL                      ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Ajuda
show_help() {
    show_banner
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./deploy-cli.sh [comando] [opções]"
    echo ""
    echo -e "${YELLOW}Comandos:${NC}"
    echo ""
    echo -e "  ${GREEN}deploy${NC}        Faz deploy completo na VPS"
    echo "  ${GREEN}build${NC}         Apenas build local"
    echo "  ${GREEN}push${NC}          Envia para Git e VPS"
    echo "  ${GREEN}status${NC}        Verifica status dos serviços"
    echo "  ${GREEN}logs${NC}          Mostra logs da aplicação"
    echo "  ${GREEN}rollback${NC}      Volta para versão anterior"
    echo "  ${GREEN}backup${NC}        Faz backup do banco de dados"
    echo "  ${GREEN}restore${NC}       Restaura backup"
    echo "  ${GREEN}setup-vps${NC}     Configura VPS pela primeira vez"
    echo "  ${GREEN}setup-n8n${NC}     Configura integração N8N"
    echo "  ${GREEN}ssh${NC}           Abre SSH na VPS"
    echo "  ${GREEN}db-push${NC}       Envia schema do banco para VPS"
    echo "  ${GREEN}seed${NC}          Executa seed na VPS"
    echo ""
    echo -e "${YELLOW}Opções:${NC}"
    echo "  --vps-ip       IP da VPS (ou set VPS_IP no .deploy.env)"
    echo "  --vps-user     Usuário SSH (default: root)"
    echo "  --vps-key      Caminho da chave SSH"
    echo "  --app-url      URL da aplicação"
    echo "  --n8n-url      URL do N8N"
    echo "  --n8n-key      API Key do N8N"
    echo "  --dry-run      Simula sem executar"
    echo "  --verbose      Mostra mais detalhes"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  ./deploy-cli.sh deploy --vps-ip 192.168.1.100"
    echo "  ./deploy-cli.sh status"
    echo "  ./deploy-cli.sh logs --follow"
    echo "  ./deploy-cli.sh backup --download"
    echo ""
}

# Verificar dependências
check_dependencies() {
    log INFO "Verificando dependências..."
    
    local missing=()
    
    command -v ssh >/dev/null 2>&1 || missing+=("ssh")
    command -v rsync >/dev/null 2>&1 || missing+=("rsync")
    command -v docker >/dev/null 2>&1 || missing+=("docker")
    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v curl >/dev/null 2>&1 || missing+=("curl")
    
    if [ ${#missing[@]} -ne 0 ]; then
        log ERROR "Dependências faltando: ${missing[*]}"
        log INFO "Instale com: apt install ${missing[*]} -y"
        exit 1
    fi
    
    log SUCCESS "Todas dependências instaladas"
}

# Verificar conexão SSH
check_ssh_connection() {
    log INFO "Verificando conexão SSH com ${VPS_USER}@${VPS_IP}..."
    
    if ssh -o ConnectTimeout=5 -o BatchMode=yes -i ${VPS_KEY:-~/.ssh/id_rsa} ${VPS_USER}@${VPS_IP} "echo 'Conexão OK'" 2>/dev/null; then
        log SUCCESS "Conexão SSH estabelecida"
        return 0
    else
        log ERROR "Não foi possível conectar via SSH"
        log INFO "Verifique:"
        log INFO "  1. IP da VPS está correto: ${VPS_IP}"
        log INFO "  2. Chave SSH existe: ${VPS_KEY:-~/.ssh/id_rsa}"
        log INFO "  3. SSH está habilitado na VPS"
        return 1
    fi
}

# Executar comando na VPS
vps_exec() {
    local cmd=$1
    ssh -i ${VPS_KEY:-~/.ssh/id_rsa} ${VPS_USER}@${VPS_IP} "$cmd"
}

# Deploy completo
deploy_full() {
    log DEPLOY "Iniciando deploy completo..."
    
    # 1. Verificar conexão
    check_ssh_connection || exit 1
    
    # 2. Build local
    log INFO "Fazendo build local..."
    bun run build 2>&1 | tee -a $LOG_FILE
    
    # 3. Criar diretório na VPS
    log INFO "Preparando diretório na VPS..."
    vps_exec "mkdir -p ${VPS_APP_PATH:-/opt/growth-studio}"
    
    # 4. Enviar arquivos
    log INFO "Enviando arquivos para VPS..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'prisma/*.db' \
        -e "ssh -i ${VPS_KEY:-~/.ssh/id_rsa}" \
        ./ ${VPS_USER}@${VPS_IP}:${VPS_APP_PATH:-/opt/growth-studio}/
    
    # 5. Executar deploy na VPS
    log INFO "Executando deploy na VPS..."
    vps_exec "cd ${VPS_APP_PATH:-/opt/growth-studio} && \
        docker-compose down && \
        docker-compose build --no-cache && \
        docker-compose up -d"
    
    # 6. Aguardar inicialização
    log INFO "Aguardando aplicação inicializar..."
    sleep 10
    
    # 7. Verificar status
    check_health
    
    log DEPLOY "Deploy concluído com sucesso!"
    log INFO "Acesse: http://${VPS_IP}:3000"
}

# Build local
build_local() {
    log INFO "Iniciando build local..."
    
    # Gerar Prisma Client
    bun run db:generate
    
    # Build Next.js
    bun run build
    
    # Verificar Docker
    if command -v docker &> /dev/null; then
        log INFO "Buildando imagem Docker..."
        docker build -t growth-studio:latest .
    fi
    
    log SUCCESS "Build local concluído!"
}

# Verificar saúde da aplicação
check_health() {
    log INFO "Verificando saúde da aplicação..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" http://${VPS_IP}:3000/api/health 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log SUCCESS "Aplicação está saudável!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    log ERROR "Aplicação não respondeu após $max_attempts tentativas"
    log INFO "Verifique os logs: ./deploy-cli.sh logs"
    return 1
}

# Mostrar status
show_status() {
    show_banner
    log INFO "Verificando status dos serviços..."
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Growth Studio
    echo -e "${YELLOW}📊 Growth Studio:${NC}"
    if vps_exec "docker ps --filter name=growth-studio --format '{{.Status}}'" 2>/dev/null; then
        echo -e "   ${GREEN}● Running${NC}"
    else
        echo -e "   ${RED}● Stopped${NC}"
    fi
    
    # N8N
    echo ""
    echo -e "${YELLOW}🔄 N8N:${NC}"
    if vps_exec "docker ps --filter name=n8n --format '{{.Status}}'" 2>/dev/null; then
        echo -e "   ${GREEN}● Running${NC}"
    else
        echo -e "   ${RED}● Stopped${NC}"
    fi
    
    # Health Check
    echo ""
    echo -e "${YELLOW}💚 Health Check:${NC}"
    local health=$(curl -s http://${VPS_IP}:3000/api/health 2>/dev/null || echo '{"status":"error"}')
    echo "   $health"
    
    # Disco
    echo ""
    echo -e "${YELLOW}💾 Disco:${NC}"
    vps_exec "df -h / | tail -1" 2>/dev/null || echo "   Não disponível"
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

# Mostrar logs
show_logs() {
    local follow=${1:-false}
    local service=${2:-growth-studio}
    
    if [ "$follow" = "true" ]; then
        vps_exec "docker logs -f $service"
    else
        vps_exec "docker logs --tail 100 $service"
    fi
}

# Backup do banco
backup_db() {
    local download=${1:-false}
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="growth-studio-backup-${timestamp}.db"
    
    log INFO "Criando backup do banco de dados..."
    
    # Criar backup na VPS
    vps_exec "docker exec growth-studio cat /app/data/growth-studio.db > /tmp/${backup_file}"
    
    if [ "$download" = "true" ]; then
        # Download para máquina local
        scp -i ${VPS_KEY:-~/.ssh/id_rsa} ${VPS_USER}@${VPS_IP}:/tmp/${backup_file} ./backups/
        log SUCCESS "Backup salvo em: ./backups/${backup_file}"
    else
        log SUCCESS "Backup criado na VPS: /tmp/${backup_file}"
    fi
}

# Restore do banco
restore_db() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log ERROR "Especifique o arquivo de backup"
        log INFO "Uso: ./deploy-cli.sh restore backups/arquivo.db"
        exit 1
    fi
    
    log WARNING "Isso vai substituir o banco de dados atual!"
    read -p "Continuar? (y/N): " confirm
    
    if [ "$confirm" != "y" ]; then
        log INFO "Operação cancelada"
        exit 0
    fi
    
    # Enviar backup para VPS
    scp -i ${VPS_KEY:-~/.ssh/id_rsa} $backup_file ${VPS_USER}@${VPS_IP}:/tmp/restore.db
    
    # Restaurar
    vps_exec "docker cp /tmp/restore.db growth-studio:/app/data/growth-studio.db && docker restart growth-studio"
    
    log SUCCESS "Banco restaurado com sucesso!"
}

# Setup VPS
setup_vps() {
    log DEPLOY "Configurando VPS pela primeira vez..."
    
    check_ssh_connection || exit 1
    
    log INFO "Instalando Docker..."
    vps_exec "curl -fsSL https://get.docker.com | sh"
    
    log INFO "Instalando Docker Compose..."
    vps_exec "curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
    
    log INFO "Criando diretórios..."
    vps_exec "mkdir -p ${VPS_APP_PATH:-/opt/growth-studio} /opt/n8n"
    
    log INFO "Configurando firewall..."
    vps_exec "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw allow 3000 && ufw allow 5678 && ufw --force enable"
    
    log SUCCESS "VPS configurada com sucesso!"
    log INFO "Agora execute: ./deploy-cli.sh deploy"
}

# Setup N8N
setup_n8n() {
    log DEPLOY "Configurando N8N..."
    
    check_ssh_connection || exit 1
    
    # Criar docker-compose do N8N
    vps_exec "cat > /opt/n8n/docker-compose.yml << 'EOF'
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - \"5678:5678\"
    environment:
      - N8N_HOST=${N8N_URL:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=${N8N_URL:-http://localhost:5678}/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASS:-admin123}
    volumes:
      - n8n-data:/home/node/.n8n
volumes:
  n8n-data:
EOF"
    
    # Iniciar N8N
    vps_exec "cd /opt/n8n && docker-compose up -d"
    
    log SUCCESS "N8N configurado!"
    log INFO "Acesse: http://${VPS_IP}:5678"
    log INFO "Usuário: ${N8N_USER:-admin}"
    log INFO "Senha: ${N8N_PASS:-admin123}"
}

# Importar workflows N8N
import_n8n_workflows() {
    log INFO "Importando workflows N8N..."
    
    # Enviar templates
    scp -i ${VPS_KEY:-~/.ssh/id_rsa} ./n8n-templates/*.json ${VPS_USER}@${VPS_IP}:/tmp/
    
    log SUCCESS "Templates enviados para VPS"
    log INFO "Importe manualmente no N8N: http://${VPS_IP}:5678"
}

# Rollback
rollback() {
    log WARNING "Iniciando rollback..."
    
    local version=$1
    if [ -z "$version" ]; then
        log INFO "Buscando versões anteriores..."
        vps_exec "docker images growth-studio --format '{{.ID}} {{.CreatedAt}}'"
        read -p "Digite o ID da imagem para rollback: " version
    fi
    
    vps_exec "docker tag $version growth-studio:current && docker-compose -f ${VPS_APP_PATH:-/opt/growth-studio}/docker-compose.yml up -d"
    
    log SUCCESS "Rollback concluído!"
}

# Push para Git e VPS
push_all() {
    log INFO "Enviando para Git..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
    git push
    
    log DEPLOY "Deploy automático via Git configurado!"
}

# SSH interativo
ssh_interactive() {
    log INFO "Abrindo SSH interativo..."
    ssh -i ${VPS_KEY:-~/.ssh/id_rsa} ${VPS_USER}@${VPS_IP}
}

# ================================================
# MAIN
# ================================================

# Carregar config
load_config

# Parse argumentos
COMMAND=""
ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --vps-ip)
            VPS_IP="$2"
            shift 2
            ;;
        --vps-user)
            VPS_USER="$2"
            shift 2
            ;;
        --vps-key)
            VPS_KEY="$2"
            shift 2
            ;;
        --app-url)
            APP_URL="$2"
            shift 2
            ;;
        --n8n-url)
            N8N_URL="$2"
            shift 2
            ;;
        --n8n-key)
            N8N_API_KEY="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --follow|-f)
            FOLLOW=true
            shift
            ;;
        --download|-d)
            DOWNLOAD=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND=$1
            else
                ARGS+=("$1")
            fi
            shift
            ;;
    esac
done

# Defaults
VPS_USER=${VPS_USER:-root}
VPS_KEY=${VPS_KEY:-~/.ssh/id_rsa}
VPS_APP_PATH=${VPS_APP_PATH:-/opt/growth-studio}

# Executar comando
case $COMMAND in
    deploy)
        show_banner
        check_dependencies
        deploy_full
        ;;
    build)
        show_banner
        build_local
        ;;
    push)
        push_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs ${FOLLOW:-false} ${ARGS[0]:-growth-studio}
        ;;
    backup)
        backup_db ${DOWNLOAD:-false}
        ;;
    restore)
        restore_db ${ARGS[0]}
        ;;
    setup-vps)
        show_banner
        setup_vps
        ;;
    setup-n8n)
        show_banner
        setup_n8n
        ;;
    import-n8n)
        import_n8n_workflows
        ;;
    rollback)
        rollback ${ARGS[0]}
        ;;
    ssh)
        ssh_interactive
        ;;
    db-push)
        log INFO "Enviando schema do banco..."
        vps_exec "cd ${VPS_APP_PATH} && docker exec growth-studio bunx prisma db push"
        log SUCCESS "Schema atualizado!"
        ;;
    seed)
        log INFO "Executando seed..."
        vps_exec "cd ${VPS_APP_PATH} && docker exec growth-studio bun run prisma/seed.ts"
        log SUCCESS "Seed executado!"
        ;;
    "")
        show_help
        ;;
    *)
        log ERROR "Comando desconhecido: $COMMAND"
        show_help
        exit 1
        ;;
esac
