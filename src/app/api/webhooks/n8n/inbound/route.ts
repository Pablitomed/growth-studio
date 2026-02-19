import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/webhooks/n8n/inbound - Recebe dados do N8N
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, clienteId, data } = body;

    if (!event || !clienteId) {
      return NextResponse.json(
        { error: 'event e clienteId são obrigatórios' },
        { status: 400 }
      );
    }

    let resultado;

    switch (event) {
      case 'metrics.update':
        // Atualiza métricas de uma campanha
        resultado = await prisma.resultado.create({
          data: {
            clienteId,
            campanhaId: data.campanhaId,
            data: new Date(data.data || new Date()),
            plataforma: data.plataforma,
            impressoes: data.impressoes,
            cliques: data.cliques,
            conversoes: data.conversoes,
            gasto: data.gasto,
            receita: data.receita,
            ctr: data.ctr,
            cpc: data.cpc,
            cpa: data.cpa,
            roas: data.roas,
            dadosBrutos: data.dadosBrutos
          }
        });
        break;

      case 'campaign.create':
        // Cria nova campanha
        resultado = await prisma.campanha.create({
          data: {
            clienteId,
            nome: data.nome,
            objetivo: data.objetivo,
            plataformas: data.plataformas,
            budget: data.budget,
            status: data.status || 'rascunho'
          }
        });
        break;

      case 'content.create':
        // Cria novo conteúdo
        resultado = await prisma.conteudo.create({
          data: {
            clienteId,
            campanhaId: data.campanhaId,
            tipo: data.tipo,
            titulo: data.titulo,
            corpo: data.corpo,
            plataforma: data.plataforma,
            mediaUrl: data.mediaUrl,
            mediaTipo: data.mediaTipo,
            status: data.status || 'rascunho'
          }
        });
        break;

      case 'decision.create':
        // Cria nova decisão HITL
        resultado = await prisma.decisaoHITL.create({
          data: {
            clienteId,
            campanhaId: data.campanhaId,
            conteudoId: data.conteudoId,
            tipo: data.tipo,
            titulo: data.titulo,
            descricao: data.descricao,
            contexto: data.contexto,
            recomendacao: data.recomendacao,
            nivelRisco: data.nivelRisco || 'baixo',
            urgencia: data.urgencia || 'normal'
          }
        });
        break;

      case 'icp.update':
        // Atualiza ICP do cliente
        resultado = await prisma.cliente.update({
          where: { id: clienteId },
          data: {
            icp: data.icp,
            icpStatus: data.icpStatus || 'definido'
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: `Evento desconhecido: ${event}` },
          { status: 400 }
        );
    }

    // Log do webhook
    await prisma.webhookN8N.updateMany({
      where: { tipo: 'entrada', ativo: true },
      data: { ultimoDisparo: new Date() }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      event,
      resultado
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/n8n/inbound - Lista webhooks configurados
export async function GET() {
  try {
    const webhooks = await prisma.webhookN8N.findMany({
      where: { tipo: 'entrada' }
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar webhooks' },
      { status: 500 }
    );
  }
}
