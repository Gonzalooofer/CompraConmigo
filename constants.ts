
import { User, Group } from './types';

export const CATEGORIES = [
  'Frutas y Verduras',
  'Lácteos y Huevos',
  'Carnicería y Pescadería',
  'Despensa',
  'Bebidas',
  'Limpieza',
  'Cuidado Personal',
  'Otros'
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Tú', avatar: 'https://picsum.photos/seed/user1/50/50', color: 'bg-blue-500' },
  { id: 'u2', name: 'Ana', avatar: 'https://picsum.photos/seed/user2/50/50', color: 'bg-pink-500' },
  { id: 'u3', name: 'Carlos', avatar: 'https://picsum.photos/seed/user3/50/50', color: 'bg-green-500' },
];

export const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Familia García', members: ['u1', 'u2', 'u3'], admins: ['u1'], icon: '🏠', color: 'bg-emerald-500' },
  { id: 'g2', name: 'Piso Estudiantes', members: ['u1', 'u3'], admins: ['u1'], icon: '🎓', color: 'bg-indigo-500' },
  { id: 'g3', name: 'Cena de Viernes', members: ['u1', 'u2'], admins: ['u2'], icon: '🍕', color: 'bg-orange-500' },
];

export const INITIAL_ITEMS = [
  { id: '1', name: 'Leche Deslactosada', category: 'Lácteos y Huevos', quantity: 2, estimatedPrice: 1.50, checked: false, assignedTo: 'u1', groupId: 'g1' },
  { id: '2', name: 'Manzanas Rojas', category: 'Frutas y Verduras', quantity: 6, estimatedPrice: 3.20, checked: true, assignedTo: 'u2', groupId: 'g1' },
  { id: '3', name: 'Pan Integral', category: 'Despensa', quantity: 1, estimatedPrice: 2.10, checked: false, assignedTo: 'u3', groupId: 'g1' },
];
