import { useState, useMemo } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, TrendingUp, ShoppingCart, ArrowUpDown, Calendar, ChevronDown, Phone, Mail, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Movements = () => {
  const { products, movements, addMovement } = useStock();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entry' as 'entry' | 'exit',
    quantity: 0,
    supplier: '',
    supplierPhone: '',
    supplierEmail: '',
    supplierNotes: '',
    customer: '',
    customerPhone: '',
    customerEmail: '',
    customerNotes: '',
  });

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(cat => cat && cat.trim() !== ''));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredMovements = useMemo(() => {
    let filtered = movements;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => {
        const product = products.find(p => p.id === m.productId);
        return product?.category === categoryFilter;
      });
    }
    
    return filtered;
  }, [movements, categoryFilter, products]);

  const chartData = useMemo(() => {
    const days = parseInt(periodFilter);
    const period = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return period.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMovements = filteredMovements.filter(m => 
        format(new Date(m.date), 'yyyy-MM-dd') === dateStr
      );
      
      const entries = dayMovements
        .filter(m => m.type === 'entry')
        .reduce((sum, m) => sum + (m.quantity * (m.price || 0)), 0);
      
      const exits = dayMovements
        .filter(m => m.type === 'exit')
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        date: format(date, 'dd/MM'),
        compras: entries,
        vendas: exits
      };
    });
  }, [filteredMovements, periodFilter]);

  const categoryChartData = useMemo(() => {
    const categoryStats = new Map<string, { compras: number; vendas: number }>();
    
    filteredMovements.forEach(m => {
      const product = products.find(p => p.id === m.productId);
      if (!product) return;
      
      const current = categoryStats.get(product.category) || { compras: 0, vendas: 0 };
      
      if (m.type === 'entry') {
        current.compras += m.quantity * (m.price || 0);
      } else {
        current.vendas += m.quantity;
      }
      
      categoryStats.set(product.category, current);
    });
    
    return Array.from(categoryStats, ([name, data]) => ({ name, ...data }));
  }, [filteredMovements, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product || !user) return;

    if (formData.type === 'exit' && formData.quantity > product.quantity) {
      toast({ 
        title: 'Erro', 
        description: 'Quantidade indisponível em estoque',
        variant: 'destructive' 
      });
      return;
    }

    addMovement({
      productId: formData.productId,
      productName: product.name,
      type: formData.type,
      quantity: formData.quantity,
      price: product.price,
      date: new Date().toISOString(),
      supplier: formData.supplier,
      supplierPhone: formData.supplierPhone,
      supplierEmail: formData.supplierEmail,
      supplierNotes: formData.supplierNotes,
      customer: formData.customer,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerNotes: formData.customerNotes,
      userId: user.id,
      userName: user.name,
    });

    toast({
      title: 'Movimentação registrada com sucesso!',
      description: `${formData.type === 'entry' ? 'Compra' : 'Venda'} de ${formData.quantity} unidades`
    });
    
    setOpen(false);
    setShowExtraFields(false);
    setFormData({
      productId: '',
      type: 'entry',
      quantity: 0,
      supplier: '',
      supplierPhone: '',
      supplierEmail: '',
      supplierNotes: '',
      customer: '',
      customerPhone: '',
      customerEmail: '',
      customerNotes: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Movimentações</h1>
            <p className="text-muted-foreground">Registre compras e vendas de produtos</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Estoque: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Movimentação *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'entry' | 'exit') => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Compra (adiciona ao estoque)</SelectItem>
                      <SelectItem value="exit">Venda (retira do estoque)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
                  />
                </div>

                {formData.type === 'entry' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Fornecedor</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Nome do fornecedor"
                      />
                    </div>

                    <Collapsible open={showExtraFields} onOpenChange={setShowExtraFields}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="w-full justify-between">
                          Dados adicionais do fornecedor
                          <ChevronDown className={`h-4 w-4 transition-transform ${showExtraFields ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="supplierPhone">Telefone</Label>
                          <Input
                            id="supplierPhone"
                            value={formData.supplierPhone}
                            onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplierEmail">Email</Label>
                          <Input
                            id="supplierEmail"
                            type="email"
                            value={formData.supplierEmail}
                            onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplierNotes">Observações</Label>
                          <Input
                            id="supplierNotes"
                            value={formData.supplierNotes}
                            onChange={(e) => setFormData({ ...formData, supplierNotes: e.target.value })}
                            placeholder="Informações adicionais"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {formData.type === 'exit' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Cliente</Label>
                      <Input
                        id="customer"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="Nome do cliente"
                      />
                    </div>

                    <Collapsible open={showExtraFields} onOpenChange={setShowExtraFields}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="w-full justify-between">
                          Dados adicionais do cliente
                          <ChevronDown className={`h-4 w-4 transition-transform ${showExtraFields ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone">Telefone</Label>
                          <Input
                            id="customerPhone"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail">Email</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerNotes">Observações</Label>
                          <Input
                            id="customerNotes"
                            value={formData.customerNotes}
                            onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                            placeholder="Informações adicionais"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        {movements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
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
                
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {movements.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                  Movimentações no Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350} minWidth={300}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground))" 
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <YAxis 
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
                        if (name === 'compras') {
                          return [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Compras (R$)'];
                        }
                        return [`${value} un.`, 'Vendas (Quantidade)'];
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compras"
                      name="Compras (R$)"
                      stroke="rgb(236, 72, 153)"
                      strokeWidth={3}
                      dot={{ fill: 'rgb(236, 72, 153)', r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      label={{
                        position: 'top',
                        formatter: (value: number) => value > 0 ? `R$ ${(value / 1000).toFixed(1)}k` : '',
                        style: { fontSize: '11px', fontWeight: 'bold', fill: 'rgb(236, 72, 153)' }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vendas"
                      name="Vendas (un.)"
                      stroke="rgb(234, 179, 8)"
                      strokeWidth={3}
                      dot={{ fill: 'rgb(234, 179, 8)', r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      label={{
                        position: 'bottom',
                        formatter: (value: number) => value > 0 ? `${value} un` : '',
                        style: { fontSize: '11px', fontWeight: 'bold', fill: 'rgb(234, 179, 8)' }
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Movimentações por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350} minWidth={300}>
                  <BarChart data={categoryChartData}>
                    <defs>
                      <linearGradient id="pinkBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="yellowBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity={0.4}/>
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
                        if (name === 'compras') {
                          return [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Compras (R$)'];
                        }
                        return [`${value} un.`, 'Vendas (Quantidade)'];
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <Bar
                      dataKey="compras"
                      name="Compras (R$)"
                      fill="url(#pinkBar)"
                      radius={[8, 8, 0, 0]}
                      label={{
                        position: 'top',
                        formatter: (value: number) => value > 0 ? `R$ ${(value / 1000).toFixed(1)}k` : '',
                        style: { fontSize: '11px', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <Bar
                      dataKey="vendas"
                      name="Vendas (un.)"
                      fill="url(#yellowBar)"
                      radius={[8, 8, 0, 0]}
                      label={{
                        position: 'top',
                        formatter: (value: number) => value > 0 ? `${value} un` : '',
                        style: { fontSize: '11px', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {movements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma movimentação registrada</p>
              <p className="text-sm text-muted-foreground">
                Registre compras e vendas de produtos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...filteredMovements].reverse().map((movement) => (
              <Card key={movement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {movement.type === 'entry' ? (
                        <TrendingUp className="h-5 w-5 text-pink-500 mt-1" />
                      ) : (
                        <ShoppingCart className="h-5 w-5 text-yellow-500 mt-1" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{movement.productName}</h3>
                          <Badge variant={movement.type === 'entry' ? 'default' : 'destructive'}>
                            {movement.type === 'entry' ? 'Compra' : 'Venda'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(movement.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        
                        <div className="grid gap-1 text-sm">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Quantidade:</span>
                            <span className="font-medium">{movement.quantity} un.</span>
                          </div>

                          {movement.supplier && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Fornecedor:</span>
                              <span>{movement.supplier}</span>
                            </div>
                          )}

                          {movement.supplierPhone && (
                            <div className="flex gap-2 items-center">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.supplierPhone}</span>
                            </div>
                          )}

                          {movement.supplierEmail && (
                            <div className="flex gap-2 items-center">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.supplierEmail}</span>
                            </div>
                          )}

                          {movement.supplierNotes && (
                            <div className="flex gap-2 items-center">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.supplierNotes}</span>
                            </div>
                          )}

                          {movement.customer && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Cliente:</span>
                              <span>{movement.customer}</span>
                            </div>
                          )}

                          {movement.customerPhone && (
                            <div className="flex gap-2 items-center">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.customerPhone}</span>
                            </div>
                          )}

                          {movement.customerEmail && (
                            <div className="flex gap-2 items-center">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.customerEmail}</span>
                            </div>
                          )}

                          {movement.customerNotes && (
                            <div className="flex gap-2 items-center">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span>{movement.customerNotes}</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Registrado por:</span>
                            <span>{movement.userName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movements;
