# 🗄️ Schema Prisma - Growth Marketing SaaS

Este documento contém o schema completo do banco de dados para o sistema.

## Schema Completo

```prisma
// ============================================
// PRISMA SCHEMA - GROWTH MARKETING SAAS
// ============================================

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// USUÁRIOS E ORGANIZAÇÃO
// ============================================

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        Plan     @default(FREE)
  settings    Json?
  
  // Relacionamentos
  users       User[]
  campaigns   Campaign[]
  icps        ICP[]
  integrations Integration[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  image          String?
  role           Role     @default(VIEWER)
  
  // Organização
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Autenticação
  emailVerified  DateTime?
  accounts       Account[]
  sessions       Session[]
  
  // Relacionamentos
  approvals      HITLApproval[] @relation("ReviewedBy")
  createdContent Content[]      @relation("CreatedBy")
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([email])
  @@index([organizationId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// ICP - IDEAL CUSTOMER PROFILE
// ============================================

model ICP {
  id             String   @id @default(cuid())
  name           String
  description    String?
  
  // Organização
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Dados do ICP (JSON estruturado)
  demographics   Json?    // { age, gender, location, income, education, ... }
  psychographics Json?    // { interests, values, lifestyle, personality, ... }
  painPoints     Json?    // [{ title, description, severity }, ...]
  goals          Json?    // [{ title, description, priority }, ...]
  channels       Json?    // [{ platform, usage, preferred_content }, ...]
  buyingBehavior Json?    // { triggers, objections, decision_makers, ... }
  
  // Status
  status         ICPStatus @default(DRAFT)
  confidence     Int       @default(0)  // 0-100
  
  // Relacionamentos
  campaigns      Campaign[]
  
  // Metadados
  source         String?   // 'manual', 'ai_generated', 'hybrid'
  generatedBy    String?   // Agent ID que gerou
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([organizationId])
  @@index([status])
}

// ============================================
// CAMPANHAS
// ============================================

model Campaign {
  id             String        @id @default(cuid())
  name           String
  description    String?
  
  // Organização
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // ICP
  icpId          String?
  icp            ICP?          @relation(fields: [icpId], references: [id], onDelete: SetNull)
  
  // Configuração
  status         CampaignStatus @default(DRAFT)
  platform       Platform[]
  objective      CampaignObjective?
  budget         Float?
  currency       String        @default("BRL")
  
  // Período
  startDate      DateTime?
  endDate        DateTime?
  
  // Configurações avançadas (JSON)
  targeting      Json?         // Configurações de segmentação
  settings       Json?         // Configurações específicas da plataforma
  
  // Métricas agregadas
  metrics        CampaignMetric?
  
  // Relacionamentos
  adSets         AdSet[]
  content        Content[]
  tasks          AgentTask[]
  workflowRuns   WorkflowRun[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([organizationId])
  @@index([status])
  @@index([icpId])
}

model AdSet {
  id             String   @id @default(cuid())
  name           String
  
  // Campanha
  campaignId     String
  campaign       Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  // Configuração
  platformId     String?  // ID na plataforma externa
  status         AdStatus @default(DRAFT)
  
  // Segmentação
  targeting      Json?    // Configurações de targeting
  
  // Orçamento
  budget         Float?
  bidStrategy    String?
  bidAmount      Float?
  
  // Período
  startDate      DateTime?
  endDate        DateTime?
  
  // Relacionamentos
  ads            Ad[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([campaignId])
  @@index([status])
}

model Ad {
  id             String   @id @default(cuid())
  name           String
  
  // Ad Set
  adSetId        String
  adSet          AdSet    @relation(fields: [adSetId], references: [id], onDelete: Cascade)
  
  // Conteúdo
  contentId      String?
  
  // Configuração
  platformId     String?  // ID na plataforma externa
  status         AdStatus @default(DRAFT)
  
  // URLs
  destinationUrl String?
  displayUrl     String?
  
  // Configurações
  settings       Json?
  
  // Relacionamentos
  metrics        Metric[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([adSetId])
  @@index([status])
}

// ============================================
// CONTEÚDO
// ============================================

model Content {
  id             String        @id @default(cuid())
  name           String
  
  // Campanha
  campaignId     String
  campaign       Campaign      @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  // Tipo
  type           ContentType
  format         String?       // 'square', 'portrait', 'landscape', 'story', etc.
  
  // Conteúdo principal
  body           Json          // Estrutura do conteúdo
  
  // Variações para A/B testing
  variations     Json?         // [{ id, name, body, status }, ...]
  
  // Status
  status         ContentStatus @default(DRAFT)
  
  // Aprovação
  approvedById   String?
  approvedBy     User?         @relation("CreatedBy", fields: [approvedById], references: [id])
  approvedAt     DateTime?
  
  // Metadados
  metadata       Json?         // { generatedBy, prompt, iterations, ... }
  
  // Relacionamentos
  approvals      HITLApproval[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([campaignId])
  @@index([type])
  @@index([status])
}

// ============================================
// MÉTRICAS
// ============================================

model CampaignMetric {
  id             String   @id @default(cuid())
  campaignId     String   @unique
  campaign       Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  // Métricas agregadas
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  conversions    Int      @default(0)
  spend          Float    @default(0)
  revenue        Float    @default(0)
  
  // Métricas calculadas
  ctr            Float    @default(0)
  cpc            Float    @default(0)
  cpm            Float    @default(0)
  roas           Float    @default(0)
  conversionRate Float    @default(0)
  
  // Período
  lastUpdated    DateTime @default(now())
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Metric {
  id             String   @id @default(cuid())
  
  // Ad
  adId           String
  ad             Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  
  // Data
  date           DateTime
  
  // Métricas base
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  conversions    Int      @default(0)
  spend          Float    @default(0)
  revenue        Float    @default(0)
  
  // Métricas calculadas
  ctr            Float    @default(0)
  cpc            Float    @default(0)
  cpm            Float    @default(0)
  roas           Float    @default(0)
  
  // Dados adicionais
  metadata       Json?    // Outras métricas específicas da plataforma
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([adId, date])
  @@index([adId])
  @@index([date])
}

// ============================================
// SISTEMA AGÊNTICO
// ============================================

model AgentTask {
  id             String     @id @default(cuid())
  
  // Agente
  agentName      String     // 'orchestrator', 'research', 'analysis', 'content', 'campaign'
  type           String     // Tipo de tarefa específica
  
  // Campanha (opcional)
  campaignId     String?
  campaign       Campaign?  @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  
  // Hierarquia
  parentId       String?
  parent         AgentTask? @relation("TaskHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children       AgentTask[] @relation("TaskHierarchy")
  
  // Dados
  input          Json       // Dados de entrada
  output         Json?      // Resultado da tarefa
  
  // Status
  status         TaskStatus @default(PENDING)
  progress       Int        @default(0)  // 0-100
  
  // Erro
  error          Json?      // { message, code, details }
  
  // Timing
  startedAt      DateTime?
  completedAt    DateTime?
  duration       Int?       // em milissegundos
  
  // Recursos
  tokensUsed     Int?
  apiCalls       Int?
  
  // Relacionamentos
  approvals      HITLApproval[]
  logs           AgentLog[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([agentName])
  @@index([status])
  @@index([campaignId])
}

model AgentLog {
  id             String   @id @default(cuid())
  
  // Tarefa
  taskId         String
  task           AgentTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  // Log
  level          LogLevel
  message        String
  data           Json?
  
  createdAt      DateTime @default(now())

  @@index([taskId])
  @@index([level])
}

// ============================================
// HITL - HUMAN IN THE LOOP
// ============================================

model HITLApproval {
  id             String        @id @default(cuid())
  
  // Tarefa
  taskId         String
  task           AgentTask     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  // Conteúdo (opcional)
  contentId      String?
  content        Content?      @relation(fields: [contentId], references: [id], onDelete: SetNull)
  
  // Tipo de aprovação
  type           ApprovalType
  contentType    String        // 'text', 'image', 'video', 'configuration', 'insight'
  
  // Conteúdo para aprovação
  content_data   Json          // Dados do que está sendo aprovado
  preview        String?       // URL ou representação visual
  
  // Avaliação de risco
  confidence     Int           // 0-100
  riskLevel      RiskLevel
  
  // Status
  status         ApprovalStatus @default(PENDING)
  
  // Decisão
  reviewedById   String?
  reviewedBy     User?         @relation("ReviewedBy", fields: [reviewedById], references: [id])
  reviewedAt     DateTime?
  decision       Decision?
  comments       String?
  modifications  Json?         // Modificações feitas pelo revisor
  
  // Timeout e escalação
  timeoutAt      DateTime
  escalationLevel Int          @default(0)
  
  // Notificações
  notifiedUsers  Json?         // [{ userId, notifiedAt, channel }]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([status])
  @@index([type])
  @@index([timeoutAt])
}

// ============================================
// WORKFLOWS
// ============================================

model WorkflowRun {
  id             String       @id @default(cuid())
  
  // Campanha
  campaignId     String
  campaign       Campaign     @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  // Workflow
  workflowType   String       // 'campaign_setup', 'content_generation', 'optimization', ...
  
  // Configuração
  config         Json         // Configuração do workflow
  
  // Status
  status         WorkflowStatus @default(PENDING)
  currentStep    String?
  progress       Int          @default(0)
  
  // Resultado
  result         Json?
  error          Json?
  
  // Timing
  startedAt      DateTime?
  completedAt    DateTime?
  duration       Int?
  
  // N8N
  n8nExecutionId String?
  n8nWebhookData Json?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([campaignId])
  @@index([status])
  @@index([workflowType])
}

// ============================================
// INTEGRAÇÕES
// ============================================

model Integration {
  id             String   @id @default(cuid())
  
  // Organização
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Tipo
  type           IntegrationType
  name           String
  
  // Credenciais (encriptadas)
  credentials    Json     // Dados encriptados
  
  // Status
  status         IntegrationStatus @default(PENDING)
  lastSync       DateTime?
  
  // Metadados
  metadata       Json?    // Dados adicionais da integração
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([organizationId, type])
  @@index([organizationId])
  @@index([type])
}

// ============================================
// ENUMS
// ============================================

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum Role {
  ADMIN
  MANAGER
  ANALYST
  VIEWER
}

enum ICPStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum AdStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  PAUSED
  ARCHIVED
  REJECTED
}

enum Platform {
  META
  GOOGLE
  TIKTOK
  LINKEDIN
  TWITTER
  YOUTUBE
}

enum CampaignObjective {
  AWARENESS
  TRAFFIC
  ENGAGEMENT
  LEADS
  CONVERSIONS
  SALES
}

enum ContentType {
  TEXT
  IMAGE
  VIDEO
  CAROUSEL
  STORY
  REEL
}

enum ContentStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PUBLISHED
}

enum TaskStatus {
  PENDING
  QUEUED
  RUNNING
  WAITING_APPROVAL
  COMPLETED
  FAILED
  CANCELLED
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

enum ApprovalType {
  ICP_VALIDATION
  CONTENT_APPROVAL
  CAMPAIGN_CONFIG
  OPTIMIZATION
  INSIGHT_VALIDATION
  BUDGET_CHANGE
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  MODIFIED
  ESCALATED
  EXPIRED
}

enum Decision {
  APPROVE
  REJECT
  MODIFY
  REGENERATE
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

enum WorkflowStatus {
  PENDING
  RUNNING
  WAITING_APPROVAL
  COMPLETED
  FAILED
  CANCELLED
}

enum IntegrationType {
  META
  GOOGLE_ADS
  N8N
  GOOGLE_ANALYTICS
  HUBSPOT
  SALESFORCE
  MAILCHIMP
  ZAPIER
}
```

---

## Notas de Implementação

1. **Migração para PostgreSQL**: Para produção, alterar o provider para `postgresql` e adicionar índices adicionais.

2. **Encriptação**: As credenciais das integrações devem ser encriptadas antes de salvar.

3. **Soft Delete**: Considerar adicionar campos `deletedAt` para models que precisam de soft delete.

4. **Audit Log**: Adicionar model de audit para rastrear mudanças importantes.

5. **Rate Limiting**: Adicionar model para rate limiting se necessário.
