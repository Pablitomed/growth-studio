import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// API Key para autenticação N8N (em produção, usar variável de ambiente)
const N8N_API_KEY = process.env.N8N_API_KEY || 'growth-studio-n8n-key-2024';

// POST /api/integrations/n8n/webhook - Recebe webhooks do N8N
export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (apiKey !== N8N_API_KEY) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { tipo, clienteId, payload } = data;

    let resultado: any = {};

    switch (tipo) {
      case 'novo_lead':
        resultado = await processarNovoLead(clienteId, payload);
        break;
      
      case 'resultado_campanha':
        resultado = await processarResultadoCampanha(clienteId, payload);
        break;
      
      case 'insight_agente':
        resultado = await processarInsightAgente(clienteId, payload);
        break;
      
      case 'decisao_hitl':
        resultado = await criarDecisaoHITL(clienteId, payload);
        break;
      
      case 'geo_metric':
        resultado = await registrarGEOMetric(clienteId, payload);
        break;
      
      case 'proim_metric':
        resultado = await registrarPROIMMetric(clienteId, payload);
        break;
      
      case 'executar_agente':
        resultado = await executarAgente(clienteId, payload);
        break;
      
      default:
        return NextResponse.json({ error: 'Tipo de webhook desconhecido' }, { status: 400 });
    }

    return NextResponse.json({ success: true, resultado });
  } catch (error) {
    console.error('Erro no webhook N8N:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}

// GET /api/integrations/n8n/webhook - Lista webhooks configurados
export async function GET(request: NextRequest) {
  try {
    const webhooks = await prisma.webhookN8N.findMany({
      where: { ativo: true }
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    return NextResponse.json({ error: 'Erro ao buscar webhooks' }, { status: 500 });
  }
}

// Funções de processamento

async function processarNovoLead(clienteId: string, payload: any) {
  return await prisma.logAgente.create({
    data: {
      clienteId,
      agente: 'plataformas',
      tarefa: 'novo_lead',
      entrada: payload,
      saida: { processado: true },
      status: 'concluido',
      iniciadoEm: new Date(),
      concluidoEm: new Date(),
    }
  });
}

async function processarResultadoCampanha(clienteId: string, payload: any) {
  const { campanhaId, plataforma, data, ...metricas } = payload;
  
  return await prisma.resultado.create({
    data: {
      clienteId,
      campanhaId: campanhaId || null,
      data: new Date(data || new Date()),
      plataforma,
      impressoes: metricas.impressoes || 0,
      cliques: metricas.cliques || 0,
      conversoes: metricas.conversoes || 0,
      gasto: metricas.gasto || 0,
      receita: metricas.receita || 0,
      ctr: metricas.ctr || null,
      cpc: metricas.cpc || null,
      cpa: metricas.cpa || null,
      roas: metricas.roas || (metricas.receita && metricas.gasto ? metricas.receita / metricas.gasto : null),
      dadosBrutos: metricas,
    }
  });
}

async function processarInsightAgente(clienteId: string, payload: any) {
  return await prisma.insightAgente.create({
    data: {
      clienteId,
      agenteExecucaoId: payload.agenteExecucaoId || null,
      tipo: payload.tipo,
      titulo: payload.titulo,
      descricao: payload.descricao,
      impacto: payload.impacto || null,
      dadosSuporte: payload.dadosSuporte || null,
      acaoSugerida: payload.acaoSugerida || null,
    }
  });
}

async function criarDecisaoHITL(clienteId: string, payload: any) {
  return await prisma.decisaoHITL.create({
    data: {
      clienteId,
      campanhaId: payload.campanhaId || null,
      conteudoId: payload.conteudoId || null,
      tipo: payload.tipo,
      titulo: payload.titulo,
      descricao: payload.descricao || null,
      contexto: payload.contexto || null,
      recomendacao: payload.recomendacao || null,
      nivelRisco: payload.nivelRisco || 'baixo',
      urgencia: payload.urgencia || 'normal',
      status: 'pendente',
    }
  });
}

async function registrarGEOMetric(clienteId: string, payload: any) {
  return await prisma.gEOMetrics.create({
    data: {
      clienteId,
      shareOfModel: payload.shareOfModel || null,
      totalCitacoes: payload.totalCitacoes || null,
      minhasCitacoes: payload.minhasCitacoes || null,
      chatGPT: payload.chatGPT || null,
      perplexity: payload.perplexity || null,
      gemini: payload.gemini || null,
      claude: payload.claude || null,
      densidadeScore: payload.densidadeScore || null,
      informationGain: payload.informationGain || null,
      g2Score: payload.g2Score || null,
      redditMentions: payload.redditMentions || null,
      quoraMentions: payload.quoraMentions || null,
    }
  });
}

async function registrarPROIMMetric(clienteId: string, payload: any) {
  return await prisma.pROIMMetrics.create({
    data: {
      clienteId,
      campanhaId: payload.campanhaId || null,
      scrollDepth: payload.scrollDepth || null,
      hoverTime: payload.hoverTime || null,
      recorrencia: payload.recorrencia || null,
      interacaoTools: payload.interacaoTools || null,
      prontidaoScore: payload.prontidaoScore || null,
      frustracaoCount: payload.frustracaoCount || null,
      ansiedadeCount: payload.ansiedadeCount || null,
      engajamentoAlto: payload.engajamentoAlto || null,
      climaLocal: payload.climaLocal || null,
      horaDia: payload.horaDia || null,
      diaSemana: payload.diaSemana || null,
      probabilidadeConv: payload.probabilidadeConv || null,
      conversoesEstim: payload.conversoesEstim || null,
      roiEstimado: payload.roiEstimado || null,
    }
  });
}

async function executarAgente(clienteId: string, payload: any) {
  const { agenteTipo, tarefa, entrada } = payload;
  
  const execucao = await prisma.agenteExecucao.create({
    data: {
      clienteId,
      agenteTipo,
      nomeAgente: agenteTipo,
      tarefa,
      descricao: payload.descricao || null,
      entrada: entrada || null,
      status: 'executando',
      iniciadoEm: new Date(),
      requerAprovacao: payload.requerAprovacao || false,
    }
  });

  return execucao;
}
