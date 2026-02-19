# 🏗️ Arquitetura do SaaS Growth Marketing Agêntico

## 📋 Visão Geral

Este documento descreve a arquitetura completa de um SaaS de Growth Marketing automatizado com sistema agêntico HITL (Human-in-the-loop), projetado para integração com N8N, Google Antigravity, e plataformas de marketing.

---

## 1. 🎯 Objetivos do Sistema

### 1.1 Metas Principais
- **Automatização inteligente** de processos de marketing
- **Supervisão humana** através de HITL para qualidade e controle
- **Orquestração agêntica** para tarefas complexas multi-etapa
- **Integração nativa** com N8N e plataformas de marketing

### 1.2 Principais Stakeholders
- **Gestores de Marketing**: Configuração e supervisão de campanhas
- **Analistas**: Revisão de insights e recomendações
- **Criativos**: Aprovação e ajuste de conteúdo gerado
- **Administradores**: Gestão do sistema e usuários

---

## 2. 🏛️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js 16)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Dashboard  │ │  Campanhas  │ │   HITL      │ │  Analytics  │          │
│  │   Principal │ │   Manager   │ │  Approval   │ │   Views     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Next.js API Routes)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  REST API   │ │  WebSocket  │ │  Webhooks   │ │   Auth      │          │
│  │  Endpoints  │ │   Server    │ │  Receiver   │ │  NextAuth   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGENTIC ORCHESTRATION LAYER                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         ORCHESTRATOR ENGINE                            │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │ │
│  │  │ Research│ │Analysis │ │Content  │ │Campaign │ │ HITL    │        │ │
│  │  │ Agent   │ │ Agent   │ │ Agent   │ │ Agent   │ │ Manager │        │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         STATE MANAGEMENT                               │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                     │ │
│  │  │  Workflow   │ │  Task       │ │  HITL       │                     │ │
│  │  │  State      │ │  Queue      │ │  Pending    │                     │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTEGRATION LAYER                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    N8N      │ │  Graph API  │ │ Google Ads  │ │  AI APIs    │          │
│  │  Webhooks   │ │   Meta      │ │    API      │ │ (Video/Img) │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER (Prisma + SQLite/PostgreSQL)            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Users     │ │ Campaigns   │ │   Agents    │ │  Workflows  │          │
│  │   Auth      │ │ Results     │ │   Tasks     │ │  HITL       │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 🤖 Sistema Agêntico

### 3.1 Arquitetura de Agentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│  (Coordena todos os agentes e gerencia fluxos complexos)        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Recebe objetivos de campanha                          │   │
│  │  - Decompõe em subtarefas                                │   │
│  │  - Distribui para agentes especializados                 │   │
│  │  - Monitora progresso e qualidade                        │   │
│  │  - Aciona HITL quando necessário                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   RESEARCH    │   │   ANALYSIS    │   │   CONTENT     │
│    AGENT      │   │    AGENT      │   │    AGENT      │
│               │   │               │   │               │
│ - Pesquisa    │   │ - Análise     │   │ - Criação     │
│   de Mercado  │   │   de Dados    │   │   de Copy     │
│ - ICP         │   │ - Insights    │   │ - Imagens     │
│ - Concorrentes│   │ - Métricas    │   │ - Vídeos      │
│ - Tendências  │   │ - Relatórios  │   │ - Variações   │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN MANAGEMENT AGENT                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Execução de campanhas                                 │   │
│  │  - Otimização contínua                                   │   │
│  │  - Integração com APIs externas                          │   │
│  │  - Reporte de resultados                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         HITL MANAGER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Gerencia aprovações pendentes                         │   │
│  │  - Notifica usuários                                     │   │
│  │  - Coleta feedback                                       │   │
│  │  - Aplica correções                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Definição de Cada Agente

#### 3.2.1 Orchestrator Agent
**Responsabilidade Principal**: Coordenação e gestão de fluxos complexos

```typescript
interface OrchestratorAgentConfig {
  name: 'orchestrator';
  responsibilities: [
    'Receber objetivos de campanha do usuário',
    'Decompor objetivos em tarefas executáveis',
    'Atribuir tarefas aos agentes especializados',
    'Monitorar progresso e qualidade das tarefas',
    'Gerenciar dependências entre tarefas',
    'Acionar HITL em pontos críticos',
    'Consolidar resultados e gerar relatórios'
  ];
  tools: [
    'TaskDecomposer',
    'AgentRouter',
    'ProgressTracker',
    'HITLTrigger',
    'ResultAggregator'
  ];
  triggers: [
    'Nova campanha criada',
    'Resultado de pesquisa disponível',
    'Conteúdo gerado aguardando aprovação',
    'Métricas de campanha atualizadas'
  ];
}
```

#### 3.2.2 Research Agent
**Responsabilidade Principal**: Coleta e síntese de informações de mercado

