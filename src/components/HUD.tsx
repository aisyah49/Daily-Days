import React from 'react';
import { TimeState, Quest, InteractionTarget } from '../types';
import { 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Sunrise, 
  Briefcase, 
  Scroll, 
  Search, 
  Map as MapIcon, 
  Users, 
  Volume2, 
  VolumeX, 
  Menu,
  FastForward,
  User,
  Coins,
  Zap,
  Home,
  UtensilsCrossed,
  MapPin,
  Heart
} from 'lucide-react';

interface HUDProps {
  time: TimeState;
  activeQuest: Quest | null;
  interactionTarget: InteractionTarget | null;
  coins: number;
  energy: number;
  maxEnergy: number;
  currentZone: 'town' | 'kosan' | 'warung';
  companionName?: string | null;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenClues: () => void;
  onOpenMap: () => void;
  onOpenRelationships: () => void;
  onOpenJobs: () => void;
  onOpenCustomize?: () => void;
  onOpenPause: () => void;
  onInteract: () => void;
  onForwardTime: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playerPosition: [number, number, number];
  playerRotation: number;
}

export const HUD: React.FC<HUDProps> = ({
  time,
  activeQuest,
  interactionTarget,
  coins,
  energy,
  maxEnergy,
  currentZone,
  companionName,
  onOpenInventory,
  onOpenQuests,
  onOpenClues,
  onOpenMap,
  onOpenRelationships,
  onOpenJobs,
  onOpenCustomize,
  onOpenPause,
  onInteract,
  onForwardTime,
  isMuted,
  onToggleMute,
  playerPosition,
  playerRotation,
}) => {
  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getPeriodIcon = () => {
    switch (time.period) {
      case 'Pagi': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'Siang': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Sore': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'Malam': return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getPeriodBadgeColor = () => {
    switch (time.period) {
      case 'Pagi': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Siang': return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Sore': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Malam': return 'bg-indigo-950 text-indigo-200 border-indigo-700';
    }
  };

  const getZoneLabel = () => {
    switch (currentZone) {
      case 'kosan':
        return { name: 'Kamar Kosan No. 07', icon: <Home className="w-3.5 h-3.5 text-sky-400" /> };
      case 'warung':
        return { name: 'Warung Bu Siti', icon: <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" /> };
      default:
        return { name: 'Kota Cisini', icon: <MapPin className="w-3.5 h-3.5 text-emerald-400" /> };
    }
  };

  const currentStep = activeQuest?.steps[activeQuest.currentStepIndex];
  const zoneInfo = getZoneLabel();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left: Time, Coins, Energy & Zone */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Time & Day */}
          <div className="flex items-center gap-2 bg-stone-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/60 shadow-lg text-stone-100">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight">
                  {formatTime(time.hour, time.minute)}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold ${getPeriodBadgeColor()}`}>
                  {getPeriodIcon()}
                  {time.period}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">Hari ke-{time.dayCount}</span>
            </div>

            <button
              id="hud-forward-time-btn"
              onClick={onForwardTime}
              title="Lompati Waktu (Pagi/Siang/Sore/Malam)"
              className="ml-1.5 p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600/60 text-stone-300 hover:text-amber-300 transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stats: Coins & Energy */}
          <div className="flex items-center gap-2 bg-stone-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/60 shadow-lg text-stone-100">
            {/* Coins */}
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs" title="Koin Rupiah (Rp)">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Rp {coins.toLocaleString('id-ID')}</span>
            </div>

            <div className="h-4 w-px bg-stone-700 mx-1" />

            {/* Energy */}
            <div className="flex items-center gap-1.5" title="Stamina & Energi Tubuh">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <div className="w-16 bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-700">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (energy / maxEnergy) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-emerald-300 font-mono font-semibold">{energy}/{maxEnergy}</span>
              </div>
            </div>
          </div>

          {/* Location / Zone Indicator */}
          <div className="flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-stone-700/60 shadow-lg text-xs font-semibold text-stone-200">
            {zoneInfo.icon}
            <span>{zoneInfo.name}</span>
          </div>

          {/* Companion Banner if following */}
          {companionName && (
            <div className="flex items-center gap-1.5 bg-pink-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-pink-700/60 shadow-lg text-xs font-semibold text-pink-200 animate-pulse">
              <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
              <span>Bersama {companionName}</span>
            </div>
          )}
        </div>

        {/* Center: Active Quest Tracker */}
        {activeQuest && (
          <div className="pointer-events-auto hidden lg:flex flex-col max-w-sm bg-stone-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-lg text-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Scroll className="w-3.5 h-3.5" />
              <span>Misi: {activeQuest.title}</span>
            </div>
            <p className="text-xs text-stone-300 mt-1 line-clamp-2">
              {currentStep ? currentStep.description : 'Selesaikan semua langkah.'}
            </p>
          </div>
        )}

        {/* Right: Quick Menu Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/60 shadow-lg text-stone-200">
          <button
            id="hud-btn-jobs"
            onClick={onOpenJobs}
            title="Lowongan Kerja Cisini [K]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Kerja</span>
          </button>

          <button
            id="hud-btn-inventory"
            onClick={onOpenInventory}
            title="Tas & Inventori [I]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tas</span>
          </button>

          <button
            id="hud-btn-quests"
            onClick={onOpenQuests}
            title="Daftar Quest [Q]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Misi</span>
          </button>

          <button
            id="hud-btn-clues"
            onClick={onOpenClues}
            title="Papan Misteri & Petunjuk [J]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Misteri</span>
          </button>

          <button
            id="hud-btn-map"
            onClick={onOpenMap}
            title="Peta Kota Cisini [M]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <MapIcon className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Peta</span>
          </button>

          <button
            id="hud-btn-relationships"
            onClick={onOpenRelationships}
            title="Hubungan Warga [R]"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-300 border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Users className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Teman</span>
          </button>

          {onOpenCustomize && (
            <button
              id="hud-btn-customize"
              onClick={onOpenCustomize}
              title="Kustomisasi Karakter [C]"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 hover:text-white border border-blue-600/50 flex items-center gap-1.5 text-xs font-semibold transition"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Baju</span>
            </button>
          )}

          <div className="h-5 w-px bg-stone-700 my-auto mx-0.5" />

          <button
            id="hud-btn-audio"
            onClick={onToggleMute}
            title={isMuted ? 'Nyalakan Musik' : 'Matikan Suara'}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>

          <button
            id="hud-btn-pause"
            onClick={onOpenPause}
            title="Menu & Simpan Game [Esc]"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 transition"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Center: Interaction Prompt */}
      {interactionTarget && (
        <div className="pointer-events-auto self-center mb-6 animate-bounce">
          <button
            id="hud-interaction-action-btn"
            onClick={onInteract}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3 rounded-full shadow-2xl border-2 border-white transition transform active:scale-95"
          >
            <span className="bg-stone-950 text-white text-xs px-2.5 py-1 rounded-md font-mono font-black">
              E / TAP
            </span>
            <span className="text-sm sm:text-base tracking-wide">
              {interactionTarget.promptText}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Row: Controls Hint & Mini-Radar */}
      <div className="flex items-end justify-between">
        {/* Left: Keyboard Controls Hint */}
        <div className="hidden sm:flex flex-col gap-1 text-[11px] text-stone-200 bg-stone-950/70 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-800/80">
          <div className="font-semibold text-stone-400 mb-0.5">Kontrol Petualangan:</div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">WASD / Panah</span>
            <span>Bergerak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">Shift</span>
            <span>Berlari</span>
            <span className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono ml-2">Drag Mouse</span>
            <span>Putar Kamera</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">E / Spasi</span>
            <span>Interaksi</span>
          </div>
        </div>

        {/* Right: Circular Mini-Radar */}
        <div 
          onClick={onOpenMap} 
          title="Klik untuk membuka Peta Penuh [M]"
          className="pointer-events-auto cursor-pointer relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-900/90 border-2 border-amber-500/70 shadow-2xl overflow-hidden backdrop-blur-md hover:border-amber-400 transition"
        >
          {/* Radar background grid */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-full h-px bg-amber-400" />
            <div className="h-full w-px bg-amber-400 absolute" />
            <div className="w-16 h-16 rounded-full border border-amber-400 absolute" />
          </div>

          {/* Compass labels */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-400">U</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-500">S</span>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-stone-500">B</span>
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-stone-500">T</span>

          {/* Player marker in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-3.5 h-3.5 bg-amber-400 border border-white rounded-full shadow"
              style={{ transform: `rotate(${playerRotation}rad)` }}
            >
              <div className="w-1.5 h-2 bg-amber-600 mx-auto -mt-1 rounded-t-full" />
            </div>
          </div>

          <div className="absolute bottom-1 right-2 text-[8px] font-mono text-amber-300/80 bg-stone-950/80 px-1 rounded">
            PETA
          </div>
        </div>
      </div>
    </div>
  );
};
