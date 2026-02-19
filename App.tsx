
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
import { MOCK_USERS, MOCK_GROUPS, INITIAL_ITEMS } from './constants';
import { Menu, Settings2, Plus, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true; 
    }
    return true;
  });

  const [view, setView] = useState<AppView>(AppView.LIST);
  const [items, setItems] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('compraConmigo_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  
  // Settlements State (Pagos realizados)
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null); // Nullable initially
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  // Apply theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('compraConmigo_items', JSON.stringify(items));
  }, [items]);

  // Derived state: Filter groups for the logged-in user
  const userGroups = currentUser 
    ? groups.filter(g => g.members.includes(currentUser.id)) 
    : [];

  // Derived state: Filter items for the current group
  const groupItems = currentGroup 
    ? items.filter(item => item.groupId === currentGroup.id) 
    : [];
    
  // Filter settlements for current group
  const groupSettlements = currentGroup
    ? settlements.filter(s => s.groupId === currentGroup.id)
    : [];

  // Handle URL Invitations
  useEffect(() => {
    if (!currentUser) return;

    const url = new URL(window.location.href);
    const joinGroupId = url.searchParams.get('join');
    const joinGroupName = url.searchParams.get('name');

    if (joinGroupId && joinGroupName) {
        // Check if user is already in this group
        const existingGroup = groups.find(g => g.id === joinGroupId);
        
        if (existingGroup) {
            if (!existingGroup.members.includes(currentUser.id)) {
                // Add user to existing group
                const updatedGroup = { ...existingGroup, members: [...existingGroup.members, currentUser.id] };
                setGroups(prev => prev.map(g => g.id === joinGroupId ? updatedGroup : g));
                setCurrentGroup(updatedGroup);
                alert(`¡Te has unido al grupo "${joinGroupName}"!`);
            } else {
                setCurrentGroup(existingGroup);
            }
        } else {
            // Create the group locally for this user
            const newGroup: Group = {
                id: joinGroupId,
                name: decodeURIComponent(joinGroupName),
                members: [currentUser.id],
                admins: [], // Default no admins if joined via link, or maybe just self
                icon: '👋',
                color: 'bg-emerald-500'
            };
            setGroups(prev => [...prev, newGroup]);
            setCurrentGroup(newGroup);
            alert(`¡Te has unido al grupo "${decodeURIComponent(joinGroupName)}"!`);
        }

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
    }
  }, [currentUser, groups]);


  const handleLogin = (name: string) => {
    // Buscar si el usuario ya existe por nombre (case insensitive)
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    // Si no existe, crearlo
    if (!user) {
      user = {
        id: uuidv4(),
        name: name,
        email: `${name.toLowerCase().replace(/\s/g, '')}@ejemplo.com`, // Dummy email generator
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        color: 'bg-purple-500',
        plan: 'free'
      };
      setUsers(prev => [...prev, user!]);
    }
    
    setCurrentUser(user);

    // Find groups for this user
    const existingGroups = groups.filter(g => g.members.includes(user!.id));
    
    if (existingGroups.length > 0) {
      // Si ya tiene grupos, entramos al primero
      setCurrentGroup(existingGroups[0]);
    } else {
      // MODIFICACIÓN: NO crear grupo automático.
      // Dejamos currentGroup en null para que salga la pantalla de creación.
      setCurrentGroup(null);
    }
  };

  const handleUpdateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...data } : u
    ));
    // If the updated user is current user, update state
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    setShowSidebar(false);
  };
  
  const handleDeleteAccount = () => {
    if(!currentUser) return;
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
      // Remove user from all groups
      setGroups(prev => prev.map(g => ({
        ...g,
        members: g.members.filter(id => id !== currentUser.id),
        admins: g.admins.filter(id => id !== currentUser.id)
      })).filter(g => g.members.length > 0)); // Remove empty groups if necessary, or keep them

      // Remove user from users list
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));

      handleLogout();
    }
  };

  const handleAddItems = (newItems: ProductItem[]) => {
    if (!currentGroup) return;
    const itemsWithGroup = newItems.map(item => ({ 
      ...item, 
      groupId: currentGroup.id,
      assignedTo: undefined 
    }));
    setItems(prev => [...prev, ...itemsWithGroup]);
    setView(AppView.LIST);
  };

  const handleToggleCheck = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAssignUser = (itemId: string, userId: string | undefined) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, assignedTo: userId } : item
    ));
  };

  const handleUpdateItem = (id: string, updates: Partial<ProductItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
    }
  };

  const handleCreateGroup = (groupData: Omit<Group, 'id' | 'members' | 'admins'>) => {
    if (!currentUser) return;
    const newGroup: Group = {
      id: uuidv4(),
      members: [currentUser.id],
      admins: [currentUser.id],
      ...groupData
    };
    setGroups(prev => [...prev, newGroup]);
    setCurrentGroup(newGroup);
    setShowNewGroupModal(false);
  };

  // --- Group Management Handlers ---

  const handleUpdateGroup = (groupId: string, data: Partial<Group>) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, ...data } : g
    ));
    if (currentGroup?.id === groupId) {
      setCurrentGroup(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    // Also delete items from that group
    setItems(prev => prev.filter(i => i.groupId !== groupId));
    
    // Switch to another group or clear
    if (currentGroup?.id === groupId) {
      const remaining = userGroups.filter(g => g.id !== groupId);
      setCurrentGroup(remaining.length > 0 ? remaining[0] : null);
    }
    setShowGroupSettings(false);
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: g.members.filter(m => m !== userId),
        admins: g.admins.filter(a => a !== userId)
      };
    }));
    // Logic for updating current group if open
    if (currentGroup?.id === groupId) {
      setCurrentGroup(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.filter(m => m !== userId),
          admins: prev.admins.filter(a => a !== userId)
        }
      });
    }
  };

  const handleToggleAdmin = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const isAdmin = g.admins.includes(userId);
      return {
        ...g,
        admins: isAdmin ? g.admins.filter(a => a !== userId) : [...g.admins, userId]
      };
    }));
    
    if (currentGroup?.id === groupId) {
      setCurrentGroup(prev => {
        if (!prev) return null;
        const isAdmin = prev.admins.includes(userId);
        return {
          ...prev,
          admins: isAdmin ? prev.admins.filter(a => a !== userId) : [...prev.admins, userId]
        }
      });
    }
  };

  const handleAddMemberManual = (groupId: string, name: string) => {
    const newUserId = uuidv4();
    const newUser: User = {
      id: newUserId,
      name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}${newUserId}`,
      color: 'bg-slate-500', // Default color
      plan: 'free'
    };

    // Add user to global state
    setUsers(prev => [...prev, newUser]);

    // Add user to group
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: [...g.members, newUserId]
      };
    }));

    if (currentGroup?.id === groupId) {
      setCurrentGroup(prev => prev ? {
        ...prev,
        members: [...prev.members, newUserId]
      } : null);
    }
  };
  
  const handleSettleDebt = (fromId: string, toId: string, amount: number) => {
    if (!currentGroup) return;
    const newSettlement: Settlement = {
      id: uuidv4(),
      fromUserId: fromId,
      toUserId: toId,
      amount: amount,
      timestamp: Date.now(),
      groupId: currentGroup.id
    };
    setSettlements(prev => [...prev, newSettlement]);
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
        />
      </div>
    );
  }

  // 2. Main App (Authenticated)
  
  // Si no hay grupo activo, pero el usuario TIENE grupos, seleccionamos el primero automáticamente
  if (!currentGroup && userGroups.length > 0) {
    setCurrentGroup(userGroups[0]);
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
        onToggleTheme={() => setDarkMode(!darkMode)}
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
