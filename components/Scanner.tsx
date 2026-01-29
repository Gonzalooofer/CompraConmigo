
import React, { useState } from 'react';
import { X, Loader2, ListPlus } from 'lucide-react';
import { ProductItem } from '../types';
import { v4 as uuidv4 } from 'uuid'; 

interface ScannerProps {
  onAddItems: (items: ProductItem[]) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onAddItems, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddManual = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // Procesamiento local simple
    setTimeout(() => {
      const lines = inputText.split(/[\n,]+/).filter(line => line.trim().length > 0);
      
      const newItems: ProductItem[] = lines.map(line => {
        const name = line.trim();
        return {
          id: uuidv4(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category: 'Otros',
          estimatedPrice: 0,
          quantity: 1,
          checked: false,
          assignedTo: undefined
        };
      });

      onAddItems(newItems);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Agregar a la lista</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg mb-2">
            <ListPlus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Añadir múltiples productos</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Escribe los nombres separados por comas o líneas.
          </p>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ej: Leche, Huevos, Pan..."
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-48 text-slate-800 dark:text-slate-200 font-medium"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleAddManual}
          disabled={isProcessing || !inputText.trim()}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <span>Añadir productos</span>}
        </button>
      </div>
    </div>
  );
};
