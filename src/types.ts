export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  sizes: number[];
  image: string;
  createdAt?: any;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: number;
  image: string;
}

export interface Order {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt?: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
