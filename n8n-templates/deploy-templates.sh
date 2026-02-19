#!/bin/bash

# Growth Studio - Script de Deploy N8N Templates
# Executar na VPS após instalar o N8N

set -e

echo "🚀 Growth Studio - Deploy de Templates N8N"
echo "============================================"

# Configurações
N8N_URL="${N8N_URL:-http://localhost:5678}"
N8N_API_KEY="${N8N_API_KEY:-}"
TEMPLATES_DIR="$(dirname "$0")"

if [ -z "$N8N_API_KEY" ]; then
    echo "❌ Erro: N8N_API_KEY não definida"
    echo "Exporte a variável: export N8N_API_KEY='sua-api-key'"
    exit 1
fi

# Função para importar workflow
import_workflow() {
    local file=$1
    local name=$(basename "$file" .json)
    
    echo "📦 Importando: $name"
    
    curl -s -X POST \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$file" \
        "${N8N_URL}/api/v1/workflows" | jq -r '.name // .message'
}

# Importar todos os templates
echo ""
echo "📋 Importando workflows..."
echo ""

for template in "$TEMPLATES_DIR"/*.json; do
    if [ -f "$template" ]; then
        import_workflow "$template"
    fi
done

echo ""
echo "✅ Templates importados com sucesso!"
echo ""
echo "🔗 Acesse o N8N para ativar os workflows: $N8N_URL"
