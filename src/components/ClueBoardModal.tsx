import React, { useState } from 'react';
import { Clue } from '../types';
import { Search, X, Pin, CheckCircle2, HelpCircle, Sparkles, FileText } from 'lucide-react';

interface ClueBoardModalProps {
  clues: Clue[];
  onClose: () => void;
}

export const ClueBoardModal: React.FC<ClueBoardModalProps> = ({ clues, onClose }) => {
  const [selectedClueId, setSelectedClueId] = useState<string>(clues[0]?.id || '');
  const selectedClue = clues.find((c) => c.id === selectedClueId) || clues[0];

  const solvedCount = clues.filter((c) => c.solved).length;
  const mysteryProgress = Math.round((clues.length / 10) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-700/60 text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Papan Penyelidikan & Misteri Cisini</h2>
              <p className="text-xs text-stone-400">
                Hubungkan petunjuk, catatan warga, dan rahasia Kapsul Waktu 1994
              </p>
            </div>
          </div>
          <button
            id="clue-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mystery Progress Tracker */}
        <div className="my-3 p-3 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-stone-200">
              Progres Pemecahan Misteri Kota:
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 bg-stone-900 h-2.5 rounded-full overflow-hidden border border-stone-700">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(10, mysteryProgress))}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {clues.length} / 10 Clue Terbuka
            </span>
          </div>
        </div>

        {/* Board Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto py-2">
          {/* Pinned Clues Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start overflow-y-auto pr-1">
            {clues.map((clue) => {
              const isSelected = selectedClue?.id === clue.id;

              return (
                <button
                  key={clue.id}
                  onClick={() => setSelectedClueId(clue.id)}
                  className={`p-4 rounded-2xl border text-left relative transition flex flex-col justify-between shadow-md ${
                    isSelected
                      ? 'bg-amber-100 text-stone-950 border-amber-500 ring-2 ring-amber-400'
                      : 'bg-stone-800/80 text-stone-200 border-stone-700 hover:border-stone-500'
                  }`}
                >
                  <Pin className={`w-4 h-4 absolute top-2 right-2 ${isSelected ? 'text-red-600 fill-red-600' : 'text-stone-500'}`} />

                  <div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      isSelected ? 'bg-amber-200 text-amber-900' : 'bg-stone-900 text-sky-400'
                    }`}>
                      {clue.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm mt-1.5 line-clamp-1">{clue.title}</h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-stone-700' : 'text-stone-400'}`}>
                      {clue.description}
                    </p>
                  </div>

                  <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isSelected ? 'border-amber-300 text-stone-600' : 'border-stone-700 text-stone-500'
                  }`}>
                    <span>{clue.discoveredAt}</span>
                    {clue.solved ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500">
                        <HelpCircle className="w-3.5 h-3.5" /> Menyelidiki
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Clue Inspection Card */}
          <div className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between">
            {selectedClue ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>CATATAN PENYELIDIKAN RESMI</span>
                </div>

                <h3 className="text-base font-bold text-amber-400">{selectedClue.title}</h3>

                <div className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-700">
                  <p>{selectedClue.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                  <span className="font-bold block mb-1">Dugaan & Petunjuk Lanjutan:</span>
                  <p>{selectedClue.notes}</p>
                </div>

                {selectedClue.relatedNPC && (
                  <div className="text-[11px] text-stone-400">
                    Tokoh Terkait: <span className="text-stone-200 font-semibold">{selectedClue.relatedNPC}</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-4 pt-3 border-t border-stone-700 text-center text-stone-400 text-xs italic">
              "Setiap warga kota Cisini memiliki potongan kecil dari cerita yang utuh."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
