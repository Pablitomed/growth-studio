# 🤖 Sistema Agêntico - Definições e Implementação

Este documento detalha a implementação do sistema agêntico com HITL.

---

## 1. Tipos TypeScript

```typescript
// ============================================
// CORE TYPES
// ============================================

// Status e estados
export type AgentName = 'orchestrator' | 'research' | 'analysis' | 'content' | 'campaign';
export type TaskStatus = 'pending' | 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'escalated' | 'expired';
export type RiskLevel = 'low' | 'medium' | 'high';
export type HITLLevel = 'full_auto' | 'light_supervision' | 'moderate_supervision' | 'full_supervision';

// ============================================
// AGENTE BASE
// ============================================

interface AgentContext {
  userId: string;
  organizationId: string;
  campaignId?: string;
  parentTaskId?: string;
  metadata?: Record<string, any>;
}

interface AgentTool {
  name: string;
  description: string;
  parameters: zod.ZodType<any>;
  execute: (params: any, context: AgentContext) => Promise<any>;
}

interface AgentConfig {
  name: AgentName;
  description: string;
  tools: AgentTool[];
  hitlConfig: {
    level: HITLLevel;
    approvalPoints: ApprovalPoint[];
  };
  maxRetries: number;
  timeout: number;
}

interface ApprovalPoint {
  trigger: string; // evento que dispara aprovação
  description: string;
  autoApproveCondition?: (result: any) => boolean;
  timeoutMinutes: number;
  escalateTo: string[];
}

// ============================================
// TAREFAS
// ============================================

interface AgentTask {
  id: string;
  agentName: AgentName;
  type: TaskType;
  input: TaskInput;
  output?: TaskOutput;
  status: TaskStatus;
  progress: number;
  error?: TaskError;
  startedAt?: Date;
  completedAt?: Date;
  parentId?: string;
  children: AgentTask[];
  approvals: HITLApproval[];
  logs: AgentLog[];
}

type TaskType = 
  | 'icp_definition'
  | 'market_research'
  | 'competitor_analysis'
  | 'content_generation'
  | 'content_variation'
  | 'campaign_setup'
  | 'campaign_optimization'
  | 'performance_analysis'
  | 'insight_generation'
  | 'report_creation';

interface TaskInput {
  objective: string;
  constraints?: Record<string, any>;
  context?: Record<string, any>;
  previousResults?: Record<string, any>;
}

interface TaskOutput {
  success: boolean;
  data: any;
  confidence: number;
  requiresApproval: boolean;
  approvalData?: HITLApprovalData;
  metadata?: Record<string, any>;
}

interface TaskError {
  message: string;
  code: string;
  details?: Record<string, any>;
  retryable: boolean;
}

interface AgentLog {
  id: string;
  taskId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

// ============================================
// HITL - HUMAN IN THE LOOP
// ============================================

interface HITLApproval {
  id: string;
  taskId: string;
  type: ApprovalType;
  contentType: 'text' | 'image' | 'video' | 'configuration' | 'insight' | 'data';
  
  // Conteúdo
  content: {
    title: string;
    description: string;
    preview?: string;
    data: any;
    metadata?: Record<string, any>;
  };
  
  // Avaliação
  confidence: number;
  riskLevel: RiskLevel;
  
  // Status
  status: ApprovalStatus;
  timeoutAt: Date;
  escalationLevel: number;
  
  // Decisão
  decision?: {
    action: 'approve' | 'reject' | 'modify' | 'regenerate';
    userId: string;
    timestamp: Date;
    comments?: string;
    modifications?: any;
  };
  
  // Notificações
  notifiedUsers: Array<{
    userId: string;
    notifiedAt: Date;
    channel: 'email' | 'push' | 'in_app';
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

type ApprovalType = 
  | 'icp_validation'
  | 'content_approval'
  | 'campaign_config'
  | 'optimization'
  | 'insight_validation'
  | 'budget_change';

interface HITLConfig {
  level: HITLLevel;
  actions: {
    content_generation: HITLActionConfig;
    campaign_changes: HITLActionConfig;
    research_findings: HITLActionConfig;
    optimizations: HITLActionConfig;
  };
  escalation: {
    timeoutMinutes: number;
    escalateTo: string[];
    autoActionOnTimeout: 'approve' | 'reject' | 'hold';
  };
}

interface HITLActionConfig {
  approvalRequired: boolean;
  autoApproveThreshold: number;
  timeoutMinutes: number;
  notifyStakeholders?: string[];
}

interface HITLApprovalData {
  type: ApprovalType;
  contentType: string;
  content: HITLApproval['content'];
  confidence: number;
  riskLevel: RiskLevel;
}

// ============================================
// ORQUESTRADOR
// ============================================

interface OrchestrationPlan {
  objective: string;
  tasks: PlannedTask[];
  dependencies: TaskDependency[];
  estimatedDuration: number;
  requiredApprovals: ApprovalPoint[];
}

interface PlannedTask {
  id: string;
  agentName: AgentName;
  type: TaskType;
  input: TaskInput;
  dependencies: string[]; // IDs de tarefas dependentes
  estimatedDuration: number;
  requiredApproval: boolean;
}

interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  type: 'sequential' | 'parallel' | 'conditional';
  condition?: (results: Record<string, any>) => boolean;
}

interface OrchestrationState {
  plan: OrchestrationPlan;
  completedTasks: Map<string, TaskOutput>;
  pendingTasks: Map<string, AgentTask>;
  activeTasks: Map<string, AgentTask>;
  failedTasks: Map<string, AgentTask>;
  pendingApprovals: Map<string, HITLApproval>;
}

// ============================================
// AGENTES ESPECIALIZADOS
// ============================================

// Research Agent
interface ResearchOutput {
  icp?: {
    demographics: Record<string, any>;
    psychographics: Record<string, any>;
    painPoints: Array<{ title: string; description: string; severity: string }>;
    goals: Array<{ title: string; description: string; priority: string }>;
    channels: Array<{ platform: string; usage: string; preferred_content: string }>;
  };
  marketData?: {
    trends: Array<{ title: string; description: string; relevance: number }>;
    competitors: Array<{ name: string; strengths: string[]; weaknesses: string[] }>;
    opportunities: string[];
  };
  insights?: Array<{ title: string; description: string; confidence: number }>;
  sources?: Array<{ title: string; url: string; date: string }>;
}

// Content Agent
interface ContentOutput {
  type: 'text' | 'image' | 'video' | 'carousel';
  variations: ContentVariation[];
  metadata: {
    generatedBy: string;
    prompt: string;
    iterations: number;
    tokensUsed: number;
  };
}

interface ContentVariation {
  id: string;
  name: string;
  content: {
    headline?: string;
    body?: string;
    cta?: string;
    imageUrl?: string;
    videoUrl?: string;
    carouselItems?: Array<{ image: string; text: string }>;
  };
  performance?: {
    predicted_ctr?: number;
    predicted_engagement?: number;
  };
}

// Analysis Agent
interface AnalysisOutput {
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    ctr: number;
    roas: number;
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation?: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
    autoApplicable: boolean;
  }>;
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
    significance: number;
  }>;
}

// Campaign Agent
interface CampaignOutput {
  configuration: {
    platform: string;
    campaignId?: string;
    adSets: Array<{
      name: string;
      targeting: Record<string, any>;
      budget: number;
      ads: Array<{
        name: string;
        contentId: string;
        destinationUrl: string;
      }>;
    }>;
  };
  execution?: {
    status: 'pending' | 'running' | 'completed' | 'failed';
    platformCampaignId?: string;
    errors?: string[];
  };
  optimization?: {
    applied: Array<{ type: string; description: string; timestamp: Date }>;
    pending: Array<{ type: string; description: string; requiresApproval: boolean }>;
  };
}

// ============================================
// WORKFLOW
// ============================================

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  hitlPoints: string[]; // step IDs que requerem HITL
}

interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  name: string;
  agentName: AgentName;
  taskType: TaskType;
  input: Record<string, any> | ((context: WorkflowContext) => Record<string, any>);
  dependsOn: string[];
  condition?: (context: WorkflowContext) => boolean;
  retryPolicy: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
  timeout: number;
}

interface WorkflowContext {
  workflowId: string;
  campaignId: string;
  stepResults: Map<string, TaskOutput>;
  variables: Record<string, any>;
  approvals: Map<string, HITLApproval>;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  campaignId: string;
  status: 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  currentStep: string | null;
  progress: number;
  context: WorkflowContext;
  result?: Record<string, any>;
  error?: TaskError;
  startedAt?: Date;
  completedAt?: Date;
}
```

