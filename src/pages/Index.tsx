import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  MessageSquare,
  Settings,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  Eye
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Gestão Completa',
      description: 'Controle total do seu estoque com cadastro de produtos, categorias e fornecedores.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Movimentações',
      description: 'Registre entradas e saídas de produtos com histórico detalhado.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Visualize estatísticas e gere relatórios em PDF com gráficos.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: MessageSquare,
      title: 'Chat com Fornecedores',
      description: 'Comunique-se diretamente com seus fornecedores pelo sistema.',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const showcaseImages = [
    {
      title: 'Dashboard Interativo',
      description: 'Visão geral com gráficos e estatísticas em tempo real',
      icon: BarChart3,
      preview: '/placeholder.svg'
    },
    {
      title: 'Gestão de Produtos',
      description: 'Organize produtos por categorias com busca avançada',
      icon: Package,
      preview: '/placeholder.svg'
    },
    {
      title: 'Relatórios Detalhados',
      description: 'Exporte relatórios com gráficos e dados completos',
      icon: FileText,
      preview: '/placeholder.svg'
    },
  ];

  const benefits = [
    'Cadastro ilimitado de produtos',
    'Múltiplos usuários e fornecedores',
    'Gráficos interativos e visuais',
    'Sistema de chat integrado',
    'Modo escuro e claro',
    'Relatórios em PDF',
    'Histórico completo de movimentações',
    'Interface moderna e responsiva'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <Badge className="mb-4 px-4 py-1.5" variant="secondary">
            <Sparkles className="h-3 w-3 mr-2" />
            Sistema Completo de Gestão
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Gestão de Estoque
            </span>
            <br />
            <span className="text-foreground">Inteligente e Moderna</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Controle seu estoque de forma <span className="text-primary font-semibold">simples</span>, 
            {' '}comunique-se com fornecedores e visualize relatórios em tempo real. 
            Tudo em uma única plataforma.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 hover-scale"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              <Eye className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Visual Showcase */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Veja o Sistema em Ação
            </h2>
            <p className="text-xl text-muted-foreground">
              Interface intuitiva e recursos poderosos ao seu alcance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {showcaseImages.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.title}
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <Icon className="h-20 w-20 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-card to-primary/5 border-2">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary">
                      <Shield className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      Por que escolher nosso sistema?
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Desenvolvido para facilitar sua rotina de gestão de estoque com 
                    tecnologia moderna e interface intuitiva.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground">
              Comece em minutos, sem complicação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Cadastre-se',
                description: 'Crie sua conta gratuitamente e configure seu perfil',
                icon: Users
              },
              {
                step: '2',
                title: 'Adicione Produtos',
                description: 'Cadastre produtos, categorias e fornecedores',
                icon: Package
              },
              {
                step: '3',
                title: 'Gerencie e Analise',
                description: 'Controle movimentações e visualize relatórios',
                icon: BarChart3
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  )}
                  <Card className="relative z-10 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                        {step.step}
                      </div>
                      <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Junte-se a milhares de usuários que já otimizaram sua gestão de estoque
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 Sistema de Gestão de Estoque. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
