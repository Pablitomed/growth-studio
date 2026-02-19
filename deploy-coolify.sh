#!/bin/bash

# ================================================
# Growth Studio - Deploy para Coolify/Hostinger
# ================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║       🚀 Growth Studio - Deploy Coolify/Hostinger            ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Carregar configurações
load_config() {
    if [ -f ".coolify.env" ]; then
        export $(cat .coolify.env | grep -v '^#' | xargs)
    else
        echo -e "${RED}❌ Arquivo .coolify.env não encontrado!${NC}"
        echo -e "${YELLOW}Crie o arquivo com: cp .coolify.env.example .coolify.env${NC}"
        exit 1
    fi
}

# ================================================
# API COOLIFY
# ================================================

# Fazer requisição para API do Coolify
coolify_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    local url="${COOLIFY_URL}/api/v1${endpoint}"
    
    if [ -n "$data" ]; then
        curl -s -X $method "$url" \
            -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X $method "$url" \
            -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
            -H "Content-Type: application/json"
    fi
}

# Listar aplicações
list_apps() {
    echo -e "${BLUE}📋 Listando aplicações no Coolify...${NC}"
    coolify_api GET "/applications" | jq '.'
}

# Obter status da aplicação
get_app_status() {
    local uuid=$1
    coolify_api GET "/applications/${uuid}" | jq '.'
}

# Deploy via API
deploy_app() {
    local uuid=$1
    echo -e "${PURPLE}🚀 Iniciando deploy...${NC}"
    coolify_api GET "/applications/${uuid}/start" | jq '.'
}

# Parar aplicação
stop_app() {
    local uuid=$1
    echo -e "${YELLOW}⏹️ Parando aplicação...${NC}"
    coolify_api GET "/applications/${uuid}/stop" | jq '.'
}

# Restart aplicação
restart_app() {
    local uuid=$1
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    coolify_api GET "/applications/${uuid}/restart" | jq '.'
}

# ================================================
# CRIAR APLICAÇÃO NO COOLIFY
# ================================================

create_coolify_app() {
    echo -e "${BLUE}📦 Criando aplicação no Coolify...${NC}"
    
    local payload='{
        "server_uuid": "'${COOLIFY_SERVER_UUID}'",
        "project_uuid": "'${COOLIFY_PROJECT_UUID}'",
        "name": "growth-studio",
        "description": "Sistema Agêntico de Growth Marketing",
        "repository_url": "'${GIT_REPO}'",
        "branch": "main",
        "build_pack": "dockerfile",
        "dockerfile_location": "./Dockerfile",
        "expose_port": 3000,
        "environment_variables": {
            "NODE_ENV": "production",
            "DATABASE_URL": "file:/app/data/growth-studio.db",
            "NEXT_PUBLIC_APP_URL": "'${APP_URL}'",
            "N8N_API_KEY": "'${N8N_API_KEY}'"
        },
        "persistent_volumes": [
            {
                "name": "growth-data",
                "mount_path": "/app/data"
            }
        ]
    }'
    
    coolify_api POST "/applications" "$payload" | jq '.'
}

# ================================================
# DEPLOY COMPLETO
# ================================================

