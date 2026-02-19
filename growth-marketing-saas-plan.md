# 🚀 SaaS Growth Marketing Agêntico com HITL

## Plano Arquitetural Completo

---

## 1. VISÃO GERAL DO SISTEMA

### Conceito
Uma plataforma SaaS de Growth Marketing que utiliza um **sistema agêntico multi-camadas** para automatizar todo o ciclo de marketing digital, desde a definição de ICP até a análise de resultados, com **Human-in-the-Loop (HITL)** para supervisão estratégica.

### Proposta de Valor
- **Para Agências**: Automatiza 80% do trabalho operacional, permitindo foco em estratégia
- **Para Empresas**: Acesso a inteligência de marketing de alto nível automatizada
- **Para o Usuário**: Tudo pronto, automaticamente, com supervisão humana estratégica

---

## 2. ARQUITETURA DO SISTEMA

### 2.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SAAS GROWTH MARKETING                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          FRONTEND (Next.js 15)                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
│  │  │Dashboard │ │Campanhas │ │ Conteúdo │ │ Análise  │ │ HITL     │      │    │
│  │  │Principal │ │  CRUD    │ │ Generator│ │ Results  │ │ Approval │      │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          API LAYER (Next.js API Routes)                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
│  │  │Auth API  │ │Campaigns │ │ Content  │ │ Webhooks │ │ HITL     │      │    │
│  │  │          │ │   API    │ │   API    │ │   API    │ │   API    │      │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    SISTEMA AGÊNTICO (Orchestrator)                       │    │
│  │                                                                          │    │
│  │  ┌────────────────────────────────────────────────────────────────┐     │    │
│  │  │                     ORCHESTRATOR ENGINE                         │     │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │     │    │
│  │  │  │  Task    │  │  Agent   │  │  Memory  │  │  HITL    │       │     │    │
│  │  │  │  Queue   │  │ Router   │  │  System  │  │  Manager │       │     │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │     │    │
│  │  └────────────────────────────────────────────────────────────────┘     │    │
│  │                                      │                                   │    │
│  │         ┌────────────────────────────┼────────────────────────────┐     │    │
│  │         ▼                            ▼                            ▼     │    │
│  │  ┌────────────┐              ┌────────────┐              ┌────────────┐ │    │
│  │  │  AGENTE    │              │  AGENTE    │              │  AGENTE    │ │    │
│  │  │ PESQUISA   │              │  ANÁLISE   │              │  CONTEÚDO  │ │    │
│  │  │            │◄────────────►│            │◄────────────►│            │ │    │
│  │  │ - Mercado  │              │ - Dados    │              │ - Texto    │ │    │
│  │  │ - ICP      │              │ - Métricas │              │ - Imagem   │ │    │
│  │  │ - Concor.  │              │ - Insights │              │ - Vídeo    │ │    │
│  │  └────────────┘              └────────────┘              └────────────┘ │    │
│  │         ▲                            ▲                            ▲     │    │
│  │         │                            │                            │     │    │
│  │  ┌────────────┐              ┌────────────┐              ┌────────────┐ │    │
│  │  │  AGENTE    │              │  AGENTE    │              │  AGENTE    │ │    │
│  │  │  GESTÃO    │              │  PLATAF.   │              │  ORQUEST.  │ │    │
│  │  │            │◄────────────►│            │◄────────────►│   MASTER   │ │    │
│  │  │ - Campanhas│              │ - Graph API│              │            │ │    │
│  │  │ - Budget   │              │ - Google   │              │ Coordena   │ │    │
│  │  │ - Results  │              │ - Social   │              │ todos      │ │    │
│  │  └────────────┘              └────────────┘              └────────────┘ │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER (Prisma + SQLite)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
│  │  │ Clients  │ │Campaigns │ │ Content  │ │ Results  │ │ HITL     │      │    │
│  │  │   DB     │ │   DB     │ │   DB     │ │   DB     │ │ Actions  │      │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL INTEGRATIONS                               │
│                                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   N8N    │  │ Graph API│  │ Google   │  │  Image   │  │  Video   │         │
│  │ Webhooks │  │  (Meta)  │  │   Ads    │  │   Gen    │  │   Gen    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 15 + React + Tailwind | SSR, performance, SEO |
| **UI Components** | shadcn/ui | Consistência, acessibilidade |
| **Backend API** | Next.js API Routes | Serverless, integrado |
| **Agentes IA** | z-ai-web-dev-sdk | LLM, imagens, análise |
| **Banco de Dados** | Prisma + SQLite/PostgreSQL | ORM robusto, migrations |
| **Autenticação** | NextAuth.js | OAuth, JWT, sessions |
| **Integrações** | REST Webhooks | N8N, APIs externas |
| **Deploy** | Docker + Coolify | Containerização, CI/CD |

