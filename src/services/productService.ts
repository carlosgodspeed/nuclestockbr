import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Product, Movement, Note } from '@/types';

const getErrorMessage = (error: any): string => {
  if (error.code === 'permission-denied') {
    return 'Você não tem permissão para esta ação';
  }
  if (error.code === 'not-found') {
    return 'Item não encontrado';
  }
  if (error.code === 'storage/unauthorized') {
    return 'Erro ao fazer upload da imagem';
  }
  return 'Erro ao processar requisição';
};

export const productService = {
  /**
   * Upload de imagem do produto
   */
  async uploadProductImage(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const storageRef = ref(storage, `products/${userId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, url: downloadURL };
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Adiciona um novo produto
   */
  async addProduct(userId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string; productId?: string }> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, productId: docRef.id };
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Atualiza um produto
   */
  async updateProduct(productId: string, data: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Deleta um produto
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar produto:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Busca produtos do usuário
   */
  async getProducts(userId: string): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'products'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as Product;
      });

      return { success: true, products };
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Busca produtos por categoria
   */
  async getProductsByCategory(userId: string, category: string): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'products'), 
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as Product;
      });

      return { success: true, products };
    } catch (error: any) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }
};

export const movementService = {
  /**
   * Adiciona um novo movimento
   */
  async addMovement(userId: string, movement: Omit<Movement, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await addDoc(collection(db, 'movements'), {
        ...movement,
        userId,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao adicionar movimento:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Busca movimentos do usuário
   */
  async getMovements(userId: string): Promise<{ success: boolean; movements?: Movement[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'movements'), 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const movements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Movement[];

      return { success: true, movements };
    } catch (error: any) {
      console.error('Erro ao buscar movimentos:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }
};

export const noteService = {
  /**
   * Adiciona uma nova nota
   */
  async addNote(userId: string, note: Omit<Note, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      await addDoc(collection(db, 'notes'), {
        ...note,
        userId,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao adicionar nota:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Deleta uma nota
   */
  async deleteNote(noteId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar nota:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Busca notas do usuário
   */
  async getNotes(userId: string): Promise<{ success: boolean; notes?: Note[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'notes'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const notes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Note;
      });

      return { success: true, notes };
    } catch (error: any) {
      console.error('Erro ao buscar notas:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }
};
