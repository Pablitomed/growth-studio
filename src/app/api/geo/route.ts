import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/geo - Lista métricas GEO (Share of Model)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;

    const metricas = await prisma.gEOMetrics.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true, empresa: true } }
      },
      orderBy: { dataMedicao: 'desc' },
      take: 30,
    });

    // Calcular tendências
    const tendencias = await calcularTendenciasGEO(clienteId);

    return NextResponse.json({ metricas, tendencias });
  } catch (error) {
    console.error('Erro ao buscar métricas GEO:', error);
    return NextResponse.json({ error: 'Erro ao buscar métricas GEO' }, { status: 500 });
  }
}

// POST /api/geo - Registra nova métrica GEO
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const metrica = await prisma.gEOMetrics.create({
      data: {
        clienteId: data.clienteId,
        shareOfModel: data.shareOfModel || null,
        totalCitacoes: data.totalCitacoes || null,
        minhasCitacoes: data.minhasCitacoes || null,
        chatGPT: data.chatGPT || null,
        perplexity: data.perplexity || null,
        gemini: data.gemini || null,
        claude: data.claude || null,
        densidadeScore: data.densidadeScore || null,
        informationGain: data.informationGain || null,
        g2Score: data.g2Score || null,
        redditMentions: data.redditMentions || null,
        quoraMentions: data.quoraMentions || null,
      }
    });

    return NextResponse.json({ metrica });
  } catch (error) {
    console.error('Erro ao criar métrica GEO:', error);
    return NextResponse.json({ error: 'Erro ao criar métrica GEO' }, { status: 500 });
  }
}

async function calcularTendenciasGEO(clienteId: string | null) {
  const where: any = {};
  if (clienteId) where.clienteId = clienteId;

  const ultimas = await prisma.gEOMetrics.findMany({
    where,
    orderBy: { dataMedicao: 'desc' },
    take: 7,
  });

  if (ultimas.length < 2) {
    return { tendencia: 'insuficiente', variacao: 0 };
  }

  const atual = ultimas[0].shareOfModel || 0;
  const anterior = ultimas[ultimas.length - 1].shareOfModel || 0;
  const variacao = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;

  return {
    tendencia: variacao > 5 ? 'crescendo' : variacao < -5 ? 'decaindo' : 'estavel',
    variacao: variacao.toFixed(2),
    shareOfModelAtual: atual,
    shareOfModelAnterior: anterior,
  };
}