```typescript
interface ResearchAgentConfig {
  name: 'research';
  responsibilities: [
    'Definir ICP baseado em dados',
    'Pesquisar mercado e concorrentes',
    'Identificar tendências relevantes',
    'Coletar dados demográficos',
    'Analisar comportamento de audiência',
    'Mapear jornada do cliente'
  ];
  tools: [
    'WebSearch',
    'MarketDataAPI',
    'SocialListening',
    'CompetitorAnalysis',
    'SurveyGenerator'
  ];
  outputs: [
    'ICPDocument',
    'CompetitorReport',
    'MarketTrends',
    'AudienceInsights'
  ];
  hitlPoints: [
    'Validação de ICP definido',
    'Confirmação de concorrentes identificados',
    'Aprovação de hipóteses de mercado'
  ];
}
```

#### 3.2.3 Analysis Agent
**Responsabilidade Principal**: Análise de dados e geração de insights

```typescript
interface AnalysisAgentConfig {
  name: 'analysis';
  responsibilities: [
    'Analisar performance de campanhas',
    'Identificar padrões em dados',
    'Gerar insights acionáveis',
    'Criar visualizações de dados',
    'Calcular ROI e KPIs',
    'Sugerir otimizações'
  ];
  tools: [
    'DataProcessor',
    'StatisticalAnalyzer',
    'VisualizationEngine',
    'ROICalculator',
    'TrendDetector'
  ];
  outputs: [
    'PerformanceReport',
    'InsightCards',
    'OptimizationRecommendations',
    'DashboardMetrics'
  ];
  hitlPoints: [
    'Validação de insights críticos',
    'Aprovação de recomendações de otimização',
    'Revisão de análises complexas'
  ];
}
```

#### 3.2.4 Content Agent
**Responsabilidade Principal**: Geração de conteúdo criativo

```typescript
interface ContentAgentConfig {
  name: 'content';
  responsibilities: [
    'Criar copy para anúncios',
    'Gerar variações de texto (A/B)',
    'Produzir scripts de vídeo',
    'Criar prompts para geração de imagens',
    'Adaptar conteúdo para diferentes formatos',
    'Otimizar para SEO e engagement'
  ];
  tools: [
    'CopyGenerator',
    'ImageGeneratorAPI',
    'VideoGeneratorAPI',
    'ABTestVariants',
    'ContentOptimizer'
  ];
  outputs: [
    'AdCopy',
    'ImageAssets',
    'VideoScripts',
    'ContentVariations',
    'PlatformOptimizedContent'
  ];
  hitlPoints: [
    'Aprovação de conteúdo criativo',
    'Seleção de variações para teste',
    'Revisão de conteúdo sensível',
    'Validação de alinhamento com marca'
  ];
}
```

#### 3.2.5 Campaign Agent
**Responsabilidade Principal**: Gestão e execução de campanhas

```typescript
interface CampaignAgentConfig {
  name: 'campaign';
  responsibilities: [
    'Configurar campanhas em plataformas',
    'Monitorar performance em tempo real',
    'Aplicar otimizações automáticas',
    'Gerenciar orçamento e lances',
    'Sincronizar com N8N workflows',
    'Reportar métricas'
  ];
  tools: [
    'GraphAPIConnector',
    'GoogleAdsConnector',
    'BudgetManager',
    'BidOptimizer',
    'N8NWebhookSender'
  ];
  outputs: [
    'CampaignConfiguration',
    'PerformanceMetrics',
    'OptimizationLogs',
    'BudgetReports'
  ];
  hitlPoints: [
    'Aprovação de mudanças de orçamento',
    'Validação de configurações de campanha',
    'Autorização de otimizações críticas'
  ];
}
```

---

## 4. 🔄 Sistema HITL (Human-in-the-Loop)

### 4.1 Fluxo HITL Genérico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HITL WORKFLOW PATTERN                             │
└─────────────────────────────────────────────────────────────────────────┘

     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
     │  AGENT  │────▶│  TASK   │────▶│  HITL   │────▶│ RESULT  │
     │  START  │     │ EXECUTE │     │ CHECK   │     │ OUTPUT  │
     └─────────┘     └─────────┘     └─────────┘     └─────────┘
                           │               │
                           │               │
                           ▼               ▼
                    ┌─────────────┐  ┌─────────────┐
                    │   Result    │  │   Pending   │
                    │   Success   │  │   Approval  │
                    └─────────────┘  └─────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
             ┌─────────────┐                              ┌─────────────┐
             │   NOTIFY    │                              │   AUTO      │
             │   USER      │                              │   APPROVE   │
             └─────────────┘                              │ (low risk)  │
                    │                                     └─────────────┘
                    ▼
             ┌─────────────┐
             │   USER      │───────┬──────────┬──────────┐
             │   DECISION  │       │          │          │
             └─────────────┘       │          │          │
                                   ▼          ▼          ▼
                            ┌──────────┐ ┌──────────┐ ┌──────────┐
                            │ APPROVE  │ │  EDIT &  │ │ REJECT & │
                            │          │ │ APPROVE  │ │ REGENERATE│
                            └──────────┘ └──────────┘ └──────────┘
