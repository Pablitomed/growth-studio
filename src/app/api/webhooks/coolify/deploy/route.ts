import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Token de verificação para webhooks do Coolify
const WEBHOOK_SECRET = process.env.COOLIFY_WEBHOOK_SECRET || 'growth-studio-webhook';

// POST /api/webhooks/coolify/deploy - Recebe webhooks do Coolify
export async function POST(request: NextRequest) {
  try {
    // Verificar secret
    const secret = request.headers.get('x-coolify-webhook-secret');
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Registrar evento
    await prisma.logAgente.create({
      data: {
        agente: 'coolify',
        tarefa: data.type || 'webhook',
        entrada: data,
        status: 'concluido',
        iniciadoEm: new Date(),
        concluidoEm: new Date(),
      }
    });

    console.log('[Coolify Webhook]', data);

    // Processar diferentes tipos de eventos
    switch (data.type) {
      case 'deployment:success':
        await handleDeploySuccess(data);
        break;
      
      case 'deployment:failed':
        await handleDeployFailed(data);
        break;
      
      case 'application:stopped':
        await handleAppStopped(data);
        break;
      
      case 'application:restarted':
        await handleAppRestarted(data);
        break;
      
      default:
        console.log('[Coolify] Evento não tratado:', data.type);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no webhook Coolify:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET /api/webhooks/coolify/deploy - Verificação de saúde
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'Coolify Webhook Handler',
    timestamp: new Date().toISOString()
  });
}

// Handlers
async function handleDeploySuccess(data: any) {
  console.log('[Coolify] Deploy realizado com sucesso:', data.application?.name);
}

async function handleDeployFailed(data: any) {
  console.error('[Coolify] Deploy falhou:', data.application?.name, data.error);
}

async function handleAppStopped(data: any) {
  console.log('[Coolify] Aplicação parada:', data.application?.name);
}

async function handleAppRestarted(data: any) {
  console.log('[Coolify] Aplicação reiniciada:', data.application?.name);
}
