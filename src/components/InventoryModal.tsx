import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Briefcase, 
  X, 
  BookOpen, 
  Map as MapIcon, 
  Key, 
  Music, 
  Search, 
  CheckCircle,
  Package
} from 'lucide-react';

interface InventoryModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onUseItem?: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  items,
  onClose,
  onUseItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'quest' | 'mystery'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(items[0] || null);
  const [examiningText, setExaminingText] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return <BookOpen className="w-6 h-6 text-amber-400" />;
      case 'map': return <MapIcon className="w-6 h-6 text-teal-400" />;
      case 'key': return <Key className="w-6 h-6 text-yellow-400" />;
      case 'music': return <Music className="w-6 h-6 text-pink-400" />;
      case 'clue': return <Search className="w-6 h-6 text-sky-400" />;
      default: return <Package className="w-6 h-6 text-stone-300" />;
    }
  };

  const handleExamine = (item: InventoryItem) => {
    if (item.examineText) {
      setExaminingText(item.examineText);
    } else {
      setExaminingText(item.description);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Tas & Inventori Pemain</h2>
              <p className="text-xs text-stone-400">{items.length} benda tersimpan dalam saku</p>
            </div>
          </div>
          <button
            id="inventory-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 py-3">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'general', label: 'Barang Umum' },
            { id: 'quest', label: 'Benda Misi' },
            { id: 'mystery', label: 'Petunjuk Misteri' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id as any);
                setExaminingText(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto py-2">
          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-2.5 content-start">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setExaminingText(null);
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition relative text-center group ${
                  selectedItem?.id === item.id
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                }`}
              >
                <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-700 group-hover:scale-105 transition">
                  {getItemIcon(item.iconName)}
                </div>
                <span className="text-[11px] font-semibold leading-tight line-clamp-1 w-full">
                  {item.name}
                </span>
                {item.quantity > 1 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-stone-900 px-1.5 py-0.5 rounded-full border border-stone-700 font-mono">
                    x{item.quantity}
                  </span>
                )}
              </button>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-3 text-center py-10 text-stone-500 text-xs">
                Tidak ada benda dalam kategori ini.
              </div>
            )}
          </div>

          {/* Item Details Pane */}
          <div className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-4 flex flex-col justify-between">
            {selectedItem ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-stone-900 border border-stone-700">
                    {getItemIcon(selectedItem.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-400 text-base">{selectedItem.name}</h3>
                    <span className="text-[10px] bg-stone-900 text-stone-400 px-2 py-0.5 rounded border border-stone-700 font-mono">
                      Kategori: {selectedItem.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {selectedItem.description}
                </p>

                {examiningText && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 animate-in fade-in">
                    <span className="font-bold block mb-1">Catatan Pemeriksaan:</span>
                    {examiningText}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500 text-xs">
                Pilih sebuah benda untuk melihat detailnya.
              </div>
            )}

            {selectedItem && (
              <div className="flex gap-2 pt-3 border-t border-stone-700/60 mt-3">
                <button
                  onClick={() => handleExamine(selectedItem)}
                  className="flex-1 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold transition"
                >
                  Periksa Benda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
