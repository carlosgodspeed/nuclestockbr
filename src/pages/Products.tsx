import { useState, useMemo } from 'react';
import { useStock } from '@/contexts/StockContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStock();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('productCategories');
    return saved ? JSON.parse(saved) : ['Eletrônicos', 'Roupas', 'Utensílios'];
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    category: '',
    price: 0,
    cost: 0,
    supplier: '',
    imageUrl: '',
  });

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const productsByCategory = useMemo(() => {
    return categories.map(cat => ({
      value: cat,
      label: cat,
      products: products.filter(p => p.category === cat),
      count: products.filter(p => p.category === cat).length
    }));
  }, [products, categories]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      toast({ title: 'Categoria já existe!', variant: 'destructive' });
      return;
    }
    const updated = [...categories, newCategoryName.trim()];
    setCategories(updated);
    localStorage.setItem('productCategories', JSON.stringify(updated));
    setNewCategoryName('');
    toast({ title: 'Categoria adicionada!' });
  };

  const removeCategory = (categoryName: string) => {
    const hasProducts = products.some(p => p.category === categoryName);
    if (hasProducts) {
      toast({ 
        title: 'Não é possível remover!', 
        description: 'Esta categoria possui produtos cadastrados.',
        variant: 'destructive' 
      });
      return;
    }
    
    if (confirm(`Deseja realmente excluir a categoria "${categoryName}"?`)) {
      const updated = categories.filter(cat => cat !== categoryName);
      setCategories(updated);
      localStorage.setItem('productCategories', JSON.stringify(updated));
      toast({ title: 'Categoria removida!' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: 0,
      category: '',
      price: 0,
      cost: 0,
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
        cost: product.cost || 0,
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
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova categoria..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCategory();
                          }
                        }}
                      />
                      <Button type="button" onClick={addCategory} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((cat) => (
                        <div key={cat} className="relative group">
                          <Button
                            type="button"
                            variant={formData.category === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className="pr-8"
                          >
                            {cat}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCategory(cat);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
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

                <div className="grid gap-4 md:grid-cols-2">
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
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Custo de Compra</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço de Venda *</Label>
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
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full mb-6">
                <TabsTrigger value="all" className="gap-2">
                  <Package className="h-4 w-4" />
                  Todos ({products.length})
                </TabsTrigger>
                {categories.map((cat) => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <TabsTrigger key={cat} value={cat} className="gap-2 whitespace-nowrap">
                      {cat} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

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

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                {products.filter(p => p.category === cat).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Package className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Nenhum produto em {cat}</p>
                      <p className="text-sm text-muted-foreground">
                        Cadastre produtos nesta categoria
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.filter(p => p.category === cat).map((product) => (
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
          <span className="text-muted-foreground">Custo:</span>
          <span className="font-medium">
            {product.cost && product.cost > 0
              ? product.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Preço:</span>
          <span className="font-medium">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Lucro Est.:</span>
          <span className="font-medium text-green-600">
            {product.cost && product.price && product.cost > 0 && product.price > 0
              ? ((product.price - product.cost) * product.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '—'}
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