---

## 3. SISTEMA AGÊNTICO

### 3.1 Agentes Especializados

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENTE ORQUESTRADOR (MASTER)                  │
│                                                                  │
│  Responsabilidade: Coordena todos os agentes, decide qual       │
│  agente chamar, gerencia contexto e prioridades                 │
│                                                                  │
│  Capacidades:                                                    │
│  - Roteamento de tarefas para agentes especializados            │
│  - Manutenção de contexto global do projeto                     │
│  - Decisão de quando solicitar intervenção HITL                 │
│  - Consolidação de outputs de múltiplos agentes                 │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   AGENTE        │ │   AGENTE        │ │   AGENTE        │
│   PESQUISA      │ │   ANÁLISE       │ │   CONTEÚDO      │
│                 │ │                 │ │                 │
│ Responsável por:│ │ Responsável por:│ │ Responsável por:│
│ • ICP Discovery │ │ • Data Analysis │ │ • Copywriting   │
│ • Pesquisa      │ │ • Métricas      │ │ • Scripts       │
│   Mercado       │ │ • ROI/LTV       │ │ • Headlines     │
│ • Concorrência  │ • Benchmarks     │ │ • CTAs          │
│ • Tendências    │ • Insights       │ │ • Criativos     │
│ • Palavras-chave│ • Relatórios     │ │ • Legendas      │
│                 │ │                 │ │                 │
│ Output:         │ │ Output:         │ │ Output:         │
│ Briefings ICP,  │ │ Dashboards,     │ │ Textos,         │
│ Relatórios de   │ │ Recomendações,  │ │ Prompts para    │
│ Mercado         │ │ Alertas         │ │ geração visual  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENTE PLATAFORMAS                            │
│                                                                  │
│  Responsável por: Executar ações nas plataformas integradas     │
│                                                                  │
│  Sub-agentes especializados:                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Graph API   │ │ Google Ads  │ │ Social Media│               │
│  │ (Meta/Insta)│ │ Manager     │ │ (LinkedIn,  │               │
│  │             │ │             │ │ TikTok)     │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  Output:                                                         │
│  Campanhas criadas, anúncios publicados, dados coletados        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENTE GESTÃO                                 │
│                                                                  │
│  Responsável por: Gerenciar ciclo de vida das campanhas         │
│                                                                  │
│  Capacidades:                                                    │
│  • Monitoramento de performance em tempo real                   │
│  • Otimização automática de budget                              │
│  • A/B testing suggestions                                       │
│  • Alertas de anomalias                                         │
│  • Relatórios automáticos                                       │
│                                                                  │
│  Output:                                                         │
│  Recomendações de otimização, relatórios, alertas               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Fluxo de Comunicação entre Agentes

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW DE CRIAÇÃO DE CAMPANHA                  │
└──────────────────────────────────────────────────────────────────────────┘

    [INPUT: Cliente + Objetivo]
              │
              ▼
    ┌─────────────────┐
    │  AGENTE MASTER  │ ◄─── Decide qual agente chamar primeiro
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ AGENTE PESQUISA │ ◄─── Pesquisa ICP, mercado, concorrência
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   HITL CHECK    │ ◄─── Supervisor aprova ICP/Posicionamento?
    └────────┬────────┘         │
             │ SIM              │ NÃO
             ▼                  ▼
    ┌─────────────────┐    [Solicita ajustes]
    │ AGENTE CONTEÚDO │         │
    └────────┬────────┘◄────────┘
             │
             ▼
    ┌─────────────────┐
    │   HITL CHECK    │ ◄─── Supervisor aprova criativos?
    └────────┬────────┘
             │ SIM
             ▼
    ┌─────────────────┐
    │ AGENTE PLATAF.  │ ◄─── Cria campanha nas plataformas
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  AGENTE GESTÃO  │ ◄─── Monitora e otimiza
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  AGENTE ANÁLISE │ ◄─── Gera relatórios e insights
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   HITL CHECK    │ ◄─── Supervisor revisa resultados
    └────────┬────────┘
             │
             ▼
    [OUTPUT: Relatório Final + Recomendações]
