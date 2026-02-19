import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/campanhas - Lista campanhas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const status = searchParams.get('status');

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (status) where.status = status;

    const campanhas = await prisma.campanha.findMany({
      where,
      include: {
        cliente: {
          select: { id: true, nome: true, empresa: true }
        },
        _count: {
          select: { conteudos: true, resultados: true, decisoes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ campanhas });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 });
  }
}

// POST /api/campanhas - Cria nova campanha
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const campanha = await prisma.campanha.create({
      data: {
        clienteId: data.clienteId,
        nome: data.nome,
        objetivo: data.objetivo || 'leads',
        plataformas: data.plataformas || [],
        budget: data.budget || 0,
        budgetAprovado: false,
        status: 'rascunho',
        publicoAlvo: data.publicoAlvo || null,
      },
      include: {
        cliente: { select: { nome: true, empresa: true } }
      }
    });

    // Criar decisão HITL para aprovação de budget
    if (data.budget && data.budget > 0) {
      await prisma.decisaoHITL.create({
        data: {
          clienteId: data.clienteId,
          campanhaId: campanha.id,
          tipo: 'aprovacao_budget',
          titulo: `Aprovar Budget - ${data.nome}`,
          descricao: `Nova campanha criada com budget de R$ ${data.budget.toLocaleString()}. Por favor, revise e aprove para iniciar.`,
          contexto: {
            budget: data.budget,
            objetivo: data.objetivo,
            plataformas: data.plataformas,
          },
          recomendacao: 'A campanha está pronta para lançamento após aprovação do budget.',
          nivelRisco: 'baixo',
          urgencia: 'normal',
          status: 'pendente',
        }
      });
    }

    // Log do agente
    await prisma.logAgente.create({
      data: {
        clienteId: data.clienteId,
        agente: 'plataformas',
        tarefa: 'criacao_campanha',
        entrada: data,
        saida: campanha,
        status: 'concluido',
        iniciadoEm: new Date(),
        concluidoEm: new Date(),
      }
    });

    return NextResponse.json({ campanha });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 });
  }
}
