import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Moon, Sun, X, Image as ImageIcon } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [businessCategory, setBusinessCategory] = useState(user?.businessCategory || '');
  const [description, setDescription] = useState(user?.description || '');
  const [productImages, setProductImages] = useState<string[]>(user?.productImages || []);
  const [promotionalImage, setPromotionalImage] = useState(user?.promotionalImage || '');
  const [promotionalImageDays, setPromotionalImageDays] = useState(user?.promotionalImageDays || 7);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const promoImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const readFiles = Array.from(files).slice(0, 6 - productImages.length);
      
      readFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === readFiles.length) {
            setProductImages([...productImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromotionalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProductImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
      name, 
      email, 
      company, 
      imageUrl,
      businessCategory: businessCategory as any,
      description,
      productImages,
      promotionalImage,
      promotionalImageDays,
      promotionalImageCreatedAt: promotionalImage !== user?.promotionalImage ? new Date().toISOString() : user?.promotionalImageCreatedAt
    });
    toast({ title: 'Perfil atualizado com sucesso!' });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={imageUrl} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa (opcional)</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label>Função</Label>
                <Input 
                  value={
                    user?.role === 'admin' ? 'Administrador' : 
                    user?.role === 'supplier' ? 'Fornecedor' : 'Usuário'
                  } 
                  disabled 
                />
              </div>

              {user?.role === 'supplier' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria do Negócio</Label>
                    <Select value={businessCategory} onValueChange={setBusinessCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bebidas">Bebidas</SelectItem>
                        <SelectItem value="diversos">Diversos</SelectItem>
                        <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                        <SelectItem value="roupas">Roupas</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição da Empresa</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva sua empresa, produtos e serviços..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fotos de Produtos (máximo 6)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {productImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                          <img src={img} alt={`Produto ${idx + 1}`} className="w-full h-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeProductImage(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {productImages.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="aspect-square"
                          onClick={() => productImageInputRef.current?.click()}
                        >
                          <ImageIcon className="h-8 w-8" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagem Promocional</Label>
                    {promotionalImage ? (
                      <div className="relative">
                        <img src={promotionalImage} alt="Promoção" className="w-full h-48 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setPromotionalImage('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => promoImageInputRef.current?.click()}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Adicionar Imagem Promocional
                      </Button>
                    )}
                    <input
                      ref={promoImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePromoImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoDays">Duração da Promoção (dias)</Label>
                    <Input
                      id="promoDays"
                      type="number"
                      min="1"
                      max="30"
                      value={promotionalImageDays}
                      onChange={(e) => setPromotionalImageDays(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      A promoção ficará visível por {promotionalImageDays} dias
                    </p>
                  </div>
                </>
              )}

              <Button type="submit">Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro
                </p>
              </div>
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Armazenamento:</strong> LocalStorage (Navegador)</p>
            <p className="text-muted-foreground pt-4">
              Os dados estão armazenados localmente no seu navegador. 
              Para usar em múltiplos dispositivos, você pode migrar para Firebase no futuro.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