```

### 3.3 Sistema HITL (Human-in-the-Loop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           SISTEMA HITL                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  TRIGGERS DE INTERVENÇÃO HUMANA:                                         │
│                                                                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐            │
│  │   OBRIGATÓRIO   │ │   CONDICIONAL   │ │   ALERTA        │            │
│  │                 │ │                 │ │                 │            │
│  │ • Aprovação ICP │ │ • Budget > $X   │ │ • ROI negativo  │            │
│  │ • Aprovação     │ │ • Mudança de    │ │ • CTR abaixo    │            │
│  │   Criativos     │ │   estratégia    │ │   threshold     │            │
│  │ • Aprovação     │ │ • Novo canal    │ │ • CP alto       │            │
│  │   Orçamento     │ │ • Audiência     │ │ • Anomalia      │            │
│  │ • Mudança       │ │   nova          │ │   detectada     │            │
│  │   significativa │ │                 │ │                 │            │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘            │
│                                                                           │
│  INTERFACE HITL:                                                          │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │  PAINEL DE APROVAÇÃO                                         │         │
│  │                                                               │         │
│  │  ┌─────────────────────────────────────────────────────┐    │         │
│  │  │ Tarefa: #1234 - Aprovar Criativos Campanha XYZ      │    │         │
│  │  │ Agente: AGENTE_CONTEUDO                             │    │         │
│  │  │ Prioridade: ALTA                                    │    │         │
│  │  │ Criado: há 2 horas                                  │    │         │
│  │  └─────────────────────────────────────────────────────┘    │         │
│  │                                                               │         │
│  │  [VER DETALHES]  [APROVAR]  [REJEITAR]  [SOLICITAR AJUSTES] │         │
│  └─────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  STATUS HITL:                                                             │
│  • PENDING → Aguardando ação humana                                       │
│  • APPROVED → Aprovado, fluxo continua                                    │
│  • REJECTED → Rejeitado, volta para agente                                │
│  • REVISION → Solicitado ajustes, agente modifica                         │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MODELO DE DADOS

### 4.1 Schema do Banco de Dados (Prisma)

```prisma
// ============================================
// MODELO DE DADOS - SaaS Growth Marketing
// ============================================

// ----- USUÁRIOS E AUTENTICAÇÃO -----
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(USER)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relacionamentos
  clients       Client[]
  hitlActions   HITLAction[]
  notifications Notification[]
  
  @@map("users")
}

enum Role {
  ADMIN
  USER
  SUPERVISOR
}

// ----- CLIENTES (Empresas) -----
model Client {
  id              String    @id @default(cuid())
  name            String
  email           String
  company         String?
  industry        String?
  website         String?
  status          ClientStatus @default(ACTIVE)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relacionamentos
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  icp             ICP?
  campaigns       Campaign[]
  contents        Content[]
  results         Result[]
  
  @@map("clients")
}

enum ClientStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

// ----- ICP (Ideal Customer Profile) -----
model ICP {
  id              String    @id @default(cuid())
  clientId        String    @unique
  client          Client    @relation(fields: [clientId], references: [id])
  
  // Dados do ICP
  demographics    Json?     // idade, gênero, localização, cargo
  psychographics  Json?     // interesses, valores, dores
  firmographics   Json?     // porte, faturamento, setor (B2B)
  behaviors       Json?     // comportamentos de compra
  channels        Json?     // canais preferidos
  
  // Metadados
  status          ICPStatus @default(DRAFT)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  approvedAt      DateTime?
  approvedBy      String?
  
  @@map("icps")
}

enum ICPStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
}

// ----- CAMPANHAS -----
model Campaign {
  id              String    @id @default(cuid())
  clientId        String
  client          Client    @relation(fields: [clientId], references: [id])
  
  // Dados da Campanha
  name            String
  objective       String    // awareness, leads, sales, etc.
  platforms       Json?     // ["facebook", "google", "instagram"]
  budget          Float?
  startDate       DateTime?
  endDate         DateTime?
  status          CampaignStatus @default(DRAFT)
  
  // Segmentação
  targeting       Json?     // audiências, interesses, etc.
  
  // Métricas agregadas
  metrics         Json?     // {impressions, clicks, conversions, spent, roas}
  
  // Metadados
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  launchedAt      DateTime?
  
  // Relacionamentos
  contents        Content[]
  results         Result[]
  hitlActions     HITLAction[]
  
  @@map("campaigns")
}

