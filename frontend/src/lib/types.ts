export type UserRole = 'Admin' | 'Cashier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastPurchaseDate?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Other';
  customerId?: string;
  cashierId: string;
}