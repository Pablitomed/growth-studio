import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/campanhas/[id] - Busca campanha por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const campanha = await prisma.campanha.findUnique({
      where: { id },
      include: {
        cliente: true,
        conteudos: {
          orderBy: { createdAt: 'desc' }
        },
        resultados: {
          orderBy: { data: 'desc' },
          take: 30,
        },
        decisoes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!campanha) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ campanha });
  } catch (error) {
    console.error('Erro ao buscar campanha:', error);
    return NextResponse.json({ error: 'Erro ao buscar campanha' }, { status: 500 });
  }
}

// PUT /api/campanhas/[id] - Atualiza campanha
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const campanha = await prisma.campanha.update({
      where: { id },
      data: {
        nome: data.nome,
        objetivo: data.objetivo,
        plataformas: data.plataformas,
        budget: data.budget,
        budgetAprovado: data.budgetAprovado,
        status: data.status,
        publicoAlvo: data.publicoAlvo,
        metricas: data.metricas,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
        dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
        lancadaEm: data.status === 'ativa' && !data.lancadaEm ? new Date() : data.lancadaEm,
      }
    });

    return NextResponse.json({ campanha });
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 });
  }
}

// DELETE /api/campanhas/[id] - Arquiva campanha
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const campanha = await prisma.campanha.update({
      where: { id },
      data: { status: 'arquivada' }
    });

    return NextResponse.json({ campanha, message: 'Campanha arquivada' });
  } catch (error) {
    console.error('Erro ao arquivar campanha:', error);
    return NextResponse.json({ error: 'Erro ao arquivar campanha' }, { status: 500 });
  }
}