enum CampaignStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

// ----- CONTEÚDOS -----
model Content {
  id              String    @id @default(cuid())
  clientId        String
  client          Client    @relation(fields: [clientId], references: [id])
  campaignId      String?
  campaign        Campaign? @relation(fields: [campaignId], references: [id])
  
  // Dados do Conteúdo
  type            ContentType
  title           String?
  body            String?   @db.Text
  prompt          String?   @db.Text  // prompt usado para gerar
  
  // Mídia
  mediaUrl        String?
  mediaType       String?   // image, video
  
  // Plataforma alvo
  platform        String?   // facebook, instagram, google, etc.
  
  // Status
  status          ContentStatus @default(DRAFT)
  
  // Metadados
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  approvedAt      DateTime?
  approvedBy      String?
  
  @@map("contents")
}

enum ContentType {
  AD_COPY
  HEADLINE
  CTA
  IMAGE
  VIDEO
  CAROUSEL
  STORY
  EMAIL
  LANDING_PAGE
}

enum ContentStatus {
  DRAFT
  GENERATING
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PUBLISHED
}

// ----- RESULTADOS/MÉTRICAS -----
model Result {
  id              String    @id @default(cuid())
  clientId        String
  client          Client    @relation(fields: [clientId], references: [id])
  campaignId      String?
  campaign        Campaign? @relation(fields: [campaignId], references: [id])
  
  // Métricas
  date            DateTime
  platform        String?
  
  // Métricas básicas
  impressions     Int?
  clicks          Int?
  conversions     Int?
  spent           Float?
  revenue         Float?
  
  // Métricas calculadas
  ctr             Float?    // click-through rate
  cpc             Float?    // cost per click
  cpa             Float?    // cost per acquisition
  roas            Float?    // return on ad spend
  roi             Float?    // return on investment
  
  // Dados brutos da plataforma
  rawData         Json?
  
  createdAt       DateTime  @default(now())
  
  @@map("results")
}

// ----- SISTEMA HITL -----
model HITLAction {
  id              String    @id @default(cuid())
  
  // Referência
  entityType      String    // Campaign, Content, ICP
  entityId        String
  
  // Ação
  actionType      HITLActionType
  status          HITLStatus @default(PENDING)
  
  // Contexto
  context         Json?     // dados relevantes para decisão
  agentOutput     Json?     // output do agente que gerou a ação
  
  // Decisão humana
  decision        String?   // approved, rejected, revision
  feedback        String?   @db.Text
  decidedBy       String?
  decidedAt       DateTime?
  
  // Relacionamentos
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  campaignId      String?
  campaign        Campaign? @relation(fields: [campaignId], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("hitl_actions")
}

enum HITLActionType {
  ICP_APPROVAL
  CREATIVE_APPROVAL
  BUDGET_APPROVAL
  CAMPAIGN_APPROVAL
  STRATEGY_CHANGE
  ALERT_RESPONSE
}

enum HITLStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
  REVISION_REQUESTED
}

// ----- AGENT LOGS -----
model AgentLog {
  id              String    @id @default(cuid())
  
  // Identificação
  agentType       String    // research, analysis, content, platform, orchestration
  taskId          String?
  
  // Execução
  input           Json?
  output          Json?
  
  // Status
  status          String    // pending, running, completed, failed
  error           String?
  
  // Timing
  startedAt       DateTime?
  completedAt     DateTime?
  duration        Int?      // em milissegundos
  
  // Custos
  tokensUsed      Int?
  cost            Float?
  
  createdAt       DateTime  @default(now())
  
  @@map("agent_logs")
}

// ----- N8N INTEGRATION -----
model N8NWorkflow {
  id              String    @id @default(cuid())
  name            String
  webhookUrl      String
  triggerType     String    // inbound, outbound
  isActive        Boolean   @default(true)
  
  // Mapeamento
  inputMapping    Json?     // como mapear dados de entrada
  outputMapping   Json?     // como mapear dados de saída
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("n8n_workflows")
}

