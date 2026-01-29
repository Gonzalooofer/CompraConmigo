
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProductItem, User } from '../types';
import { ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

interface ExpenseSplitterProps {
  items: ProductItem[];
  users: User[];
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({ items, users }) => {
  // Only calculate for checked items (items actually bought)
  const boughtItems = items.filter(item => item.checked);
  const totalSpent = boughtItems.reduce((acc, item) => acc + (item.estimatedPrice * item.quantity), 0);
  
  // 1. Calculate individual spending
  const userExpenses = useMemo(() => users.map(user => {
    let personalTotal = 0;
    
    // Logic: 
    // If assigned to user -> user pays full price.
    // If unassigned -> cost is split among all group members.
    
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
      avatar: user.avatar
    };
  }), [users, boughtItems]);

  // 2. Calculate Debts (Who owes whom)
  // Assumption: The goal is for everyone to contribute equally to the total pot (fair share), 
  // adjusted by what they actually paid.
  // Note: For a more complex model where specific items are assigned to specific people and *only* they pay for it,
  // the logic is different. Here we assume "Expense Splitter" means "Equalizing the load".
  
  const debts = useMemo(() => {
    if (totalSpent === 0 || users.length === 0) return [];

    const fairShare = totalSpent / users.length;
    
    // Calculate balance: Positive = Paid too much (Receive), Negative = Paid too little (Owe)
    let balances = userExpenses.map(u => ({
      ...u,
      balance: u.value - fairShare
    }));

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

      // Move indices if settled (using epsilon for float precision)
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return transactions;
  }, [userExpenses, totalSpent, users.length]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  return (
    <div className="pb-24 space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 font-medium mb-1 uppercase text-xs tracking-wider">Total Gastado</p>
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">${totalSpent.toFixed(2)}</h2>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
           <span>{users.length > 0 ? (totalSpent / users.length).toFixed(2) : 0} $ / persona</span>
        </div>
      </div>

      {/* Debts Section (New) */}
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
              <p className="text-xs text-slate-400">Todos han pagado lo mismo.</p>
            </div>
          ) : (
            debts.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3 flex-1">
                   {/* Payer */}
                   <div className="flex flex-col items-center min-w-[3rem]">
                      <img src={t.from.avatar} className="w-8 h-8 rounded-full mb-1 border border-slate-200 dark:border-slate-700" alt="" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[4rem]">{t.from.name}</span>
                   </div>

                   {/* Direction */}
                   <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 mb-1">paga a</span>
                      <ArrowRight size={16} className="text-slate-300" />
                   </div>

                   {/* Receiver */}
                   <div className="flex flex-col items-center min-w-[3rem]">
                      <img src={t.to.avatar} className="w-8 h-8 rounded-full mb-1 border border-slate-200 dark:border-slate-700" alt="" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[4rem]">{t.to.name}</span>
                   </div>
                </div>

                {/* Amount */}
                <div className="pl-4 border-l border-slate-200 dark:border-slate-700 ml-2 text-right min-w-[4rem]">
                   <span className="block font-black text-lg text-slate-800 dark:text-emerald-400">${t.amount.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
           Calculado para repartir el gasto total equitativamente.
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
