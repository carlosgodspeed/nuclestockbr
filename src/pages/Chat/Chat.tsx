import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Plus, Search, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    conversations, 
    sendMessage, 
    createConversation, 
    getConversationMessages,
    markAsRead,
    getSuppliers
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('conversation')
  );
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allSuppliers = getSuppliers();
  
  const filteredSuppliers = allSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.businessCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const currentMessages = selectedConversation 
    ? getConversationMessages(selectedConversation) 
    : [];

  useEffect(() => {
    if (selectedConversation) {
      markAsRead(selectedConversation);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, currentMessages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessage(selectedConversation, newMessage);
    setNewMessage('');
  };

  const handleNewConversation = (supplierId: string) => {
    const conversationId = createConversation(supplierId);
    setSelectedConversation(conversationId);
    setShowNewChat(false);
  };

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      bebidas: 'Bebidas',
      diversos: 'Diversos',
      eletronicos: 'Eletrônicos',
      roupas: 'Roupas',
      varejo: 'Varejo'
    };
    return category ? labels[category] : '';
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);
  const otherParticipantId = selectedConvData?.participantIds.find(
    id => id !== user?.id
  );
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const otherParticipant = users.find((u: any) => u.id === otherParticipantId);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chat</h1>
            <p className="text-muted-foreground">Comunique-se com fornecedores</p>
          </div>
          
          <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conversa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[600px]">
              <DialogHeader>
                <DialogTitle>Pesquisar Fornecedores</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Buscar por nome</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome ou empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="bebidas">Bebidas</SelectItem>
                        <SelectItem value="diversos">Diversos</SelectItem>
                        <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                        <SelectItem value="roupas">Roupas</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredSuppliers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum fornecedor encontrado.
                      </p>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="hover:bg-accent/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={supplier.imageUrl} />
                                  <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{supplier.name}</p>
                                  {supplier.company && (
                                    <p className="text-sm text-muted-foreground">{supplier.company}</p>
                                  )}
                                  {supplier.businessCategory && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {getCategoryLabel(supplier.businessCategory)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/supplier/${supplier.id}`)}
                                >
                                  <UserIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleNewConversation(supplier.id)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">
                    Nenhuma conversa ainda. Inicie uma nova!
                  </p>
                ) : (
                  conversations.map((conv) => {
                     const otherId = conv.participantIds.find(id => id !== user?.id);
                     const otherUser = users.find((u: any) => u.id === otherId);
                     const hasUnread = conv.unreadCount > 0;
                     return (
                       <Button
                         key={conv.id}
                         variant={selectedConversation === conv.id ? 'secondary' : 'ghost'}
                         className="w-full justify-start p-4 h-auto relative"
                         onClick={() => setSelectedConversation(conv.id)}
                       >
                         <div className="relative">
                           <Avatar className="mr-2 h-10 w-10">
                             <AvatarImage src={otherUser?.imageUrl} />
                             <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
                           </Avatar>
                           {hasUnread && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
                           )}
                         </div>
                         <div className="flex-1 text-left">
                           <div className="flex items-center justify-between">
                             <p className="font-medium">{otherUser?.name || 'Usuário'}</p>
                             {hasUnread && (
                               <Badge variant="destructive" className="ml-2">
                                 {conv.unreadCount}
                               </Badge>
                             )}
                           </div>
                           {conv.lastMessage && (
                             <p className="text-xs text-muted-foreground truncate">
                               {conv.lastMessage}
                             </p>
                           )}
                         </div>
                       </Button>
                     );
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedConversation && otherParticipant ? (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherParticipant.imageUrl} />
                      <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {otherParticipant.name}
                  </>
                ) : (
                  'Selecione uma conversa'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {selectedConversation ? (
                <>
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    {currentMessages.map((message, idx) => {
                      const isOwn = message.senderId === user?.id;
                      const messageDate = new Date(message.createdAt);
                      const showDate = idx === 0 || 
                        !isSameDay(messageDate, new Date(currentMessages[idx - 1].createdAt));
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <Badge variant="outline" className="text-xs">
                                {format(messageDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </Badge>
                            </div>
                          )}
                          <div
                            className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {message.senderName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    isOwn
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(messageDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Selecione uma conversa para começar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
