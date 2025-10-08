import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import { differenceInDays } from 'date-fns';

const PromotionsWidget = () => {
  const navigate = useNavigate();
  const [activePromotions, setActivePromotions] = useState<User[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const promos = users.filter((user: User) => {
      if (!user.promotionalImage || !user.promotionalImageCreatedAt) return false;
      
      const daysSinceCreated = differenceInDays(
        new Date(),
        new Date(user.promotionalImageCreatedAt)
      );
      
      return daysSinceCreated <= (user.promotionalImageDays || 7);
    });

    setActivePromotions(promos);
  }, []);

  useEffect(() => {
    if (activePromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % activePromotions.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, [activePromotions.length]);

  if (activePromotions.length === 0) return null;

  const currentPromo = activePromotions[currentPromoIndex];

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20"
      onClick={() => navigate(`/supplier/${currentPromo.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Promoção em Destaque
          <ExternalLink className="h-3 w-3 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={currentPromo.promotionalImage}
            alt="Promoção"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white font-bold text-sm">{currentPromo.company || currentPromo.name}</p>
          </div>
        </div>
        
        {activePromotions.length > 1 && (
          <div className="flex gap-1 justify-center">
            {activePromotions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentPromoIndex 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Clique para ver mais detalhes
        </p>
      </CardContent>
    </Card>
  );
};

export default PromotionsWidget;
