import React, { useState } from 'react';
import { Play, RotateCcw, BookOpen, Volume2, VolumeX, Sparkles, MapPin, Heart, User } from 'lucide-react';

interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenCustomize?: () => void;
  hasSaveData: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenCustomize,
  hasSaveData,
  isMuted,
  onToggleMute,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 via-amber-950 to-stone-950 text-stone-100 select-none overflow-hidden p-6">
      {/* Background Stylized Aesthetic Silhouette & Stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      {/* Main Title Card */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        {/* Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Game Petualangan 3D & Life Simulation</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-amber-400 tracking-tight font-serif drop-shadow-md">
          Cisini Stories
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-stone-300 max-w-md mt-2 mb-8 leading-relaxed font-sans">
          Jelajahi kota kecil yang tenang, jalin persahabatan dengan warga, dan pecahkan rahasia Kapsul Waktu 1994.
        </p>

        {/* Buttons Menu */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          {/* New Game */}
          <button
            id="mainmenu-btn-new-game"
            onClick={onStartNewGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>Mulai Petualangan Baru</span>
          </button>

          {/* Continue */}
          {hasSaveData && (
            <button
              id="mainmenu-btn-continue"
              onClick={onContinueGame}
              className="w-full py-3.5 px-6 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-stone-100 border border-stone-600 font-bold text-base shadow-lg flex items-center justify-center gap-2.5 transition transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5 text-sky-400" />
              <span>Lanjutkan Petualangan</span>
            </button>
          )}

          {/* Character Creator / Customizer */}
          {onOpenCustomize && (
            <button
              id="mainmenu-btn-customize"
              onClick={onOpenCustomize}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 text-sky-200 hover:text-white border border-blue-500/40 font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition transform active:scale-95"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>Buat & Kustomisasi Karakter</span>
            </button>
          )}

          {/* Guide & Lore */}
          <button
            id="mainmenu-btn-guide"
            onClick={() => setShowGuide(true)}
            className="w-full py-3 px-6 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Panduan & Latar Belakang Kota</span>
          </button>

          {/* Audio toggle */}
          <button
            id="mainmenu-btn-audio"
            onClick={onToggleMute}
            className="w-full py-2.5 px-6 rounded-2xl bg-stone-900/50 hover:bg-stone-800/60 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center justify-center gap-2 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            <span>Musik & Suara: {isMuted ? 'Mati' : 'Menyala'}</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="mt-10 text-[11px] text-stone-400 flex items-center gap-2">
          <span>Karya Orisinal Kota Cisini</span>
          <span>•</span>
          <span>Eksplorasi Santai & Misteri Hangat</span>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl text-stone-100 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tentang Kota Cisini & Cara Bermain
            </h3>

            <div className="text-xs text-stone-300 leading-relaxed space-y-3">
              <p>
                <strong>Selamat Datang di Cisini:</strong> Kamu adalah pendatang baru yang tiba di kota kecil yang damai ini. Di balik kebiasaan sehari-hari para warga, tersimpan cerita lama tentang Kapsul Waktu pendiri kota yang terkunci selama 30 tahun.
              </p>

              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1.5">
                <div className="font-bold text-stone-200">Kontrol Permainan:</div>
                <div>• <strong>WASD / Tombol Panah</strong>: Bergerak ke segala arah.</div>
                <div>• <strong>Shift</strong>: Berlari cepat.</div>
                <div>• <strong>Drag Mouse</strong>: Memutar pandangan kamera 360°.</div>
                <div>• <strong>E / Spasi</strong>: Berinteraksi dengan warga, benda, dan bangunan.</div>
                <div>• <strong>I / Q / J / M</strong>: Buka Tas, Misi, Misteri, dan Peta.</div>
              </div>

              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1.5">
                <div className="font-bold text-stone-200">Siklus Waktu & Kehidupan:</div>
                <p>
                  Waktu berjalan dari Pagi, Siang, Sore, hingga Malam. Setiap warga memiliki rutinitas dan tempat beraktivitas yang berbeda di setiap waktu. Kamu bisa duduk di bangku taman atau alun-alun untuk melompati waktu!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm"
            >
              Saya Mengerti, Mulai Jelajahi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
