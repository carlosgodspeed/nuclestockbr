import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  TrendingUp,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: Package,
      title: 'Controle de Estoque',
      description: 'Acompanhe níveis, categorias e movimentações em tempo real.',
      color: 'from-primary to-primary/70',
    },
    {
      icon: TrendingUp,
      title: 'Movimentações Inteligentes',
      description: 'Registre entradas e saídas com histórico completo e filtros.',
      color: 'from-secondary to-secondary/70',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Profissionais',
      description: 'Gere PDFs claros para decisões rápidas e seguras.',
      color: 'from-accent to-accent/70',
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
    'Gráficos interativos e visuais',
    'Relatórios em PDF',
    'Histórico completo de movimentações',
    'Interface moderna e responsiva',
    'Controle total de estoque',
    'Categorização personalizada',
    'Exportação de dados'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const success = await signup(name, email, password);
        if (success) {
          toast({ title: 'Conta criada com sucesso!' });
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            navigate('/dashboard');
          }
        } else {
          toast({
            title: 'Erro',
            description: 'Email já cadastrado',
            variant: 'destructive',
          });
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate('/dashboard');
        } else {
          toast({
            title: 'Erro',
            description: 'Email ou senha incorretos',
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-6 animate-fade-in">
            <Badge className="mb-2 inline-flex items-center px-4 py-1.5" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" />
              Sistema completo de gestão de estoque
            </Badge>

            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Nuclestock
              </span>
              <br />
              <span className="text-foreground">Gestão de estoque inteligente</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Centralize o controle de produtos, movimentações e relatórios em uma única
              plataforma, pensada para pequenos e médios negócios.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="w-full rounded-full px-8 py-5 text-base sm:w-auto hover:shadow-lg hover:shadow-primary/30"
                onClick={() => setMode('signup')}
              >
                Criar conta grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full px-8 py-5 text-base sm:w-auto border-primary/40 bg-background/60 hover:bg-card hover:text-primary"
                onClick={() => setMode('login')}
              >
                Já uso o Nuclestock
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="border-border/60 bg-card/80 backdrop-blur hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300"
                  >
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div
                        className={`mx-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}
                      >
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="relative w-full max-w-md justify-self-center border-border/70 bg-gradient-to-br from-card to-background/60 shadow-xl shadow-black/40">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Entre para acompanhar seu estoque em tempo real.'
                  : 'Leva menos de 1 minuto para começar a controlar seu estoque.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da empresa</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

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
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                </Button>
              </form>

              <div className="mt-4 text-center text-xs text-muted-foreground">
                {mode === 'login' ? (
                  <p>
                    Não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-medium text-primary hover:underline"
                    >
                      Cadastre-se
                    </button>
                  </p>
                ) : (
                  <p>
                    Já tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-primary hover:underline"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-20 px-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-3 sm:mb-4 mx-auto sm:mx-0`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors text-center sm:text-left">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Visual Showcase */}
        <div className="mb-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Veja o Sistema em Ação
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Interface intuitiva e recursos poderosos ao seu alcance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
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
        <div className="mb-20 px-4">
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-card to-primary/5 border-2">
            <CardContent className="p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary flex-shrink-0">
                      <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
                      Por que escolher nosso sistema?
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-base sm:text-lg mb-6 text-center sm:text-left">
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
        <div className="mb-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Comece em minutos, sem complicação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
        <div className="text-center px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-6 sm:p-8 md:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-8 text-primary-foreground/90">
                Junte-se a milhares de usuários que já otimizaram sua gestão de estoque
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">© 2024 NucleStockBR - Sistema de Gestão de Estoque. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
