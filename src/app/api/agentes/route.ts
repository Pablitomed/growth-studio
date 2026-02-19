import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/agentes - Lista execuções de agentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const agenteTipo = searchParams.get('agenteTipo');
    const status = searchParams.get('status');

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (agenteTipo) where.agenteTipo = agenteTipo;
    if (status) where.status = status;

    const execucoes = await prisma.agenteExecucao.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true, empresa: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Estatísticas
    const stats = await prisma.agenteExecucao.aggregate({
      where,
      _count: { id: true },
      _avg: { scoreQualidade: true, duracao: true },
    });

    return NextResponse.json({ execucoes, stats });
  } catch (error) {
    console.error('Erro ao buscar execuções:', error);
    return NextResponse.json({ error: 'Erro ao buscar execuções' }, { status: 500 });
  }
}

// POST /api/agentes - Cria/executa novo agente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const execucao = await prisma.agenteExecucao.create({
      data: {
        clienteId: data.clienteId || null,
        agenteTipo: data.agenteTipo,
        nomeAgente: data.nomeAgente || data.agenteTipo,
        tarefa: data.tarefa,
        descricao: data.descricao || null,
        entrada: data.entrada || null,
        status: 'pendente',
        requerAprovacao: data.requerAprovacao || false,
      }
    });

    return NextResponse.json({ execucao });
  } catch (error) {
    console.error('Erro ao criar execução:', error);
    return NextResponse.json({ error: 'Erro ao criar execução' }, { status: 500 });
  }
}