```

### 4.2 Níveis de HITL

```typescript
enum HITLLevel {
  // Sem intervenção humana
  FULL_AUTO = 'full_auto',
  
  // Aprovação apenas para ações críticas
  LIGHT_SUPERVISION = 'light_supervision',
  
  // Aprovação para ações moderadas e críticas
  MODERATE_SUPERVISION = 'moderate_supervision',
  
  // Aprovação para todas as ações
  FULL_SUPERVISION = 'full_supervision'
}

interface HITLConfig {
  level: HITLLevel;
  
  // Configurações por tipo de ação
  actions: {
    content_generation: {
      approvalRequired: boolean;
      autoApproveThreshold: number; // 0-100 confidence
      timeout: number; // minutos até escalar
    };
    campaign_changes: {
      approvalRequired: boolean;
      budgetThreshold: number; // valor que requer aprovação
      notifyStakeholders: string[];
    };
    research_findings: {
      approvalRequired: boolean;
      categories: string[]; // categorias que requerem aprovação
    };
  };
  
  // Escalação
  escalation: {
    timeoutMinutes: number;
    escalateTo: string[];
    autoActionOnTimeout: 'approve' | 'reject' | 'hold';
  };
}
```

### 4.3 Estados de Aprovação

```typescript
interface HITLApproval {
  id: string;
  taskId: string;
  agentName: string;
  actionType: HITLActionType;
  
  // O que está sendo aprovado
  content: {
    type: 'text' | 'image' | 'video' | 'configuration' | 'insight';
    data: any;
    preview?: string; // URL ou representação visual
    metadata: Record<string, any>;
  };
  
  // Status da aprovação
  status: HITLStatus;
  
  // Decisões
  decision?: {
    action: 'approved' | 'rejected' | 'modified';
    userId: string;
    timestamp: Date;
    comments?: string;
    modifications?: any;
  };
  
  // Metadados
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  timeoutAt: Date;
  escalationLevel: number;
}
```

---

## 5. 🔌 Integrações

### 5.1 Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION HUB                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   N8N HUB     │           │   API GATEWAY │           │   AI HUB      │
│               │           │               │           │               │
│ - Webhooks    │           │ - Graph API   │           │ - LLM APIs    │
│ - Triggers    │           │ - Google Ads  │           │ - Image Gen   │
│ - Workflows   │           │ - Analytics   │           │ - Video Gen   │
│ - Callbacks   │           │ - CRM APIs    │           │ - Audio Gen   │
└───────────────┘           └───────────────┘           └───────────────┘
```

### 5.2 N8N Integration

```typescript
interface N8NConfig {
  // Configuração do servidor N8N
  server: {
    url: string; // URL do N8N (VPS)
    apiKey: string;
  };
  
  // Webhooks de saída (SaaS → N8N)
  outboundWebhooks: {
    // Gatilho de novo conteúdo
    contentReady: {
      endpoint: '/webhook/content-ready';
      payload: {
        campaignId: string;
        contentId: string;
        type: 'text' | 'image' | 'video';
        approvedBy: string;
      };
    };
    
    // Gatilho de campanha configurada
    campaignReady: {
      endpoint: '/webhook/campaign-ready';
      payload: {
        campaignId: string;
        platform: 'meta' | 'google' | 'tiktok';
        configuration: CampaignConfiguration;
      };
    };
    
    // Gatilho de otimização
    optimizationTrigger: {
      endpoint: '/webhook/optimization';
      payload: {
        campaignId: string;
        recommendations: OptimizationRecommendation[];
        autoApply: boolean;
      };
    };
  };
  
  // Webhooks de entrada (N8N → SaaS)
  inboundWebhooks: {
    // Receber resultados de execução
    executionResult: {
      path: '/api/webhooks/n8n/execution';
      handler: 'handleN8NExecution';
    };
    
    // Receber métricas de campanha
    metricsUpdate: {
      path: '/api/webhooks/n8n/metrics';
      handler: 'handleMetricsUpdate';
    };
    
    // Receber alertas
    alerts: {
      path: '/api/webhooks/n8n/alerts';
      handler: 'handleAlerts';
    };
  };
}
```

### 5.3 Graph API (Meta/Facebook)

