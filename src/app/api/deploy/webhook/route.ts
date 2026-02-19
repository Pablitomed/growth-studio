import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API Key para autenticação de deploy
const DEPLOY_API_KEY = process.env.DEPLOY_API_KEY || 'growth-studio-deploy-key-2024';

interface DeployWebhookPayload {
  action: 'deploy' | 'backup' | 'status' | 'notify';
  version?: string;
  commit?: string;
  branch?: string;
  author?: string;
  environment?: 'production' | 'staging';
  timestamp?: string;
}

// POST /api/deploy/webhook - Recebe webhooks de CI/CD
export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (apiKey !== DEPLOY_API_KEY) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data: DeployWebhookPayload = await request.json();
    
    // Registrar log do deploy
    await prisma.logAgente.create({
      data: {
        agente: 'deploy',
        tarefa: data.action,
        entrada: data,
        status: 'concluido',
        iniciadoEm: new Date(),
        concluidoEm: new Date(),
      }
    });

    switch (data.action) {
      case 'deploy':
        return handleDeploy(data);
      
      case 'backup':
        return handleBackup(data);
      
      case 'status':
        return handleStatus(data);
      
      case 'notify':
        return handleNotify(data);
      
      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro no webhook de deploy:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}

// GET /api/deploy/webhook - Status do deploy
export async function GET(request: NextRequest) {
  try {
    // Validar API Key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (apiKey !== DEPLOY_API_KEY) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar últimos deploys
    const deploys = await prisma.logAgente.findMany({
      where: { agente: 'deploy' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      status: 'ok',
      lastDeploys: deploys,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

// Handlers
async function handleDeploy(data: DeployWebhookPayload) {
  // Aqui você pode adicionar lógica pós-deploy
  // Ex: limpar cache, notificar clientes, etc.
  
  return NextResponse.json({
    success: true,
    message: 'Deploy registrado com sucesso',
    version: data.version,
    timestamp: new Date().toISOString(),
  });
}

async function handleBackup(data: DeployWebhookPayload) {
  return NextResponse.json({
    success: true,
    message: 'Backup solicitado',
    timestamp: new Date().toISOString(),
  });
}

async function handleStatus(data: DeployWebhookPayload) {
  return NextResponse.json({
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

async function handleNotify(data: DeployWebhookPayload) {
  // Aqui você pode integrar com Slack, Discord, Telegram, etc.
  
  return NextResponse.json({
    success: true,
    message: 'Notificação enviada',
    timestamp: new Date().toISOString(),
  });
}