---

## 2. Implementação do Agente Base

```typescript
// agents/core/base-agent.ts

import { z } from 'zod';
import { db } from '@/lib/db';
import { AgentContext, AgentConfig, AgentTask, TaskInput, TaskOutput, HITLApprovalData } from './types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  
  constructor(config: AgentConfig) {
    this.config = config;
  }
  
  /**
   * Método principal para executar uma tarefa
   */
  async execute(input: TaskInput, context: AgentContext): Promise<TaskOutput> {
    const task = await this.createTask(input, context);
    
    try {
      // Atualizar status
      await this.updateTaskStatus(task.id, 'running');
      
      // Executar lógica específica do agente
      const result = await this.run(input, context, task);
      
      // Verificar se precisa de aprovação HITL
      if (result.requiresApproval && result.approvalData) {
        await this.createHITLApproval(task.id, result.approvalData, context);
        await this.updateTaskStatus(task.id, 'waiting_approval');
        return result;
      }
      
      // Completar tarefa
      await this.completeTask(task.id, result);
      return result;
      
    } catch (error) {
      await this.handleTaskError(task.id, error);
      throw error;
    }
  }
  
  /**
   * Lógica específica de cada agente (implementada pelas subclasses)
   */
  protected abstract run(
    input: TaskInput, 
    context: AgentContext, 
    task: AgentTask
  ): Promise<TaskOutput>;
  
  /**
   * Cria uma nova tarefa no banco
   */
  protected async createTask(input: TaskInput, context: AgentContext): Promise<AgentTask> {
    const task = await db.agentTask.create({
      data: {
        agentName: this.config.name,
        type: input.objective,
        input: input as any,
        status: 'QUEUED',
        campaignId: context.campaignId,
        parentId: context.parentTaskId,
      },
    });
    
    return this.mapTask(task);
  }
  
  /**
   * Atualiza o status da tarefa
   */
  protected async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await db.agentTask.update({
      where: { id: taskId },
      data: { 
        status: status.toUpperCase() as any,
        startedAt: status === 'running' ? new Date() : undefined,
      },
    });
  }
  
  /**
   * Completa a tarefa com sucesso
   */
  protected async completeTask(taskId: string, output: TaskOutput): Promise<void> {
    await db.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        output: output as any,
        completedAt: new Date(),
        progress: 100,
      },
    });
  }
  
  /**
   * Trata erros da tarefa
   */
  protected async handleTaskError(taskId: string, error: any): Promise<void> {
    await db.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          details: error.details,
        },
        completedAt: new Date(),
      },
    });
    
    // Log do erro
    await this.log(taskId, 'error', `Task failed: ${error.message}`, { error });
  }
  
  /**
   * Cria uma solicitação de aprovação HITL
   */
  protected async createHITLApproval(
    taskId: string, 
    data: HITLApprovalData, 
    context: AgentContext
  ): Promise<void> {
    await db.hITLApproval.create({
      data: {
        taskId,
        type: data.type.toUpperCase() as any,
        contentType: data.contentType,
        content_data: data.content as any,
        confidence: data.confidence,
        riskLevel: data.riskLevel.toUpperCase() as any,
        status: 'PENDING',
        timeoutAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      },
    });
    
    // Notificar usuários
    await this.notifyApprovers(taskId, context);
  }
  
  /**
   * Notifica aprovadores sobre nova aprovação pendente
   */
  protected async notifyApprovers(taskId: string, context: AgentContext): Promise<void> {
    // Implementar sistema de notificação
    // - Email
    // - Push notification
    // - In-app notification
  }
  
  /**
   * Log de atividades do agente
   */
  protected async log(
    taskId: string, 
    level: 'debug' | 'info' | 'warn' | 'error', 
    message: string, 
    data?: Record<string, any>
  ): Promise<void> {
    await db.agentLog.create({
      data: {
        taskId,
        level: level.toUpperCase() as any,
        message,
        data: data as any,
      },
    });
  }
  
  /**
   * Atualiza progresso da tarefa
   */
  protected async updateProgress(taskId: string, progress: number): Promise<void> {
    await db.agentTask.update({
      where: { id: taskId },
      data: { progress: Math.min(100, Math.max(0, progress)) },
    });
  }
  
  /**
   * Mapeia registro do banco para tipo
   */
  protected mapTask(dbTask: any): AgentTask {
    return {
      id: dbTask.id,
      agentName: dbTask.agentName,
      type: dbTask.type,
      input: dbTask.input,
      output: dbTask.output,
      status: dbTask.status.toLowerCase() as TaskStatus,
      progress: dbTask.progress,
      error: dbTask.error,
      startedAt: dbTask.startedAt,
      completedAt: dbTask.completedAt,
      parentId: dbTask.parentId,
      children: [],
      approvals: [],
      logs: [],
    };
  }
}
```

