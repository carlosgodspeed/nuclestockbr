import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Movement, Note } from '@/types';
import { useAuth } from './AuthContext';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    
    const storageRef = ref(storage, `products/${user.id}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    await addDoc(collection(db, 'products'), {
      ...product,
      userId: user.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user) return;
    
    await updateDoc(doc(db, 'products', id), {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    
    await deleteDoc(doc(db, 'products', id));
  };

  const addMovement = async (movement: Omit<Movement, 'id'>) => {
    if (!user) return;
    
    await addDoc(collection(db, 'movements'), {
      ...movement,
      userId: user.id,
    });

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
    
    await addDoc(collection(db, 'notes'), {
      ...note,
      userId: user.id,
      createdAt: serverTimestamp(),
    });
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    
    await deleteDoc(doc(db, 'notes', id));
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
