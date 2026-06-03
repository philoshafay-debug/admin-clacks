import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase/config';
import { Product, Order } from '../types';

// Helper to generate IDs that match standard formats and comply with firestore.rules regex: '^[a-zA-Z0-9_\-]+$'
function generateSecureId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// === PRODUCTS ===

export async function getProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    handleFirestoreError(error, 'list', path);
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Product;
  } catch (error) {
    handleFirestoreError(error, 'get', path);
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const customId = generateSecureId();
  const path = `products/${customId}`;
  try {
    const docRef = doc(db, 'products', customId);
    const payload = {
      ...product,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return customId;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

export async function editProduct(id: string, product: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    // Filter clean changes and exclude immutable createdAt
    const { id: _, createdAt: __, ...updates } = product as any;
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

export async function removeProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', path);
  }
}

// === ORDERS ===

export async function getOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    handleFirestoreError(error, 'list', path);
  }
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const customId = generateSecureId();
  const path = `orders/${customId}`;
  try {
    const docRef = doc(db, 'orders', customId);
    const payload = {
      ...order,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return customId;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const path = `orders/${id}`;
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

export async function removeOrder(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const docRef = doc(db, 'orders', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', path);
  }
}
