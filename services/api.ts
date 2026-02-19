import { Group, ProductItem, Settlement, User } from '../types';

type BootstrapPayload = {
  user: User;
  users: User[];
  groups: Group[];
  items: ProductItem[];
  settlements: Settlement[];
};

// allow overriding the base path for deployed setups where
// a reverse proxy already prefixes requests (e.g. the app is
// mounted under `/api`).  The value can be set via Vite env
// variable `VITE_API_BASE`; if it's not defined we fall back to
// "/api" for local development.
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // build url and guard against double "/api" prefixes which
  // were causing 405 errors in production (frontend already served
  // under /api).  any accidental "/api/api/..." collapses to
  // "/api/...".
  // build the URL and guard against repeated "/api" prefixes, which can occur
  // when the frontend is itself mounted under /api or when a proxy adds the prefix.
  // previous regex only collapsed a single "/api/api/"; that failed to handle
  // variations like "/api/api/auth/login" or "/api/api/api/auth/login" in
  // production. we'll coalesce any number of adjacent "/api" segments.
  let url = `${API_BASE}${path}`;
  // collapse duplicate "/api" segments (e.g. "/api/api/auth" -> "/api/auth").
  // also handles trailing cases and multiple repetitions.
  url = url.replace(/(?:\/api)+/g, '/api');

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function login(name: string) {
  return request<BootstrapPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

export function bootstrap(userId: string) {
  return request<BootstrapPayload>(`/bootstrap/${userId}`);
}

export function updateUser(userId: string, data: Partial<User>) {
  return request<{ user: User }>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export function deleteUser(userId: string) {
  return request<{ ok: boolean }>(`/users/${userId}`, {
    method: 'DELETE'
  });
}

export function createGroup(payload: { id: string; name: string; icon: string; color: string; ownerId: string }) {
  return request<{ group: Group }>('/groups', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateGroup(groupId: string, data: Partial<Group>) {
  return request<{ group: Group }>(`/groups/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export function deleteGroup(groupId: string) {
  return request<{ ok: boolean }>(`/groups/${groupId}`, {
    method: 'DELETE'
  });
}

export function joinGroup(payload: { groupId: string; userId: string; groupName: string }) {
  return request<{ group: Group }>(`/groups/${payload.groupId}/join`, {
    method: 'POST',
    body: JSON.stringify({ userId: payload.userId, groupName: payload.groupName })
  });
}

export function addMemberManual(groupId: string, name: string) {
  return request<{ user: User; group: Group }>(`/groups/${groupId}/members/manual`, {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

export function removeMember(groupId: string, userId: string) {
  return request<{ group: Group }>(`/groups/${groupId}/members/${userId}`, {
    method: 'DELETE'
  });
}

export function toggleAdmin(groupId: string, userId: string) {
  return request<{ group: Group }>(`/groups/${groupId}/admins/toggle`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function addItems(items: ProductItem[]) {
  return request<{ items: ProductItem[] }>('/items/bulk', {
    method: 'POST',
    body: JSON.stringify({ items })
  });
}

export function updateItem(itemId: string, data: Partial<ProductItem>) {
  return request<{ item: ProductItem }>(`/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export function deleteItem(itemId: string) {
  return request<{ ok: boolean }>(`/items/${itemId}`, {
    method: 'DELETE'
  });
}

export function createSettlement(settlement: Settlement) {
  return request<{ settlement: Settlement }>('/settlements', {
    method: 'POST',
    body: JSON.stringify(settlement)
  });
}
