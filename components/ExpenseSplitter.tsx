
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProductItem, User, Settlement } from '../types';
import { ArrowRight, Wallet, CheckCircle2, Phone, CreditCard, ExternalLink } from 'lucide-react';

interface ExpenseSplitterProps {
  items: ProductItem[];
  users: User[];
  currentUser: User;
  settlements: Settlement[];
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({ 
  items, 
  users, 
  currentUser,
  settlements,
  onSettleDebt 
}) => {
  // Only calculate for checked items (items actually bought)
  const boughtItems = items.filter(item => item.checked);
  const totalSpent = boughtItems.reduce((acc, item) => acc + (item.estimatedPrice * item.quantity), 0);
  
  // 1. Calculate individual spending
  const userExpenses = useMemo(() => users.map(user => {
    let personalTotal = 0;
    
    boughtItems.forEach(item => {
      const itemCost = item.estimatedPrice * item.quantity;
      if (item.assignedTo === user.id) {
        personalTotal += itemCost;
      } else if (!item.assignedTo) {
        personalTotal += itemCost / (users.length || 1);
      }
    });

    return {
      id: user.id,
      name: user.name,
      value: personalTotal,
      color: user.color.replace('bg-', 'text-'),
      avatar: user.avatar,
      phoneNumber: user.phoneNumber
    };
  }), [users, boughtItems]);

  const myExpense = userExpenses.find(u => u.id === currentUser.id)?.value || 0;

  // 2. Calculate Debts (Who owes whom)
  const debts = useMemo(() => {
    if (totalSpent === 0 || users.length === 0) return [];

    const fairShare = totalSpent / users.length;
    
    // Calculate initial balance
    let balances = userExpenses.map(u => ({
      ...u,
      balance: u.value - fairShare
    }));

    // APPLY SETTLEMENTS (Adjust balances based on payments already made)
    settlements.forEach(settlement => {
      const payer = balances.find(b => b.id === settlement.fromUserId);
      const receiver = balances.find(b => b.id === settlement.toUserId);
      
      if (payer) payer.balance += settlement.amount; // Payer effectively "paid more" (reduced debt)
      if (receiver) receiver.balance -= settlement.amount; // Receiver "received money" (reduced credit)
    });

    // Separate debtors and creditors
    let debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    let creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    const transactions = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];

      // The amount to settle is the minimum of what debtor owes vs what creditor is owed
      let amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      transactions.push({
        from: debtor,
        to: creditor,
        amount: amount
      });

      // Adjust temp balances
      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return transactions;
  }, [userExpenses, totalSpent, users.length, settlements]);

  const handleBizum = (transaction: any) => {
    // 1. Mark as paid in the app
    onSettleDebt(transaction.from.id, transaction.to.id, transaction.amount);
    
    // 2. Open Bizum intent (Simulated via copying number or opening generic payment link if no real deep link exists)
    // Real Bizum deep links are bank-specific. We will simulate checking the number.
    if (transaction.to.phoneNumber) {
      // Copy to clipboard or try to open generic tel link
      navigator.clipboard.writeText(transaction.to.phoneNumber);
      alert(`Número ${transaction.to.phoneNumber} copiado. Abriendo aplicación de pagos...`);
      // In a real mobile app, this would be a deep link
      window.location.href = `tel:${transaction.to.phoneNumber}`;
    } else {
      alert("Pago registrado. (El usuario no tiene teléfono configurado para Bizum)");
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  return (
    <div className="pb-24 space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tu Gasto</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">${myExpense.toFixed(2)}</span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalSpent > 0 ? (myExpense / totalSpent) * 100 : 0}%` }}
                />
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Grupo</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">${totalSpent.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 mt-2">{users.length} miembros</span>
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
           <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
             <Wallet size={18} className="text-emerald-500" />
             Ajustar Cuentas
           </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {totalSpent === 0 ? (
             <div className="text-center py-6 text-slate-400">
               <p>No hay gastos marcados todavía.</p>
             </div>
          ) : debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-emerald-500">
              <CheckCircle2 size={48} className="mb-2 opacity-50" />
              <p className="font-bold">¡Todo cuadra!</p>
              <p className="text-xs text-slate-400">Todos han pagado lo justo o las deudas han sido saldadas.</p>
            </div>
          ) : (
            debts.map((t, idx) => {
              const iAmPayer = t.from.id === currentUser.id;
              const iAmReceiver = t.to.id === currentUser.id;
              
              return (
              <div key={idx} className={`flex flex-col p-3 rounded-xl border transition-all ${iAmPayer ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/50'}`}>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                     <div className="flex flex-col items-center min-w-[3rem]">
                        <img src={t.from.avatar} className="w-8 h-8 rounded-full mb-1 border border-slate-200 dark:border-slate-700" alt="" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[4rem]">{iAmPayer ? 'Tú' : t.from.name}</span>
                     </div>

                     <div className="flex-1 flex flex-col items-center">
                        <ArrowRight size={16} className="text-slate-300" />
                     </div>

                     <div className="flex flex-col items-center min-w-[3rem]">
                        <img src={t.to.avatar} className="w-8 h-8 rounded-full mb-1 border border-slate-200 dark:border-slate-700" alt="" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[4rem]">{iAmReceiver ? 'Ti' : t.to.name}</span>
                     </div>
                  </div>

                  <div className="text-right min-w-[4rem]">
                     <span className="block font-black text-lg text-slate-800 dark:text-white">${t.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions for Payer */}
                {iAmPayer && (
                   <div className="mt-2 flex gap-2">
                     {t.to.phoneNumber ? (
                       <button 
                         onClick={() => handleBizum(t)}
                         className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                       >
                         <Phone size={12} className="fill-white" />
                         Hacer Bizum
                       </button>
                     ) : (
                       <button 
                         disabled
                         className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed"
                         title="El usuario no tiene teléfono configurado"
                       >
                         <Phone size={12} />
                         No tiene Bizum
                       </button>
                     )}
                     
                     <button 
                        onClick={() => onSettleDebt(t.from.id, t.to.id, t.amount)}
                        className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                     >
                       <CheckCircle2 size={12} />
                       Marcar pagado
                     </button>
                   </div>
                )}
              </div>
            )})
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-80">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">Desglose Actual</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={userExpenses}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {userExpenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`} 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
