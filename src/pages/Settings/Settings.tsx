import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import './Settings.css';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      await updateProfile({ imageUrl: publicUrl });
      
      toast({ title: 'Foto atualizada com sucesso!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: 'Erro ao fazer upload da foto', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, imageUrl });
    toast({ title: 'Perfil atualizado com sucesso!' });
  };

  return (
    <Layout>
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Configurações</h1>
          <p className="settings-subtitle">Gerencie suas informações pessoais</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="settings-form">
              <div className="avatar-section">
                <Avatar className="settings-avatar">
                  <AvatarImage src={imageUrl} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="upload-icon spinning" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Camera className="upload-icon" />
                      Alterar Foto
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-input"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="name">Nome da empresa</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit">Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="system-info">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Backend:</strong> Lovable Cloud</p>
            <p><strong>Banco de Dados:</strong> PostgreSQL</p>
            <p><strong>Armazenamento:</strong> Cloud Storage</p>
            <p className="system-description">
              Seus dados estão armazenados de forma segura na nuvem com backup automático. 
              Acesse de qualquer dispositivo com suas credenciais.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
