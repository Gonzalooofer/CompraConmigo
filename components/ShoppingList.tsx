
import React, { useMemo, useState, useEffect } from 'react';
import { ProductItem, User, Group } from '../types';
import { CATEGORIES } from '../constants';
import { Trash2, Check, User as UserIcon, TrendingDown, Share2 } from 'lucide-react';
import { PriceComparisonModal } from './PriceComparisonModal';
import { InviteModal } from './InviteModal';

interface ShoppingListProps {
  items: ProductItem[];
  users: User[];
  currentGroup: Group; // Added prop
  onToggleCheck: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAssignUser: (itemId: string, userId: string | undefined) => void;
  onUpdateItem: (id: string, updates: Partial<ProductItem>) => void;
}

const EditableNumberInput = ({ 
  value, 
  onSave, 
  className, 
  min, 
  step,
  suffix 
}: { 
  value: number, 
  onSave: (val: number) => void, 
  className?: string,
  min?: string,
  step?: string,
  suffix?: string
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (!isNaN(num)) {
      onSave(num);
    } else {
      setLocalValue(value.toString());
    }
  };

  return (
    <div className={`flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:bg-white dark:focus-within:bg-slate-700 transition-all ${className}`}>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        min={min}
        step={step}
        className="bg-transparent w-full text-center font-bold text-slate-700 dark:text-slate-200 outline-none p-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-[10px] ml-1 text-slate-400 dark:text-slate-500 font-bold select-none">{suffix}</span>}
    </div>
  );
};

export const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  users, 
  currentGroup,
  onToggleCheck, 
  onDeleteItem,
  onAssignUser,
  onUpdateItem
}) => {
  const [comparingProduct, setComparingProduct] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  
  const groupedItems = useMemo(() => {
    const groups: Record<string, ProductItem[]> = {};
    CATEGORIES.forEach(cat => groups[cat] = []);
    items.forEach(item => {
      const cat = CATEGORIES.includes(item.category) ? item.category : 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const totalCost = items.reduce((acc, item) => acc + (item.estimatedPrice * item.quantity), 0);
  const checkedCost = items.filter(i => i.checked).reduce((acc, item) => acc + (item.estimatedPrice * item.quantity), 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Invite Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Mi Lista</h2>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <Share2 size={14} />
          <span>INVITAR AMIGOS</span>
        </button>
      </div>
      
      {/* Summary Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Total Estimado</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">${totalCost.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Comprado</p>
          <p className="text-2xl font-bold text-emerald-500">${checkedCost.toFixed(2)}</p>
        </div>
      </div>

      {Object.entries(groupedItems).map(([category, rawCategoryItems]) => {
        const categoryItems = rawCategoryItems as ProductItem[];
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">{category}</h3>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const assignedUser = users.find(u => u.id === item.assignedTo);
                
                return (
                  <div 
                    key={item.id} 
                    className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 ${item.checked ? 'bg-slate-50 dark:bg-slate-950/50 border-transparent opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 shadow-sm'}`}
                  >
                    <div className="flex items-center">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleCheck(item.id)}
                        className={`w-7 h-7 shrink-0 rounded-xl border-2 flex items-center justify-center mr-4 transition-all ${
                          item.checked 
                            ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-600 text-white rotate-0' 
                            : 'border-slate-200 dark:border-slate-700 text-transparent hover:border-emerald-400 dark:hover:border-emerald-500 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <Check size={16} strokeWidth={4} />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 mr-2">
                        <p className={`font-bold truncate text-base ${item.checked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.name}
                        </p>
                        
                        {/* Editable Fields */}
                        <div className="flex items-center space-x-2 mt-1.5">
                          <EditableNumberInput 
                            value={item.quantity}
                            onSave={(val) => onUpdateItem(item.id, { quantity: val })}
                            className="w-16"
                            min="1"
                            suffix="ud"
                          />
                          <EditableNumberInput 
                            value={item.estimatedPrice}
                            onSave={(val) => onUpdateItem(item.id, { estimatedPrice: val })}
                            className="w-20"
                            min="0"
                            step="0.01"
                            suffix="€"
                          />
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button 
                          onClick={() => setComparingProduct(item.name)}
                          className="p-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Comparar precios"
                        >
                          <TrendingDown size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteItem(item.id)}
                          className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: User assignment */}
                    <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2 relative">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">ASIGNADO A:</span>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setAssigningItemId(assigningItemId === item.id ? null : item.id)}
                            className={`flex items-center space-x-2 px-2 py-1 rounded-full text-[11px] font-bold text-white transition-all active:scale-95 ${assignedUser ? assignedUser.color : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            {assignedUser ? (
                              <>
                                <img src={assignedUser.avatar} className="w-4 h-4 rounded-full border border-white/50" alt="" />
                                <span>{assignedUser.name}</span>
                              </>
                            ) : (
                              <>
                                <UserIcon size={12} className={assignedUser ? "" : "text-slate-500 dark:text-slate-400"} />
                                <span className={assignedUser ? "" : "text-slate-500 dark:text-slate-400"}>Sin asignar</span>
                              </>
                            )}
                          </button>

                          {/* Assignment Dropdown */}
                          {assigningItemId === item.id && (
                            <>
                              {/* Backdrop to close when clicking outside */}
                              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setAssigningItemId(null)} />
                              
                              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col p-1">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-50 dark:border-slate-700/50 mb-1">
                                  Asignar a...
                                </div>
                                
                                <button
                                    onClick={() => { onAssignUser(item.id, undefined); setAssigningItemId(null); }}
                                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${!assignedUser ? 'bg-slate-50 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                      <UserIcon size={12} className="text-slate-400" />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Sin asignar</span>
                                    {!assignedUser && <Check size={14} className="ml-auto text-emerald-500"/>}
                                </button>

                                {users.map(u => (
                                    <button
                                      key={u.id}
                                      onClick={() => { onAssignUser(item.id, u.id); setAssigningItemId(null); }}
                                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${item.assignedTo === u.id ? 'bg-slate-50 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                  >
                                      <img src={u.avatar} className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 object-cover" />
                                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{u.name}</span>
                                      {item.assignedTo === u.id && <Check size={14} className="ml-auto text-emerald-500"/>}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {item.checked && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">EN CARRITO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {items.length === 0 && (
        <div className="text-center py-20 px-10">
          <div className="bg-slate-100 dark:bg-slate-900 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 border border-transparent dark:border-slate-800">
            <span className="text-5xl">📦</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">¡Tu despensa te llama!</h3>
          <p className="text-slate-500 mt-2">Empieza a añadir productos con el botón central o escanea una nota de papel.</p>
        </div>
      )}

      {comparingProduct && (
        <PriceComparisonModal 
          productName={comparingProduct} 
          onClose={() => setComparingProduct(null)} 
        />
      )}

      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)}
          groupName={currentGroup.name}
          groupId={currentGroup.id}
        />
      )}
    </div>
  );
};
