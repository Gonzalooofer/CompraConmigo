
import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ListPlus, Wand2, Camera } from 'lucide-react';
import { ProductItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { translations } from '../translations';
// NOTE: html5-qrcode is added as a dependency (npm install html5-qrcode)
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onAddItems: (items: ProductItem[]) => void;
  onClose: () => void;
  language: string;
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

export const Scanner: React.FC<ScannerProps> = ({ onAddItems, onClose, language }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanningQR, setScanningQR] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

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

  const onScanSuccess = (decodedText: string) => {
    // treat decoded text as product name
    const name = decodedText.trim();
    if (name) {
      const { price, category } = getEstimatedData(name);
      const item: ProductItem = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        category,
        estimatedPrice: price,
        quantity: 1,
        checked: false,
        assignedTo: undefined
      };
      onAddItems([item]);
    }
    // stop scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanningQR(false);
    onClose();
  };

  const onScanError = (err: any) => {
    console.warn('QR scan error', err);
  };

  const startQR = () => {
    setScanningQR(true);
    const config = { fps: 10, qrbox: 250 };
    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);
    scannerRef.current.render(onScanSuccess, onScanError);
  };

  const stopQR = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanningQR(false);
  };
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{translations[language]?.addProducts || 'Agregar productos'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Escribe una lista y nosotros hacemos el resto</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-indigo-200 dark:hover:bg-slate-700 rounded-full transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
            <Wand2 size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{translations[language]?.smartAssistant || 'Asistente Inteligente'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm px-4 mt-2 leading-relaxed">
              ✨ Escribe tu lista. Nosotros detectamos automáticamente la categoría y estimamos el precio basándonos en la media de mercado.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs px-4 -mt-1">
              {translations[language]?.scanQRDesc || 'Escanea el código de un producto para añadirlo automáticamente'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">💡 Consejo: Separa los productos con comas o líneas nuevas para mejor detección</p>
        </div>

        {!scanningQR ? (
          <>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoFocus
                placeholder="Ej: Leche, 2kg de Patatas, Aceite de oliva, Pan integral..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none h-48 text-slate-800 dark:text-slate-200 font-medium shadow-inner transition-all"
              />
              <div className="absolute top-3 right-3 text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                <span>PRECIO AUTO</span>
              </div>
              <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
                {inputText.split(/[\n,]+/).filter(line => line.trim().length > 0).length} productos
              </div>
            </div>

            <button
              onClick={startQR}
              className="mt-4 w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-800 transition-all"
            >
              <Camera size={18} />
              {translations[language]?.scanQR || 'Escanear QR'}
            </button>
          </>
        ) : (
          <div className="relative">
            <div id="qr-reader" className="w-full" />
            <button
              onClick={stopQR}
              className="absolute top-2 right-2 p-2 bg-red-100 dark:bg-red-800 rounded-full"
            >
              <X size={20} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 safe-area-pb">
        <button
          onClick={handleAddManual}
          disabled={isProcessing || !inputText.trim()}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{translations[language]?.analyze || 'Analizando...'}</span>
            </>
          ) : (
            <>
              <ListPlus size={20} />
              <span>{translations[language]?.generateList || 'Generar Lista'}</span>
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {translations[language]?.cancel || 'Cancelar'}
        </button>
      </div>
    </div>
  );
};
