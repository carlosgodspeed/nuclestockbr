import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  FileText
} from 'lucide-react';
import './Index.css';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Gestão Completa',
      description: 'Controle total do seu estoque com cadastro de produtos e categorias.',
      color: 'feature-blue'
    },
    {
      icon: TrendingUp,
      title: 'Movimentações',
      description: 'Registre compras e vendas de produtos com histórico detalhado.',
      color: 'feature-pink'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Visualize estatísticas e gere relatórios em PDF com gráficos.',
      color: 'feature-purple'
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

  return (
    <div className="index-page">
      {/* Hero Section */}
      <div className="index-container">
        <div className="hero-section">
          <Badge className="hero-badge" variant="secondary">
            <Sparkles className="badge-icon" />
            Sistema Completo de Gestão
          </Badge>
          
          <h1 className="hero-title">
            <span className="hero-title-gradient">NucleStockBR</span>
            <br />
            <span className="hero-title-text">Gestão de Estoque Inteligente</span>
          </h1>
          
          <p className="hero-description">
            Controle seu estoque de forma <span className="text-highlight">simples</span>, 
            {' '}visualize relatórios em tempo real e gerencie produtos com eficiência. 
            Tudo em uma única plataforma.
          </p>
          
          <div className="hero-buttons">
            <Button 
              size="lg" 
              className="hero-button-primary"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Começar Agora
              <ArrowRight className="button-icon" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="hero-button-secondary"
              onClick={() => navigate('/auth?mode=login')}
            >
              Já tem conta? Entrar
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="feature-card"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardContent className="feature-card-content">
                  <div className={`feature-icon-wrapper ${feature.color}`}>
                    <Icon className="feature-icon" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Visual Showcase */}
        <div className="showcase-section">
          <div className="section-header">
            <h2 className="section-title">Veja o Sistema em Ação</h2>
            <p className="section-subtitle">
              Interface intuitiva e recursos poderosos ao seu alcance
            </p>
          </div>

          <div className="showcase-grid">
            {showcaseImages.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.title}
                  className="showcase-card"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="showcase-preview">
                    <div className="showcase-grid-overlay" />
                    <Icon className="showcase-icon" />
                    <div className="showcase-gradient" />
                  </div>
                  <CardContent className="showcase-content">
                    <h3 className="showcase-title">{item.title}</h3>
                    <p className="showcase-description">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <Card className="benefits-card">
            <CardContent className="benefits-content">
              <div className="benefits-grid">
                <div className="benefits-header">
                  <div className="benefits-title-wrapper">
                    <div className="benefits-icon-wrapper">
                      <Shield className="benefits-shield-icon" />
                    </div>
                    <h2 className="benefits-title">
                      Por que escolher nosso sistema?
                    </h2>
                  </div>
                  <p className="benefits-description">
                    Desenvolvido para facilitar sua rotina de gestão de estoque com 
                    tecnologia moderna e interface intuitiva.
                  </p>
                </div>

                <div className="benefits-list">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-item">
                      <CheckCircle2 className="benefit-check-icon" />
                      <span className="benefit-text">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="how-it-works-section">
          <div className="section-header">
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-subtitle">Comece em minutos, sem complicação</p>
          </div>

          <div className="steps-grid">
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
                <div key={step.step} className="step-wrapper">
                  {idx < 2 && <div className="step-connector" />}
                  <Card className="step-card">
                    <CardContent className="step-content">
                      <div className="step-number">{step.step}</div>
                      <Icon className="step-icon" />
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Final */}
        <div className="cta-section">
          <Card className="cta-card">
            <CardContent className="cta-content">
              <h2 className="cta-title">Pronto para começar?</h2>
              <p className="cta-description">
                Junte-se a milhares de usuários que já otimizaram sua gestão de estoque
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="cta-button"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Criar Conta Grátis
                <ArrowRight className="button-icon" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="index-footer">
        <div className="footer-content">
          <p className="footer-text">© 2024 NucleStockBR - Sistema de Gestão de Estoque. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
