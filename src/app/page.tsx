"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Megaphone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  BarChart3,
  Zap,
  ChevronRight,
  Activity,
  Brain,
  Target,
  DollarSign,
  Search,
  Settings,
  Bell,
  Menu,
  X,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Heart,
  LineChart,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AGENTES, TIERS_SERVICO } from "@/lib/agents";

// Tipos
interface Cliente {
  id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  tokenAcesso: string;
  status: string;
  icpStatus: string;
  tierServico?: { tier: string } | null;
  campanhas: Campanha[];
  decisoes: Decisao[];
  _count?: {
    campanhas: number;
    conteudos: number;
    decisoes: number;
  };
}

interface Campanha {
  id: string;
  nome: string;
  status: string;
  budget: number | null;
  metricas: { impressoes?: number; conversoes?: number; roas?: number } | null;
}

interface Decisao {
  id: string;
  tipo: string;
  titulo: string;
  status: string;
  urgencia: string;
  nivelRisco: string;
  createdAt: string;
  cliente?: { nome: string; empresa: string | null };
}

interface StatsGerais {
  totalClientes: number;
  clientesAtivos: number;
  campanhasAtivas: number;
  decisoesPendentes: number;
  roasMedio: number;
  investidoTotal: number;
  conversoesTotal: number;
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ 
    nome: "", 
    empresa: "", 
    email: "", 
    telefone: "",
    website: "",
    industria: "",
    tier: "assistivo"
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data.clientes || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Estatísticas gerais
  const stats: StatsGerais = {
    totalClientes: clientes.length,
    clientesAtivos: clientes.filter(c => c.status === "ativo").length,
    campanhasAtivas: clientes.reduce((acc, c) => acc + (c.campanhas?.filter(cam => cam.status === "ativa").length || 0), 0),
    decisoesPendentes: clientes.reduce((acc, c) => acc + (c.decisoes?.filter(d => d.status === "pendente").length || 0), 0),
    roasMedio: calcularROASMedio(clientes),
    investidoTotal: clientes.reduce((acc, c) => acc + (c.campanhas?.reduce((a: number, cam: Campanha) => a + (cam.metricas?.impressoes || 0), 0) || 0), 0),
    conversoesTotal: clientes.reduce((acc, c) => acc + (c.campanhas?.reduce((a: number, cam: Campanha) => a + (cam.metricas?.conversoes || 0), 0) || 0), 0),
  };

  function calcularROASMedio(clientes: Cliente[]): number {
    let total = 0;
    let count = 0;
    clientes.forEach(c => {
      c.campanhas?.forEach(cam => {
        if (cam.metricas?.roas) {
          total += cam.metricas.roas;
          count++;
        }
      });
    });
    return count > 0 ? total / count : 0;
  }