```typescript
interface MetaIntegration {
  // OAuth Configuration
  oauth: {
    appId: string;
    appSecret: string;
    scopes: ['ads_management', 'ads_read', 'business_management'];
    callbackUrl: '/api/auth/meta/callback';
  };
  
  // API Endpoints utilizados
  endpoints: {
    // Gerenciamento de campanhas
    campaigns: {
      create: '/{ad_account_id}/campaigns';
      update: '/{campaign_id}';
      delete: '/{campaign_id}';
      list: '/{ad_account_id}/campaigns';
    };
    
    // Criativos
    creatives: {
      create: '/{ad_account_id}/adcreatives';
      upload: '/{ad_account_id}/advideos';
    };
    
    // Insights
    insights: {
      campaign: '/{campaign_id}/insights';
      adset: '/{adset_id}/insights';
      ad: '/{ad_id}/insights';
    };
  };
  
  // Rate Limiting
  rateLimits: {
    callsPerHour: 200;
    retryStrategy: 'exponential-backoff';
  };
}
```

### 5.4 Google Ads API

```typescript
interface GoogleAdsIntegration {
  // OAuth Configuration
  oauth: {
    clientId: string;
    clientSecret: string;
    scopes: ['https://www.googleapis.com/auth/adwords'];
    callbackUrl: '/api/auth/google-ads/callback';
  };
  
  // Developer Token
  developerToken: string;
  
  // API Version
  apiVersion: 'v16';
  
  // Operations
  operations: {
    campaigns: {
      create: 'CampaignService.MutateCampaigns';
      update: 'CampaignService.MutateCampaigns';
      get: 'GoogleAdsService.Search';
    };
    
    ads: {
      create: 'AdGroupAdService.MutateAdGroupAds';
      get: 'GoogleAdsService.Search';
    };
    
    metrics: {
      query: 'GoogleAdsService.Search';
      streaming: 'GoogleAdsService.SearchStream';
    };
  };
}
```

### 5.5 AI APIs Integration

```typescript
interface AIIntegration {
  // z-ai-web-dev-sdk (já instalado)
  zai: {
    llm: {
      model: 'gpt-4' | 'claude-3' | 'gemini-pro';
      useCase: 'content-generation' | 'analysis' | 'orchestration';
    };
    image: {
      model: 'dall-e-3' | 'midjourney' | 'stable-diffusion';
      sizes: ['1024x1024', '1792x1024', '1024x1792'];
    };
    video: {
      model: 'runway' | 'pika' | 'sora';
      maxDuration: 30; // seconds
    };
  };
  
  // Fallbacks e alternativas
  alternatives: {
    image: ['replicate', 'leonardo-ai'];
    video: ['synthesia', 'heygen'];
    audio: ['eleven-labs', 'azure-tts'];
  };
}
```

---

## 6. 📊 Fluxo de Dados

### 6.1 Fluxo Principal de Campanha

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN LIFECYCLE FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

  1. INPUT PHASE
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  │   User Input                    System Input                         │
  │   ┌───────────┐                ┌───────────┐                        │
  │   │ Business  │                │ Historic  │                        │
  │   │ Context   │                │ Data      │                        │
  │   └─────┬─────┘                └─────┬─────┘                        │
  │         │                            │                               │
  │         └──────────┬─────────────────┘                               │
  │                    ▼                                                 │
  │            ┌───────────────┐                                        │
  │            │   Orchestrator│                                        │
  │            │   Agent       │                                        │
  │            └───────┬───────┘                                        │
  │                    │                                                 │
  └────────────────────┼─────────────────────────────────────────────────┘
                       ▼
  2. RESEARCH PHASE
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    │                                                │
  │            ┌───────▼───────┐                                        │
  │            │   Research    │───────┐                               │
  │            │   Agent       │       │                               │
  │            └───────────────┘       │                               │
  │                    │               │                               │
  │                    ▼               ▼                               │
  │            ┌───────────────┐ ┌───────────────┐                     │
  │            │  ICP Defined  │ │ Market Data   │                     │
  │            └───────┬───────┘ └───────┬───────┘                     │
  │                    │                 │                              │
  │                    └────────┬────────┘                              │
  │                             ▼                                       │
  │                     ┌───────────────┐                              │
  │                     │  HITL: ICP    │                              │
  │                     │  Approval     │                              │
  │                     └───────┬───────┘                              │
  │                             │                                       │
  └─────────────────────────────┼───────────────────────────────────────┘
                                ▼
  3. CONTENT PHASE
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      │                                              │
  │              ┌───────▼───────┐                                      │
  │              │   Content     │                                      │
  │              │   Agent       │                                      │
  │              └───────┬───────┘                                      │
  │                      │                                              │
  │         ┌────────────┼────────────┐                                │
  │         ▼            ▼            ▼                                │
  │   ┌──────────┐ ┌──────────┐ ┌──────────┐                          │
  │   │   Copy   │ │  Images  │ │  Videos  │                          │
  │   └────┬─────┘ └────┬─────┘ └────┬─────┘                          │
  │        │            │            │                                 │
  │        └────────────┼────────────┘                                │
  │                     ▼                                              │
  │              ┌───────────────┐                                    │
  │              │ HITL: Content │                                    │
  │              │ Approval      │                                    │
  │              └───────┬───────┘                                    │
  │                      │                                              │
  └──────────────────────┼──────────────────────────────────────────────┘
                         ▼
  4. EXECUTION PHASE
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      │                                              │
  │              ┌───────▼───────┐                                      │
  │              │   Campaign    │                                      │
  │              │   Agent       │                                      │
  │              └───────┬───────┘                                      │
  │                      │                                              │
  │         ┌────────────┼────────────┐                                │
  │         ▼            ▼            ▼                                │
  │   ┌──────────┐ ┌──────────┐ ┌──────────┐                          │
  │   │  Config  │ │  Push to │ │  Monitor │                          │
  │   │ Campaign │ │   N8N    │ │   Start  │                          │
  │   └──────────┘ └──────────┘ └──────────┘                          │
  │                      │                                              │
  │                      ▼                                              │
  │              ┌───────────────┐                                     │
  │              │  N8N Workflow │                                     │
  │              │  Executes     │                                     │
  │              └───────┬───────┘                                     │
  │                      │                                              │
  └──────────────────────┼──────────────────────────────────────────────┘
                         ▼
  5. ANALYSIS PHASE
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      │                                              │
  │              ┌───────▼───────┐                                      │
  │              │   Analysis    │                                      │
  │              │   Agent       │                                      │
  │              └───────┬───────┘                                      │
  │                      │                                              │
  │         ┌────────────┼────────────┐                                │
  │         ▼            ▼            ▼                                │
  │   ┌──────────┐ ┌──────────┐ ┌──────────┐                          │
  │   │ Collect  │ │ Generate │ │ Recommend│                          │
  │   │ Metrics  │ │ Insights │ │ Optimizes│                          │
  │   └──────────┘ └──────────┘ └──────────┘                          │
  │                      │                                              │
  │                      ▼                                              │
  │              ┌───────────────┐                                     │
  │              │   Dashboard   │                                     │
  │              │   Display     │                                     │
  │              └───────────────┘                                     │
  │                                                                      │
  └─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   LOOP:     │
                  │ Optimize &  │
                  │ Iterate     │
                  └─────────────┘