---

## 3. Implementação do Orchestrator

```typescript
// agents/core/orchestrator.ts

import { BaseAgent } from './base-agent';
import { AgentContext, TaskInput, TaskOutput, OrchestrationPlan, OrchestrationState } from './types';
import { ResearchAgent } from '../specialized/research-agent';
import { AnalysisAgent } from '../specialized/analysis-agent';
import { ContentAgent } from '../specialized/content-agent';
import { CampaignAgent } from '../specialized/campaign-agent';

export class OrchestratorAgent extends BaseAgent {
  private agents: Map<string, BaseAgent>;
  
  constructor() {
    super({
      name: 'orchestrator',
      description: 'Coordena todos os agentes especializados',
      tools: [],
      hitlConfig: {
        level: 'moderate_supervision',
        approvalPoints: [],
      },
      maxRetries: 3,
      timeout: 60000,
    });
    
    this.agents = new Map([
      ['research', new ResearchAgent()],
      ['analysis', new AnalysisAgent()],
      ['content', new ContentAgent()],
      ['campaign', new CampaignAgent()],
    ]);
  }
  
  protected async run(
    input: TaskInput, 
    context: AgentContext, 
    task: any
  ): Promise<TaskOutput> {
    // 1. Criar plano de orquestração
    const plan = await this.createPlan(input, context);
    
    // 2. Inicializar estado
    const state: OrchestrationState = {
      plan,
      completedTasks: new Map(),
      pendingTasks: new Map(),
      activeTasks: new Map(),
      failedTasks: new Map(),
      pendingApprovals: new Map(),
    };
    
    // 3. Executar tarefas
    await this.executePlan(state, context);
    
    // 4. Consolidar resultados
    const result = await this.consolidateResults(state);
    
    return result;
  }
  
  /**
   * Cria plano de execução baseado no objetivo
   */
  private async createPlan(input: TaskInput, context: AgentContext): Promise<OrchestrationPlan> {
    const objective = input.objective.toLowerCase();
    
    // Plano para nova campanha
    if (objective.includes('nova campanha') || objective.includes('new campaign')) {
      return this.createNewCampaignPlan(input);
    }
    
    // Plano para otimização
    if (objective.includes('otimizar') || objective.includes('optimize')) {
      return this.createOptimizationPlan(input);
    }
    
    // Plano para análise
    if (objective.includes('analisar') || objective.includes('analyze')) {
      return this.createAnalysisPlan(input);
    }
    
    // Plano padrão
    return this.createDefaultPlan(input);
  }
  
  /**
   * Plano para criar nova campanha
   */
  private createNewCampaignPlan(input: TaskInput): OrchestrationPlan {
    return {
      objective: input.objective,
      tasks: [
        {
          id: 'task-1',
          agentName: 'research',
          type: 'icp_definition',
          input: { objective: 'Definir ICP baseado no contexto', context: input.context },
          dependencies: [],
          estimatedDuration: 120,
          requiredApproval: true,
        },
        {
          id: 'task-2',
          agentName: 'research',
          type: 'market_research',
          input: { objective: 'Pesquisar mercado e concorrentes', context: input.context },
          dependencies: ['task-1'],
          estimatedDuration: 180,
          requiredApproval: false,
        },
        {
          id: 'task-3',
          agentName: 'content',
          type: 'content_generation',
          input: { objective: 'Gerar criativos para campanha' },
          dependencies: ['task-1', 'task-2'],
          estimatedDuration: 60,
          requiredApproval: true,
        },
        {
          id: 'task-4',
          agentName: 'campaign',
          type: 'campaign_setup',
          input: { objective: 'Configurar campanha nas plataformas' },
          dependencies: ['task-3'],
          estimatedDuration: 30,
          requiredApproval: true,
        },
      ],
      dependencies: [
        { taskId: 'task-1', dependsOn: [], type: 'sequential' },
        { taskId: 'task-2', dependsOn: ['task-1'], type: 'sequential' },
        { taskId: 'task-3', dependsOn: ['task-1', 'task-2'], type: 'sequential' },
        { taskId: 'task-4', dependsOn: ['task-3'], type: 'sequential' },
      ],
      estimatedDuration: 390,
      requiredApprovals: [
        { trigger: 'icp_defined', description: 'Validação do ICP', timeoutMinutes: 60, escalateTo: ['manager'] },
        { trigger: 'content_ready', description: 'Aprovação de conteúdo', timeoutMinutes: 30, escalateTo: ['manager', 'analyst'] },
        { trigger: 'campaign_config', description: 'Configuração de campanha', timeoutMinutes: 30, escalateTo: ['manager'] },
      ],
    };
  }
  
  /**
   * Executa o plano de orquestração
   */
  private async executePlan(state: OrchestrationState, context: AgentContext): Promise<void> {
    const { plan } = state;
    
    // Inicializar tarefas pendentes
    for (const task of plan.tasks) {
      state.pendingTasks.set(task.id, task as any);
    }
    
    // Loop de execução
    while (state.pendingTasks.size > 0 || state.activeTasks.size > 0) {
      // Verificar tarefas prontas para executar
      const readyTasks = this.getReadyTasks(state);
      
      // Executar tarefas prontas (paralelo quando possível)
      const executions = readyTasks.map(taskId => this.executeTask(taskId, state, context));
      await Promise.all(executions);
      
      // Verificar aprovações pendentes
      await this.checkPendingApprovals(state);
      
      // Aguardar um pouco antes da próxima iteração
      if (state.pendingTasks.size > 0 || state.activeTasks.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  /**
   * Retorna tarefas prontas para execução
   */
  private getReadyTasks(state: OrchestrationState): string[] {
    const ready: string[] = [];
    
    for (const [taskId, task] of state.pendingTasks) {
      const dependency = state.plan.dependencies.find(d => d.taskId === taskId);
      
      if (!dependency) continue;
      
      // Verificar se todas as dependências foram completadas
      const allDependenciesCompleted = dependency.dependsOn.every(depId => 
        state.completedTasks.has(depId)
      );
      
      if (allDependenciesCompleted) {
        ready.push(taskId);
      }
    }
    
    return ready;
  }
  
  /**
   * Executa uma tarefa específica
   */
  private async executeTask(
    taskId: string, 
    state: OrchestrationState, 
    context: AgentContext
  ): Promise<void> {
    const task = state.pendingTasks.get(taskId);
    if (!task) return;
    
    // Mover para tarefas ativas
    state.pendingTasks.delete(taskId);
    state.activeTasks.set(taskId, task);
    
    try {
      // Obter agente
      const agent = this.agents.get(task.agentName);
      if (!agent) throw new Error(`Agent ${task.agentName} not found`);
      
      // Executar
      const result = await agent.execute(task.input, {
        ...context,
        parentTaskId: task.id,
      });
      
      // Verificar se precisa de aprovação
      if (result.requiresApproval) {
        // Aguardar aprovação
        state.pendingApprovals.set(taskId, result.approvalData as any);
      } else {
        // Completar tarefa
        state.completedTasks.set(taskId, result);
        state.activeTasks.delete(taskId);
      }
      
    } catch (error) {
      state.failedTasks.set(taskId, { ...task, error } as any);
      state.activeTasks.delete(taskId);
    }
  }
  
  /**
   * Verifica aprovações pendentes
   */
  private async checkPendingApprovals(state: OrchestrationState): Promise<void> {
    for (const [taskId, approval] of state.pendingApprovals) {
      // Verificar status da aprovação no banco
      const dbApproval = await db.hITLApproval.findFirst({
        where: { taskId },
      });
      
      if (dbApproval?.status === 'APPROVED') {
        // Aprovação concedida
        const task = state.activeTasks.get(taskId);
        if (task) {
          state.completedTasks.set(taskId, { success: true, data: approval } as any);
          state.activeTasks.delete(taskId);
        }
        state.pendingApprovals.delete(taskId);
      } else if (dbApproval?.status === 'REJECTED') {
        // Aprovação negada - retry ou falhar
        state.failedTasks.set(taskId, { error: { message: 'Approval rejected' } } as any);
        state.activeTasks.delete(taskId);
        state.pendingApprovals.delete(taskId);
      }
    }
  }
  
  /**
   * Consolida resultados de todas as tarefas
   */
  private async consolidateResults(state: OrchestrationState): Promise<TaskOutput> {
    const results: Record<string, any> = {};
    
    for (const [taskId, output] of state.completedTasks) {
      results[taskId] = output.data;
    }
    
    return {
      success: state.failedTasks.size === 0,
      data: results,
      confidence: this.calculateOverallConfidence(state),
      requiresApproval: false,
    };
  }
  
  /**
   * Calcula confiança geral do resultado
   */
  private calculateOverallConfidence(state: OrchestrationState): number {
    if (state.completedTasks.size === 0) return 0;
    
    let totalConfidence = 0;
    for (const [, output] of state.completedTasks) {
      totalConfidence += output.confidence || 50;
    }
    
    return Math.round(totalConfidence / state.completedTasks.size);
  }
  
  // ... outros métodos auxiliares
}
```

