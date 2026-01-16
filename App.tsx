
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShoppingList } from './components/ShoppingList';
import { Scanner } from './components/Scanner';
import { ExpenseSplitter } from './components/ExpenseSplitter';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { NewGroupModal } from './components/NewGroupModal';
import { GroupSettingsModal } from './components/GroupSettingsModal';
import { AppView, ProductItem, User, Group } from './types';
import { MOCK_USERS, MOCK_GROUPS, INITIAL_ITEMS } from './constants';
import { Menu, Settings2 } from 'lucide-react';
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
        color: 'bg-purple-500'
      };
      setUsers(prev => [...prev, user!]);
    }
    
    setCurrentUser(user);

    // Find groups for this user
    const existingGroups = groups.filter(g => g.members.includes(user!.id));
    
    if (existingGroups.length > 0) {
      setCurrentGroup(existingGroups[0]);
    } else {
      // Create a default group for new user
      const defaultGroup: Group = {
        id: uuidv4(),
        name: 'Mi Casa',
        members: [user.id],
        admins: [user.id],
        icon: '🏠',
        color: 'bg-emerald-500'
      };
      setGroups(prev => [...prev, defaultGroup]);
      setCurrentGroup(defaultGroup);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    setShowSidebar(false);
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
  // If user has no groups (deleted all), create a new default one or show a "Create Group" screen.
  // For simplicity, if currentGroup is null but user is logged in, show sidebar or prompt.
  if (!currentGroup && userGroups.length > 0) {
    setCurrentGroup(userGroups[0]);
    return null; 
  }

  if (!currentGroup) {
     // User has no groups left
     return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">¡Vaya! No tienes grupos.</h2>
            <button 
              onClick={() => setShowNewGroupModal(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg"
            >
              Crear Nuevo Grupo
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
        />
      )}

    </div>
  );
};

export default App;
