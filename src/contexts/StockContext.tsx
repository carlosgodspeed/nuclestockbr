import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Movement, Note } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  uploadProductImage: (file: File) => Promise<string | null>;
  loading: boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setMovements([]);
      setNotes([]);
      setLoading(false);
      return;
    }

    loadData();

    // Subscribe to real-time updates
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadProducts()
      )
      .subscribe();

    const movementsChannel = supabase
      .channel('movements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'movements',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadMovements()
      )
      .subscribe();

    const notesChannel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadNotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(movementsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadMovements(), loadNotes()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        quantity: p.quantity,
        category: p.category,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        supplier: p.supplier || '',
        imageUrl: p.image_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadMovements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedMovements: Movement[] = data.map((m: any) => ({
        id: m.id,
        productId: m.product_id,
        productName: m.product_name,
        type: m.type as 'entry' | 'exit',
        quantity: m.quantity,
        price: Number(m.price),
        date: m.date,
        supplier: m.supplier,
        supplierPhone: m.supplier_phone,
        supplierEmail: m.supplier_email,
        supplierNotes: m.supplier_notes,
        customer: m.customer,
        customerPhone: m.customer_phone,
        customerEmail: m.customer_email,
        customerNotes: m.customer_notes,
        reason: m.reason,
        userId: m.user_id,
        userName: user.name,
      }));

      setMovements(mappedMovements);
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedNotes: Note[] = data.map((n) => ({
        id: n.id,
        content: n.content,
        createdAt: n.created_at,
        userId: n.user_id,
      }));

      setNotes(mappedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('products').insert({
        user_id: user.id,
        name: product.name,
        description: product.description,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        cost: product.cost,
        supplier: product.supplier,
        image_url: product.imageUrl,
      }).select().single();

      if (error) throw error;

      // Atualiza o estado local imediatamente
      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          quantity: data.quantity,
          category: data.category,
          price: Number(data.price),
          cost: data.cost ? Number(data.cost) : undefined,
          supplier: data.supplier || '',
          imageUrl: data.image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setProducts(prev => [newProduct, ...prev]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.cost !== undefined) updateData.cost = productData.cost;
      if (productData.supplier !== undefined) updateData.supplier = productData.supplier;
      if (productData.imageUrl !== undefined) updateData.image_url = productData.imageUrl;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualiza o estado local imediatamente
      if (data) {
        setProducts(prev => prev.map(p => p.id === id ? {
          id: data.id,
          name: data.name,
          description: data.description || '',
          quantity: data.quantity,
          category: data.category,
          price: Number(data.price),
          cost: data.cost ? Number(data.cost) : undefined,
          supplier: data.supplier || '',
          imageUrl: data.image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } : p));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualiza o estado local imediatamente
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addMovement = async (movement: Omit<Movement, 'id'>) => {
    if (!user) return;

    try {
      // Insert movement
      const { data, error: movementError } = await supabase.from('movements').insert({
        user_id: user.id,
        product_id: movement.productId,
        product_name: movement.productName,
        type: movement.type,
        quantity: movement.quantity,
        price: movement.price,
        date: movement.date,
        supplier: movement.supplier,
        supplier_phone: movement.supplierPhone,
        supplier_email: movement.supplierEmail,
        supplier_notes: movement.supplierNotes,
        customer: movement.customer,
        customer_phone: movement.customerPhone,
        customer_email: movement.customerEmail,
        customer_notes: movement.customerNotes,
        reason: movement.reason,
      }).select().single();

      if (movementError) throw movementError;

      // Atualiza o estado local imediatamente
      if (data) {
        const newMovement: Movement = {
          id: data.id,
          productId: data.product_id,
          productName: data.product_name,
          type: data.type as 'entry' | 'exit',
          quantity: data.quantity,
          price: Number(data.price),
          date: data.date,
          supplier: data.supplier,
          supplierPhone: data.supplier_phone,
          supplierEmail: data.supplier_email,
          supplierNotes: data.supplier_notes,
          customer: data.customer,
          customerPhone: data.customer_phone,
          customerEmail: data.customer_email,
          customerNotes: data.customer_notes,
          reason: data.reason,
          userId: data.user_id,
          userName: user.name,
        };
        setMovements(prev => [newMovement, ...prev]);
      }

      // Update product quantity
      const product = products.find((p) => p.id === movement.productId);
      if (product) {
        const newQuantity =
          movement.type === 'entry'
            ? product.quantity + movement.quantity
            : product.quantity - movement.quantity;

        await updateProduct(movement.productId, { quantity: Math.max(0, newQuantity) });
      }
    } catch (error) {
      console.error('Error adding movement:', error);
      throw error;
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('notes').insert({
        user_id: user.id,
        content: note.content,
      }).select().single();

      if (error) throw error;

      // Atualiza o estado local imediatamente
      if (data) {
        const newNote: Note = {
          id: data.id,
          content: data.content,
          createdAt: data.created_at,
          userId: data.user_id,
        };
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualiza o estado local imediatamente
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  return (
    <StockContext.Provider
      value={{
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
        loading,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStock must be used within StockProvider');
  return context;
};