// ----- NOTIFICAÇÕES -----
model Notification {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  type            String    // hitl_required, alert, info
  title           String
  message         String    @db.Text
  
  isRead          Boolean   @default(false)
  readAt          DateTime?
  
  // Referência
  entityType      String?
  entityId        String?
  
  createdAt       DateTime  @default(now())
  
  @@map("notifications")
}

// ----- CONFIGURAÇÕES DO SISTEMA -----
model SystemConfig {
  id              String    @id @default(cuid())
  key             String    @unique
  value           Json?
  description     String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("system_configs")
}
```

---

## 5. INTEGRAÇÕES

### 5.1 Integração com N8N

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FLUXO N8N ↔ SAAS                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  WEBHOOKS DE SAÍDA (SaaS → N8N):                                         │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ POST /api/webhooks/n8n/outbound                                 │     │
│  │                                                                  │     │
│  │ Eventos disparados:                                              │     │
│  │ • campaign.created      → N8N cria campanha nas plataformas     │     │
│  │ • content.approved      → N8N publica conteúdo                  │     │
│  │ • hitl.pending          → N8N notifica supervisor              │     │
│  │ • result.new            → N8N processa novos dados             │     │
│  │ • alert.triggered       → N8N envia alertas                    │     │
│  │                                                                  │     │
│  │ Payload exemplo:                                                 │     │
│  │ {                                                                │     │
│  │   "event": "campaign.created",                                  │     │
│  │   "timestamp": "2024-01-15T10:30:00Z",                         │     │
│  │   "data": {                                                      │     │
│  │     "campaignId": "clx123...",                                  │     │
│  │     "name": "Campanha Black Friday",                            │     │
│  │     "platforms": ["facebook", "google"],                        │     │
│  │     "budget": 5000,                                             │     │
│  │     "targeting": {...}                                          │     │
│  │   }                                                              │     │
│  │ }                                                                │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  WEBHOOKS DE ENTRADA (N8N → SaaS):                                       │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ POST /api/webhooks/n8n/inbound                                  │     │
│  │                                                                  │     │
│  │ Eventos recebidos:                                               │     │
│  │ • platform.metrics      → Atualiza métricas de campanha        │     │
│  │ • platform.leads        → Novos leads capturados               │     │
│  │ • platform.conversions  → Novas conversões                     │     │
│  │ • external.data         → Dados de fontes externas             │     │
│  │                                                                  │     │
│  │ Payload exemplo:                                                 │     │
│  │ {                                                                │     │
│  │   "event": "platform.metrics",                                  │     │
│  │   "source": "facebook",                                         │     │
│  │   "campaignId": "fb_123456",                                    │     │
│  │   "data": {                                                      │     │
│  │     "impressions": 50000,                                       │     │
│  │     "clicks": 1250,                                             │     │
│  │     "spent": 450.00,                                            │     │
│  │     "conversions": 45                                           │     │
│  │   }                                                              │     │
│  │ }                                                                │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 APIs Externas

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         APIS EXTERNAS INTEGRADAS                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ META GRAPH API (Facebook/Instagram)                             │     │
│  │                                                                  │     │
│  │ Funcionalidades:                                                 │     │
│  │ • Criar/gerenciar campanhas de ads                              │     │
│  │ • Criar/gerenciar ad sets e ads                                 │     │
│  │ • Upload de criativos (imagens/vídeos)                          │     │
│  │ • Buscar métricas de performance                                │     │
│  │ • Gerenciar pixels e eventos de conversão                       │     │
│  │ • Criar audiências personalizadas                               │     │
│  │                                                                  │     │
│  │ Endpoint base: https://graph.facebook.com/v18.0/                │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ GOOGLE ADS API                                                   │     │
│  │                                                                  │     │
│  │ Funcionalidades:                                                 │     │
│  │ • Criar/gerenciar campanhas                                     │     │
│  │ • Gerenciar grupos de anúncios e anúncios                       │     │
│  │ • Gerenciar palavras-chave                                      │     │
│  │ • Buscar relatórios de performance                              │     │
│  │ • Gerenciar orçamentos                                          │     │
│  │                                                                  │     │
│  │ Endpoint base: https://googleads.googleapis.com/v15/            │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ IMAGE GENERATION (via z-ai-web-dev-sdk)                         │     │
│  │                                                                  │     │
│  │ Funcionalidades:                                                 │     │
│  │ • Gerar imagens para anúncios                                   │     │
│  │ • Criar variações de criativos                                  │     │
│  │ • Gerar thumbnails para vídeos                                  │     │
│  │                                                                  │     │
│  │ Uso: z-ai-web-dev-sdk images.generations.create()               │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ VIDEO GENERATION (via z-ai-web-dev-sdk)                         │     │
│  │                                                                  │     │
│  │ Funcionalidades:                                                 │     │
│  │ • Gerar vídeos para anúncios                                    │     │
│  │ • Criar conteúdo para stories/reels                             │     │
│  │                                                                  │     │
│  │ Uso: z-ai-web-dev-sdk videos.generations.create()               │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ LLM (via z-ai-web-dev-sdk)                                      │     │
│  │                                                                  │     │
│  │ Funcionalidades:                                                 │     │
│  │ • Gerar copy para anúncios                                      │     │
│  │ • Criar headlines e CTAs                                        │     │
│  │ • Analisar dados e gerar insights                               │     │
│  │ • Resumir relatórios                                            │     │
│  │ • Sugerir otimizações                                           │     │
│  │                                                                  │     │
│  │ Uso: z-ai-web-dev-sdk chat.completions.create()                 │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. ESTRUTURA DE PASTAS

```
growth-marketing-saas/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing/Dashboard
│   │   ├── layout.tsx                # Layout principal
│   │   │
│   │   ├── (auth)/                   # Grupo de rotas de auth
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/              # Grupo de rotas protegidas
│   │   │   ├── dashboard/page.tsx    # Dashboard principal
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx          # Lista de clientes
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhes do cliente
│   │   │   │       ├── icp/page.tsx  # ICP do cliente
│   │   │   │       └── campaigns/page.tsx
│   │   │   │
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx          # Todas as campanhas
│   │   │   │   ├── new/page.tsx      # Criar campanha
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhes
│   │   │   │       └── edit/page.tsx
│   │   │   │
│   │   │   ├── content/
│   │   │   │   ├── page.tsx          # Biblioteca de conteúdo
│   │   │   │   ├── generate/page.tsx # Gerar conteúdo
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── results/
│   │   │   │   ├── page.tsx          # Relatórios
│   │   │   │   └── [campaignId]/page.tsx
│   │   │   │
│   │   │   └── hitl/
│   │   │       ├── page.tsx          # Painel de aprovações
│   │   │       └── [id]/page.tsx     # Aprovação específica
│   │   │
│   │   └── api/                      # API Routes
│   │       ├── auth/[...nextauth]/route.ts
│   │       │
│   │       ├── clients/
│   │       │   ├── route.ts          # GET, POST
│   │       │   └── [id]/route.ts     # GET, PUT, DELETE
│   │       │
│   │       ├── campaigns/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── launch/route.ts
│   │       │
│   │       ├── content/
│   │       │   ├── route.ts
│   │       │   ├── generate/route.ts # Gera conteúdo com IA
│   │       │   └── [id]/route.ts
│   │       │
│   │       ├── agents/               # Sistema Agêntico
│   │       │   ├── research/route.ts
│   │       │   ├── analysis/route.ts
│   │       │   ├── content/route.ts
│   │       │   ├── orchestrate/route.ts
│   │       │   └── hitl/
│   │       │       ├── route.ts
│   │       │       └── [id]/decide/route.ts
│   │       │
│   │       ├── webhooks/             # Integrações
│   │       │   ├── n8n/
│   │       │   │   ├── inbound/route.ts
│   │       │   │   └── outbound/route.ts
│   │       │   ├── meta/route.ts
│   │       │   └── google/route.ts
│   │       │
│   │       └── results/
│   │           ├── route.ts
│   │           └── sync/route.ts     # Sincroniza com plataformas
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── CampaignChart.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignForm.tsx
│   │   │   └── CampaignStatus.tsx
│   │   ├── content/
│   │   │   ├── ContentCard.tsx
│   │   │   ├── ContentGenerator.tsx
│   │   │   └── ContentPreview.tsx
│   │   ├── hitl/
│   │   │   ├── ApprovalQueue.tsx
│   │   │   ├── ApprovalCard.tsx
│   │   │   └── ApprovalModal.tsx
│   │   └── agents/
│   │       ├── AgentStatus.tsx
│   │       └── AgentLogViewer.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── utils.ts
│   │   └── validations/              # Zod schemas
│   │
│   ├── agents/                       # Sistema Agêntico
│   │   ├── index.ts                  # Export principal
│   │   ├── orchestrator.ts           # Agente mestre
│   │   ├── types.ts                  # Tipos compartilhados
│   │   │
│   │   ├── research/                 # Agente de Pesquisa
│   │   │   ├── index.ts
│   │   │   ├── icp-discovery.ts
│   │   │   ├── market-research.ts
│   │   │   └── competitor-analysis.ts
│   │   │
│   │   ├── analysis/                 # Agente de Análise
│   │   │   ├── index.ts
│   │   │   ├── data-analysis.ts
│   │   │   ├── metrics.ts
│   │   │   └── insights.ts
│   │   │
│   │   ├── content/                  # Agente de Conteúdo
│   │   │   ├── index.ts
│   │   │   ├── copywriter.ts
│   │   │   ├── image-generator.ts
│   │   │   └── video-generator.ts
│   │   │
│   │   ├── platforms/                # Agente de Plataformas
│   │   │   ├── index.ts
│   │   │   ├── meta-ads.ts
│   │   │   ├── google-ads.ts
│   │   │   └── social-media.ts
│   │   │
│   │   ├── management/               # Agente de Gestão
│   │   │   ├── index.ts
│   │   │   ├── campaign-manager.ts
│   │   │   ├── budget-optimizer.ts
│   │   │   └── alerts.ts
│   │   │
│   │   ├── hitl/                     # Sistema HITL
│   │   │   ├── index.ts
│   │   │   ├── manager.ts
│   │   │   └── triggers.ts
│   │   │
│   │   └── memory/                   # Sistema de Memória
│   │       ├── index.ts
│   │       ├── context.ts
│   │       └── storage.ts
│   │
│   ├── integrations/                 # Integrações externas
│   │   ├── n8n/
│   │   │   ├── client.ts
│   │   │   └── handlers.ts
│   │   ├── meta/
│   │   │   ├── client.ts
│   │   │   ├── campaigns.ts
│   │   │   └── metrics.ts
│   │   ├── google-ads/
│   │   │   ├── client.ts
│   │   │   ├── campaigns.ts
│   │   │   └── reports.ts
│   │   └── ai/
│   │       ├── llm.ts
│   │       ├── image.ts
│   │       └── video.ts
│   │
│   └── hooks/                        # React hooks
│       ├── use-campaigns.ts
│       ├── use-content.ts
│       ├── use-hitl.ts
│       └── use-agents.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── public/
│   ├── images/
│   └── icons/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: MVP (Semanas 1-4)
**Objetivo: Sistema funcional com fluxo básico**

