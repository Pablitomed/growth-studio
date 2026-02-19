// Growth Studio - Configuração dos 15 Agentes Especializados
export const AGENTES = {
  // Agentes de Pesquisa
  PESQUISA_MERCADO: {
    id: 'pesquisa_mercado',
    nome: 'Pesquisa de Mercado',
    descricao: 'Analisa tendências, concorrência e oportunidades de mercado',
    icone: 'BarChart3',
    categoria: 'pesquisa',
    tierMinimo: 'orchestrado',
  },
  PESQUISA_ICP: {
    id: 'pesquisa_icp',
    nome: 'Definição de ICP',
    descricao: 'Identifica e refina o Perfil do Cliente Ideal',
    icone: 'Target',
    categoria: 'pesquisa',
    tierMinimo: 'assistivo',
  },
  PESQUISA_PALAVRAS_CHAVE: {
    id: 'pesquisa_palavras_chave',
    nome: 'Palavras-Chave',
    descricao: 'Pesquisa e análise de keywords para SEO e anúncios',
    icone: 'Search',
    categoria: 'pesquisa',
    tierMinimo: 'orchestrado',
  },

  // Agentes de Conteúdo
  CONTEUDO_COPY: {
    id: 'conteudo_copy',
    nome: 'Copywriter',
    descricao: 'Gera headlines, copies e chamadas para ação',
    icone: 'PenTool',
    categoria: 'conteudo',
    tierMinimo: 'assistivo',
  },
  CONTEUDO_IMAGEM: {
    id: 'conteudo_imagem',
    nome: 'Designer Visual',
    descricao: 'Cria imagens, banners e criativos visuais',
    icone: 'Image',
    categoria: 'conteudo',
    tierMinimo: 'orchestrado',
  },
  CONTEUDO_VIDEO: {
    id: 'conteudo_video',
    nome: 'Produtor de Vídeo',
    descricao: 'Gera vídeos curtos para redes sociais e anúncios',
    icone: 'Video',
    categoria: 'conteudo',
    tierMinimo: 'agentic',
  },
  CONTEUDO_GEO: {
    id: 'conteudo_geo',
    nome: 'Otimizador GEO',
    descricao: 'Cria conteúdo otimizado para motores de IA (Share of Model)',
    icone: 'Brain',
    categoria: 'conteudo',
    tierMinimo: 'agentic',
  },

  // Agentes de Plataformas
  PLATAFORMA_META: {
    id: 'plataforma_meta',
    nome: 'Especialista Meta',
    descricao: 'Gerencia campanhas no Facebook e Instagram',
    icone: 'Facebook',
    categoria: 'plataformas',
    tierMinimo: 'orchestrado',
  },
  PLATAFORMA_GOOGLE: {
    id: 'plataforma_google',
    nome: 'Especialista Google',
    descricao: 'Gerencia Google Ads, Search e Display',
    icone: 'Google',
    categoria: 'plataformas',
    tierMinimo: 'orchestrado',
  },
  PLATAFORMA_TIKTOK: {
    id: 'plataforma_tiktok',
    nome: 'Especialista TikTok',
    descricao: 'Gerencia campanhas no TikTok Ads',
    icone: 'TikTok',
    categoria: 'plataformas',
    tierMinimo: 'agentic',
  },

  // Agentes de Análise
  ANALISE_METRICAS: {
    id: 'analise_metricas',
    nome: 'Analista de Métricas',
    descricao: 'Processa e interpreta dados de performance',
    icone: 'TrendingUp',
    categoria: 'analise',
    tierMinimo: 'assistivo',
  },
  ANALISE_PROIM: {
    id: 'analise_proim',
    nome: 'PROIM - ROI Preditivo',
    descricao: 'Prevê ROI antes da conversão usando micro-sinais',
    icone: 'LineChart',
    categoria: 'analise',
    tierMinimo: 'agentic',
  },
  ANALISE_PRONTIDAO: {
    id: 'analise_prontidao',
    nome: 'Detector de Prontidão',
    descricao: 'Identifica prontidão emocional para compra',
    icone: 'Heart',
    categoria: 'analise',
    tierMinimo: 'agentic',
  },

  // Agentes de Gestão
  GESTAO_ORQUESTRADOR: {
    id: 'gestao_orquestrador',
    nome: 'Orquestrador',
    descricao: 'Coordena todos os agentes e decisões',
    icone: 'Zap',
    categoria: 'gestao',
    tierMinimo: 'assistivo',
  },
  GESTAO_AUTONOMO: {
    id: 'gestao_autonomo',
    nome: 'Gestor Autônomo',
    descricao: 'Toma decisões automáticas de baixo risco',
    icone: 'Cpu',
    categoria: 'gestao',
    tierMinimo: 'autonomo',
  },
} as const;

export type AgenteTipo = keyof typeof AGENTES;

// Categorias de agentes
export const CATEGORIAS_AGENTES = {
  pesquisa: { nome: 'Pesquisa', cor: 'blue' },
  conteudo: { nome: 'Conteúdo', cor: 'purple' },
  plataformas: { nome: 'Plataformas', cor: 'green' },
  analise: { nome: 'Análise', cor: 'orange' },
  gestao: { nome: 'Gestão', cor: 'emerald' },
} as const;

// Tiers de serviço
export const TIERS_SERVICO = {
  assistivo: {
    nome: 'Assistivo',
    preco: 997,
    agentes: ['pesquisa_icp', 'conteudo_copy', 'analise_metricas', 'gestao_orquestrador'],
    decisoesHITLSemana: 1,
    features: ['1 HITL por semana', 'Relatórios mensais', 'Suporte por email'],
  },
  orchestrado: {
    nome: 'Orquestrado',
    preco: 2497,
    agentes: ['pesquisa_mercado', 'pesquisa_icp', 'pesquisa_palavras_chave', 'conteudo_copy', 'conteudo_imagem', 'plataforma_meta', 'plataforma_google', 'analise_metricas', 'gestao_orquestrador'],
    decisoesHITLSemana: 3,
    features: ['Agentes de conteúdo', 'GEO básico', '3 HITL por semana', 'Relatórios semanais'],
  },
  agentic: {
    nome: 'Agêntico',
    preco: 4997,
    agentes: Object.keys(AGENTES).filter(a => a !== 'gestao_autonomo'),
    decisoesHITLSemana: 7,
    features: ['Todos os 14 agentes', 'PROIM', 'Share of Model', 'Prontidão Emocional', 'HITL diário'],
  },
  autonomo: {
    nome: 'Autônomo',
    preco: 9977,
    agentes: Object.keys(AGENTES),
    decisoesHITLSemana: -1, // Ilimitado
    features: ['15 agentes completos', 'Decisões automáticas', 'API aberta', 'Vibe Strategy', 'Dedicated success manager'],
  },
} as const;

export type TierTipo = keyof typeof TIERS_SERVICO;
