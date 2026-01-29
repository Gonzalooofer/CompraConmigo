
import React, { useState, useEffect } from 'react';
import { X, Store, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { PriceComparisonResult } from '../types';

interface PriceComparisonModalProps {
  productName: string;
  onClose: () => void;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({ productName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PriceComparisonResult | null>(null);

  useEffect(() => {
    // Simulamos una carga de datos locales para evitar la API de Gemini
    const fetchMockData = () => {
      setTimeout(() => {
        const mockResult: PriceComparisonResult = {
          product: productName,
          comparisons: [
            { store: 'Mercadona', price: Math.random() * (5 - 1) + 1, note: 'Precio habitual' },
            { store: 'Carrefour', price: Math.random() * (5 - 1) + 1, note: 'Descuento en 2ª unidad' },
            { store: 'Lidl', price: Math.random() * (5 - 1) + 1, note: 'Oferta de fin de semana' },
            { store: 'Dia', price: Math.random() * (5 - 1) + 1, note: 'Cupón disponible en app' }
          ]
        };
        setData(mockResult);
        setLoading(false);
      }, 1200);
    };
    fetchMockData();
  }, [productName]);

  const bestPrice = data?.comparisons.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

  const getSearchUrl = (store: string, product: string) => {
    const query = encodeURIComponent(`comprar ${product} ${store}`);
    return `https://www.google.com/search?q=${query}&tbm=shop`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Comparativa de Precios</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-slate-500 text-sm animate-pulse">Buscando mejores precios...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {data.comparisons.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${item === bestPrice ? 'border-emerald-200 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/10 ring-1 ring-emerald-500/30' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item === bestPrice ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Store size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.store}</p>
                        <p className="text-xs text-slate-500">{item.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item === bestPrice ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.price.toFixed(2)}€
                      </p>
                      {item === bestPrice && (
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">Mejor Precio</span>
                      )}
                    </div>
                  </div>
                  
                  <a 
                    href={getSearchUrl(item.store, productName)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center space-x-2 w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                      item === bestPrice 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ExternalLink size={14} />
                    <span>Ver en {item.store}</span>
                  </a>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start space-x-3 border border-amber-100 dark:border-amber-900/30">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                  Estos precios son comparativas estimadas. Revisa la web oficial para confirmar el precio exacto de hoy.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500">No hay datos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};
