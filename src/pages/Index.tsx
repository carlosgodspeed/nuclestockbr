import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, BarChart3, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Gestão Completa',
      description: 'Controle total do seu estoque com cadastro de produtos, categorias e fornecedores.',
    },
    {
      icon: TrendingUp,
      title: 'Movimentações',
      description: 'Registre entradas e saídas de produtos com histórico detalhado.',
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Visualize estatísticas e gere relatórios personalizados.',
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Sistema com autenticação segura e controle de usuários.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sistema de Gestão de Estoque
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Controle seu estoque de forma simples e eficiente. Cadastre produtos, 
            gerencie movimentações e visualize relatórios em tempo real.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Cadastrar-se
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <Icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
          <div className="max-w-3xl mx-auto grid gap-4 text-left">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">✅ Cadastro de Produtos</h3>
              <p className="text-sm text-muted-foreground">
                Nome, descrição, quantidade, categoria, preço, fornecedor e imagens.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">✅ Controle de Movimentações</h3>
              <p className="text-sm text-muted-foreground">
                Registre entradas e saídas com histórico completo e atualização automática.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">✅ Relatórios e Estatísticas</h3>
              <p className="text-sm text-muted-foreground">
                Visualize seu estoque com gráficos, pesquisa avançada e exportação de dados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
