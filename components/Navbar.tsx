
import React from 'react';
import { List, PlusCircle, PieChart } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-safe flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)] transition-colors duration-300">
      
      <button 
        onClick={() => onChangeView(AppView.LIST)}
        className={`flex flex-col items-center space-y-1 ${currentView === AppView.LIST ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <List size={24} strokeWidth={currentView === AppView.LIST ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Lista</span>
      </button>

      <button 
        onClick={() => onChangeView(AppView.SCANNER)}
        className="relative -top-5"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-black/30 transform transition-transform active:scale-95 ${currentView === AppView.SCANNER ? 'bg-indigo-600 ring-4 ring-white dark:ring-slate-800' : 'bg-emerald-600 hover:bg-emerald-500 ring-4 ring-white dark:ring-slate-900'}`}>
          <PlusCircle size={28} className="text-white" />
        </div>
      </button>

      <button 
        onClick={() => onChangeView(AppView.EXPENSES)}
        className={`flex flex-col items-center space-y-1 ${currentView === AppView.EXPENSES ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <PieChart size={24} strokeWidth={currentView === AppView.EXPENSES ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Gastos</span>
      </button>

    </div>
  );
};