| Semana | Entregáveis |
|--------|-------------|
| 1 | Setup projeto, autenticação, modelo de dados, CRUD clientes |
| 2 | Sistema agêntico básico (orchestrator + research agent) |
| 3 | Geração de conteúdo (copy + imagens), interface básica |
| 4 | Sistema HITL simples, integração N8N webhook |

**Features MVP:**
- ✅ Cadastro de clientes
- ✅ Descoberta de ICP automatizada
- ✅ Geração de copy para anúncios
- ✅ Geração de imagens para anúncios
- ✅ Fluxo de aprovação HITL
- ✅ Webhook para N8N

### FASE 2: Crescimento (Semanas 5-8)
**Objetivo: Funcionalidades de campanha**

| Semana | Entregáveis |
|--------|-------------|
| 5 | Agente de análise, dashboards de métricas |
| 6 | Integração Meta Graph API |
| 7 | Integração Google Ads API |
| 8 | Agente de gestão, otimização automática |

**Features Fase 2:**
- ✅ Criação de campanhas via API
- ✅ Sincronização de métricas
- ✅ Dashboards de performance
- ✅ Alertas automáticos

### FASE 3: Escala (Semanas 9-12)
**Objetivo: Recursos avançados e refinamento**

| Semana | Entregáveis |
|--------|-------------|
| 9 | Geração de vídeo, stories/reels |
| 10 | Sistema de relatórios automatizados |
| 11 | Notificações, email automático |
| 12 | Testes, otimização, documentação |

