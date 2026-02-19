import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/decisoes/[id] - Busca decisão por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const decisao = await prisma.decisaoHITL.findUnique({
      where: { id },
      include: {
        cliente: true,
        campanha: true,
        conteudo: true,
      }
    });

    if (!decisao) {
      return NextResponse.json({ error: 'Decisão não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ decisao });
  } catch (error) {
    console.error('Erro ao buscar decisão:', error);
    return NextResponse.json({ error: 'Erro ao buscar decisão' }, { status: 500 });
  }
}

// PUT /api/decisoes/[id] - Processa decisão (aprovar/rejeitar)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const decisao = await prisma.decisaoHITL.update({
      where: { id },
      data: {
        status: data.status,
        decisao: data.decisao,
        feedback: data.feedback || null,
        decididoEm: new Date(),
      },
      include: {
        cliente: true,
        campanha: true,
      }
    });

    // Se aprovado, executar ação dependendo do tipo
    if (data.decisao === 'aprovado') {
      await executarAcaoAprovacao(decisao);
    }

    // Log do agente
    await prisma.logAgente.create({
      data: {
        clienteId: decisao.clienteId,
        agente: 'orchestrator',
        tarefa: `decisao_hitled_${decisao.tipo}`,
        entrada: { decisaoId: id, acao: data.decisao },
        saida: decisao,
        status: 'concluido',
        iniciadoEm: new Date(),
        concluidoEm: new Date(),
      }
    });

    return NextResponse.json({ decisao });
  } catch (error) {
    console.error('Erro ao processar decisão:', error);
    return NextResponse.json({ error: 'Erro ao processar decisão' }, { status: 500 });
  }
}

// Função auxiliar para executar ações pós-aprovação
async function executarAcaoAprovacao(decisao: any) {
  switch (decisao.tipo) {
    case 'aprovacao_budget':
      if (decisao.campanhaId) {
        await prisma.campanha.update({
          where: { id: decisao.campanhaId },
          data: { 
            budgetAprovado: true,
            status: 'ativa',
            lancadaEm: new Date(),
          }
        });
      }
      break;
    
    case 'aprovacao_criativo':
      if (decisao.conteudoId) {
        await prisma.conteudo.update({
          where: { id: decisao.conteudoId },
          data: { 
            status: 'aprovado',
            aprovadoEm: new Date(),
          }
        });
      }
      break;
    
    case 'aprovacao_campanha':
      if (decisao.campanhaId) {
        await prisma.campanha.update({
          where: { id: decisao.campanhaId },
          data: { status: 'ativa' }
        });
      }
      break;
  }
}