  const criarCliente = async () => {
    if (!novoCliente.nome) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCliente),
      });
      
      if (res.ok) {
        const data = await res.json();
        setClientes([data.cliente, ...clientes]);
        setNovoClienteOpen(false);
        setNovoCliente({ nome: "", empresa: "", email: "", telefone: "", website: "", industria: "", tier: "assistivo" });
        toast({ title: "Sucesso", description: "Cliente criado com sucesso!" });
      } else {
        throw new Error('Erro ao criar cliente');
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível criar o cliente", variant: "destructive" });
    }
  };

  const copiarLink = async (token: string) => {
    const url = `${window.location.origin}/cliente/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copiado!", description: "Link copiado para a área de transferência" });
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case "critica": return "bg-red-500";
      case "alta": return "bg-orange-500";
      case "normal": return "bg-yellow-500";
      default: return "bg-green-500";
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

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      assistivo: "bg-slate-600",
      orchestrado: "bg-blue-600",
      agentic: "bg-purple-600",
      autonomo: "bg-emerald-600",
    };
    return colors[tier] || "bg-slate-600";
  };

  const todasDecisoes = clientes.flatMap(c => 
    (c.decisoes || []).map(d => ({ ...d, cliente: { nome: c.nome, empresa: c.empresa } }))
  ).filter(d => d.status === "pendente");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando Growth Studio...</p>
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
              <p className="text-xs text-slate-400">Sistema Agêntico de Marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={fetchClientes}
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-400">15 Agentes Ativos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Clientes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClientes}</p>
                </div>
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Campanhas</p>
                  <p className="text-2xl font-bold text-white">{stats.campanhasAtivas}</p>
                </div>
                <Megaphone className="w-6 h-6 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.decisoesPendentes}</p>
                </div>
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">ROAS</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.roasMedio.toFixed(1)}x</p>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Conversões</p>
                  <p className="text-2xl font-bold text-white">{stats.conversoesTotal}</p>
                </div>
                <Target className="w-6 h-6 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">SoM</p>
                  <p className="text-2xl font-bold text-purple-400">12%</p>
                </div>
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">PROIM</p>
                  <p className="text-2xl font-bold text-blue-400">78%</p>
                </div>
                <LineChart className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clientes" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="clientes" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="decisoes" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Decisões ({stats.decisoesPendentes})
            </TabsTrigger>
            <TabsTrigger value="agentes" className="data-[state=active]:bg-slate-700">
              <Zap className="w-4 h-4 mr-2" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="geo" className="data-[state=active]:bg-slate-700">
              <Brain className="w-4 h-4 mr-2" />
              GEO / SoM
            </TabsTrigger>
            <TabsTrigger value="proim" className="data-[state=active]:bg-slate-700">
              <LineChart className="w-4 h-4 mr-2" />
              PROIM
            </TabsTrigger>
          </TabsList>

          {/* Tab: Clientes */}
          <TabsContent value="clientes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Todos os Clientes</h2>
              <Dialog open={novoClienteOpen} onOpenChange={setNovoClienteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Novo Cliente</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Adicione um novo cliente ao sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-slate-300">Nome do Contato *</Label>
                      <Input
                        id="nome"
                        value={novoCliente.nome}
                        onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa" className="text-slate-300">Empresa</Label>
                      <Input
                        id="empresa"
                        value={novoCliente.empresa}
                        onChange={(e) => setNovoCliente({ ...novoCliente, empresa: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={novoCliente.email}
                        onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tier" className="text-slate-300">Tier de Serviço</Label>
                      <Select value={novoCliente.tier} onValueChange={(v) => setNovoCliente({ ...novoCliente, tier: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {Object.entries(TIERS_SERVICO).map(([key, tier]) => (
                            <SelectItem key={key} value={key}>
                              {tier.nome} - R$ {tier.preco.toLocaleString()}/mês
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={criarCliente} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Criar Cliente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                          {cliente.nome}
                          <Badge className={`${getTierBadge(cliente.tierServico?.tier || 'assistivo')} text-xs`}>
                            {cliente.tierServico?.tier || 'assistivo'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                          {cliente.empresa || "Sem empresa definida"}
                        </CardDescription>
                      </div>
                      <Link
                        href={`/cliente/${cliente.tokenAcesso}`}
                        target="_blank"
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* ICP Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">ICP</span>
                      <Badge variant={cliente.icpStatus === "aprovado" ? "default" : "secondary"} 
                             className={cliente.icpStatus === "aprovado" ? "bg-emerald-600" : ""}>
                        {cliente.icpStatus.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Contadores */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-800/50">
                        <p className="text-slate-400">Campanhas</p>
                        <p className="text-white font-medium">{cliente._count?.campanhas || cliente.campanhas?.length || 0}</p>
                      </div>
                      <div className="p-2 rounded bg-slate-800/50">
                        <p className="text-slate-400">Conteúdos</p>
                        <p className="text-white font-medium">{cliente._count?.conteudos || 0}</p>
                      </div>
                      <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                        <p className="text-orange-400">Pendentes</p>
                        <p className="text-orange-400 font-medium">{cliente._count?.decisoes || cliente.decisoes?.filter(d => d.status === 'pendente').length || 0}</p>
                      </div>
                    </div>

                    {/* Decisões Pendentes */}
                    {cliente.decisoes?.filter(d => d.status === "pendente").length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Decisões Pendentes
                        </span>
                        {cliente.decisoes.filter(d => d.status === "pendente").slice(0, 2).map((decisao) => (
                          <div key={decisao.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getUrgenciaColor(decisao.urgencia)}`} />
                              <span className="text-white truncate max-w-[150px]">{decisao.titulo}</span>
                            </div>
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">
                              {getTipoLabel(decisao.tipo)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Link do Cliente */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">Link de acesso:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => copiarLink(cliente.tokenAcesso)}
                        >
                          {copied === cliente.tokenAcesso ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <code className="text-xs text-emerald-400 bg-slate-800 px-2 py-1 rounded block truncate">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/cliente/{cliente.tokenAcesso.substring(0, 20)}...
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Decisões */}
          <TabsContent value="decisoes" className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Todas as Decisões Pendentes</h2>
            {todasDecisoes.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white">Nenhuma decisão pendente!</h3>
                  <p className="text-slate-400 mt-2">Todas as ações foram processadas.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {todasDecisoes
                  .sort((a, b) => {
                    const ordem = { critica: 0, alta: 1, normal: 2, baixa: 3 };
                    return ordem[a.urgencia as keyof typeof ordem] - ordem[b.urgencia as keyof typeof ordem];
                  })
                  .map((decisao) => (
                    <Card key={decisao.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-3 h-3 rounded-full mt-1.5 ${getUrgenciaColor(decisao.urgencia)}`} />
                            <div>
                              <h3 className="font-medium text-white">{decisao.titulo}</h3>
                              <p className="text-sm text-slate-400 mt-1">
                                Cliente: <span className="text-white">{decisao.cliente?.nome}</span> • {decisao.cliente?.empresa}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                  {getTipoLabel(decisao.tipo)}
                                </Badge>
                                <Badge variant="outline" className={
                                  decisao.nivelRisco === 'alto' ? 'border-red-500 text-red-400' :
                                  decisao.nivelRisco === 'medio' ? 'border-yellow-500 text-yellow-400' :
                                  'border-green-500 text-green-400'
                                }>
                                  Risco {decisao.nivelRisco}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Link href={`/cliente/${decisao.cliente?.id}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              Decidir <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Agentes */}
          <TabsContent value="agentes" className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Sistema de 15 Agentes Especializados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(AGENTES).map(([key, agente]) => (
                <Card key={key} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{agente.nome}</h3>
                        <p className="text-xs text-slate-400">{agente.descricao}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-emerald-400">Ativo</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {agente.categoria}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: GEO / Share of Model */}
          <TabsContent value="geo" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">GEO - Generative Engine Optimization</h2>
                <p className="text-sm text-slate-400">Share of Model (SoM) - Visibilidade em IAs</p>
              </div>
              <Badge className="bg-purple-600 text-lg px-4 py-2">
                SoM: 12%
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Densidade de Fatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Score de Citação</span>
                    <span className="text-white font-medium">72/100</span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Information Gain</span>
                    <span className="text-white font-medium">+45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: PROIM */}
          <TabsContent value="proim" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">PROIM - Predictive ROI Model</h2>
                <p className="text-sm text-slate-400">Previsão de ROI usando micro-sinais comportamentais</p>
              </div>
              <Badge className="bg-blue-600 text-lg px-4 py-2">
                Precisão: 78%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Prontidão Emocional</span>
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
                  <p className="text-sm text-slate-400 mt-2">Média histórica: 18%</p>
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

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Micro-Sinais Comportamentais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400">Scroll Depth</p>
                    <p className="text-lg font-bold text-white">68%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400">Hover Time</p>
                    <p className="text-lg font-bold text-white">4.2s</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400">Recorrência</p>
                    <p className="text-lg font-bold text-white">2.3x</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400">Interação Tools</p>
                    <p className="text-lg font-bold text-white">45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Growth Studio v1.0 • Sistema Agêntico de Marketing
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Powered by AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