**Features Fase 3:**
- ✅ Geração de vídeo para anúncios
- ✅ Relatórios automáticos
- ✅ Sistema de notificações
- ✅ Documentação completa

---

## 8. INTERFACE DO USUÁRIO

### 8.1 Dashboard Principal

```
┌──────────────────────────────────────────────────────────────────────────┐
│  GROWTH STUDIO                    🔔 3    👤 Admin ▼                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐  Campanhas   │  Conteúdo   │  Resultados   │  HITL (3)    │
│  │ Menu    │                                                              │
│  │         │  ┌──────────────────────────────────────────────────────┐   │
│  │ Dashboard│  │  MÉTRICAS GERAIS                                          │   │
│  │ Clientes│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │   │
│  │ Campanha│  │  │ 28.5K   │  │ R$45.2K │  │ 1.2K    │  │ 4.8x    │ │   │
│  │ Conteúdo│  │  │Impressões│  │ Gasto   │  │ Leads   │  │ ROAS    │ │   │
│  │ Resulta.│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │   │
│  │         │  │      ↑12%        ↑8%         ↑25%        ↑15%       │   │
│  │ HITL    │  └──────────────────────────────────────────────────────┘   │
│  │ Config. │                                                              │
│  │         │  ┌──────────────────────────────────────────────────────┐   │
│  └─────────┘  │  CAMPANHAS ATIVAS                                        │   │
│               │  ┌────────────────────────────────────────────────────┐ │   │
│               │  │ Black Friday 2024    │ Meta │ R$5K  │ ⚫ Ativa    │ │   │
│               │  │ Launch Produto X     │ Google│ R$3K  │ ⚫ Ativa    │ │   │
│               │  │ Remarketing Q4       │ Meta │ R$2K  │ 🟡 Pausada  │ │   │
│               │  └────────────────────────────────────────────────────┘ │   │
│               └──────────────────────────────────────────────────────┘   │
│                                                                          │
│               ┌──────────────────────────────────────────────────────┐   │
│               │  AGUARDANDO APROVAÇÃO (HITL)                           │   │
│               │  ┌────────────────────────────────────────────────────┐ │   │
│               │  │ 🔴 Criativos - Cliente ABC    │ Há 2h  │ [Ver]    │ │   │
│               │  │ 🟡 ICP - Cliente XYZ          │ Há 5h  │ [Ver]    │ │   │
│               │  │ 🟢 Budget - Campanha Black    │ Há 1d  │ [Ver]    │ │   │
│               │  └────────────────────────────────────────────────────┘ │   │
│               └──────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Fluxo HITL

```
┌──────────────────────────────────────────────────────────────────────────┐
│  APROVAÇÃO: Criativos Campanha Black Friday                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cliente: Loja ABC                                                       │
│  Campanha: Black Friday 2024                                             │
│  Plataforma: Meta (Facebook/Instagram)                                   │
│  Agente: AGENTE_CONTEUDO                                                 │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────    │
│                                                                          │
│  CRIATIVO 1 - FEED                                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────┐                                                      │  │
│  │  │         │  📱 Black Friday chegou!                             │  │
│  │  │  [IMG]  │                                                      │  │
│  │  │         │  Descontos de até 70% em todos os produtos.          │  │
│  │  │         │                                                      │  │
│  │  └─────────┘  🔥 Corra antes que acabe!                           │  │
│  │                                                                      │  │
│  │  CTA: Compre Agora    |    Destino: lojaabc.com.br/black-friday    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  CRIATIVO 2 - STORIES                                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────┐                                                      │  │
│  │  │         │  🛒 Sua lista de desejos com 70% OFF!                │  │
│  │  │  [IMG]  │                                                      │  │
│  │  │         │  [Botão: Comprar]                                    │  │
│  │  └─────────┘                                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────    │
│                                                                          │
│  💬 Feedback (opcional):                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  [❌ Rejeitar Todos]  [🔄 Solicitar Ajustes]  [✅ Aprovar Todos]         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. PRÓXIMOS PASSOS

1. **Confirmar Arquitetura**: Validar se atende às necessidades
2. **Priorizar Features**: Definir o que entra no MVP
3. **Iniciar Desenvolvimento**: Começar pela Fase 1
4. **Configurar N8N**: Preparar webhooks de integração
5. **Testar Fluxo**: Validar com um cliente piloto

---

*Documento criado em: Janeiro 2025*
*Versão: 1.0*
