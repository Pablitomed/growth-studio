import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cliente/[token] - Busca cliente por token de acesso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    const cliente = await prisma.cliente.findUnique({
      where: { tokenAcesso: token },
      include: {
        campanhas: {
          where: { status: { not: 'arquivada' } },
          orderBy: { createdAt: 'desc' }
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
          orderBy: { createdAt: 'desc' }
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