full_deploy() {
    show_banner
    
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Iniciando Deploy no Coolify${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # 1. Verificar conexão com Coolify
    echo -e "${YELLOW}1️⃣ Verificando conexão com Coolify...${NC}"
    local status=$(coolify_api GET "/version" 2>/dev/null)
    if [ -n "$status" ]; then
        echo -e "${GREEN}   ✓ Coolify acessível${NC}"
    else
        echo -e "${RED}   ✗ Não foi possível conectar ao Coolify${NC}"
        echo -e "${YELLOW}   Verifique COOLIFY_URL e COOLIFY_API_TOKEN${NC}"
        exit 1
    fi
    
    # 2. Push para Git (se configurado)
    if [ -n "$GIT_REPO" ] && [ "$SKIP_GIT_PUSH" != "true" ]; then
        echo -e "${YELLOW}2️⃣ Enviando para Git...${NC}"
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
        git push origin main
        echo -e "${GREEN}   ✓ Código enviado para Git${NC}"
    else
        echo -e "${YELLOW}2️⃣ Pulando push para Git...${NC}"
    fi
    
    # 3. Trigger deploy no Coolify
    echo -e "${YELLOW}3️⃣ Disparando deploy no Coolify...${NC}"
    if [ -n "$COOLIFY_APP_UUID" ]; then
        deploy_app "$COOLIFY_APP_UUID"
        echo -e "${GREEN}   ✓ Deploy iniciado${NC}"
    else
        echo -e "${RED}   ✗ COOLIFY_APP_UUID não configurado${NC}"
        echo -e "${YELLOW}   Configure no arquivo .coolify.env${NC}"
        exit 1
    fi
    
    # 4. Aguardar e verificar
    echo -e "${YELLOW}4️⃣ Aguardando aplicação iniciar...${NC}"
    sleep 10
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ Deploy Concluído!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "🌐 Acesse: ${CYAN}${APP_URL}${NC}"
    echo ""
}

# ================================================
# STATUS
# ================================================

show_status() {
    show_banner
    
    echo -e "${BLUE}📊 Status das Aplicações${NC}"
    echo ""
    
    # Growth Studio
    echo -e "${YELLOW}Growth Studio:${NC}"
    if [ -n "$COOLIFY_APP_UUID" ]; then
        get_app_status "$COOLIFY_APP_UUID" | jq '{
            name: .name,
            status: .status,
            url: .fqdn,
            updated: .updated_at
        }'
    else
        echo -e "   ${RED}UUID não configurado${NC}"
    fi
    
    echo ""
    
    # Health Check
    echo -e "${YELLOW}💚 Health Check:${NC}"
    local health=$(curl -s "${APP_URL}/api/health" 2>/dev/null || echo '{"status":"error"}')
    echo "$health" | jq '.'
}

# ================================================
# LOGS
# ================================================

show_logs() {
    local follow=${1:-false}
    
    if [ -n "$COOLIFY_APP_UUID" ]; then
        echo -e "${BLUE}📋 Buscando logs...${NC}"
        coolify_api GET "/applications/${COOLIFY_APP_UUID}/logs"
    else
        echo -e "${RED}UUID não configurado${NC}"
    fi
}

# ================================================
# WEBHOOK DE DEPLOY
# ================================================

setup_webhook() {
    show_banner
    echo -e "${BLUE}🔗 Configurando Webhook de Deploy Automático${NC}"
    echo ""
    
    # Criar webhook no Coolify
    local webhook_url="${COOLIFY_URL}/api/v1/webhooks/deploy?uuid=${COOLIFY_APP_UUID}"
    
    echo -e "${YELLOW}Webhook URL:${NC}"
    echo -e "${CYAN}${webhook_url}${NC}"
    echo ""
    
    echo -e "${YELLOW}Adicione este webhook ao seu GitHub:${NC}"
    echo "1. Vá em: Settings → Webhooks → Add webhook"
    echo "2. Payload URL: ${webhook_url}"
    echo "3. Content type: application/json"
    echo "4. Events: Just the push event"
    echo "5. Add webhook"
    echo ""
    
    echo -e "${GREEN}✓ Webhook configurado!${NC}"
    echo -e "${YELLOW}Agora cada push no Git vai disparar deploy automático.${NC}"
}

# ================================================
# BACKUP
# ================================================

backup_db() {
    show_banner
    echo -e "${BLUE}💾 Criando backup do banco de dados...${NC}"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="growth-studio-backup-${timestamp}.db"
    
    # SSH para VPS e copiar banco
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} \
        "docker exec growth-studio cat /app/data/growth-studio.db" > "./backups/${backup_file}"
    
    echo -e "${GREEN}✓ Backup salvo em: ./backups/${backup_file}${NC}"
}