```

### 6.2 Fluxo de Webhooks N8N

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      N8N WEBHOOK FLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

  SAAS PLATFORM                                    N8N WORKFLOWS
  ┌─────────────────┐                           ┌─────────────────┐
  │                 │   POST /webhook/...       │                 │
  │  Campaign Agent │──────────────────────────▶│  Trigger Node   │
  │                 │   { campaignId, ... }     │                 │
  │                 │                           │         │       │
  └─────────────────┘                           │         ▼       │
                                                │  ┌───────────┐  │
                                                │  │ Process   │  │
                                                │  │ Campaign  │  │
                                                │  └─────┬─────┘  │
                                                │        │        │
                                                │        ▼        │
                                                │  ┌───────────┐  │
                                                │  │ Call APIs │  │
                                                │  │ (Meta/Goog│  │
                                                │  └─────┬─────┘  │
                                                │        │        │
                                                │        ▼        │
                                                │  ┌───────────┐  │
                                                │  │ Webhook   │  │
                                                │  │ Response  │  │
                                                │  └─────┬─────┘  │
                                                │        │        │
  ┌─────────────────┐                           │        │        │
  │                 │   POST /api/webhooks/n8n  │        │        │
  │  Update Status  │◀──────────────────────────┼────────┘        │
  │  & Metrics      │   { status, metrics }     │                 │
  │                 │                           └─────────────────┘
  └─────────────────┘
```

---

## 7. 🗄️ Modelo de Dados

### 7.1 Diagrama ER (Entity-Relationship)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐       ┌────────────────────┐
│       USER         │       │    ORGANIZATION    │
├────────────────────┤       ├────────────────────┤
│ id (PK)           │       │ id (PK)            │
│ email             │       │ name               │
│ name              │       │ plan               │
│ role              │       │ settings (JSON)    │
│ organizationId(FK)│──────▶│ createdAt          │
│ createdAt         │       │ updatedAt          │
│ updatedAt         │       └────────────────────┘
└────────────────────┘                 │
                                       │
        ┌──────────────────────────────┤
        │                              │
        ▼                              ▼
┌────────────────────┐       ┌────────────────────┐
│     CAMPAIGN       │       │     ICP            │
├────────────────────┤       ├────────────────────┤
│ id (PK)           │       │ id (PK)            │
│ name              │       │ organizationId(FK) │
│ status            │       │ name               │
│ platform          │       │ demographics (JSON)│
│ budget            │       │ psychographics(JSON)│
│ startDate         │       │ painPoints (JSON)  │
│ endDate           │       │ goals (JSON)       │
│ organizationId(FK)│──────▶│ channels (JSON)    │
│ icpId (FK)        │◀──────│ createdAt          │
│ settings (JSON)   │       │ updatedAt          │
│ createdAt         │       └────────────────────┘
│ updatedAt         │
└────────────────────┘
        │
        │
        ▼
