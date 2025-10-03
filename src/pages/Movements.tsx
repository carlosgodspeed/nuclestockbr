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
import { Plus, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Movements = () => {
  const { products, movements, addMovement } = useStock();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entry' as 'entry' | 'exit',
    quantity: 0,
    supplier: '',
    customer: '',
    reason: '',
  });

  const chartData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subMonths(new Date(), 1),
      end: new Date()
    });

    return last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMovements = movements.filter(m => 
        format(new Date(m.date), 'yyyy-MM-dd') === dateStr
      );
      
      const entries = dayMovements
        .filter(m => m.type === 'entry')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const exits = dayMovements
        .filter(m => m.type === 'exit')
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        date: format(date, 'dd/MM'),
        entradas: entries,
        saídas: exits
      };
    });
  }, [movements]);

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
      date: new Date().toISOString(),
      supplier: formData.supplier,
      customer: formData.customer,
      reason: formData.reason,
      userId: user.id,
      userName: user.name,
    });

    toast({ 
      title: 'Movimentação registrada com sucesso!',
      description: `${formData.type === 'entry' ? 'Entrada' : 'Saída'} de ${formData.quantity} unidades`
    });
    
    setOpen(false);
    setFormData({
      productId: '',
      type: 'entry',
      quantity: 0,
      supplier: '',
      customer: '',
      reason: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Movimentações</h1>
            <p className="text-muted-foreground">Registre entradas e saídas de produtos</p>
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
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'entry' | 'exit') => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entrada</SelectItem>
                      <SelectItem value="exit">Saída</SelectItem>
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
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                )}

                {formData.type === 'exit' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="customer">Cliente</Label>
                      <Input
                        id="customer"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo</Label>
                      <Input
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>
                  </>
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

        {/* Chart */}
        {movements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Movimentações nos Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="entradas" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saídas" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {movements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma movimentação registrada</p>
              <p className="text-sm text-muted-foreground">
                Registre entradas e saídas de produtos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...movements].reverse().map((movement) => (
              <Card key={movement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {movement.type === 'entry' ? (
                        <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 mt-1" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{movement.productName}</h3>
                          <Badge variant={movement.type === 'entry' ? 'default' : 'destructive'}>
                            {movement.type === 'entry' ? 'Entrada' : 'Saída'}
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
                          
                          {movement.customer && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Cliente:</span>
                              <span>{movement.customer}</span>
                            </div>
                          )}
                          
                          {movement.reason && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Motivo:</span>
                              <span>{movement.reason}</span>
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
