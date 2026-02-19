// allow overriding from env but default to relative path so same-origin requests work
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Generic helper
async function request(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const text = await res.text();
    let data: any;
    try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
    if (!res.ok) {
      const msg = data?.error || data?.message || res.statusText;
      const error: any = new Error(msg);
      error.status = res.status;
      throw error;
    }
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

// Authentication
export const register = (data: { name: string; email: string; password: string }) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (email: string, password: string) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const verifyCode = (email: string, code: string) =>
  request('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code }) });
export const verifyLoginCode = (email: string, code: string) =>
  request('/auth/verify-login', { method: 'POST', body: JSON.stringify({ email, code }) });
export const resendCode = (email: string) =>
  request('/auth/resend', { method: 'POST', body: JSON.stringify({ email }) });

// Invitations
export const sendInvitation = (data: { groupId: string; toEmail: string; fromUserId: string }) =>
  request('/invitations/send', { method: 'POST', body: JSON.stringify(data) });
export const acceptInvitation = (code: string, userId: string) =>
  request(`/invitations/accept/${code}`, { method: 'POST', body: JSON.stringify({ userId }) });
export const getPendingInvitations = (userId: string) =>
  request(`/invitations/pending/${userId}`, { method: 'GET' });
export const rejectInvitation = (invitationId: string) =>
  request(`/invitations/reject/${invitationId}`, { method: 'POST' });

// Messages
export const getMessages = (groupId: string, limit?: number, skip?: number) =>
  request(`/messages/group/${groupId}?limit=${limit || 50}&skip=${skip || 0}`, { method: 'GET' });
export const createMessage = (data: { groupId: string; userId: string; userName: string; userAvatar: string; content: string }) =>
  request('/messages', { method: 'POST', body: JSON.stringify(data) });
export const editMessage = (id: string, content: string, userId: string) =>
  request(`/messages/${id}`, { method: 'PUT', body: JSON.stringify({ content, userId }) });
export const deleteMessage = (id: string, userId: string) =>
  request(`/messages/${id}`, { method: 'DELETE', body: JSON.stringify({ userId }) });

// 2FA (Two-Factor Authentication)
export const setup2FA = (userId: string) =>
  request('/2fa/setup', { method: 'POST', body: JSON.stringify({ userId }) });
export const verify2FA = (userId: string, secret: string, code: string, backupCodes: string[]) =>
  request('/2fa/verify', { method: 'POST', body: JSON.stringify({ userId, secret, code, backupCodes }) });
export const verifyLogin2FA = (userId: string, code: string, useBackupCode?: boolean, rememberMe?: boolean) =>
  request('/2fa/verify-login', { method: 'POST', body: JSON.stringify({ userId, code, useBackupCode, rememberMe }) });
export const getBackupCodes = (userId: string) =>
  request(`/2fa/backup-codes?userId=${userId}`, { method: 'GET' });
export const disable2FA = (userId: string) =>
  request('/2fa/disable', { method: 'POST', body: JSON.stringify({ userId }) });
export const verifyRememberMe = (userId: string, token: string) =>
  request('/2fa/verify-remember-me', { method: 'POST', body: JSON.stringify({ userId, token }) });

// Export request for use in other places
export { request };