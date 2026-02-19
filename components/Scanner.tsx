
import React, { useState } from 'react';
import { X, Loader2, ListPlus, Wand2 } from 'lucide-react';
import { ProductItem } from '../types';
import { v4 as uuidv4 } from 'uuid'; 

interface ScannerProps {
  onAddItems: (items: ProductItem[]) => void;
  onClose: () => void;
}

// Base de datos ficticia de precios comunes
const MOCK_PRICES_DB: Record<string, { price: number; category: string }> = {
  'leche': { price: 1.05, category: 'Lácteos y Huevos' },
  'huevos': { price: 2.40, category: 'Lácteos y Huevos' },
  'pan': { price: 0.95, category: 'Despensa' },
  'arroz': { price: 1.30, category: 'Despensa' },
  'pasta': { price: 1.10, category: 'Despensa' },
  'pollo': { price: 6.50, category: 'Carnicería y Pescadería' },
  'carne': { price: 8.90, category: 'Carnicería y Pescadería' },
  'pescado': { price: 9.50, category: 'Carnicería y Pescadería' },
  'atun': { price: 3.20, category: 'Despensa' },
  'tomate': { price: 1.99, category: 'Frutas y Verduras' },
  'patatas': { price: 2.50, category: 'Frutas y Verduras' },
  'cebolla': { price: 1.20, category: 'Frutas y Verduras' },
  'platanos': { price: 1.85, category: 'Frutas y Verduras' },
  'manzana': { price: 2.10, category: 'Frutas y Verduras' },
  'cerveza': { price: 0.70, category: 'Bebidas' },
  'vino': { price: 5.50, category: 'Bebidas' },
  'agua': { price: 0.60, category: 'Bebidas' },
  'refresco': { price: 1.50, category: 'Bebidas' },
  'aceite': { price: 8.50, category: 'Despensa' },
  'cafe': { price: 3.80, category: 'Despensa' },
  'papel': { price: 4.50, category: 'Limpieza' },
  'detergente': { price: 9.90, category: 'Limpieza' },
  'jabon': { price: 2.50, category: 'Cuidado Personal' },
  'champu': { price: 3.20, category: 'Cuidado Personal' }
};

export const Scanner: React.FC<ScannerProps> = ({ onAddItems, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getEstimatedData = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Buscar coincidencia parcial en la base de datos
    const foundKey = Object.keys(MOCK_PRICES_DB).find(key => lowerName.includes(key));
    
    if (foundKey) {
      return MOCK_PRICES_DB[foundKey];
    }

    // Si no encuentra nada, generar datos aleatorios verosímiles
    return {
      price: parseFloat((Math.random() * (8 - 1) + 1).toFixed(2)),
      category: 'Otros'
    };
  };

  const handleAddManual = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // Simulamos un tiempo de "pensado"
    setTimeout(() => {
      const lines = inputText.split(/[\n,]+/).filter(line => line.trim().length > 0);
      
      const newItems: ProductItem[] = lines.map(line => {
        const name = line.trim();
        const { price, category } = getEstimatedData(name);

        return {
          id: uuidv4(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category: category,
          estimatedPrice: price, // Precio automático ficticio
          quantity: 1,
          checked: false,
          assignedTo: undefined
        };
      });

      onAddItems(newItems);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Agregar productos</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg mb-2 shadow-indigo-200 dark:shadow-indigo-900/50">
            <Wand2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Asistente Inteligente</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-6">
            Escribe tu lista. Nosotros detectamos automáticamente la categoría y estimamos el precio.
          </p>
        </div>

        <div className="relative">
            <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ej: Leche, 2kg de Patatas, Aceite de oliva..."
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-48 text-slate-800 dark:text-slate-200 font-medium shadow-inner"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                AUTO-PRECIO ACTIVADO
            </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-area-pb">
        <button
          onClick={handleAddManual}
          disabled={isProcessing || !inputText.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Calculando precios...</span>
            </>
          ) : (
            <>
              <ListPlus size={20} />
              <span>Generar Lista</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
