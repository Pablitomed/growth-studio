import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/proim - Lista métricas PROIM (Predictive ROI)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const campanhaId = searchParams.get('campanhaId');

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (campanhaId) where.campanhaId = campanhaId;

    const metricas = await prisma.pROIMMetrics.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true } },
      },
      orderBy: { dataMedicao: 'desc' },
      take: 30,
    });

    // Calcular precisão do modelo
    const precisao = await calcularPrecisaoModelo(where);

    return NextResponse.json({ metricas, precisao });
  } catch (error) {
    console.error('Erro ao buscar métricas PROIM:', error);
    return NextResponse.json({ error: 'Erro ao buscar métricas PROIM' }, { status: 500 });
  }
}

// POST /api/proim - Registra nova métrica PROIM
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const metrica = await prisma.pROIMMetrics.create({
      data: {
        clienteId: data.clienteId,
        campanhaId: data.campanhaId || null,
        scrollDepth: data.scrollDepth || null,
        hoverTime: data.hoverTime || null,
        recorrencia: data.recorrencia || null,
        interacaoTools: data.interacaoTools || null,
        prontidaoScore: data.prontidaoScore || null,
        frustracaoCount: data.frustracaoCount || null,
        ansiedadeCount: data.ansiedadeCount || null,
        engajamentoAlto: data.engajamentoAlto || null,
        climaLocal: data.climaLocal || null,
        horaDia: data.horaDia || null,
        diaSemana: data.diaSemana || null,
        probabilidadeConv: data.probabilidadeConv || null,
        conversoesEstim: data.conversoesEstim || null,
        roiEstimado: data.roiEstimado || null,
      }
    });

    return NextResponse.json({ metrica });
  } catch (error) {
    console.error('Erro ao criar métrica PROIM:', error);
    return NextResponse.json({ error: 'Erro ao criar métrica PROIM' }, { status: 500 });
  }
}

async function calcularPrecisaoModelo(where: any) {
  const previsoes = await prisma.pROIMMetrics.findMany({
    where: {
      ...where,
      previsaoCorreta: { not: null }
    }
  });

  if (previsoes.length === 0) {
    return { precisao: null, totalPrevisoes: 0 };
  }

  const corretas = previsoes.filter(p => p.previsaoCorreta === true).length;
  const precisao = (corretas / previsoes.length) * 100;

  return {
    precisao: precisao.toFixed(2),
    totalPrevisoes: previsoes.length,
    previsoesCorretas: corretas,
  };
}
