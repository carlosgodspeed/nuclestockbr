import { useMemo, useState } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Package, TrendingUp, ShoppingCart, DollarSign, Search, Plus, X, BarChart3, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { products, movements, notes, addNote, deleteNote } = useStock();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState('');

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    // Lucro Mensal e indicadores do mês vigente
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthMovements = movements.filter(m => new Date(m.date) >= currentMonthStart);

    const purchasesValue = currentMonthMovements
      .filter(m => m.type === 'entry')
      .reduce((sum, m) => sum + (m.quantity * (m.price || 0)), 0);

    const salesQuantity = currentMonthMovements
      .filter(m => m.type === 'exit')
      .reduce((sum, m) => sum + m.quantity, 0);

    const monthlyProfit = currentMonthMovements
      .filter(m => m.type === 'exit')
      .reduce((sum, m) => {
        const product = products.find(p => p.id === m.productId);
        if (product && product.cost && product.price && product.cost > 0 && product.price > 0) {
          return sum + ((product.price - product.cost) * m.quantity);
        }
        return sum;
      }, 0);

    return { totalProducts, totalValue, purchasesValue, salesQuantity, monthlyProfit };
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
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu estoque</p>
          </div>

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
                <CardTitle className="text-sm font-medium">Quantidade de Vendas</CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-500 break-words">
                  {stats.salesQuantity} un.
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
                <CardTitle className="text-sm font-medium">Valor de Compras</CardTitle>
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-500 break-words">
                  {stats.purchasesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Lucro Mensal</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500 break-words">
                  {stats.monthlyProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                <div className="space-y-3">
                  {topProducts.map((product, index) => {
                    const maxValue = Math.max(...topProducts.map(p => p.value));
                    const percentage = (product.value / maxValue) * 100;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-28 truncate">{product.name}</span>
                        <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
                          <div 
                            className="h-full bg-primary rounded transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">
                            {product.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
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
                <div className="space-y-4">
                  {/* Legend at top */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Donut chart with percentages */}
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return percent > 0.05 ? (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
                                {`${(percent * 100).toFixed(1)}%`}
                              </text>
                            ) : null;
                          }}
                          outerRadius={90}
                          innerRadius={50}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: number, name: string) => [
                            value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
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
