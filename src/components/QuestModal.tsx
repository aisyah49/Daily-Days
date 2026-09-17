import React, { useState } from 'react';
import { Quest } from '../types';
import { Scroll, CheckCircle2, Circle, X, Award, MapPin } from 'lucide-react';

interface QuestModalProps {
  quests: Quest[];
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ quests, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedQuestId, setSelectedQuestId] = useState<string>(quests[0]?.id || '');

  const filteredQuests = quests.filter((q) => {
    if (filter === 'active') return !q.completed;
    if (filter === 'completed') return q.completed;
    return true;
  });

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || filteredQuests[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Buku Catatan Misi & Kisah</h2>
              <p className="text-xs text-stone-400">Perjalanan dan cerita warga yang kamu bantu di Cisini</p>
            </div>
          </div>
          <button
            id="quest-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 py-3">
          {[
            { id: 'active', label: 'Misi Aktif' },
            { id: 'completed', label: 'Terselesaikan' },
            { id: 'all', label: 'Semua Misi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                filter === tab.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto py-2">
          {/* Quest List */}
          <div className="flex flex-col gap-2 md:border-r md:border-stone-800 md:pr-3 overflow-y-auto">
            {filteredQuests.map((quest) => (
              <button
                key={quest.id}
                onClick={() => setSelectedQuestId(quest.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedQuest?.id === quest.id
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                    : 'bg-stone-800/50 border-stone-700/50 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700">
                    {quest.category === 'main' ? 'Kisah Utama' : 'Kisah Warga'}
                  </span>
                  {quest.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold line-clamp-1">{quest.title}</h4>
              </button>
            ))}

            {filteredQuests.length === 0 && (
              <div className="text-center py-10 text-stone-500 text-xs">
                Tidak ada misi pada kategori ini.
              </div>
            )}
          </div>

          {/* Quest Detail Pane */}
          <div className="md:col-span-2 bg-stone-800/40 border border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between">
            {selectedQuest ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-amber-400 font-mono font-semibold uppercase">
                      {selectedQuest.category === 'main' ? '★ Kisah Utama Kota' : '◆ Cerita Sampingan'}
                    </span>
                    {selectedQuest.completed && (
                      <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-semibold">
                        Selesai
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-stone-100">{selectedQuest.title}</h3>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                    {selectedQuest.summary}
                  </p>
                </div>

                {/* Steps Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Langkah Penyelesaian:
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedQuest.steps.map((step, idx) => {
                      const isDone = step.completed || idx < selectedQuest.currentStepIndex;
                      const isCurrent = idx === selectedQuest.currentStepIndex && !selectedQuest.completed;

                      return (
                        <div
                          key={step.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-300'
                              : isCurrent
                              ? 'bg-amber-950/30 border-amber-600/60 text-amber-200 font-medium ring-1 ring-amber-500/30'
                              : 'bg-stone-900/40 border-stone-800 text-stone-500'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-amber-400' : 'text-stone-600'}`} />
                          )}
                          <span>{step.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards Info */}
                <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-700 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <Award className="w-4 h-4" />
                    <span>Hadiah & Dampak Cerita:</span>
                  </div>
                  <p className="text-stone-300">{selectedQuest.rewards.notes}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-500 text-xs">
                Pilih sebuah misi untuk melihat rincian langkah.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
