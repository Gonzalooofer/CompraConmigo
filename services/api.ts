// allow overriding from env but default to relative path so same-origin requests work
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Generic helper
async function request(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    // normalize mongodb _id to id for convenience
    if (Array.isArray(data)) {
      return data.map(d => ({ ...d, id: d._id || d.id }));
    }
    return { ...data, id: data._id || data.id };
  } catch (err) {
    console.error('API request failed', path, err);
    throw err;
  }
}

// Users
export const getUsers = () => request('/users');
export const createUser = (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: string) => request(`/users/${id}`, { method: 'DELETE' });

// Groups
export const getGroups = () => request('/groups');
export const createGroup = (data: any) => request('/groups', { method: 'POST', body: JSON.stringify(data) });
export const updateGroup = (id: string, data: any) => request(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGroup = (id: string) => request(`/groups/${id}`, { method: 'DELETE' });

// Items
export const getItems = () => request('/items');
export const createItem = (data: any) => request('/items', { method: 'POST', body: JSON.stringify(data) });
export const updateItem = (id: string, data: any) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteItem = (id: string) => request(`/items/${id}`, { method: 'DELETE' });

// Settlements
export const getSettlements = () => request('/settlements');
export const createSettlement = (data: any) => request('/settlements', { method: 'POST', body: JSON.stringify(data) });