---

## 4. Prompts do Sistema

### Prompt do Orchestrator

```
Você é o Orchestrator Agent de um sistema de Growth Marketing automatizado.

## Sua Responsabilidade
Coordenar agentes especializados para atingir objetivos de marketing, garantindo qualidade e eficiência.

## Agentes Disponíveis
1. **Research Agent**: Define ICP, pesquisa mercado, analisa concorrentes
2. **Analysis Agent**: Analisa métricas, gera insights, recomenda otimizações
3. **Content Agent**: Cria copy, gera imagens/vídeos, produz variações
4. **Campaign Agent**: Configura campanhas, monitora performance, aplica otimizações

## Seu Processo
1. Analise o objetivo recebido
2. Decomponha em subtarefas
3. Identifique dependências entre tarefas
4. Atribua tarefas aos agentes especializados
5. Monitore progresso e qualidade
6. Acione HITL quando necessário
7. Consolide resultados

## Pontos de Aprovação HITL
- ICP definido → Validação com gestor
- Conteúdo gerado → Aprovação criativa
- Configuração de campanha → Aprovação de orçamento/segmentação
- Otimizações críticas → Aprovação de mudanças

## Resposta Esperada
Forneça sempre:
1. Plano de execução claro
2. Dependências identificadas
3. Estimativa de tempo
4. Pontos de HITL necessários
```

