
import React, { useState, useEffect } from 'react';
import { X, Store, AlertCircle, Loader2, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { PriceComparisonResult } from '../types';

interface PriceComparisonModalProps {
  productName: string;
  onClose: () => void;
}

// Reutilizamos lógica simple para estimar el precio base y generar variaciones
const getBasePrice = (name: string): number => {
    const lower = name.toLowerCase();
    if (lower.includes('aceite')) return 8.50;
    if (lower.includes('pollo')) return 6.50;
    if (lower.includes('carne') || lower.includes('ternera')) return 9.90;
    if (lower.includes('pescado') || lower.includes('salmon')) return 10.50;
    if (lower.includes('detergente')) return 9.90;
    if (lower.includes('vino')) return 5.50;
    if (lower.includes('cafe')) return 3.80;
    if (lower.includes('leche')) return 1.05;
    return 2.50; // Fallback promedio
};

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({ productName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PriceComparisonResult | null>(null);

  useEffect(() => {
    // Simulamos una búsqueda en tiempo real
    const fetchMockData = () => {
      setTimeout(() => {
        const basePrice = getBasePrice(productName);
        
        // Generar variaciones realistas alrededor del precio base
        // Math.random() - 0.5 genera un número entre -0.5 y 0.5
        // Multiplicado por basePrice * 0.2 da una variación del 20%
        const getVariation = () => basePrice + (Math.random() - 0.5) * (basePrice * 0.3);

        const mockResult: PriceComparisonResult = {
          product: productName,
          comparisons: [
            { 
                store: 'Mercadona', 
                price: parseFloat(getVariation().toFixed(2)), 
                note: 'Marca Hacendado' 
            },
            { 
                store: 'Carrefour', 
                price: parseFloat(getVariation().toFixed(2)), 
                note: 'Promoción 3x2' 
            },
            { 
                store: 'Lidl', 
                price: parseFloat((getVariation() * 0.95).toFixed(2)), // Lidl suele ser algo más barato en la simulación
                note: 'Oferta semanal' 
            },
            { 
                store: 'Dia', 
                price: parseFloat(getVariation().toFixed(2)), 
                note: 'Club Dia' 
            }
          ]
        };
        
        // Ordenar simuladamente (aunque el frontend ya calcula el mejor)
        mockResult.comparisons.sort((a, b) => a.price - b.price);
        
        setData(mockResult);
        setLoading(false);
      }, 1500); // 1.5s de carga para dar sensación de "búsqueda"
    };
    fetchMockData();
  }, [productName]);

  const bestPrice = data?.comparisons.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
  const worstPrice = data?.comparisons.reduce((prev, curr) => prev.price > curr.price ? prev : curr);
  
  const savings = bestPrice && worstPrice ? (worstPrice.price - bestPrice.price).toFixed(2) : '0';

  const getSearchUrl = (store: string, product: string) => {
    const query = encodeURIComponent(`comprar ${product} ${store} precio`);
    return `https://www.google.com/search?q=${query}&tbm=shop`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Comparador
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full uppercase">Simulado</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Store size={16} className="text-emerald-500 opacity-50" />
                </div>
              </div>
              <p className="text-slate-500 text-sm animate-pulse font-medium">Consultando supermercados...</p>
            </div>
          ) : data ? (
            <div className="space-y-5">
              
              {/* Savings Banner */}
              <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold opacity-80 uppercase mb-0.5">Ahorro Potencial</p>
                    <p className="text-2xl font-black">{savings}€</p>
                </div>
                <div className="bg-white/20 p-2 rounded-xl">
                    <TrendingDown size={24} />
                </div>
              </div>

              <div className="space-y-3">
                {data.comparisons.map((item, idx) => {
                   const isBest = item === bestPrice;
                   const isWorst = item === worstPrice;
                   
                   return (
                    <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                        isBest 
                        ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20 shadow-md relative overflow-hidden' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                    >
                    {isBest && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                            MEJOR OPCIÓN
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isBest ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                            <Store size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.store}</p>
                            <p className="text-xs text-slate-500">{item.note}</p>
                        </div>
                        </div>
                        <div className="text-right mt-2">
                        <p className={`text-xl font-black ${isBest ? 'text-emerald-600 dark:text-emerald-400' : isWorst ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.price.toFixed(2)}€
                        </p>
                        </div>
                    </div>
                    
                    <a 
                        href={getSearchUrl(item.store, productName)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center space-x-2 w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                        isBest 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100' 
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        <ExternalLink size={12} />
                        <span>Verificar en web</span>
                    </a>
                    </div>
                )})}
              </div>
              
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start space-x-2">
                <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Los precios mostrados son estimaciones generadas automáticamente basadas en medias del mercado para demostración.
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
