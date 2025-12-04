import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Package, TrendingUp, ShoppingCart, DollarSign, Search, Plus, X, BarChart3, TrendingDown, ArrowDownCircle, ArrowUpCircle, FileText, SlidersHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { products, movements, notes, addNote, deleteNote } = useStock();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState('');

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const entriesValue = movements.filter(m => m.type === 'entry').reduce((sum, m) => sum + (m.quantity * (m.price || 0)), 0);
    const exitsQuantity = movements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    const estimatedProfit = products.reduce((sum, p) => {
      if (p.cost && p.price && p.cost > 0 && p.price > 0) {
        return sum + ((p.price - p.cost) * p.quantity);
      }
      return sum;
    }, 0);

    return { totalProducts, totalValue, entriesValue, exitsQuantity, estimatedProfit };
  }, [products, movements]);

  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    products.forEach(p => {
      const current = categories.get(p.category) || 0;
      categories.set(p.category, current + (p.price * p.quantity));
    });
    return Array.from(categories, ([name, value]) => ({ name, value }));
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        value: p.price * p.quantity
      }));
  }, [products]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleAddNote = () => {
    if (!newNote.trim() || !user) return;
    addNote({ content: newNote, userId: user.id });
    setNewNote('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu estoque{user?.company ? ` • ${user.company}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              <p className="font-medium">Usuário</p>
              <p className="max-w-[180px] truncate text-foreground/90">{user?.name}</p>
            </div>
          </div>
        </div>

        <section
          aria-label="Atalhos rápidos"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 rounded-2xl border-border/80 bg-card/80 px-4 py-3 text-sm hover:bg-card hover:shadow-lg hover:shadow-primary/15"
            onClick={() => navigate('/products')}
          >
            <Package className="h-5 w-5 text-primary" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Adicionar produto</span>
              <span className="text-xs text-muted-foreground">
                Cadastre novos itens no estoque
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 rounded-2xl border-border/80 bg-card/80 px-4 py-3 text-sm hover:bg-card hover:shadow-lg hover:shadow-primary/15"
            onClick={() => navigate('/movements')}
          >
            <ArrowDownCircle className="h-5 w-5 text-success" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Registrar entrada</span>
              <span className="text-xs text-muted-foreground">
                Lançar novas entradas de produtos
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 rounded-2xl border-border/80 bg-card/80 px-4 py-3 text-sm hover:bg-card hover:shadow-lg hover:shadow-primary/15"
            onClick={() => navigate('/movements')}
          >
            <ArrowUpCircle className="h-5 w-5 text-destructive" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Registrar saída</span>
              <span className="text-xs text-muted-foreground">
                Controle as saídas do estoque
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 rounded-2xl border-border/80 bg-card/80 px-4 py-3 text-sm hover:bg-card hover:shadow-lg hover:shadow-primary/15"
            onClick={() => navigate('/reports')}
          >
            <FileText className="h-5 w-5 text-accent" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Gerar relatório</span>
              <span className="text-xs text-muted-foreground">
                Visualize PDFs profissionais
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 rounded-2xl border-border/80 bg-card/80 px-4 py-3 text-sm hover:bg-card hover:shadow-lg hover:shadow-primary/15"
            onClick={() => navigate('/movements')}
          >
            <SlidersHorizontal className="h-5 w-5 text-secondary" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Filtros avançados</span>
              <span className="text-xs text-muted-foreground">
                Explore movimentações por período
              </span>
            </div>
          </Button>
        </section>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-primary break-words">{stats.totalProducts}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quantidade de Saídas</CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-500 break-words">
                  {stats.exitsQuantity} un.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary break-words">
                  {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border-pink-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Valor de Entradas</CardTitle>
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-500 break-words">
                  {stats.entriesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500 break-words">
                  {stats.estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>
          </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top 5 Produtos por Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={350} minWidth={300}>
                  <BarChart data={topProducts}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--foreground))" 
                      style={{ fontSize: '13px', fontWeight: '500' }} 
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))" 
                      style={{ fontSize: '13px', fontWeight: '500' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor']}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorValue)" 
                      radius={[8, 8, 0, 0]}
                      label={{ 
                        position: 'top', 
                        formatter: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                        style: { fontSize: '12px', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Nenhum produto cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Valor por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350} minWidth={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => 
                        `${name}: ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      style={{ fontSize: '13px', fontWeight: '600' }}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor Total']}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Nenhuma categoria disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Notes */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Produtos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou categoria..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {search && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                  ) : (
                    filteredProducts.map(p => (
                      <div key={p.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{p.quantity} un.</p>
                            <p className="text-sm text-muted-foreground">
                              {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lembretes Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicionar novo lembrete..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddNote} size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum lembrete</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="p-3 border rounded-lg flex justify-between items-start">
                      <p className="text-sm flex-1">{note.content}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => deleteNote(note.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
