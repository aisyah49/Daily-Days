import React, { useState } from 'react';
import { NPCData, TimeOfDay } from '../types';
import { Users, X, Heart, Clock, Home, Lock, Unlock } from 'lucide-react';

interface RelationshipModalProps {
  npcs: Record<string, NPCData>;
  relationships: Record<string, number>;
  currentPeriod: TimeOfDay;
  activeCompanionId?: string | null;
  onSetCompanion?: (npcId: string | null) => void;
  onGiveGift?: (npcId: string) => void;
  onClose: () => void;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  npcs,
  relationships,
  currentPeriod,
  activeCompanionId,
  onSetCompanion,
  onGiveGift,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'romance' | 'female' | 'male'>('all');
  const [selectedNpcId, setSelectedNpcId] = useState<string>('nadia');
  const selectedNpc = npcs[selectedNpcId] || Object.values(npcs)[0];
  const score = relationships[selectedNpc?.id] ?? selectedNpc?.relationship ?? 15;

  const filteredNpcList = (Object.values(npcs) as NPCData[]).filter((npc) => {
    if (filter === 'romance') return !!npc.canRomance;
    if (filter === 'female') return npc.gender === 'female';
    if (filter === 'male') return npc.gender === 'male';
    return true;
  });

  const getRelationshipTier = (score: number, canRomance?: boolean) => {
    if (score >= 80) {
      return canRomance
        ? { title: 'Kekasih Hati / Pasangan Idaman', color: 'text-rose-400 bg-rose-950/70 border-rose-600' }
        : { title: 'Sahabat Karib Terpercaya', color: 'text-pink-400 bg-pink-950/60 border-pink-700' };
    }
    if (score >= 50) {
      return canRomance
        ? { title: 'Teman Dekat Spesial (Saling Naksir)', color: 'text-pink-400 bg-pink-950/60 border-pink-700' }
        : { title: 'Teman Akrab', color: 'text-amber-400 bg-amber-950/60 border-amber-700' };
    }
    if (score >= 25) return { title: 'Tetangga Baik & Ramah', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700' };
    return { title: 'Kenalan Baru', color: 'text-stone-400 bg-stone-800 border-stone-700' };
  };

  const tier = getRelationshipTier(score, selectedNpc?.canRomance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-950/80 border border-pink-700/60 text-pink-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Buku Warga & Hubungan Sosial</h2>
              <p className="text-xs text-stone-400">Tingkat keakraban dan kehidupan sehari-hari penduduk Cisini</p>
            </div>
          </div>
          <button
            id="relationship-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto py-3">
          {/* NPC Roster */}
          <div className="flex flex-col gap-2 md:border-r md:border-stone-800 md:pr-3 overflow-y-auto">
            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-[10px] font-semibold text-center mb-1">
              <button
                onClick={() => setFilter('all')}
                className={`py-1 rounded-lg transition ${filter === 'all' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('romance')}
                className={`py-1 rounded-lg transition ${filter === 'romance' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-stone-400 hover:text-rose-300'}`}
              >
                Romansa
              </button>
              <button
                onClick={() => setFilter('female')}
                className={`py-1 rounded-lg transition ${filter === 'female' ? 'bg-pink-950 text-pink-300 border border-pink-800' : 'text-stone-400 hover:text-pink-300'}`}
              >
                Cewe
              </button>
              <button
                onClick={() => setFilter('male')}
                className={`py-1 rounded-lg transition ${filter === 'male' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-stone-400 hover:text-blue-300'}`}
              >
                Cowo
              </button>
            </div>

            {filteredNpcList.map((npc) => {
              const rel = relationships[npc.id] ?? npc.relationship;
              const isSelected = selectedNpc?.id === npc.id;

              return (
                <button
                  key={npc.id}
                  onClick={() => setSelectedNpcId(npc.id)}
                  className={`p-2.5 rounded-2xl border flex items-center gap-3 transition text-left ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-500/60 text-pink-300'
                      : 'bg-stone-800/40 border-stone-700/50 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border border-stone-700 font-bold text-xs relative"
                    style={{ backgroundColor: npc.appearance.shirtColor }}
                  >
                    <span className="text-stone-900 bg-white/80 px-1 py-0.5 rounded text-[10px]">
                      {npc.name.slice(0, 2).toUpperCase()}
                    </span>
                    {npc.canRomance && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-xs">
                        ♥
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate flex items-center gap-1">
                        <span>{npc.name}</span>
                        {npc.gender === 'female' ? (
                          <span className="text-[10px] text-pink-400 font-normal">♀</span>
                        ) : npc.gender === 'male' ? (
                          <span className="text-[10px] text-blue-400 font-normal">♂</span>
                        ) : null}
                      </h4>
                      <span className="text-[10px] flex items-center gap-0.5 text-pink-400 font-semibold">
                        <Heart className="w-3 h-3 fill-pink-400" />
                        {rel}%
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">{npc.role}</p>
                    {npc.jobPlace && (
                      <p className="text-[9px] text-emerald-400/80 truncate">📍 {npc.jobPlace}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* NPC Detailed Profile */}
          <div className="md:col-span-2 bg-stone-800/40 border border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between">
            {selectedNpc ? (
              <div className="flex flex-col gap-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-pink-400/80 shadow-md shrink-0 relative"
                    style={{ backgroundColor: selectedNpc.appearance.shirtColor }}
                  >
                    <div
                      className="w-9 h-9 rounded-full border border-stone-800"
                      style={{ backgroundColor: selectedNpc.appearance.skinColor }}
                    />
                    {selectedNpc.canRomance && (
                      <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold shadow-xs">
                        ♥ Dekati
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                      <span>{selectedNpc.name}</span>
                      {selectedNpc.gender === 'female' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-700 text-pink-300 font-medium">
                          Perempuan (Cewe)
                        </span>
                      ) : selectedNpc.gender === 'male' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-700 text-blue-300 font-medium">
                          Laki-laki (Cowo)
                        </span>
                      ) : null}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {selectedNpc.role} • Usia {selectedNpc.age} tahun
                    </p>
                    {selectedNpc.jobPlace && (
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">
                        🏢 Tempat Kerja: <span className="text-stone-200">{selectedNpc.jobPlace}</span>
                      </p>
                    )}
                    <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border mt-1 font-semibold ${tier.color}`}>
                      {tier.title}
                    </span>
                  </div>
                </div>

                {/* Affinity Bar */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-700">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-stone-300">Tingkat Kepercayaan Warga:</span>
                    <span className="text-pink-400 font-mono">{score} / 100</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                    />
                  </div>
                </div>

                {/* Bio & Personality */}
                <div className="text-xs text-stone-300 leading-relaxed bg-stone-900/40 p-3 rounded-xl border border-stone-800">
                  <p><strong>Kepribadian:</strong> {selectedNpc.personality}</p>
                  <p className="mt-1"><strong>Tentang:</strong> {selectedNpc.description}</p>
                </div>

                {/* Daily Routine based on time */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Rutinitas Saat Ini ({currentPeriod}):</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
                    <span className="font-bold">{selectedNpc.schedule[currentPeriod].locationName}: </span>
                    {selectedNpc.schedule[currentPeriod].activity}
                  </div>
                </div>

                {/* Secret lore unlocked at higher affinity */}
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-700 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {score >= 25 ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Rahasia yang Dibisikkan:</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-stone-500" />
                        <span className="text-stone-400">Rahasia Terkunci (Butuh Hubungan &ge; 25%):</span>
                      </>
                    )}
                  </div>
                  <p className="text-stone-300 italic">
                    {score >= 25 ? selectedNpc.secretInfo : 'Tingkatkan keakraban dengan berbicara dan membantu misinya.'}
                  </p>
                </div>

                {/* Social Actions: Companion & Gift */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-800">
                  {onSetCompanion && (
                    <button
                      onClick={() => {
                        if (activeCompanionId === selectedNpc.id) {
                          onSetCompanion(null);
                        } else {
                          onSetCompanion(selectedNpc.id);
                        }
                      }}
                      disabled={score < 20}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        activeCompanionId === selectedNpc.id
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : score >= 20
                          ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/20'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>
                        {activeCompanionId === selectedNpc.id
                          ? 'Sudahi Jalan Bareng'
                          : score >= 20
                          ? 'Ajak Jalan Bareng (Teman Jalan)'
                          : 'Ajak Jalan (Butuh Hubungan &ge; 20%)'}
                      </span>
                    </button>
                  )}

                  {onGiveGift && (
                    <button
                      onClick={() => onGiveGift(selectedNpc.id)}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Beri Hadiah (+Keakraban)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
