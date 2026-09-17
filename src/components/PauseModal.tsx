import React, { useState } from 'react';
import { GameSettings, GameState } from '../types';
import { 
  Play, 
  Save, 
  Download, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Settings as SettingsIcon, 
  X,
  Check,
  Sparkles
} from 'lucide-react';

interface PauseModalProps {
  onClose: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onOpenCustomize?: () => void;
  onReturnToMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lastSavedAt: string | null;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onClose,
  onSaveGame,
  onLoadGame,
  onOpenCustomize,
  onReturnToMainMenu,
  isMuted,
  onToggleMute,
  lastSavedAt,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onSaveGame();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-stone-800 text-amber-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Jeda Permainan</h2>
              <p className="text-xs text-stone-400">Cisini Stories • Mode Petualangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Menu Buttons */}
        <div className="flex flex-col gap-2.5 py-2">
          {/* Resume */}
          <button
            id="pause-btn-resume"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Lanjutkan Petualangan</span>
          </button>

          {/* Save Game */}
          <button
            id="pause-btn-save"
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-emerald-400" />}
            <span>{saveSuccess ? 'Berhasil Disimpan!' : 'Simpan Permainan'}</span>
          </button>

          {/* Load Game */}
          <button
            id="pause-btn-load"
            onClick={onLoadGame}
            className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Muat Data Terakhir</span>
          </button>

          {/* Character Customize */}
          {onOpenCustomize && (
            <button
              id="pause-btn-customize"
              onClick={onOpenCustomize}
              className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ubah Tampilan Karakter</span>
            </button>
          )}

          {/* Audio toggle */}
          <button
            id="pause-btn-audio"
            onClick={onToggleMute}
            className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            <span>Suara & Musik: {isMuted ? 'Mati' : 'Aktif'}</span>
          </button>

          {/* Return to Main Menu */}
          <button
            id="pause-btn-main-menu"
            onClick={onReturnToMainMenu}
            className="w-full py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-semibold text-sm flex items-center justify-center gap-2 transition mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>

        {/* Footer info */}
        {lastSavedAt && (
          <div className="pt-2 text-center text-[11px] text-stone-500">
            Terakhir disimpan: {lastSavedAt}
          </div>
        )}
      </div>
    </div>
  );
};
