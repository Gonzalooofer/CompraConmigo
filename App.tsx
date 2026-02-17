
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShoppingList } from './components/ShoppingList';
import { Scanner } from './components/Scanner';
import { ExpenseSplitter } from './components/ExpenseSplitter';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { NewGroupModal } from './components/NewGroupModal';
import { GroupSettingsModal } from './components/GroupSettingsModal';
import { AppView, ProductItem, User, Group, Settlement } from './types';
import {
  addItems,
  addMemberManual,
  bootstrap,
  createGroup,
  createSettlement,
  deleteGroup,
  deleteItem,
  deleteUser,
  joinGroup,
  login,
  removeMember,
  toggleAdmin,
  updateGroup,
  updateItem,
  updateUser
} from './services/api';
import { Menu, Settings2, Plus, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  const [view, setView] = useState<AppView>(AppView.LIST);
  const [items, setItems] = useState<ProductItem[]>([]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [didProcessInvite, setDidProcessInvite] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser?.theme) {
      setDarkMode(currentUser.theme === 'dark');
    }
  }, [currentUser]);

  const userGroups = currentUser 
    ? groups.filter(g => g.members.includes(currentUser.id)) 
    : [];

  const groupItems = currentGroup 
    ? items.filter(item => item.groupId === currentGroup.id) 
    : [];
    
  const groupSettlements = currentGroup
    ? settlements.filter(s => s.groupId === currentGroup.id)
    : [];

  useEffect(() => {
    if (!currentUser || didProcessInvite) return;

    const processInvite = async () => {
      const url = new URL(window.location.href);
      const joinGroupId = url.searchParams.get('join');
      const joinGroupName = url.searchParams.get('name');
      if (!joinGroupId || !joinGroupName) {
        setDidProcessInvite(true);
        return;
      }

      try {
        const decodedName = decodeURIComponent(joinGroupName);
        const joinResponse = await joinGroup({
          groupId: joinGroupId,
          userId: currentUser.id,
          groupName: decodedName
        });

        const data = await bootstrap(currentUser.id);
        setUsers(data.users);
        setGroups(data.groups);
        setItems(data.items);
        setSettlements(data.settlements);
        setCurrentGroup(joinResponse.group);
        alert(`¡Te has unido al grupo "${decodedName}"!`);
      } catch (error) {
        alert(`No se pudo procesar la invitación: ${String(error)}`);
      } finally {
        setDidProcessInvite(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    processInvite();
  }, [currentUser, didProcessInvite]);

  useEffect(() => {
    if (!currentGroup && userGroups.length > 0) {
      setCurrentGroup(userGroups[0]);
    }
  }, [currentGroup, userGroups]);

  const handleLogin = async (name: string) => {
    try {
      setIsLoading(true);
      setDidProcessInvite(false);
      const data = await login(name);
      setCurrentUser(data.user);
      setUsers(data.users);
      setGroups(data.groups);
      setItems(data.items);
      setSettlements(data.settlements);
      setCurrentGroup(data.groups[0] || null);
    } catch (error) {
      alert(`No se pudo iniciar sesión: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    const localFallback = users.find((u) => u.id === userId);

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }

    try {
      const response = await updateUser(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? response.user : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(response.user);
      }
    } catch (error) {
      if (localFallback) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? localFallback : u)));
        if (currentUser?.id === userId) {
          setCurrentUser(localFallback);
        }
      }
      alert(`No se pudo guardar el perfil: ${String(error)}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    setDidProcessInvite(false);
    setShowSidebar(false);
  };
  
  const handleDeleteAccount = async () => {
    if(!currentUser) return;
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
      try {
        await deleteUser(currentUser.id);
        setUsers(prev => prev.filter(u => u.id !== currentUser.id));
        setGroups(prev => prev.filter(g => g.members.includes(currentUser.id) === false));
        setItems([]);
        setSettlements([]);
        handleLogout();
      } catch (error) {
        alert(`No se pudo eliminar la cuenta: ${String(error)}`);
      }
    }
  };

  const handleAddItems = async (newItems: ProductItem[]) => {
    if (!currentGroup) return;
    const itemsWithGroup = newItems.map(item => ({ 
      ...item, 
      groupId: currentGroup.id,
      assignedTo: undefined 
    }));

    try {
      const response = await addItems(itemsWithGroup);
      setItems(prev => [...prev, ...response.items]);
      setView(AppView.LIST);
    } catch (error) {
      alert(`No se pudieron añadir los productos: ${String(error)}`);
    }
  };

  const handleToggleCheck = async (id: string) => {
    const item = items.find((value) => value.id === id);
    if (!item) return;

    try {
      const response = await updateItem(id, { checked: !item.checked });
      setItems(prev => prev.map(it => (it.id === id ? response.item : it)));
    } catch (error) {
      alert(`No se pudo actualizar el estado del producto: ${String(error)}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert(`No se pudo borrar el producto: ${String(error)}`);
    }
  };

  const handleAssignUser = async (itemId: string, userId: string | undefined) => {
    try {
      const response = await updateItem(itemId, { assignedTo: userId });
      setItems(prev => prev.map(item => (item.id === itemId ? response.item : item)));
    } catch (error) {
      alert(`No se pudo asignar el producto: ${String(error)}`);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<ProductItem>) => {
    try {
      const response = await updateItem(id, updates);
      setItems(prev => prev.map(item => (item.id === id ? response.item : item)));
    } catch (error) {
      alert(`No se pudo actualizar el producto: ${String(error)}`);
    }
  };

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
    }
  };

  const handleCreateGroup = async (groupData: Omit<Group, 'id' | 'members' | 'admins'>) => {
    if (!currentUser) return;

    try {
      const response = await createGroup({
        id: uuidv4(),
        ownerId: currentUser.id,
        ...groupData
      });
      setGroups(prev => [...prev, response.group]);
      setCurrentGroup(response.group);
      setShowNewGroupModal(false);
    } catch (error) {
      alert(`No se pudo crear el grupo: ${String(error)}`);
    }
  };

  const handleUpdateGroup = async (groupId: string, data: Partial<Group>) => {
    try {
      const response = await updateGroup(groupId, data);
      setGroups(prev => prev.map(g => (g.id === groupId ? response.group : g)));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(response.group);
      }
    } catch (error) {
      alert(`No se pudo actualizar el grupo: ${String(error)}`);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setItems(prev => prev.filter(i => i.groupId !== groupId));
      setSettlements(prev => prev.filter(s => s.groupId !== groupId));

      if (currentGroup?.id === groupId) {
        const remaining = userGroups.filter(g => g.id !== groupId);
        setCurrentGroup(remaining.length > 0 ? remaining[0] : null);
      }
      setShowGroupSettings(false);
    } catch (error) {
      alert(`No se pudo eliminar el grupo: ${String(error)}`);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      const response = await removeMember(groupId, userId);
      setGroups(prev => prev.map(g => (g.id === groupId ? response.group : g)));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(response.group);
      }
    } catch (error) {
      alert(`No se pudo eliminar el miembro: ${String(error)}`);
    }
  };

  const handleToggleAdmin = async (groupId: string, userId: string) => {
    try {
      const response = await toggleAdmin(groupId, userId);
      setGroups(prev => prev.map(g => (g.id === groupId ? response.group : g)));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(response.group);
      }
    } catch (error) {
      alert(`No se pudo actualizar permisos: ${String(error)}`);
    }
  };

  const handleAddMemberManual = async (groupId: string, name: string) => {
    try {
      const response = await addMemberManual(groupId, name);
      setUsers(prev => [...prev, response.user]);
      setGroups(prev => prev.map(g => (g.id === groupId ? response.group : g)));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(response.group);
      }
    } catch (error) {
      alert(`No se pudo añadir el miembro: ${String(error)}`);
    }
  };
  
  const handleSettleDebt = async (fromId: string, toId: string, amount: number) => {
    if (!currentGroup) return;
    const newSettlement: Settlement = {
      id: uuidv4(),
      fromUserId: fromId,
      toUserId: toId,
      amount: amount,
      timestamp: Date.now(),
      groupId: currentGroup.id
    };

    try {
      const response = await createSettlement(newSettlement);
      setSettlements(prev => [...prev, response.settlement]);
    } catch (error) {
      alert(`No se pudo registrar el pago: ${String(error)}`);
    }
  };

  const handleToggleTheme = async () => {
    if (!currentUser) return;
    const nextTheme = darkMode ? 'light' : 'dark';
    setDarkMode(nextTheme === 'dark');
    await handleUpdateUser(currentUser.id, { theme: nextTheme });
  };


  // --- RENDER ---

  // 1. Force Login if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center transition-colors duration-300">
        <AuthModal 
          onClose={() => {}} // No-op
          onLogin={handleLogin} 
          allowClose={false}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // 2. Main App (Authenticated)
  
  if (!currentGroup && userGroups.length > 0) {
    return null; 
  }

  // 3. Estado "Sin Grupo" (Dashboard de bienvenida para crear uno)
  if (!currentGroup) {
     return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
            
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50 animate-in zoom-in duration-500">
                <span className="text-5xl">👋</span>
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-3">¡Hola, {currentUser.name}!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xs mx-auto leading-relaxed">
                Bienvenido a <span className="font-bold text-emerald-600 dark:text-emerald-500">CompraConmigo</span>.<br/>
                Para empezar a organizar tus compras, necesitas crear o unirte a un grupo.
            </p>

            <button 
              onClick={() => setShowNewGroupModal(true)}
              className="w-full max-w-xs py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 group mb-4"
            >
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                <Plus size={20} className="text-white" strokeWidth={3} />
              </div>
              <span>Crear Nuevo Grupo</span>
            </button>
            
            <button 
               onClick={handleLogout}
               className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
               <LogOut size={14} />
               <span>Cerrar Sesión</span>
             </button>

            {showNewGroupModal && (
              <NewGroupModal 
                onClose={() => setShowNewGroupModal(false)}
                onCreate={handleCreateGroup}
              />
            )}
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full max-w-md md:max-w-3xl mx-auto relative shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Top Bar Navigation */}
      <header className="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <button 
          onClick={() => setShowSidebar(true)}
          className="flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 -ml-1 pr-3 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
             <Menu className="text-white" size={20} />
          </div>
          <div className="text-left group relative">
            <h1 className="text-lg font-black text-slate-800 dark:text-white leading-tight">CompraConmigo</h1>
            
            {/* Group Config Trigger */}
            <div 
              onClick={(e) => { e.stopPropagation(); setShowGroupSettings(true); }}
              className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-emerald-500 transition-colors mt-0.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${currentGroup.color}`}></span>
              <span className="mr-1">{currentGroup.name}</span>
              <Settings2 size={10} className="ml-0.5" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => setShowSidebar(true)}
          className="relative group"
        >
          <img 
            src={currentUser.avatar} 
            alt="Profile" 
            className="w-10 h-10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-500 transition-colors object-cover" 
          />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {view === AppView.LIST && (
          <ShoppingList 
            items={groupItems} 
            users={users.filter(u => currentGroup.members.includes(u.id))}
            currentGroup={currentGroup}
            onToggleCheck={handleToggleCheck}
            onDeleteItem={handleDeleteItem}
            onAssignUser={handleAssignUser}
            onUpdateItem={handleUpdateItem}
          />
        )}
        
        {view === AppView.EXPENSES && (
          <ExpenseSplitter 
            items={groupItems} 
            users={users.filter(u => currentGroup.members.includes(u.id))} 
            currentUser={currentUser}
            settlements={groupSettlements}
            onSettleDebt={handleSettleDebt}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {view === AppView.SCANNER && (
        <Scanner 
          onAddItems={handleAddItems} 
          onClose={() => setView(AppView.LIST)}
        />
      )}

      <Navbar currentView={view} onChangeView={setView} />

      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        groups={userGroups}
        currentGroupId={currentGroup.id}
        onSelectGroup={handleSelectGroup}
        onAddNewGroup={() => setShowNewGroupModal(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLogin={() => {}}
        isDarkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        onUpdateUser={handleUpdateUser}
        onDeleteAccount={handleDeleteAccount}
      />

      {showNewGroupModal && (
        <NewGroupModal 
          onClose={() => setShowNewGroupModal(false)} 
          onCreate={handleCreateGroup} 
        />
      )}

      {showGroupSettings && (
        <GroupSettingsModal 
          group={currentGroup}
          users={users}
          currentUser={currentUser}
          onClose={() => setShowGroupSettings(false)}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onRemoveMember={handleRemoveMember}
          onToggleAdmin={handleToggleAdmin}
          onAddMember={handleAddMemberManual}
        />
      )}

    </div>
  );
};

export default App;
