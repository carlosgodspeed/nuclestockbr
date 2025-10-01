import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Movement, Note } from '@/types';

interface StockContextType {
  products: Product[];
  movements: Movement[];
  notes: Note[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMovement: (movement: Omit<Movement, 'id'>) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedMovements = localStorage.getItem('movements');
    const storedNotes = localStorage.getItem('notes');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedMovements) setMovements(JSON.parse(storedMovements));
    if (storedNotes) setNotes(JSON.parse(storedNotes));
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
    );
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const addMovement = (movement: Omit<Movement, 'id'>) => {
    const newMovement: Movement = {
      ...movement,
      id: crypto.randomUUID(),
    };
    
    const updated = [...movements, newMovement];
    setMovements(updated);
    localStorage.setItem('movements', JSON.stringify(updated));

    const product = products.find(p => p.id === movement.productId);
    if (product) {
      const newQuantity = movement.type === 'entry' 
        ? product.quantity + movement.quantity 
        : product.quantity - movement.quantity;
      
      updateProduct(movement.productId, { quantity: Math.max(0, newQuantity) });
    }
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
  };

  return (
    <StockContext.Provider value={{
      products,
      movements,
      notes,
      addProduct,
      updateProduct,
      deleteProduct,
      addMovement,
      addNote,
      deleteNote,
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStock must be used within StockProvider');
  return context;
};
