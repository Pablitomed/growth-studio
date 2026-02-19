import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import prisma from '@/lib/db';

const execAsync = promisify(exec);

async function initDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = '/app/data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if database exists
    const dbPath = '/app/data/growth-studio.db';
    if (!fs.existsSync(dbPath)) {
      console.log('[Health] Database not found, initializing...');
      
      // Run prisma db push
      try {
        const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate', {
          cwd: '/app',
          env: {
            ...process.env,
            DATABASE_URL: 'file:/app/data/growth-studio.db'
          }
        });
        console.log('[Health] Database initialized:', stdout.substring(0, 200));
        return { initialized: true, message: 'Database created' };
      } catch (error: any) {
        console.error('[Health] Database init error:', error.message);
        return { initialized: false, error: error.message };
      }
    }
    
    return { initialized: true, message: 'Database already exists' };
  } catch (error: any) {
    return { initialized: false, error: error.message };
  }
}

export async function GET() {
  const healthData: any = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Growth Studio API',
    version: '1.0.0'
  };

  // Try to initialize database
  const dbInit = await initDatabase();
  healthData.database = dbInit;

  // Try to connect to database
  try {
    await prisma.$connect();
    const clienteCount = await prisma.cliente.count();
    healthData.database.connected = true;
    healthData.database.clientes = clienteCount;
  } catch (error: any) {
    healthData.database.connected = false;
    healthData.database.error = error.message;
  }

  return NextResponse.json(healthData);
}
