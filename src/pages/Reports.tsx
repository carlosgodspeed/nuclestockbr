import { useState, useMemo, useRef } from 'react';
import { useStock } from '@/contexts/StockContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Package, FileText, ShoppingCart, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { products, movements } = useStock();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const cats = new Set(
      products
        .map(p => p.category)
        .filter(cat => cat && cat.trim() !== '')
    );
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredData = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    return filtered;
  }, [products, searchTerm, category]);

  const filteredMovements = useMemo(() => {
    let filtered = movements;

    if (startDate) {
      filtered = filtered.filter(m => new Date(m.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(m => new Date(m.date) <= new Date(endDate));
    }

    return filtered;
  }, [movements, startDate, endDate]);

  const [periodFilter, setPeriodFilter] = useState('30');

  const stats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const entriesValue = filteredMovements.filter(m => m.type === 'entry').reduce((sum, m) => sum + (m.quantity * (m.price || 0)), 0);
    const exitsQuantity = filteredMovements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    const estimatedProfit = filteredData.reduce((sum, p) => {
      if (p.cost && p.price && p.cost > 0 && p.price > 0) {
        return sum + ((p.price - p.cost) * p.quantity);
      }
      return sum;
    }, 0);

    return { totalValue, entriesValue, exitsQuantity, estimatedProfit };
  }, [filteredData, filteredMovements]);

  const categoryData = useMemo(() => {
    const categories = new Map<string, { count: number; value: number }>();
    filteredData.forEach(p => {
      const current = categories.get(p.category) || { count: 0, value: 0 };
      categories.set(p.category, {
        count: current.count + 1,
        value: current.value + (p.price * p.quantity)
      });
    });
    return Array.from(categories, ([name, data]) => ({ name, ...data }));
  }, [filteredData]);

  const stockLevelData = useMemo(() => {
    return filteredData.map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      quantidade: p.quantity,
      valor: p.price * p.quantity
    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);
  }, [filteredData]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const exportToPDF = async () => {
    setIsExporting(true);
    toast({ title: 'Gerando PDF...', description: 'Aguarde enquanto preparamos seu relatório' });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Título
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // primary color
      pdf.text('Relatório de Estoque', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Data do relatório
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Estatísticas
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Resumo Financeiro', 14, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Valor Total em Estoque: ${stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPosition);
      yPosition += 7;
      pdf.text(`Valor de Entradas: ${stats.entriesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPosition);
      yPosition += 7;
      pdf.text(`Quantidade de Saídas: ${stats.exitsQuantity} unidades`, 14, yPosition);
      yPosition += 7;
      pdf.text(`Lucro Estimado: ${stats.estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPosition);
      yPosition += 15;

      // Capturar gráfico de barras
      if (barChartRef.current && stockLevelData.length > 0) {
        const barCanvas = await html2canvas(barChartRef.current, { 
          backgroundColor: '#ffffff',
          scale: 2 
        });
        const barImgData = barCanvas.toDataURL('image/png');
        const barImgWidth = pageWidth - 28;
        const barImgHeight = (barCanvas.height * barImgWidth) / barCanvas.width;

        if (yPosition + barImgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Produtos com Maior Estoque', 14, yPosition);
        yPosition += 10;
        pdf.addImage(barImgData, 'PNG', 14, yPosition, barImgWidth, barImgHeight);
        yPosition += barImgHeight + 15;
      }

      // Capturar gráfico de pizza
      if (pieChartRef.current && categoryData.length > 0) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }

        const pieCanvas = await html2canvas(pieChartRef.current, { 
          backgroundColor: '#ffffff',
          scale: 2 
        });
        const pieImgData = pieCanvas.toDataURL('image/png');
        const pieImgWidth = pageWidth - 28;
        const pieImgHeight = (pieCanvas.height * pieImgWidth) / pieCanvas.width;

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Distribuição de Valor por Categoria', 14, yPosition);
        yPosition += 10;
        pdf.addImage(pieImgData, 'PNG', 14, yPosition, pieImgWidth, pieImgHeight);
        yPosition += pieImgHeight + 15;
      }

      // Tabela de produtos
      pdf.addPage();
      yPosition = 20;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Lista de Produtos', 14, yPosition);
      yPosition += 10;

      // Cabeçalho da tabela
      pdf.setFillColor(59, 130, 246);
      pdf.rect(14, yPosition, pageWidth - 28, 8, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Produto', 16, yPosition + 5);
      pdf.text('Categoria', 60, yPosition + 5);
      pdf.text('Qtd', 100, yPosition + 5);
      pdf.text('Preço', 120, yPosition + 5);
      pdf.text('Total', 150, yPosition + 5);
      pdf.text('Lucro Est.', 180, yPosition + 5);
      yPosition += 10;

      // Linhas da tabela
      pdf.setTextColor(0, 0, 0);
      filteredData.forEach((product, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(240, 240, 240);
          pdf.rect(14, yPosition - 2, pageWidth - 28, 7, 'F');
        }

        const estimatedProfit = product.cost && product.price && product.cost > 0 && product.price > 0
          ? (product.price - product.cost) * product.quantity
          : null;

        pdf.setFontSize(8);
        pdf.text(product.name.substring(0, 25), 16, yPosition + 3);
        pdf.text(product.category.substring(0, 15), 60, yPosition + 3);
        pdf.text(String(product.quantity), 100, yPosition + 3);
        pdf.text(product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 120, yPosition + 3);
        pdf.text((product.price * product.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 150, yPosition + 3);
        pdf.text(
          estimatedProfit !== null 
            ? estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : '—',
          180,
          yPosition + 3
        );
        yPosition += 7;
      });

      // Salvar PDF
      pdf.save(`relatorio_estoque_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: 'PDF exportado com sucesso!', description: 'Seu relatório foi baixado' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ 
        title: 'Erro ao gerar PDF', 
        description: 'Ocorreu um erro ao criar o relatório',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Visualize estatísticas e exporte dados</p>
          </div>
          
          <Button onClick={exportToPDF} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar Produto</Label>
                <Input
                  id="search"
                  placeholder="Nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Período Rápido</Label>
                <Select value={periodFilter} onValueChange={(value) => {
                  setPeriodFilter(value);
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - parseInt(value));
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">
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
              <p className="text-3xl font-bold text-pink-500">
                {stats.entriesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
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
              <p className="text-3xl font-bold text-yellow-500">
                {stats.exitsQuantity} un.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
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
                <Package className="h-5 w-5 text-primary" />
                Produtos com Maior Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={barChartRef}>
              {stockLevelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={stockLevelData} layout="vertical">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--foreground))" 
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={150} 
                      stroke="hsl(var(--foreground))" 
                      style={{ fontSize: '13px', fontWeight: '500' }}
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
                      formatter={(value: number, name: string) => {
                        if (name === 'quantidade') {
                          return [`${value} unidades`, 'Quantidade'];
                        }
                        return [value, name];
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="quantidade" 
                      fill="url(#barGradient)" 
                      radius={[0, 8, 8, 0]}
                      label={{ 
                        position: 'right',
                        formatter: (value: number) => `${value} un`,
                        style: { fontSize: '12px', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[380px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Distribuição de Valor por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={pieChartRef}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => 
                        `${name}: ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={110}
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
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[380px] flex items-center justify-center text-muted-foreground">
                  Nenhuma categoria disponível
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Categoria</th>
                    <th className="text-right p-2">Quantidade</th>
                    <th className="text-right p-2">Custo</th>
                    <th className="text-right p-2">Preço</th>
                    <th className="text-right p-2">Valor Total</th>
                    <th className="text-right p-2">Lucro Estimado</th>
                    <th className="text-left p-2">Fornecedor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(product => {
                    const estimatedProfit = product.cost && product.price && product.cost > 0 && product.price > 0
                      ? (product.price - product.cost) * product.quantity
                      : null;
                    
                    return (
                      <tr key={product.id} className="border-b">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="text-right p-2">{product.quantity}</td>
                        <td className="text-right p-2">
                          {product.cost && product.cost > 0
                            ? product.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                        <td className="text-right p-2">
                          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="text-right p-2">
                          {(product.price * product.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="text-right p-2">
                          {estimatedProfit !== null
                            ? estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                        <td className="p-2">{product.supplier}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
