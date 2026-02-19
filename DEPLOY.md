# Growth Studio - Guia de Deploy

## 🚀 Deploy na VPS Hostinger com Coolify

### Pré-requisitos

- VPS Hostinger com Docker instalado
- Coolify instalado e configurado
- Domínio apontado para a VPS (opcional)

### 1. Preparar o Repositório

```bash
# Clone ou faça upload do projeto para seu repositório Git
git init
git add .
git commit -m "Initial commit - Growth Studio"
git remote add origin <seu-repositorio>
git push -u origin main
```

### 2. Deploy via Coolify

1. Acesse o painel do Coolify (geralmente em `http://seu-ip:3000`)
2. Clique em **"New Resource"** → **"Service"** → **"Docker Compose"**
3. Cole o conteúdo do `docker-compose.yml`
4. Configure as variáveis de ambiente:

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
N8N_WEBHOOK_URL=https://n8n.seu-dominio.com
N8N_API_KEY=sua-api-key-segura
```

5. Clique em **"Deploy"**

### 3. Configurar N8N (se usando o container incluído)

1. Acesse o N8N em `http://seu-ip:5678`
2. Configure as credenciais de admin
3. Importe os workflows do diretório `n8n-templates/`

### 4. Deploy dos Templates N8N

```bash
# Na sua VPS, execute:
cd /path/to/growth-studio/n8n-templates
export N8N_API_KEY='sua-api-key'
export N8N_URL='http://localhost:5678'
chmod +x deploy-templates.sh
./deploy-templates.sh
```

### 5. Configurar Domínio (opcional)

No Coolify:
1. Vá em **"Domains"**
2. Adicione seu domínio
3. Configure SSL automático (Let's Encrypt)

---

## 📁 Estrutura de Arquivos Importantes

```
growth-studio/
├── Dockerfile                    # Build do container
├── docker-compose.yml            # Orquestração dos serviços
├── prisma/
│   └── schema.prisma             # Schema do banco de dados
├── n8n-templates/
│   ├── growth-studio-main.json   # Workflow principal
│   ├── growth-studio-scheduler.json
│   └── deploy-templates.sh       # Script de deploy
└── src/
    ├── app/
    │   ├── api/                  # APIs REST
    │   ├── page.tsx              # Dashboard principal
    │   └── cliente/[token]/      # Página do cliente
    └── lib/
        └── agents.ts             # Configuração dos agentes
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | URL do banco SQLite | Sim |
| `NEXT_PUBLIC_APP_URL` | URL pública do app | Sim |
| `N8N_WEBHOOK_URL` | URL do N8N | Não |
| `N8N_API_KEY` | Chave de API do N8N | Não |

---

## 🔗 Integração com N8N

### Webhook de Entrada

O Growth Studio recebe webhooks do N8N em:

```
POST /api/integrations/n8n/webhook
Authorization: Bearer <N8N_API_KEY>
Content-Type: application/json

{
  "tipo": "resultado_campanha",
  "clienteId": "xxx",
  "payload": { ... }
}
```

### Tipos de Webhook Suportados

| Tipo | Descrição |
|------|-----------|
| `resultado_campanha` | Registra métricas de campanha |
| `decisao_hitl` | Cria nova decisão pendente |
| `geo_metric` | Registra métrica GEO |
| `proim_metric` | Registra métrica PROIM |
| `insight_agente` | Registra insight de agente |
| `executar_agente` | Executa um agente |

---

## 🧪 Testando a Instalação

### Health Check

```bash
curl http://seu-ip:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Growth Studio API",
  "version": "1.0.0"
}
```

### Criar Cliente de Teste

```bash
curl -X POST http://seu-ip:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Teste",
    "empresa": "Empresa Teste LTDA",
    "email": "teste@empresa.com",
    "tier": "orchestrado"
  }'
```

---

## 🔧 Manutenção

### Backup do Banco de Dados

```bash
# Copiar arquivo do banco
docker cp growth-studio:/app/data/growth-studio.db ./backup-$(date +%Y%m%d).db
```

### Atualização

```bash
# No Coolify, clique em "Redeploy" após atualizar o código
# Ou via CLI:
docker-compose pull
docker-compose up -d
```

### Logs

```bash
# Ver logs do container
docker logs growth-studio -f

# Ver logs do N8N
docker logs n8n -f
```

---

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `docker logs growth-studio`
2. Verifique a saúde do container: `docker ps`
3. Verifique a conexão com o banco: `docker exec growth-studio bunx prisma db push`
