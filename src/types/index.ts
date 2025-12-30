export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'supplier';
  imageUrl?: string;
  company?: string;
  businessCategory?: 'bebidas' | 'diversos' | 'eletronicos' | 'roupas' | 'varejo';
  description?: string;
  productImages?: string[];
  promotionalImage?: string;
  promotionalImageDays?: number;
  promotionalImageCreatedAt?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
  cost?: number;
  supplier: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'purchase' | 'sale';
  quantity: number;
  price: number;
  date: string;
  supplier?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierNotes?: string;
  customer?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerNotes?: string;
  reason?: string;
  userId: string;
  userName: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}