### Prompt do Research Agent

```
Você é o Research Agent especializado em inteligência de mercado.

## Sua Responsabilidade
Definir ICPs, pesquisar mercado, analisar concorrentes e identificar tendências.

## Ferramentas Disponíveis
- WebSearch: Pesquisa na web
- MarketDataAPI: Dados de mercado
- SocialListening: Análise de redes sociais
- CompetitorAnalysis: Análise de concorrentes

## Seu Processo
1. Entenda o contexto do negócio
2. Pesquise dados demográficos e psicográficos
3. Identifique pain points e objetivos
4. Analise concorrentes
5. Identifique tendências relevantes
6. Sintetize em insights acionáveis

## Output Esperado
- ICP estruturado com confiança
- Dados de mercado
- Análise de concorrentes
- Tendências identificadas
- Fontes consultadas

## Nível de Confiança
- HIGH (80-100): Dados verificados de múltiplas fontes
- MEDIUM (50-79): Dados de fontes secundárias
- LOW (0-49): Dados inferidos ou hipóteses

## HITL
Sempre solicitar validação de ICP definido com confiança < 80%.
```

### Prompt do Content Agent

```
Você é o Content Agent especializado em criação de conteúdo para marketing.

## Sua Responsabilidade
Criar copy, gerar variações, produzir scripts e coordenar geração de assets visuais.

## Tipos de Conteúdo
- Copy para anúncios (headline, body, CTA)
- Scripts de vídeo
- Prompts para geração de imagens
- Variações para A/B testing

## Seu Processo
1. Analise o ICP e contexto
2. Identifique o tipo de conteúdo necessário
3. Crie variações baseadas em diferentes ângulos
4. Otimize para a plataforma específica
5. Preveja performance potencial

## Output Esperado
- Variações de conteúdo (mínimo 3)
- Metadados (targeting sugerido, melhores práticas)
- Previsão de performance
- Recomendações de uso

## HITL
- Conteúdo com temáticas sensíveis → Aprovação obrigatória
- Todos os conteúdos visuais → Aprovação recomendada
- Copy com reivindicações específicas → Aprovação de compliance
```