restore_db() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}Especifique o arquivo de backup${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️ Isso vai substituir o banco de dados!${NC}"
    read -p "Continuar? (y/N): " confirm
    
    if [ "$confirm" != "y" ]; then
        exit 0
    fi
    
    # Enviar backup para VPS
    cat "$backup_file" | ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} \
        "docker exec -i growth-studio cat > /app/data/growth-studio.db && docker restart growth-studio"
    
    echo -e "${GREEN}✓ Banco restaurado!${NC}"
}

# ================================================
# AJUDA
# ================================================

show_help() {
    show_banner
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./deploy-coolify.sh [comando]"
    echo ""
    echo -e "${YELLOW}Comandos:${NC}"
    echo ""
    echo -e "  ${GREEN}deploy${NC}         Faz deploy no Coolify"
    echo -e "  ${GREEN}status${NC}        Mostra status da aplicação"
    echo -e "  ${GREEN}logs${NC}          Mostra logs"
    echo -e "  ${GREEN}restart${NC}       Reinicia aplicação"
    echo -e "  ${GREEN}stop${NC}          Para aplicação"
    echo -e "  ${GREEN}create${NC}        Cria aplicação no Coolify"
    echo -e "  ${GREEN}webhook${NC}       Configura webhook de deploy"
    echo -e "  ${GREEN}backup${NC}        Faz backup do banco"
    echo -e "  ${GREEN}restore${NC}       Restaura backup"
    echo -e "  ${GREEN}list${NC}          Lista aplicações"
    echo -e "  ${GREEN}setup${NC}         Configuração inicial"
    echo ""
    echo -e "${YELLOW}Opções:${NC}"
    echo "  --skip-push     Não faz push para Git"
    echo "  --verbose       Mostra mais detalhes"
    echo ""
}

# ================================================
# SETUP INICIAL
# ================================================

setup_initial() {
    show_banner
    echo -e "${BLUE}🔧 Configuração Inicial${NC}"
    echo ""
    
    # Criar arquivo de configuração se não existe
    if [ ! -f ".coolify.env" ]; then
        echo -e "${YELLOW}Criando arquivo de configuração...${NC}"
        cp .coolify.env.example .coolify.env
        echo -e "${GREEN}✓ Arquivo .coolify.env criado${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📝 Próximos passos:${NC}"
    echo ""
    echo "1. Edite o arquivo .coolify.env com suas configurações:"
    echo "   nano .coolify.env"
    echo ""
    echo "2. Obtenha o API Token no Coolify:"
    echo "   - Acesse: ${COOLIFY_URL:-http://seu-coolify:8000}"
    echo "   - Vá em: Profile → API Tokens → Create Token"
    echo ""
    echo "3. Obtenha os UUIDs:"
    echo "   - Server UUID: Settings → Servers → clique no servidor"
    echo "   - Project UUID: Projects → clique no projeto"
    echo "   - App UUID: Applications → clique na app → Settings"
    echo ""
    echo "4. Execute o deploy:"
    echo "   ./deploy-coolify.sh deploy"
    echo ""
    
    # Verificar dependências
    echo -e "${YELLOW}🔍 Verificando dependências...${NC}"
    
    command -v curl >/dev/null 2>&1 || echo -e "${RED}   ✗ curl não instalado${NC}"
    command -v jq >/dev/null 2>&1 || echo -e "${RED}   ✗ jq não instalado (instale: apt install jq)${NC}"
    command -v git >/dev/null 2>&1 || echo -e "${RED}   ✗ git não instalado${NC}"
    
    echo ""
}

# ================================================
# MAIN
# ================================================

load_config

COMMAND=${1:-help}

case $COMMAND in
    deploy)
        full_deploy
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_app "$COOLIFY_APP_UUID"
        ;;
    stop)
        stop_app "$COOLIFY_APP_UUID"
        ;;
    create)
        create_coolify_app
        ;;
    webhook)
        setup_webhook
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    list)
        list_apps
        ;;
    setup)
        setup_initial
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando desconhecido: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac
