# Growth Studio - Dockerfile para Coolify
FROM oven/bun:1.3.4-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache curl openssl sqlite

# Estágio de dependências
FROM base AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Limpar cache e instalar dependências
RUN rm -rf node_modules && bun install

# Verificar versão do Prisma
RUN bunx prisma --version

# Gerar Prisma Client
RUN bunx prisma generate

# Estágio de build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build do Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Estágio de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/growth-studio.db

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copiar node_modules para Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Criar diretório de dados
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Inicializar banco e iniciar servidor
CMD ["sh", "-c", "cd /app && npx prisma db push --skip-generate && node server.js"]
