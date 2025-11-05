import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Movement, Note } from '@/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { productService, movementService, noteService } from '@/services/productService';

interface StockContextType {
  products: Product[];
  movements: Movement[];
  notes: Note[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addMovement: (movement: Omit<Movement, 'id'>) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setMovements([]);
      setNotes([]);
      return;
    }

    // Listen to products
    const productsQuery = query(collection(db, 'products'), where('userId', '==', user.id));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as Product;
      });
      setProducts(productsData);
    });

    // Listen to movements
    const movementsQuery = query(collection(db, 'movements'), where('userId', '==', user.id));
    const unsubscribeMovements = onSnapshot(movementsQuery, (snapshot) => {
      const movementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Movement[];
      setMovements(movementsData);
    });

    // Listen to notes
    const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.id));
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const notesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Note;
      });
      setNotes(notesData);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeMovements();
      unsubscribeNotes();
    };
  }, [user]);

  const uploadProductImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const result = await productService.uploadProductImage(user.id, file);
    if (result.success && result.url) {
      return result.url;
    }
    throw new Error(result.error || 'Erro ao fazer upload da imagem');
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    await productService.addProduct(user.id, product);
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user) return;
    await productService.updateProduct(id, productData);
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    await productService.deleteProduct(id);
  };

  const addMovement = async (movement: Omit<Movement, 'id'>) => {
    if (!user) return;
    
    await movementService.addMovement(user.id, movement);

    const product = products.find(p => p.id === movement.productId);
    if (product) {
      const newQuantity = movement.type === 'entry' 
        ? product.quantity + movement.quantity 
        : product.quantity - movement.quantity;
      
      await updateProduct(movement.productId, { quantity: Math.max(0, newQuantity) });
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) return;
    await noteService.addNote(user.id, note);
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    await noteService.deleteNote(id);
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
      uploadProductImage,
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
