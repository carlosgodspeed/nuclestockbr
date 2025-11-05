import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { User } from '@/types';

export interface AuthError {
  message: string;
  code: string;
}

const getErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'E-mail inválido';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet';
    default:
      return 'Erro ao processar requisição';
  }
};

export const authService = {
  /**
   * Registra um novo usuário
   */
  async signup(name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Verifica se é o primeiro usuário (será admin)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const isFirstUser = usersSnapshot.empty;

      // Cria usuário no Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualiza o displayName
      await updateFirebaseProfile(userCredential.user, { displayName: name });

      // Cria documento do usuário no Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        role: isFirstUser ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Faz login do usuário
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        return { success: false, error: 'Dados do usuário não encontrados' };
      }

      const user = { id: userCredential.user.uid, ...userDoc.data() } as User;
      return { success: true, user };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      return { success: false, error: 'Erro ao sair da conta' };
    }
  },

  /**
   * Busca dados do usuário pelo ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  /**
   * Atualiza perfil do usuário
   */
  async updateUserProfile(userId: string, data: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  }
};
