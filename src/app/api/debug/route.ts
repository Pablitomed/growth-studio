import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL + ')' : 'NOT SET',
  };

  // Check if database file exists
  try {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/app/data/growth-studio.db';
    diagnostics.dbPath = dbPath;
    diagnostics.dbExists = fs.existsSync(dbPath);
    
    if (diagnostics.dbExists) {
      const stats = fs.statSync(dbPath);
      diagnostics.dbSize = stats.size;
    }
  } catch (error: any) {
    diagnostics.dbError = error.message;
  }

  // Check directory
  try {
    const dataDir = '/app/data';
    diagnostics.dataDirExists = fs.existsSync(dataDir);
    if (diagnostics.dataDirExists) {
      const files = fs.readdirSync(dataDir);
      diagnostics.dataDirFiles = files;
    }
  } catch (error: any) {
    diagnostics.dataDirError = error.message;
  }

  // Try Prisma connection
  try {
    await prisma.$connect();
    diagnostics.prismaConnected = true;
    
    // Try to count clientes
    const count = await prisma.cliente.count();
    diagnostics.clientesCount = count;
    
    await prisma.$disconnect();
  } catch (error: any) {
    diagnostics.prismaError = error.message;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
