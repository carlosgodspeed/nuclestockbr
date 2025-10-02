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
    const storedConversations = localStorage.getItem('conversations');
    const storedMessages = localStorage.getItem('chatMessages');
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

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
    localStorage.setItem('conversations', JSON.stringify(updated));
    
    return newConversation.id;
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

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
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const getConversationMessages = (conversationId: string): ChatMessage[] => {
    return messages.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const markAsRead = (conversationId: string) => {
    const updatedMessages = messages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== user?.id) {
        return { ...m, read: true };
      }
      return m;
    });

    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });

    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
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
