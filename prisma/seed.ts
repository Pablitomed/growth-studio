import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar cliente 1
  const cliente1 = await db.cliente.create({
    data: {
      nome: 'João Silva',
      empresa: 'TechStart LTDA',
      email: 'joao@techstart.com',
      industria: 'Tecnologia',
      icp: {
        demografia: 'Empresários e gestores de tecnologia, 25-45 anos, regiões metropolitanas',
        psicografia: 'Inovadores, orientados a resultados, buscam escalabilidade',
        dores: ['Dificuldade em escalar vendas', 'Custo de aquisição alto', 'Falta de tempo para marketing'],
        desejos: ['Mais leads qualificados', 'Automação de processos', 'Previsibilidade de receita'],
        canais: ['LinkedIn', 'Google', 'YouTube']
      },
      icpStatus: 'aprovado'
    }
  });
  console.log('✅ Cliente 1 criado:', cliente1.nome);

  // Criar campanhas para cliente 1
  const campanha1 = await db.campanha.create({
    data: {
      clienteId: cliente1.id,
      nome: 'Black Friday 2024',
      objetivo: 'vendas',
      plataformas: ['meta', 'google'],
      budget: 5000,
      budgetAprovado: true,
      status: 'ativa',
      dataInicio: new Date('2024-11-15'),
      metricas: {
        impressoes: 125000,
        cliques: 3250,
        conversoes: 45,
        gasto: 1850,
        roas: 4.2,
        ctr: 2.6
      }
    }
  });
  console.log('✅ Campanha 1 criada:', campanha1.nome);

  const campanha2 = await db.campanha.create({
    data: {
      clienteId: cliente1.id,
      nome: 'Lançamento Produto X',
      objetivo: 'leads',
      plataformas: ['meta'],
      budget: 3000,
      status: 'pendente_aprovacao'
    }
  });
  console.log('✅ Campanha 2 criada:', campanha2.nome);

  // Criar decisões HITL para cliente 1
  await db.decisaoHITL.create({
    data: {
      clienteId: cliente1.id,
      campanhaId: campanha1.id,
      tipo: 'aprovacao_criativo',
      titulo: 'Aprovar Vídeo para Stories',
      descricao: 'O agente de conteúdo gerou um vídeo promocional para stories do Instagram. Por favor, revise e aprove para publicação.',
      contexto: {
        tipo: 'video',
        duracao: '15s',
        formato: '9:16',
        callToAction: 'Arraste para cima'
      },
      recomendacao: 'Recomendamos aprovação. O vídeo segue as melhores práticas para stories e está alinhado com a identidade visual da marca.',
      nivelRisco: 'baixo',
      urgencia: 'alta'
    }
  });

  await db.decisaoHITL.create({
    data: {
      clienteId: cliente1.id,
      campanhaId: campanha1.id,
      tipo: 'aprovacao_budget',
      titulo: 'Aumentar Budget da Campanha Black Friday',
      descricao: 'A campanha está performando acima do esperado (ROAS 4.2x). Sugerimos aumento de 30% no budget diário para escalar resultados.',
      contexto: {
        budgetAtual: 5000,
        budgetSugerido: 6500,
        roasAtual: 4.2,
        conversoes: 45
      },
      recomendacao: 'Com base na performance atual, o aumento de budget pode gerar aproximadamente 35% mais conversões mantendo o ROAS acima de 3.5x.',
      nivelRisco: 'baixo',
      urgencia: 'normal'
    }
  });
  console.log('✅ Decisões HITL criadas');

  // Criar resultados
  await db.resultado.createMany({
    data: [
      {
        clienteId: cliente1.id,
        campanhaId: campanha1.id,
        data: new Date('2024-11-20'),
        plataforma: 'meta',
        impressoes: 45000,
        cliques: 1200,
        conversoes: 18,
        gasto: 680,
        receita: 2856,
        roas: 4.2,
        ctr: 2.67,
        cpc: 0.57
      },
      {
        clienteId: cliente1.id,
        campanhaId: campanha1.id,
        data: new Date('2024-11-21'),
        plataforma: 'meta',
        impressoes: 42000,
        cliques: 1050,
        conversoes: 15,
        gasto: 620,
        receita: 2380,
        roas: 3.8,
        ctr: 2.5,
        cpc: 0.59
      },
      {
        clienteId: cliente1.id,
        campanhaId: campanha1.id,
        data: new Date('2024-11-22'),
        plataforma: 'google',
        impressoes: 38000,
        cliques: 1000,
        conversoes: 12,
        gasto: 550,
        receita: 1920,
        roas: 3.5,
        ctr: 2.63,
        cpc: 0.55
      }
    ]
  });
  console.log('✅ Resultados criados');

  // Criar cliente 2
  const cliente2 = await db.cliente.create({
    data: {
      nome: 'Maria Santos',
      empresa: 'ModaExpress',
      email: 'maria@modaexpress.com',
      industria: 'E-commerce Moda',
      icp: {
        demografia: 'Mulheres, 25-40 anos, classes A e B',
        psicografia: 'Interessadas em moda, tendências e estilo',
        dores: ['Dificuldade em encontrar roupas que servem', 'Falta de tempo para ir às lojas'],
        desejos: ['Roupas da moda', 'Comodidade na compra', 'Melhor custo-benefício'],
        canais: ['Instagram', 'TikTok', 'Google']
      },
      icpStatus: 'aprovado'
    }
  });
  console.log('✅ Cliente 2 criado:', cliente2.nome);

  // Criar campanha para cliente 2
  const campanha3 = await db.campanha.create({
    data: {
      clienteId: cliente2.id,
      nome: 'Coleção Verão 2025',
      objetivo: 'vendas',
      plataformas: ['meta', 'tiktok'],
      budget: 8000,
      budgetAprovado: true,
      status: 'ativa',
      dataInicio: new Date('2024-12-01'),
      metricas: {
        impressoes: 280000,
        cliques: 8400,
        conversoes: 120,
        gasto: 3200,
        roas: 3.8,
        ctr: 3.0
      }
    }
  });
  console.log('✅ Campanha 3 criada:', campanha3.nome);

  // Criar decisões para cliente 2
  await db.decisaoHITL.create({
    data: {
      clienteId: cliente2.id,
      tipo: 'mudanca_estrategia',
      titulo: 'Testar Nova Audiência - Lookalike',
      descricao: 'Identificamos oportunidade de testar uma nova audiência lookalike baseada nos compradores dos últimos 30 dias.',
      contexto: {
        audienciaAtual: 'Interesses amplos',
        novaAudiencia: 'LAL 1% compradores 30d',
        volumeEstimado: '50.000 pessoas'
      },
      recomendacao: 'O teste pode revelar segmentos mais propensos à conversão. Sugerimos alocar 20% do budget para este teste por 5 dias.',
      nivelRisco: 'medio',
      urgencia: 'baixa'
    }
  });

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log(`- 2 clientes`);
  console.log(`- 3 campanhas`);
  console.log(`- 3 resultados`);
  console.log(`- 3 decisões HITL pendentes`);
  console.log('\n🔗 Acesse a aplicação para ver os dados.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