┌────────────────────┐       ┌────────────────────┐
│     CONTENT        │       │     AD_SET         │
├────────────────────┤       ├────────────────────┤
│ id (PK)           │       │ id (PK)            │
│ campaignId (FK)   │──────▶│ campaignId (FK)    │
│ type              │       │ platformId         │
│ format            │       │ name               │
│ body (JSON)       │       │ targeting (JSON)   │
│ variations (JSON) │       │ budget             │
│ status            │       │ status             │
│ approvedBy (FK)   │       │ startDate          │
│ approvedAt        │       │ endDate            │
│ createdAt         │       │ settings (JSON)    │
│ updatedAt         │       └────────────────────┘
└────────────────────┘                 │
                                       │
                                       ▼
                              ┌────────────────────┐
                              │       AD           │
                              ├────────────────────┤
                              │ id (PK)            │
                              │ adSetId (FK)       │
                              │ contentId (FK)     │
                              │ platformId         │
                              │ status             │
                              │ settings (JSON)    │
                              └────────────────────┘
                                       │
                                       │
        ┌──────────────────────────────┤
        │                              │
        ▼                              ▼
┌────────────────────┐       ┌────────────────────┐
│     METRIC         │       │   AGENT_TASK       │
├────────────────────┤       ├────────────────────┤
│ id (PK)           │       │ id (PK)            │
│ adId (FK)         │       │ agentName          │
│ date              │       │ type               │
│ impressions       │       │ status             │
│ clicks            │       │ input (JSON)       │
│ conversions       │       │ output (JSON)      │
│ spend             │       │ campaignId (FK)    │
│ revenue           │       │ parentId (FK)      │
│ ctr               │       │ startedAt          │
│ cpc               │       │ completedAt        │
│ roas              │       │ error (JSON)       │
│ metadata (JSON)   │       └────────────────────┘
└────────────────────┘                 │
                                       │
                                       ▼
                              ┌────────────────────┐
                              │   HITL_APPROVAL    │
                              ├────────────────────┤
                              │ id (PK)            │
                              │ taskId (FK)        │
                              │ status             │
                              │ contentType        │
                              │ content (JSON)     │
                              │ confidence         │
                              │ riskLevel          │
                              │ requestedBy        │
                              │ reviewedBy (FK)    │
                              │ reviewedAt         │
                              │ decision           │
                              │ comments           │
                              │ timeoutAt          │
                              │ createdAt          │
                              └────────────────────┘
