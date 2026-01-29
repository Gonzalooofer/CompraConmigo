
import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Loader2, ListPlus } from 'lucide-react';
import { ProductItem } from '../types';
import { v4 as uuidv4 } from 'uuid'; 

interface ScannerProps {
  onAddItems: (items: ProductItem[]) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onAddItems, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    
    // Simulamos un pequeño retraso de procesamiento local
    setTimeout(() => {
      // Lógica de procesamiento local simple:
      // Separar por líneas o por comas
      const lines = inputText.split(/[\n,]+/).filter(line => line.trim().length > 0);
      
      const newItems: ProductItem[] = lines.map(line => {
        const name = line.trim();
        return {
          id: uuidv4(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category: 'Otros', // Categoría por defecto
          estimatedPrice: 0,
          quantity: 1,
          checked: false,
          assignedTo: undefined
        };
      });

      onAddItems(newItems);
      setIsAnalyzing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Agregar Productos</h2>
        <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg mb-2">
            <ListPlus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Añadir Lista</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Escribe los productos separados por comas o saltos de línea.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ej: Leche, Huevos, Pan, Detergente..."
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-48 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 font-medium"
          />
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-area-pb">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
          className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-bold text-lg shadow-lg transition-all ${
            isAnalyzing || !inputText.trim()
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-200 dark:shadow-emerald-900/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <span>Añadir a la Lista</span>
          )}
        </button>
      </div>
    </div>
  );
};
