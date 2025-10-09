import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage, Conversation, User } from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  messages: ChatMessage[];
  sendMessage: (conversationId: string, content: string) => void;
  createConversation: (participantId: string) => string;
  getConversationMessages: (conversationId: string) => ChatMessage[];
  markAsRead: (conversationId: string) => void;
  getSuppliers: () => User[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const storedConversations = localStorage.getItem(`conversations_${user.id}`);
    const storedMessages = localStorage.getItem(`chatMessages_${user.id}`);
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [user]);

  const getSuppliers = (): User[] => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter((u: User) => u.role === 'supplier' && u.id !== user?.id);
  };

  const createConversation = (participantId: string): string => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const participant = users.find((u: User) => u.id === participantId);
    
    if (!participant || !user) return '';

    const existingConv = conversations.find(c => 
      c.participantIds.includes(participantId) && c.participantIds.includes(user.id)
    );

    if (existingConv) return existingConv.id;

    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      participantIds: [user.id, participantId],
      participantNames: [user.name, participant.name],
      unreadCount: 0,
    };

    const updated = [...conversations, newConversation];
    setConversations(updated);
    localStorage.setItem(`conversations_${user.id}`, JSON.stringify(updated));
    
    return newConversation.id;
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!user) return;

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Salvar mensagem para o usuário atual
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(updatedMessages));

    // Salvar mensagem para o outro participante
    const otherParticipantId = conversation.participantIds.find(id => id !== user.id);
    if (otherParticipantId) {
      const otherMessages = JSON.parse(localStorage.getItem(`chatMessages_${otherParticipantId}`) || '[]');
      const updatedOtherMessages = [...otherMessages, newMessage];
      localStorage.setItem(`chatMessages_${otherParticipantId}`, JSON.stringify(updatedOtherMessages));

      // Atualizar conversas do outro participante
      const otherConversations = JSON.parse(localStorage.getItem(`conversations_${otherParticipantId}`) || '[]');
      const updatedOtherConversations = otherConversations.map((conv: Conversation) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: content,
            lastMessageAt: newMessage.createdAt,
            unreadCount: (conv.unreadCount || 0) + 1,
          };
        }
        return conv;
      });
      localStorage.setItem(`conversations_${otherParticipantId}`, JSON.stringify(updatedOtherConversations));
    }

    // Atualizar conversas do usuário atual
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: content,
          lastMessageAt: newMessage.createdAt,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    localStorage.setItem(`conversations_${user.id}`, JSON.stringify(updatedConversations));
  };

  const getConversationMessages = (conversationId: string): ChatMessage[] => {
    return messages.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const markAsRead = (conversationId: string) => {
    if (!user) return;
    
    const updatedMessages = messages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== user?.id) {
        return { ...m, read: true };
      }
      return m;
    });

    setMessages(updatedMessages);
    localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(updatedMessages));

    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });

    setConversations(updatedConversations);
    localStorage.setItem(`conversations_${user.id}`, JSON.stringify(updatedConversations));
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      sendMessage,
      createConversation,
      getConversationMessages,
      markAsRead,
      getSuppliers,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