```

### 7.2 Schema Prisma Completo

O schema detalhado será fornecido no arquivo `prisma/schema.prisma`.

---

## 8. 📁 Estrutura de Pastas

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Grupo de rotas de autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Grupo de rotas do dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard principal
│   │   ├── campaigns/
│   │   │   ├── page.tsx              # Lista de campanhas
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Detalhes da campanha
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx      # Editar campanha
│   │   │   │   └── results/
│   │   │   │       └── page.tsx      # Resultados da campanha
│   │   │   └── new/
│   │   │       └── page.tsx          # Nova campanha
│   │   ├── icp/
│   │   │   ├── page.tsx              # Lista de ICPs
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Detalhes do ICP
│   │   ├── content/
│   │   │   ├── page.tsx              # Biblioteca de conteúdo
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Detalhes do conteúdo
│   │   ├── approvals/                # Centro de aprovações HITL
│   │   │   ├── page.tsx              # Fila de aprovações
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Detalhes da aprovação
│   │   ├── analytics/
│   │   │   └── page.tsx              # Analytics e relatórios
│   │   ├── settings/
│   │   │   ├── page.tsx              # Configurações gerais
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx          # Integrações
│   │   │   └── team/
│   │   │       └── page.tsx          # Gerenciar equipe
│   │   └── layout.tsx                # Layout do dashboard
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── meta/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   └── google-ads/
│   │   │       └── callback/
│   │   │           └── route.ts
│   │   ├── campaigns/
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, PUT, DELETE
│   │   ├── icp/
│   │   │   └── route.ts
│   │   ├── content/
│   │   │   └── route.ts
│   │   ├── approvals/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── agents/
│   │   │   ├── research/
│   │   │   │   └── route.ts
│   │   │   ├── content/
│   │   │   │   └── route.ts
│   │   │   ├── analysis/
│   │   │   │   └── route.ts
│   │   │   └── campaign/
│   │   │       └── route.ts
│   │   ├── webhooks/
│   │   │   └── n8n/
│   │   │       ├── execution/
│   │   │       │   └── route.ts
│   │   │       ├── metrics/
│   │   │       │   └── route.ts
│   │   │       └── alerts/
│   │   │           └── route.ts
│   │   └── health/
│   │       └── route.ts
│   │
│   ├── layout.tsx                    # Layout raiz
│   ├── page.tsx                      # Landing page
│   └── globals.css
│
├── agents/                           # Sistema Agêntico
│   ├── core/
│   │   ├── base-agent.ts             # Classe base para agentes
│   │   ├── orchestrator.ts           # Agente orquestrador
│   │   ├── types.ts                  # Tipos compartilhados
│   │   └── prompts/                  # Prompts do sistema
│   │       ├── orchestrator.ts
│   │       ├── research.ts
│   │       ├── analysis.ts
│   │       ├── content.ts
│   │       └── campaign.ts
│   │
│   ├── specialized/
│   │   ├── research-agent.ts         # Agente de pesquisa
│   │   ├── analysis-agent.ts         # Agente de análise
│   │   ├── content-agent.ts          # Agente de conteúdo
│   │   └── campaign-agent.ts         # Agente de campanhas
│   │
│   ├── tools/                        # Ferramentas dos agentes
│   │   ├── web-search.ts
│   │   ├── market-data.ts
│   │   ├── content-generator.ts
│   │   ├── image-generator.ts
│   │   ├── video-generator.ts
│   │   └── analytics.ts
│   │
│   └── hitl/
│       ├── manager.ts                # Gerenciador HITL
│       ├── approval-queue.ts         # Fila de aprovações
│       ├── notifications.ts          # Sistema de notificações
│       └── escalation.ts             # Sistema de escalação
│
├── services/                         # Serviços externos
│   ├── n8n/
│   │   ├── client.ts                 # Cliente N8N
│   │   ├── webhooks.ts               # Gerenciador de webhooks
│   │   └── workflows.ts              # Gerenciador de workflows
│   │
│   ├── meta/
│   │   ├── client.ts                 # Cliente Graph API
│   │   ├── campaigns.ts              # Operações de campanha
│   │   ├── creatives.ts              # Operações de criativos
│   │   └── insights.ts               # Operações de insights
│   │
│   ├── google-ads/
│   │   ├── client.ts                 # Cliente Google Ads
│   │   ├── campaigns.ts
│   │   ├── ads.ts
│   │   └── metrics.ts
│   │
│   └── ai/
│       ├── llm.ts                    # Serviço LLM
│       ├── image-gen.ts              # Geração de imagens
│       ├── video-gen.ts              # Geração de vídeos
│       └── audio-gen.ts              # Geração de áudio
│
├── workflows/                        # Fluxos de trabalho
│   ├── campaign-workflow.ts          # Workflow de campanha
│   ├── research-workflow.ts          # Workflow de pesquisa
│   ├── content-workflow.ts           # Workflow de conteúdo
│   └── optimization-workflow.ts      # Workflow de otimização
│
├── components/                       # Componentes React
│   ├── ui/                           # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── dashboard/
│   │   ├── overview-cards.tsx
│   │   ├── performance-chart.tsx
│   │   ├── recent-campaigns.tsx
│   │   └── pending-approvals.tsx
│   ├── campaigns/
│   │   ├── campaign-card.tsx
│   │   ├── campaign-form.tsx
│   │   ├── campaign-list.tsx
│   │   └── campaign-status.tsx
│   ├── icp/
│   │   ├── icp-card.tsx
│   │   ├── icp-form.tsx
│   │   └── icp-display.tsx
│   ├── content/
│   │   ├── content-card.tsx
│   │   ├── content-form.tsx
│   │   ├── content-preview.tsx
│   │   └── content-variations.tsx
│   ├── approvals/
│   │   ├── approval-card.tsx
│   │   ├── approval-actions.tsx
│   │   ├── approval-timeline.tsx
│   │   └── approval-filters.tsx
│   ├── analytics/
│   │   ├── metrics-card.tsx
│   │   ├── charts/
│   │   │   ├── performance-chart.tsx
│   │   │   ├── spend-chart.tsx
│   │   │   └── conversion-chart.tsx
│   │   └── reports/
│   │       ├── report-builder.tsx
│   │       └── report-export.tsx
│   └── agents/
│       ├── agent-status.tsx
│       ├── task-queue.tsx
│       └── agent-logs.tsx
│
├── hooks/                            # Custom hooks
│   ├── use-campaigns.ts
│   ├── use-icp.ts
│   ├── use-content.ts
│   ├── use-approvals.ts
│   ├── use-agents.ts
│   ├── use-websocket.ts
│   └── use-notifications.ts
│
├── lib/                              # Utilitários
│   ├── db.ts                         # Prisma client
│   ├── utils.ts                      # Utilitários gerais
│   ├── validations.ts                # Schemas Zod
│   ├── constants.ts                  # Constantes
│   ├── auth.ts                       # Utilitários de auth
│   └── api-client.ts                 # Cliente HTTP
│
├── stores/                           # Estado global (Zustand)
│   ├── campaign-store.ts
│   ├── approval-store.ts
│   ├── notification-store.ts
│   └── user-store.ts
│
└── types/                            # Tipos TypeScript
    ├── index.ts
    ├── campaign.ts
    ├── icp.ts
    ├── content.ts
    ├── agent.ts
    ├── hitl.ts
    └── api.ts
```

