"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import SwitcherTheme from "@/components/SwitcherTheme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, LogOut, TrendingUp, DollarSign, CreditCard, PieChart } from "lucide-react";
import transactionService from "./service/transaction.service";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TransactionsResponse {
    id: string
    type: string
    category: string
    date: string
    value: string
    description: string
}

interface ApiResponse {
    data: TransactionsResponse[]
    total: number
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<TransactionsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("Token");
    
    if (!token) {
      router.push("/auth/login");
      return;
    }
    
    setIsAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("Token");
    Cookies.remove("RefreshToken");
    router.push("/auth/login");
  };


  function getTransactions() {
    setLoading(true);
    transactionService.getAllTransactions<ApiResponse>().then((res) => {
      console.log(res.data);
      setTransactions(res.data.data);
    }).catch((err) => {
        console.log(err)
    }).finally(() => {
        setLoading(false);
    });
  }

  useEffect(() => {
      getTransactions();
  }, [])

  // Funções auxiliares para cálculos
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Cálculos das estatísticas
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + parseFloat(t.value), 0);
    
  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + parseFloat(t.value), 0);
    
  const lucroLiquido = totalReceitas - totalDespesas;

  // Dados para gráfico de pizza (Receitas vs Despesas)
  const pieData = [
    {
      name: 'Receitas',
      value: totalReceitas,
      color: '#22c55e'
    },
    {
      name: 'Despesas', 
      value: totalDespesas,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const categoryData = Object.entries(
    transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { receitas: 0, despesas: 0, total: 0 };
      }
      
      const value = parseFloat(transaction.value);
      if (transaction.type === 'receita') {
        acc[category].receitas += value;
      } else {
        acc[category].despesas += value;
      }
      acc[category].total += value;
      
      return acc;
    }, {} as Record<string, { receitas: number; despesas: number; total: number }>)
  ).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    receitas: data.receitas,
    despesas: data.despesas,
    total: data.total
  })).sort((a, b) => b.total - a.total);

  const COLORS = [
    '#22c55e', // Verde
    '#ef4444', // Vermelho  
    '#3b82f6', // Azul
    '#f59e0b', // Amarelo
    '#8b5cf6', // Roxo
    '#06b6d4', // Ciano
    '#ec4899', // Rosa
    '#10b981', // Esmeralda
    '#f97316', // Laranja
    '#6366f1', // Índigo
    '#84cc16', // Lima
    '#14b8a6'  // Teal
  ];

  // Dados para gráfico donut por categoria
  const categoryDonutData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.total,
    color: COLORS[index % COLORS.length],
    receitas: item.receitas,
    despesas: item.despesas
  }));

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Fast Finance</h1>
          </div>
          <div className="flex items-center gap-4">
            <SwitcherTheme />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel financeiro
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceitas.toString())}</div>
              <p className="text-xs text-muted-foreground">
                Total de receitas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDespesas.toString())}</div>
              <p className="text-xs text-muted-foreground">
                Total de despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(lucroLiquido.toString())}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Transações
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Movimentações registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Pizza - Receitas vs Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Financeira</CardTitle>
              <CardDescription>
                Proporção entre receitas e despesas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }: any) => 
                          `${name}: ${formatCurrency((value as number).toString())} (${((percent as number) * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value.toString()), 'Valor']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum dado disponível para exibir
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico Donut - Por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>
                Análise visual das categorias de transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : categoryDonutData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryDonutData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }: any) => 
                          `${name}: ${((percent as number) * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          formatCurrency(value.toString()), 
                          'Total'
                        ]}
                        labelFormatter={(label) => `${label}`}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">
                                  <span className="text-green-600">Receitas: {formatCurrency(data.receitas.toString())}</span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-red-600">Despesas: {formatCurrency(data.despesas.toString())}</span>
                                </p>
                                <p className="text-sm font-medium">
                                  Total: {formatCurrency(data.value.toString())}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum dado disponível para exibir
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Suas últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 6).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium text-lg ${
                        transaction.type === 'receita' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </span>
                    </div>
                  ))}
                  {transactions.length > 6 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        Ver todas as {transactions.length} transações
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo por Categoria</CardTitle>
              <CardDescription>
                Distribuição dos gastos e ganhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : categoryData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação para analisar
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => {
                    const percentage = (category.total / (totalReceitas + totalDespesas)) * 100;
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm font-medium">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(category.total.toString())}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Mini barra de progresso */}
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                        
                        {/* Detalhes de receitas e despesas */}
                        {(category.receitas > 0 || category.despesas > 0) && (
                          <div className="flex gap-4 text-xs text-muted-foreground pl-5">
                            {category.receitas > 0 && (
                              <span className="text-green-600">
                                +{formatCurrency(category.receitas.toString())}
                              </span>
                            )}
                            {category.despesas > 0 && (
                              <span className="text-red-600">
                                -{formatCurrency(category.despesas.toString())}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {categoryData.length > 5 && (
                    <div className="text-center pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        +{categoryData.length - 5} categorias adicionais
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}