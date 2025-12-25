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
import './Dashboard.css';

const Dashboard = () => {
  const { products, movements, notes, addNote, deleteNote } = useStock();
  const { user } = useAuth();
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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Visão geral do seu estoque</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid-2">
          <Card className="stat-card stat-card-primary">
            <CardHeader className="stat-card-header">
              <CardTitle className="stat-card-title">Total de Produtos</CardTitle>
              <div className="stat-icon-wrapper stat-icon-primary">
                <Package className="stat-icon" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="stat-value stat-value-primary">{stats.totalProducts}</p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-yellow">
            <CardHeader className="stat-card-header">
              <CardTitle className="stat-card-title">Quantidade de Saídas</CardTitle>
              <div className="stat-icon-wrapper stat-icon-yellow">
                <ShoppingCart className="stat-icon" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="stat-value stat-value-yellow">{stats.exitsQuantity} un.</p>
            </CardContent>
          </Card>
        </div>

        <div className="stats-grid-3">
          <Card className="stat-card stat-card-secondary">
            <CardHeader className="stat-card-header">
              <CardTitle className="stat-card-title">Valor Total</CardTitle>
              <div className="stat-icon-wrapper stat-icon-secondary">
                <DollarSign className="stat-icon" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="stat-value stat-value-secondary">
                {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-pink">
            <CardHeader className="stat-card-header">
              <CardTitle className="stat-card-title">Valor de Entradas</CardTitle>
              <div className="stat-icon-wrapper stat-icon-pink">
                <TrendingUp className="stat-icon" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="stat-value stat-value-pink">
                {stats.entriesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-green">
            <CardHeader className="stat-card-header">
              <CardTitle className="stat-card-title">Lucro Estimado</CardTitle>
              <div className="stat-icon-wrapper stat-icon-green">
                <TrendingDown className="stat-icon" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="stat-value stat-value-green">
                {stats.estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <Card>
            <CardHeader>
              <CardTitle className="chart-title">
                <BarChart3 className="chart-title-icon chart-title-icon-primary" />
                Top 5 Produtos por Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return `${value}`;
                      }}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        fontSize: '13px'
                      }}
                      formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor']}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorValue)" 
                      radius={[0, 6, 6, 0]}
                      maxBarSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">Nenhum produto cadastrado</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="chart-title">
                <Package className="chart-title-icon chart-title-icon-accent" />
                Valor por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={75}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={3}
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
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        fontSize: '13px'
                      }}
                      formatter={(value: number, name: string) => [
                        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
                        name
                      ]}
                    />
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                      formatter={(value) => {
                        const item = categoryData.find(c => c.name === value);
                        if (item) {
                          return `${value}: ${item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                        }
                        return value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">Nenhuma categoria disponível</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Notes */}
        <div className="bottom-grid">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Produtos</CardTitle>
            </CardHeader>
            <CardContent className="search-content">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <Input
                  placeholder="Buscar por nome ou categoria..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              
              {search && (
                <div className="search-results">
                  {filteredProducts.length === 0 ? (
                    <p className="no-results">Nenhum produto encontrado</p>
                  ) : (
                    filteredProducts.map(p => (
                      <div key={p.id} className="search-result-item">
                        <div className="result-info">
                          <p className="result-name">{p.name}</p>
                          <p className="result-category">{p.category}</p>
                        </div>
                        <div className="result-details">
                          <p className="result-quantity">{p.quantity} un.</p>
                          <p className="result-price">
                            {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
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
            <CardContent className="notes-content">
              <div className="note-input-wrapper">
                <Textarea
                  placeholder="Adicionar novo lembrete..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="note-textarea"
                />
                <Button onClick={handleAddNote} size="icon" className="note-add-button">
                  <Plus className="note-add-icon" />
                </Button>
              </div>

              <div className="notes-list">
                {notes.length === 0 ? (
                  <p className="no-notes">Nenhum lembrete</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="note-item">
                      <p className="note-content">{note.content}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="note-delete-button"
                        onClick={() => deleteNote(note.id)}
                      >
                        <X className="note-delete-icon" />
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
