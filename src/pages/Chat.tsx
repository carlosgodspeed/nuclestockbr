import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Chat = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    sendMessage, 
    createConversation, 
    getConversationMessages,
    markAsRead,
    getSuppliers
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suppliers = getSuppliers();
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar conversa com fornecedor</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {suppliers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum fornecedor cadastrado ainda.
                  </p>
                ) : (
                  suppliers.map((supplier) => (
                    <Button
                      key={supplier.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleNewConversation(supplier.id)}
                    >
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src={supplier.imageUrl} />
                        <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{supplier.name}</p>
                        {supplier.company && (
                          <p className="text-xs text-muted-foreground">{supplier.company}</p>
                        )}
                      </div>
                    </Button>
                  ))
                )}
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
                    return (
                      <Button
                        key={conv.id}
                        variant={selectedConversation === conv.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start p-4 h-auto"
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <Avatar className="mr-2 h-10 w-10">
                          <AvatarImage src={otherUser?.imageUrl} />
                          <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{otherUser?.name || 'Usuário'}</p>
                            {conv.unreadCount > 0 && (
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
                    {currentMessages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
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
                                {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
                              </p>
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
