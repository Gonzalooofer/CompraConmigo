
import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { analyzeImageOrText, fileToGenerativePart } from '../services/geminiService';
import { ProductItem } from '../types';
import { v4 as uuidv4 } from 'uuid'; 

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ScannerProps {
  onAddItems: (items: ProductItem[]) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onAddItems, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToGenerativePart(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error("Error reading file", error);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!inputText && !selectedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageOrText(inputText, selectedImage || undefined);
      
      const newItems: ProductItem[] = result.items.map(item => ({
        id: generateId(),
        name: item.name,
        category: item.category,
        estimatedPrice: item.estimatedPrice,
        quantity: item.quantity,
        checked: false,
        assignedTo: undefined // Unassigned initially
      }));

      onAddItems(newItems);
      onClose();
    } catch (error) {
      alert("Lo siento, hubo un error procesando tu solicitud. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Agregar Productos</h2>
        <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 mb-2">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">IA Scanner</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Escribe una lista rápida (ej: "tomates, pasta y vino") o sube una foto de tu despensa o ticket.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe aquí productos, recetas o pega un texto..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-32 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {selectedImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={`data:image/jpeg;base64,${selectedImage}`} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">Cambiar Imagen</span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
                  <Camera size={24} />
                </div>
                <p className="font-medium text-slate-600 dark:text-slate-300">Toca para tomar foto</p>
                <p className="text-xs text-slate-500 mt-1">Escanea tickets o estantes</p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-area-pb">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!inputText && !selectedImage)}
          className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-bold text-lg shadow-lg transition-all ${
            isAnalyzing || (!inputText && !selectedImage)
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200 dark:shadow-indigo-900/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Procesar con Gemini</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
