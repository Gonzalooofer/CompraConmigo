
export interface ProductItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPrice: number;
  checked: boolean;
  assignedTo?: string; // User ID
  groupId?: string; // Group ID to which this item belongs
  storePrices?: Array<{ store: string; price: number }>;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  email?: string; // disponible si el usuario se registró con correo
  verified?: boolean; // indica si el correo fue confirmado
  phoneNumber?: string; // Para Bizum
  country?: string; // País del usuario
  city?: string; // Ciudad del usuario
  postalCode?: string; // Código postal
  plan?: 'free' | 'premium' | 'family'; // Plan del usuario
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // User IDs
  admins: string[]; // User IDs with admin privileges
  icon: string; // Emoji or URL
  color: string;
}

// Nuevo: Para registrar pagos realizados y saldar deudas
export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  timestamp: number;
  groupId: string;
}

export enum AppView {
  LIST = 'LIST',
  SCANNER = 'SCANNER',
  EXPENSES = 'EXPENSES',
  GROUPS = 'GROUPS',
  PROFILE = 'PROFILE'
}

export type ScanResult = {
  items: Array<{
    name: string;
    category: string;
    estimatedPrice: number;
    quantity: number;
  }>
}

export type PriceComparisonResult = {
  product: string;
  comparisons: Array<{
    store: string;
    price: number;
    note: string;
  }>;
}
