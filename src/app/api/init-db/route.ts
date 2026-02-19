import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Ensure data directory exists
    const dataDir = '/app/data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Run prisma db push
    const { stdout, stderr } = await execAsync('bunx prisma db push --skip-generate', {
      cwd: '/app',
      env: {
        ...process.env,
        DATABASE_URL: 'file:/app/data/growth-studio.db'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized',
      stdout: stdout.substring(0, 500),
      stderr: stderr.substring(0, 500)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stderr: error.stderr?.substring(0, 500)
    }, { status: 500 });
  }
}

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL || 'NOT SET',
  };

  // Check database file
  try {
    const dbPath = '/app/data/growth-studio.db';
    diagnostics.dbPath = dbPath;
    diagnostics.dbExists = fs.existsSync(dbPath);
    if (diagnostics.dbExists) {
      diagnostics.dbSize = fs.statSync(dbPath).size;
    }
  } catch (error: any) {
    diagnostics.dbError = error.message;
  }

  // Check data directory
  try {
    const dataDir = '/app/data';
    diagnostics.dataDirExists = fs.existsSync(dataDir);
    if (diagnostics.dataDirExists) {
      diagnostics.dataDirFiles = fs.readdirSync(dataDir);
    }
  } catch (error: any) {
    diagnostics.dataDirError = error.message;
  }

  return NextResponse.json(diagnostics);
}
