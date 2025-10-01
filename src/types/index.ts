export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
  supplier: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'entry' | 'exit';
  quantity: number;
  date: string;
  supplier?: string;
  customer?: string;
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