---

## 5. Sistema de Filas e Eventos

```typescript
// lib/queue.ts

import { AgentTask } from '@/agents/core/types';

interface QueueConfig {
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number;
}

export class AgentQueue {
  private queue: AgentTask[] = [];
  private running: Map<string, AgentTask> = new Map();
  private config: QueueConfig;
  
  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 5,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 5000,
    };
  }
  
  async add(task: AgentTask): Promise<void> {
    this.queue.push(task);
    await this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running.size < this.config.maxConcurrent) {
      const task = this.queue.shift();
      if (task) {
        this.running.set(task.id, task);
        this.executeTask(task);
      }
    }
  }
  
  private async executeTask(task: AgentTask): Promise<void> {
    // Executar tarefa...
    this.running.delete(task.id);
    await this.processQueue();
  }
}
```

---

## 6. WebSocket para Atualizações em Tempo Real

```typescript
// app/api/ws/route.ts (Next.js 16 WebSocket)

import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

export async function GET(request: NextRequest) {
  // Upgrade para WebSocket
  const socket = request.socket as any;
  
  if (socket && !socket.server.ws) {
    const wss = new WebSocketServer({ noServer: true });
    
    socket.server.ws = wss;
    socket.server.on('upgrade', (req: any, socket: any, head: any) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    });
    
    wss.on('connection', (ws, req) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        // Handle message
      });
      
      // Send initial state
      ws.send(JSON.stringify({ type: 'connected' }));
    });
  }
}
```

---

*Este documento será expandido conforme a implementação avança.*
