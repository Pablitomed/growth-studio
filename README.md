# Growth Studio

Sistema Agêntico de Growth Marketing com HITL (Human-in-the-Loop)

## 🎯 Visão Geral

O Growth Studio é uma plataforma completa para automação de marketing com 15 agentes especializados, sistema de aprovações human-in-the-loop, e métricas avançadas como Share of Model (GEO) e ROI Preditivo (PROIM).

## ✨ Features

- **Dashboard Principal** - Visão geral de todos os clientes e métricas
- **15 Agentes Especializados** - Pesquisa, Conteúdo, Plataformas, Análise, Gestão
- **HITL (Human-in-the-Loop)** - Sistema de aprovações estruturado
- **GEO / Share of Model** - Visibilidade em motores de IA
- **PROIM** - ROI Preditivo usando micro-sinais comportamentais
- **Integração N8N** - Webhooks bidirecionais
- **4 Tiers de Serviço** - Do Assistivo ao Autônomo

## 🚀 Quick Start

```bash
# Instalar dependências
bun install

# Configurar banco de dados
bun run db:push

# Rodar em desenvolvimento
bun run dev
```

## 📦 Deploy

Veja o [Guia de Deploy](./DEPLOY.md) para instruções completas de deploy na VPS Hostinger com Coolify.

## 🔗 Links de Acesso

Após criar um cliente, ele receberá um link único:
```
https://seu-dominio.com/cliente/{token}
```

## 📊 Tiers de Serviço

| Tier | Preço | Agentes | Features |
|------|-------|---------|----------|
| ASSISTIVO | R$ 997/mês | 4 | Básico, 1 HITL/semana |
| ORQUESTRADO | R$ 2.497/mês | 9 | Agentes conteúdo, GEO básico |
| AGÊNTICO | R$ 4.997/mês | 14 | PROIM, SoM, HITL diário |
| AUTÔNOMO | R$ 9.997+/mês | 15 | Self-adjusting, API completa |

## 🛠️ Stack

- **Frontend**: Next.js 15, React, Tailwind, shadcn/ui
- **Backend**: API Routes (Next.js)
- **Banco**: Prisma + SQLite
- **IA**: z-ai-web-dev-sdk
- **Orquestração**: N8N
- **Deploy**: Docker, Coolify

## 📝 Licença

Proprietário - Uso interno
