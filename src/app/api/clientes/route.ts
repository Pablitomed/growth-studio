import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/clientes - Lista todos os clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        campanhas: {
          where: { status: { not: 'arquivada' } },
          select: {
            id: true,
            nome: true,
            status: true,
            budget: true,
            metricas: true,
          }
        },
        decisoes: {
          where: { status: 'pendente' },
          select: {
            id: true,
            tipo: true,
            titulo: true,
            urgencia: true,
            createdAt: true,
          }
        },
        tierServico: true,
        _count: {
          select: {
            campanhas: true,
            conteudos: true,
            decisoes: { where: { status: 'pendente' } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ clientes });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// POST /api/clientes - Cria novo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        empresa: data.empresa || null,
        email: data.email || null,
        telefone: data.telefone || null,
        website: data.website || null,
        industria: data.industria || null,
        status: 'ativo',
        icpStatus: 'pendente',
        tokenAcesso: generateToken(),
      },
      include: {
        tierServico: true,
      }
    });

    // Criar tier de serviço padrão (assistivo)
    await prisma.tierServico.create({
      data: {
        clienteId: cliente.id,
        tier: data.tier || 'assistivo',
        valorMensal: data.tier === 'orchestrado' ? 2497 : 
                     data.tier === 'agentic' ? 4997 : 
                     data.tier === 'autonomo' ? 9977 : 997,
        cicloInicio: new Date(),
        cicloFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    // Log do agente orquestrador
    await prisma.logAgente.create({
      data: {
        clienteId: cliente.id,
        agente: 'orchestrator',
        tarefa: 'criacao_cliente',
        entrada: data,
        saida: cliente,
        status: 'concluido',
        iniciadoEm: new Date(),
        concluidoEm: new Date(),
        duracao: 0,
      }
    });

    return NextResponse.json({ cliente });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