---

## 9. 🔐 Segurança e Autenticação

### 9.1 Sistema de Autenticação

```typescript
// Autenticação via NextAuth.js
interface AuthConfig {
  providers: [
    'credentials',    // Email/senha
    'google',         // OAuth Google
    'github',         // OAuth GitHub
  ];
  
  session: {
    strategy: 'jwt';
    maxAge: 7 * 24 * 60 * 60; // 7 dias
  };
  
  callbacks: {
    // Incluir organizationId no token
    jwt: (token, user) => token;
    // Incluir role na sessão
    session: (session, token) => session;
  };
}
```

### 9.2 Controle de Acesso (RBAC)

```typescript
enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

interface Permissions {
  admin: {
    campaigns: ['create', 'read', 'update', 'delete'];
    icp: ['create', 'read', 'update', 'delete'];
    content: ['create', 'read', 'update', 'delete', 'approve'];
    approvals: ['read', 'approve', 'reject'];
    settings: ['read', 'update'];
    team: ['create', 'read', 'update', 'delete'];
  };
  manager: {
    campaigns: ['create', 'read', 'update'];
    icp: ['create', 'read', 'update'];
    content: ['create', 'read', 'update', 'approve'];
    approvals: ['read', 'approve', 'reject'];
    settings: ['read'];
    team: ['read'];
  };
  analyst: {
    campaigns: ['read'];
    icp: ['read'];
    content: ['create', 'read'];
    approvals: ['read'];
    settings: [];
    team: [];
  };
  viewer: {
    campaigns: ['read'];
    icp: ['read'];
    content: ['read'];
    approvals: [];
    settings: [];
    team: [];
  };
}
```

### 9.3 Segurança de API

```typescript
interface APISecurityConfig {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000; // 15 minutos
    max: 100; // requests por window
  };
  
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',');
    credentials: true;
  };
  
  // Validação
  validation: {
    body: 'zod';
    query: 'zod';
    params: 'zod';
  };
  
  // Headers de segurança
  headers: {
    'X-Content-Type-Options': 'nosniff';
    'X-Frame-Options': 'DENY';
    'X-XSS-Protection': '1; mode=block';
  };
}
```

---

## 10. 🚀 Roadmap de Implementação

### Fase 1: Fundação (Semanas 1-3)
- [ ] Setup inicial do projeto
- [ ] Configuração do banco de dados (Prisma)
- [ ] Sistema de autenticação (NextAuth)
- [ ] Layout base do dashboard
- [ ] CRUD de campanhas

### Fase 2: Sistema Agêntico Core (Semanas 4-6)
- [ ] Implementação do agente orquestrador
- [ ] Agente de pesquisa (Research Agent)
- [ ] Sistema HITL básico
- [ ] Fila de aprovações

### Fase 3: Conteúdo e ICP (Semanas 7-9)
- [ ] Definição de ICP automatizada
- [ ] Agente de conteúdo
- [ ] Integração com APIs de IA
- [ ] Geração de variações

### Fase 4: Integrações (Semanas 10-12)
- [ ] Integração N8N (webhooks)
- [ ] Graph API (Meta)
- [ ] Google Ads API
- [ ] Sincronização de métricas

### Fase 5: Análise e Otimização (Semanas 13-15)
- [ ] Agente de análise
- [ ] Dashboards de analytics
- [ ] Sistema de recomendações
- [ ] Otimização automática

### Fase 6: Polimento e Launch (Semanas 16-18)
- [ ] Testes automatizados
- [ ] Performance optimization
- [ ] Documentação
- [ ] Deploy e monitoramento

---

## 11. 📊 Stack Tecnológico Resumido

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Framework | Next.js | 16.x |
| Runtime | Node.js/Bun | Latest |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | Latest |
| State | Zustand | 5.x |
| Data Fetching | TanStack Query | 5.x |
| ORM | Prisma | 6.x |
| Database | SQLite → PostgreSQL | - |
| Auth | NextAuth.js | 4.x |
| Validation | Zod | 4.x |
| Charts | Recharts | 2.x |
| AI SDK | z-ai-web-dev-sdk | Latest |
| Deployment | Docker + Coolify | - |

---

## 12. 🎯 Próximos Passos

1. **Revisar e aprovar** esta arquitetura
2. **Criar schema Prisma** detalhado
3. **Implementar estrutura de pastas**
4. **Começar desenvolvimento** pela Fase 1

---

*Documento criado em: Janeiro 2025*
*Versão: 1.0*
