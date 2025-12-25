import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowLeft, Package } from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

const SupplierProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { createConversation } = useChat();
  const [supplier, setSupplier] = useState<User | null>(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find((u: User) => u.id === id);
    setSupplier(found || null);
  }, [id]);

  const handleStartChat = () => {
    if (!supplier || !currentUser) return;
    const conversationId = createConversation(supplier.id);
    navigate(`/chat?conversation=${conversationId}`);
  };

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      bebidas: 'Bebidas',
      diversos: 'Diversos',
      eletronicos: 'Eletrônicos',
      roupas: 'Roupas',
      varejo: 'Varejo'
    };
    return category ? labels[category] || category : 'Não especificado';
  };

  if (!supplier) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Fornecedor não encontrado</p>
          <Button onClick={() => navigate('/chat')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Header com info principal */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24">
                <AvatarImage src={supplier.imageUrl} />
                <AvatarFallback className="text-2xl">{supplier.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{supplier.name}</h1>
                  {supplier.role === 'supplier' && (
                    <Badge variant="secondary">Fornecedor</Badge>
                  )}
                </div>
                
                {supplier.company && (
                  <p className="text-xl text-muted-foreground mb-2">{supplier.company}</p>
                )}
                
                {supplier.businessCategory && (
                  <Badge variant="outline" className="mb-4">
                    {getCategoryLabel(supplier.businessCategory)}
                  </Badge>
                )}
                
                {supplier.description && (
                  <p className="text-muted-foreground mt-4">{supplier.description}</p>
                )}
              </div>
              
              {currentUser?.id !== supplier.id && (
                <Button onClick={handleStartChat} size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Imagem Promocional */}
        {supplier.promotionalImage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Promoção em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={supplier.promotionalImage} 
                alt="Promoção" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Galeria de Produtos */}
        {supplier.productImages && supplier.productImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {supplier.productImages.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                    <img 
                      src={img} 
                      alt={`Produto ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SupplierProfile;
