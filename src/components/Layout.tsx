import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Produtos', path: '/products' },
    { icon: TrendingUp, label: 'Movimentações', path: '/movements' },
    { icon: FileText, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            {user?.company && (
              <p className="text-xs text-muted-foreground">{user.company}</p>
            )}
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-2"
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border/70 bg-card/70 hover:bg-card hover:shadow-lg hover:shadow-primary/20"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 sm:w-80">
                <NavContent />
              </SheetContent>
            </Sheet>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-[0.25em] text-primary/80 uppercase">
                Nuclestock
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Gestão de estoque inteligente
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Olá, {user?.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border/70 bg-card/60 hover:bg-card hover:shadow-lg hover:shadow-primary/20"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pt-20">
        <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
