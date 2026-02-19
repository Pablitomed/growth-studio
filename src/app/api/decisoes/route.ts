import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/decisoes - Lista decisões HITL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const status = searchParams.get('status');

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (status) where.status = status;

    const decisoes = await prisma.decisaoHITL.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true, empresa: true } },
        campanha: { select: { id: true, nome: true } },
        conteudo: { select: { id: true, tipo: true, titulo: true } },
      },
      orderBy: [
        { urgencia: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ decisoes });
  } catch (error) {
    console.error('Erro ao buscar decisões:', error);
    return NextResponse.json({ error: 'Erro ao buscar decisões' }, { status: 500 });
  }
}

// POST /api/decisoes - Cria nova decisão HITL
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const decisao = await prisma.decisaoHITL.create({
      data: {
        clienteId: data.clienteId,
        campanhaId: data.campanhaId || null,
        conteudoId: data.conteudoId || null,
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao || null,
        contexto: data.contexto || null,
        recomendacao: data.recomendacao || null,
        nivelRisco: data.nivelRisco || 'baixo',
        urgencia: data.urgencia || 'normal',
        status: 'pendente',
      },
      include: {
        cliente: { select: { nome: true, empresa: true } }
      }
    });

    return NextResponse.json({ decisao });
  } catch (error) {
    console.error('Erro ao criar decisão:', error);
    return NextResponse.json({ error: 'Erro ao criar decisão' }, { status: 500 });
  }
}
