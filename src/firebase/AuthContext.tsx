import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute if the logged in user qualifies as isAdmin according to our rules
  const isAdmin = user ? user.email === 'ziashafay34@gmail.com' : false;

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
      throw err;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      // Reload user so profile changes are immediately accessible
      setUser({ ...credential.user });
      return credential.user;
    } catch (err: any) {
      setError(err.message || "Failed to register.");
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || "Failed to log out.");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
