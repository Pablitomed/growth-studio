"use client";

import { useState, useEffect, use } from "react";
import {
  TrendingUp,
  Megaphone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Info,
  DollarSign,
  Target,
  Eye,
  Play,
  Pause,
  Brain,
  LineChart,
  Heart,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Settings,
  Bell,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface ClienteData {
  id: string;
  nome: string;
  empresa: string | null;
  icp: {
    demografia?: string;
    psicografia?: string;
    dores?: string[];
    desejos?: string[];
    canais?: string[];
  } | null;
  icpStatus: string;
  campanhas: Campanha[];
  conteudos: Conteudo[];
  resultados: Resultado[];
  decisoes: Decisao[];
  geoMetrics?: GEOMetric[];
  proimMetrics?: PROIMMetric[];
  tierServico?: { tier: string; valorMensal: number };
}

interface Campanha {
  id: string;
  nome: string;
  objetivo: string;
  status: string;
  budget: number | null;
  plataformas: string[];
  metricas: {
    impressoes?: number;
    cliques?: number;
    conversoes?: number;
    gasto?: number;
    roas?: number;
    ctr?: number;
  } | null;
  dataInicio?: string;
}

interface Conteudo {
  id: string;
  tipo: string;
  titulo: string | null;
  corpo: string | null;
  mediaUrl: string | null;
  status: string;
  plataforma: string | null;
}

interface Resultado {
  id: string;
  data: string;
  plataforma: string | null;
  impressoes: number;
  cliques: number;
  conversoes: number;
  gasto: number;
  receita: number;
  roas: number;
}

interface Decisao {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  contexto: any;
  recomendacao: string | null;
  nivelRisco: string;
  status: string;
  urgencia: string;
  feedback?: string;
  createdAt: string;
}

interface GEOMetric {
  id: string;
  shareOfModel: number | null;
  chatGPT: number | null;
  perplexity: number | null;
  gemini: number | null;
  claude: number | null;
  dataMedicao: string;
}

interface PROIMMetric {
  id: string;
  prontidaoScore: number | null;
  probabilidadeConv: number | null;
  roiEstimado: number | null;
  scrollDepth: number | null;
  hoverTime: number | null;
  dataMedicao: string;
}

export default function PaginaCliente({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decisaoSelecionada, setDecisaoSelecionada] = useState<Decisao | null>(null);
  const [feedback, setFeedback] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCliente();
  }, [resolvedParams.token]);

  const fetchCliente = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/cliente/${resolvedParams.token}`);
      if (res.ok) {
        const data = await res.json();
        setCliente(data.cliente);
      } else {
        setCliente(null);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case "critica":
        return <Badge className="bg-red-500 animate-pulse">Crítica</Badge>;
      case "alta":
        return <Badge className="bg-orange-500">Alta</Badge>;
      case "normal":
        return <Badge className="bg-yellow-500">Normal</Badge>;
      default:
        return <Badge className="bg-green-500">Baixa</Badge>;
    }
  };

  const getRiscoBadge = (risco: string) => {
    switch (risco) {
      case "alto":
        return <Badge variant="outline" className="border-red-500 text-red-400">Risco Alto</Badge>;
      case "medio":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400">Risco Médio</Badge>;
      default:
        return <Badge variant="outline" className="border-green-500 text-green-400">Risco Baixo</Badge>;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "aprovacao_budget":
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case "aprovacao_criativo":
        return <FileText className="w-5 h-5 text-blue-400" />;
      case "aprovacao_campanha":
        return <Megaphone className="w-5 h-5 text-purple-400" />;
      case "mudanca_estrategia":
        return <Target className="w-5 h-5 text-orange-400" />;
      case "alerta_risco":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      aprovacao_budget: "Aprovação de Budget",
      aprovacao_criativo: "Aprovação de Criativo",
      aprovacao_campanha: "Aprovação de Campanha",
      mudanca_estrategia: "Mudança de Estratégia",
      alerta_risco: "Alerta de Risco",
    };
    return labels[tipo] || tipo;
  };

  const decidir = async (decisaoId: string, tipoDecisao: string) => {
    if (!cliente) return;

    try {
      const res = await fetch(`/api/decisoes/${decisaoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: tipoDecisao === "aprovado" ? "aprovado" : "rejeitado",
          decisao: tipoDecisao,
          feedback: feedback || null,
        }),
      });

      if (res.ok) {
        const atualizarDecisao = cliente.decisoes.map(d => 
          d.id === decisaoId ? { ...d, status: tipoDecisao === "aprovado" ? "aprovado" : "rejeitado", feedback } : d
        );
        setCliente({ ...cliente, decisoes: atualizarDecisao });
        setDecisaoSelecionada(null);
        setFeedback("");
        toast({
          title: tipoDecisao === "aprovado" ? "Aprovado!" : "Rejeitado",
          description: `A decisão foi ${tipoDecisao === "aprovado" ? "aprovada" : "rejeitada"} com sucesso.`,
          className: tipoDecisao === "aprovado" ? "bg-emerald-600" : "bg-red-600",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível processar a decisão", variant: "destructive" });
    }
  };

  const decisoesPendentes = cliente?.decisoes.filter(d => d.status === "pendente") || [];

  // Dados para gráficos
  const dadosGrafico = cliente?.resultados.slice(0, 7).map(r => ({
    data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    roas: r.roas || 0,
    conversoes: r.conversoes,
    gasto: r.gasto,
  })).reverse() || [];

  // Métricas calculadas
  const metricas = {
    totalImpressoes: cliente?.resultados.reduce((acc, r) => acc + (r.impressoes || 0), 0) || 0,
    totalCliques: cliente?.resultados.reduce((acc, r) => acc + (r.cliques || 0), 0) || 0,
    totalConversoes: cliente?.resultados.reduce((acc, r) => acc + (r.conversoes || 0), 0) || 0,
    totalGasto: cliente?.resultados.reduce((acc, r) => acc + (r.gasto || 0), 0) || 0,
    totalReceita: cliente?.resultados.reduce((acc, r) => acc + (r.receita || 0), 0) || 0,
    roasMedio: cliente?.resultados.length ? 
      cliente.resultados.reduce((acc, r) => acc + (r.roas || 0), 0) / cliente.resultados.length : 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Cliente não encontrado</h1>
          <p className="text-slate-400 mt-2">Verifique o link de acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Growth Studio</h1>
              <p className="text-xs text-slate-400">{cliente.empresa || cliente.nome}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {cliente.tierServico && (
              <Badge className="bg-purple-600">
                Tier: {cliente.tierServico.tier}
              </Badge>
            )}
            {decisoesPendentes.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-400">{decisoesPendentes.length} pendente(s)</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={fetchCliente}
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerta de Decisões Pendentes */}
        {decisoesPendentes.length > 0 && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Ações Necessárias</h2>
                <p className="text-slate-300 mb-4">
                  Existem <span className="text-orange-400 font-semibold">{decisoesPendentes.length} decisão(ões)</span> aguardando sua aprovação. 
                  Algumas podem ser urgentes e impactar a performance das campanhas.
                </p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600" 
                  onClick={() => document.getElementById('decisoes-tab')?.click()}
                >
                  Ver Decisões <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="visao-geral" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="campanhas" className="data-[state=active]:bg-slate-700">
              <Megaphone className="w-4 h-4 mr-2" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="resultados" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="decisoes" id="decisoes-tab" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Decisões {decisoesPendentes.length > 0 && `(${decisoesPendentes.length})`}
            </TabsTrigger>
            <TabsTrigger value="geo" className="data-[state=active]:bg-slate-700">
              <Brain className="w-4 h-4 mr-2" />
              GEO
            </TabsTrigger>
            <TabsTrigger value="proim" className="data-[state=active]:bg-slate-700">
              <LineChart className="w-4 h-4 mr-2" />
              PROIM
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Impressões</p>
                      <p className="text-xl font-bold text-white">{metricas.totalImpressoes.toLocaleString()}</p>
                    </div>
                    <Eye className="w-5 h-5 text-slate-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Cliques</p>
                      <p className="text-xl font-bold text-white">{metricas.totalCliques.toLocaleString()}</p>
                    </div>
                    <Target className="w-5 h-5 text-slate-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Conversões</p>
                      <p className="text-xl font-bold text-white">{metricas.totalConversoes}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">ROAS Médio</p>
                      <p className="text-xl font-bold text-emerald-400">{metricas.roasMedio.toFixed(1)}x</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Investido</p>
                      <p className="text-xl font-bold text-white">R$ {metricas.totalGasto.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-5 h-5 text-slate-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Receita</p>
                      <p className="text-xl font-bold text-emerald-400">R$ {metricas.totalReceita.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Performance */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Performance - Últimos 7 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGrafico}>
                      <defs>
                        <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="data" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Area type="monotone" dataKey="roas" stroke="#10b981" fillOpacity={1} fill="url(#colorRoas)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ICP */}
            {cliente.icp && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    ICP - Perfil do Cliente Ideal
                    <Badge className={cliente.icpStatus === "aprovado" ? "bg-emerald-600" : ""}>
                      {cliente.icpStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cliente.icp.demografia && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Demografia</h4>
                        <p className="text-white">{cliente.icp.demografia}</p>
                      </div>
                    )}
                    {cliente.icp.psicografia && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Psicografia</h4>
                        <p className="text-white">{cliente.icp.psicografia}</p>
                      </div>
                    )}
                    {cliente.icp.dores && cliente.icp.dores.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Dores</h4>
                        <ul className="space-y-1">
                          {cliente.icp.dores.map((dor, i) => (
                            <li key={i} className="text-white flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {dor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {cliente.icp.desejos && cliente.icp.desejos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Desejos</h4>
                        <ul className="space-y-1">
                          {cliente.icp.desejos.map((desejo, i) => (
                            <li key={i} className="text-white flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {desejo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Campanhas */}
          <TabsContent value="campanhas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cliente.campanhas.map((campanha) => (
                <Card key={campanha.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{campanha.nome}</CardTitle>
                        <CardDescription className="text-slate-400">
                          Objetivo: {campanha.objetivo}
                        </CardDescription>
                      </div>
                      <Badge className={
                        campanha.status === "ativa" ? "bg-emerald-600" :
                        campanha.status === "pendente_aprovacao" ? "bg-orange-600" :
                        "bg-slate-600"
                      }>
                        {campanha.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Budget</span>
                        <span className="text-white font-medium">
                          R$ {campanha.budget?.toLocaleString() || "Não definido"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Plataformas</span>
                        <div className="flex gap-2">
                          {campanha.plataformas?.map((p) => (
                            <Badge key={p} variant="outline" className="border-slate-600">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {campanha.metricas && (
                        <div className="pt-4 border-t border-slate-700">
                          <h5 className="text-sm font-medium text-slate-300 mb-3">Métricas</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-2 rounded bg-slate-800/50">
                              <span className="text-slate-400">Impressões</span>
                              <p className="text-white font-medium">{campanha.metricas.impressoes?.toLocaleString()}</p>
                            </div>
                            <div className="p-2 rounded bg-slate-800/50">
                              <span className="text-slate-400">CTR</span>
                              <p className="text-white font-medium">{campanha.metricas.ctr}%</p>
                            </div>
                            <div className="p-2 rounded bg-slate-800/50">
                              <span className="text-slate-400">Conversões</span>
                              <p className="text-white font-medium">{campanha.metricas.conversoes}</p>
                            </div>
                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <span className="text-slate-400">ROAS</span>
                              <p className="text-emerald-400 font-bold">{campanha.metricas.roas}x</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Resultados */}
          <TabsContent value="resultados" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Resultados por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cliente.resultados.map((resultado) => (
                    <div key={resultado.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-slate-600">
                            {resultado.plataforma}
                          </Badge>
                          <span className="text-slate-300">{new Date(resultado.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <Badge className={resultado.roas >= 3 ? "bg-emerald-600" : resultado.roas >= 2 ? "bg-yellow-600" : "bg-red-600"}>
                          ROAS: {resultado.roas.toFixed(1)}x
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Impressões</span>
                          <p className="text-white font-medium">{resultado.impressoes.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Cliques</span>
                          <p className="text-white font-medium">{resultado.cliques.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Conversões</span>
                          <p className="text-white font-medium">{resultado.conversoes}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Gasto</span>
                          <p className="text-white font-medium">R$ {resultado.gasto.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Receita</span>
                          <p className="text-emerald-400 font-medium">R$ {resultado.receita.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Decisões */}
          <TabsContent value="decisoes" className="space-y-6">
            <div className="space-y-4">
              {decisoesPendentes.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white">Nenhuma decisão pendente!</h3>
                    <p className="text-slate-400 mt-2">Todas as ações foram processadas. Continue acompanhando os resultados.</p>
                  </CardContent>
                </Card>
              ) : (
                decisoesPendentes.map((decisao) => (
                  <Card key={decisao.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTipoIcon(decisao.tipo)}
                          <div>
                            <CardTitle className="text-white">{decisao.titulo}</CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                              {getTipoLabel(decisao.tipo)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getUrgenciaBadge(decisao.urgencia)}
                          {getRiscoBadge(decisao.nivelRisco)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">{decisao.descricao}</p>

                      {decisao.contexto && (
                        <div className="p-3 rounded-lg bg-slate-800/50 mb-4">
                          <h5 className="text-sm font-medium text-slate-300 mb-2">Contexto</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(decisao.contexto).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-slate-400">{key}:</span>
                                <span className="text-white">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {decisao.recomendacao && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
                          <h5 className="text-sm font-medium text-emerald-400 mb-1">Recomendação do Agente</h5>
                          <p className="text-sm text-slate-300">{decisao.recomendacao}</p>
                        </div>
                      )}

                      <Textarea
                        placeholder="Adicione um feedback ou comentário (opcional)..."
                        className="bg-slate-800 border-slate-700 text-white mb-4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                        onClick={() => decidir(decisao.id, "rejeitado")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => decidir(decisao.id, "aprovado")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab: GEO */}
          <TabsContent value="geo" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">GEO - Share of Model</h2>
                <p className="text-sm text-slate-400">Visibilidade da marca em motores de IA</p>
              </div>
              <Badge className="bg-purple-600 text-lg px-4 py-2">
                SoM: 12%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">ChatGPT</p>
                    <p className="text-3xl font-bold text-white">15%</p>
                    <Progress value={15} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Perplexity</p>
                    <p className="text-3xl font-bold text-white">18%</p>
                    <Progress value={18} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Gemini</p>
                    <p className="text-3xl font-bold text-white">8%</p>
                    <Progress value={8} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Claude</p>
                    <p className="text-3xl font-bold text-white">12%</p>
                    <Progress value={12} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: PROIM */}
          <TabsContent value="proim" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">PROIM - Predictive ROI</h2>
                <p className="text-sm text-slate-400">Previsão de ROI usando micro-sinais</p>
              </div>
              <Badge className="bg-blue-600 text-lg px-4 py-2">
                Precisão: 78%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Prontidão</span>
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-3xl font-bold text-white">65%</p>
                  <p className="text-sm text-emerald-400 mt-2">+12% vs semana passada</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Prob. Conversão</span>
                    <Target className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-white">23%</p>
                  <p className="text-sm text-slate-400 mt-2">Média: 18%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">ROI Estimado</span>
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-400">3.8x</p>
                  <p className="text-sm text-slate-400 mt-2">Próximos 7 dias</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Growth Studio - Sistema Agêntico de Marketing • Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
