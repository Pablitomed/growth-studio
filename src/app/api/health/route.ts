import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const healthData: any = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Growth Studio API',
    version: '1.0.0'
  };

  // Try to connect to database
  try {
    await prisma.$connect();
    const clienteCount = await prisma.cliente.count();
    healthData.database = {
      connected: true,
      clientes: clienteCount
    };
  } catch (error: any) {
    healthData.database = {
      connected: false,
      error: error.message
    };
  }

  return NextResponse.json(healthData);
}
