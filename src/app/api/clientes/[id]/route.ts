import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/clientes/[id] - Busca cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        campanhas: {
          include: {
            _count: { select: { conteudos: true, resultados: true } }
          }
        },
        conteudos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        resultados: {
          orderBy: { data: 'desc' },
          take: 30,
        },
        decisoes: {
          orderBy: { createdAt: 'desc' },
        },
        geoMetrics: {
          orderBy: { dataMedicao: 'desc' },
          take: 10,
        },
        proimMetrics: {
          orderBy: { dataMedicao: 'desc' },
          take: 10,
        },
        tierServico: true,
        insights: {
          where: { validado: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      }
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ cliente });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 });
  }
}

// PUT /api/clientes/[id] - Atualiza cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
        empresa: data.empresa,
        email: data.email,
        telefone: data.telefone,
        website: data.website,
        industria: data.industria,
        icp: data.icp,
        icpStatus: data.icpStatus,
        status: data.status,
      }
    });

    return NextResponse.json({ cliente });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

// DELETE /api/clientes/[id] - Remove cliente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cliente = await prisma.cliente.update({
      where: { id },
      data: { status: 'arquivado' }
    });

    return NextResponse.json({ cliente, message: 'Cliente arquivado com sucesso' });
  } catch (error) {
    console.error('Erro ao arquivar cliente:', error);
    return NextResponse.json({ error: 'Erro ao arquivar cliente' }, { status: 500 });
  }
}
