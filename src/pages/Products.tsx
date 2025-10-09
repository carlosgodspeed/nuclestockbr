import { useState, useMemo } from 'react';
import { useStock } from '@/contexts/StockContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, Smartphone, Shirt, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { value: 'Eletrônicos', label: 'Eletrônicos', icon: Smartphone },
  { value: 'Roupas', label: 'Roupas', icon: Shirt },
  { value: 'Utensílios', label: 'Utensílios', icon: Utensils },
];

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStock();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    category: '',
    price: 0,
    supplier: '',
    imageUrl: '',
  });

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const productsByCategory = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      products: products.filter(p => p.category === cat.value),
      count: products.filter(p => p.category === cat.value).length
    }));
  }, [products]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: 0,
      category: '',
      price: 0,
      supplier: '',
      imageUrl: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateProduct(editingId, formData);
      toast({ title: 'Produto atualizado com sucesso!' });
    } else {
      addProduct(formData);
      toast({ title: 'Produto cadastrado com sucesso!' });
    }
    
    setOpen(false);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        category: product.category,
        price: product.price,
        supplier: product.supplier,
        imageUrl: product.imageUrl || '',
      });
      setEditingId(id);
      setOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      deleteProduct(id);
      toast({ title: 'Produto excluído com sucesso!' });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum produto cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Comece cadastrando seu primeiro produto
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all" className="gap-2">
                <Package className="h-4 w-4" />
                Todos ({products.length})
              </TabsTrigger>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = products.filter(p => p.category === cat.value).length;
                return (
                  <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </TabsContent>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                {products.filter(p => p.category === cat.value).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <cat.icon className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Nenhum produto em {cat.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Cadastre produtos nesta categoria
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.filter(p => p.category === cat.value).map((product) => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

const ProductCard = ({ product, onEdit, onDelete }: { 
  product: any; 
  onEdit: (id: string) => void; 
  onDelete: (id: string) => void;
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      
      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
      
      {product.description && (
        <p className="text-sm mb-3 line-clamp-2">{product.description}</p>
      )}
      
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Quantidade:</span>
          <span className="font-medium">{product.quantity} un.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Preço:</span>
          <span className="font-medium">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        {product.supplier && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fornecedor:</span>
            <span className="font-medium">{product.supplier}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(product.id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default Products;
