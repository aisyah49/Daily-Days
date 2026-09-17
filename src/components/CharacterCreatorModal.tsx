import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterAppearance, createCharacterModel, CharacterRig } from '../game/CharacterModel';
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  X, 
  User, 
  Palette, 
  Shirt, 
  Scissors, 
  Glasses, 
  Shuffle, 
  Smile, 
  ShieldCheck 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  initialAppearance?: CharacterAppearance;
  onSave: (appearance: CharacterAppearance) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

const SKIN_TONES = [
  { id: '#f5d0a9', name: 'Kuning Langsat', color: '#f5d0a9' },
  { id: '#e0a97b', name: 'Sawo Matang', color: '#e0a97b' },
  { id: '#fed7aa', name: 'Cerah Halus', color: '#fed7aa' },
  { id: '#b47b52', name: 'Eksotis Tropis', color: '#b47b52' },
];

const HAIR_STYLES = [
  { id: 'short', name: 'Pendek Kasual', icon: '✂️' },
  { id: 'spiky', name: 'Keren Spiky', icon: '⚡' },
  { id: 'undercut', name: 'Modern Undercut', icon: '💈' },
  { id: 'long', name: 'Panjang Anggun', icon: '✨' },
  { id: 'ponytail', name: 'Kuncir Kuda', icon: '🐎' },
  { id: 'twin_tails', name: 'Kuncir Dua (Twin Tails)', icon: '🎀' },
  { id: 'bun', name: 'Sanggul Modern', icon: '🌸' },
  { id: 'hijab', name: 'Hijab Santun', icon: '🧕' },
  { id: 'peci', name: 'Peci Nusantara', icon: '🎩' },
  { id: 'blangkon', name: 'Blangkon Tradisional', icon: '👑' },
  { id: 'beanie', name: 'Kupluk / Beanie Hangat', icon: '🧶' },
  { id: 'hat', name: 'Topi Petualang', icon: '🧢' },
  { id: 'caping', name: 'Topi Caping Tani', icon: '🌾' },
];

const HAIR_COLORS = [
  { id: '#18181b', name: 'Hitam Alami', color: '#18181b' },
  { id: '#451a03', name: 'Cokelat Gelap', color: '#451a03' },
  { id: '#78350f', name: 'Cokelat Kayu', color: '#78350f' },
  { id: '#991b1b', name: 'Merah Mahoni', color: '#991b1b' },
  { id: '#ca8a04', name: 'Pirang Madu', color: '#ca8a04' },
  { id: '#64748b', name: 'Perak Modern', color: '#64748b' },
  { id: '#0284c7', name: 'Biru Elektrik', color: '#0284c7' },
  { id: '#16a34a', name: 'Hijau Zamrud', color: '#16a34a' },
];

const SHIRT_STYLES = [
  { id: 'casual', name: 'Kaos Santai', desc: 'Nyaman & santai untuk keliling kota' },
  { id: 'jacket', name: 'Jaket Denim', desc: 'Keren berkarakter dengan kaos dalam' },
  { id: 'hoodie', name: 'Hoodie Hangat', desc: 'Saku depan lembut & tudung santai' },
  { id: 'batik', name: 'Batik Cisini', desc: 'Motif emas warisan budaya Cisini' },
  { id: 'vest', name: 'Rompi Penjelajah', desc: 'Siap untuk menyelidiki misteri' },
  { id: 'oversized_tee', name: 'Kaos Oversized', desc: 'Gaya streetwear kekinian longgar' },
  { id: 'kemeja_formal', name: 'Kemeja Rapi', desc: 'Kemeja berkerah rapi & berkancing' },
  { id: 'seragam_sekolah', name: 'Seragam Putih Abu', desc: 'Seragam khas anak sekolah Cisini' },
  { id: 'kebaya', name: 'Kebaya Elegan', desc: 'Busana tradisional nusantara anggun' },
  { id: 'jersey', name: 'Jersey Olahraga', desc: 'Bahan atletis nomor punggung 10' },
  { id: 'apron_koki', name: 'Celemek Dapur', desc: 'Celemek masak siap bantu warung' },
  { id: 'jaket_kulit', name: 'Jaket Kulit Biker', desc: 'Jaket kulit hitam tangguh berkerah' },
  { id: 'sweater', name: 'Sweater Rajut', desc: 'Rajutan hangat bergaris leher' },
  { id: 'baju_kurir', name: 'Rompi Kurir Kilat', desc: 'Seragam kurir pengantar paket' },
];

const SHIRT_COLORS = [
  { id: '#2563eb', name: 'Biru Samudra', color: '#2563eb' },
  { id: '#dc2626', name: 'Merah Semangat', color: '#dc2626' },
  { id: '#059669', name: 'Hijau Daun', color: '#059669' },
  { id: '#eab308', name: 'Kuning Mentari', color: '#eab308' },
  { id: '#7c3aed', name: 'Ungu Twilight', color: '#7c3aed' },
  { id: '#0f172a', name: 'Hitam Malam', color: '#0f172a' },
  { id: '#ea580c', name: 'Oranye Senja', color: '#ea580c' },
  { id: '#e2e8f0', name: 'Putih Awan', color: '#e2e8f0' },
  { id: '#db2777', name: 'Merah Muda (Pink)', color: '#db2777' },
  { id: '#0891b2', name: 'Toska Segar', color: '#0891b2' },
];

const PANTS_STYLES = [
  { id: 'jeans', name: 'Celana Jeans', desc: 'Klasik & pas di segala suasana' },
  { id: 'formal', name: 'Celana Kain', desc: 'Rapi & sopan' },
  { id: 'cargo', name: 'Celana Kargo', desc: 'Banyak kantong untuk petualang' },
  { id: 'skirt', name: 'Rok Panjang', desc: 'Anggun & elegan khas santun' },
  { id: 'pleated_skirt', name: 'Rok Rempel / Lipit', desc: 'Rok lipit berombak modis' },
  { id: 'shorts', name: 'Celana Pendek', desc: 'Bebas & santai saat cuaca panas' },
  { id: 'sarung', name: 'Sarung Tradisional', desc: 'Sarung kotak-kotak khas nusantara' },
  { id: 'jogger', name: 'Celana Jogger', desc: 'Karet di pergelangan kaki nyaman' },
  { id: 'kulot', name: 'Celana Kulot Lebar', desc: 'Potongan lebar santai & sejuk' },
  { id: 'training', name: 'Celana Training Strip', desc: 'Garis samping sporty' },
];

const PANTS_COLORS = [
  { id: '#1e293b', name: 'Denim Gelap', color: '#1e293b' },
  { id: '#0f172a', name: 'Hitam Pekat', color: '#0f172a' },
  { id: '#78350f', name: 'Cokelat Tanah', color: '#78350f' },
  { id: '#475569', name: 'Abu-Abu Arang', color: '#475569' },
  { id: '#b45309', name: 'Khaki Pasir', color: '#b45309' },
  { id: '#1e3a8a', name: 'Navy Klasik', color: '#1e3a8a' },
  { id: '#064e3b', name: 'Hijau Botol', color: '#064e3b' },
  { id: '#831843', name: 'Maroon Anggur', color: '#831843' },
];

const ACCESSORIES = [
  { id: 'none', name: 'Tanpa Aksesoris', icon: '✨' },
  { id: 'glasses', name: 'Kacamata Vintage', icon: '👓' },
  { id: 'sunglasses', name: 'Kacamata Hitam Keren', icon: '🕶️' },
  { id: 'headphone', name: 'Headphone Musik', icon: '🎧' },
  { id: 'masker', name: 'Masker Wajah Higienis', icon: '😷' },
  { id: 'tas_kamera', name: 'Tas Kamera Selempang', icon: '📷' },
  { id: 'backpack', name: 'Tas Ransel Petualang', icon: '🎒' },
  { id: 'scarf', name: 'Syal Hangat Merah', icon: '🧣' },
  { id: 'caping', name: 'Topi Caping Jerami', icon: '👒' },
  { id: 'apron', name: 'Celemek Makan', icon: '🍽️' },
];

const PRESETS: { name: string; desc: string; config: CharacterAppearance }[] = [
  {
    name: 'Petualang Keren',
    desc: 'Gaya kasual yang siap mengungkap rahasia Cisini',
    config: {
      name: 'Arga',
      gender: 'male',
      skinColor: '#f5d0a9',
      hairStyle: 'spiky',
      hairColor: '#18181b',
      shirtStyle: 'jacket',
      shirtColor: '#2563eb',
      pantsStyle: 'jeans',
      pantsColor: '#1e293b',
      accessory: 'backpack',
    },
  },
  {
    name: 'Gadis Santun Hijab',
    desc: 'Anggun, ramah, dan dihormati warga kota',
    config: {
      name: 'Aisyah',
      gender: 'female',
      skinColor: '#fed7aa',
      hairStyle: 'hijab',
      hairColor: '#059669',
      shirtStyle: 'batik',
      shirtColor: '#059669',
      pantsStyle: 'skirt',
      pantsColor: '#1e293b',
      accessory: 'glasses',
    },
  },
  {
    name: 'Pemuda Berbudaya',
    desc: 'Menghargai tradisi luhur kota dengan peci & batik',
    config: {
      name: 'Bima',
      gender: 'male',
      skinColor: '#e0a97b',
      hairStyle: 'peci',
      hairColor: '#18181b',
      shirtStyle: 'batik',
      shirtColor: '#ca8a04',
      pantsStyle: 'formal',
      pantsColor: '#0f172a',
      accessory: 'none',
    },
  },
  {
    name: 'Penyelidik Kasual',
    desc: 'Gaya modern dengan hoodie & syal hangat',
    config: {
      name: 'Maya',
      gender: 'female',
      skinColor: '#f5d0a9',
      hairStyle: 'ponytail',
      hairColor: '#78350f',
      shirtStyle: 'hoodie',
      shirtColor: '#dc2626',
      pantsStyle: 'cargo',
      pantsColor: '#475569',
      accessory: 'scarf',
    },
  },
];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  initialAppearance,
  onSave,
  onClose,
  isFirstTime = false,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'hair' | 'shirt' | 'pants' | 'accessory'>('profile');
  const [appearance, setAppearance] = useState<CharacterAppearance>(() => {
    return initialAppearance || {
      name: 'Pengelana Cisini',
      gender: 'male',
      skinColor: '#f5d0a9',
      shirtColor: '#2563eb',
      shirtStyle: 'casual',
      pantsColor: '#1e293b',
      pantsStyle: 'jeans',
      hairColor: '#18181b',
      hairStyle: 'short',
      accessory: 'none',
      isPlayer: true,
    };
  });

  // 3D Canvas Preview Setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRigRef = useRef<CharacterRig | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  // Sync initial appearance when modal opens
  useEffect(() => {
    if (initialAppearance) {
      setAppearance(initialAppearance);
    }
  }, [initialAppearance, isOpen]);

  // Setup 3D Scene
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.9, 3.2);
    camera.lookAt(0, 0.75, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    backLight.position.set(-3, 3, -3);
    scene.add(backLight);

    // Circular pedestal platform
    const pedestalMat = new THREE.MeshLambertMaterial({ color: '#e2e8f0' });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.12, 32), pedestalMat);
    pedestal.position.y = -0.06;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Initial character
    const rig = createCharacterModel({ ...appearance, isPlayer: true });
    rig.root.position.set(0, 0, 0);
    scene.add(rig.root);
    characterRigRef.current = rig;

    // Mouse rotation drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.clientX;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseXRef.current;
      rotationAngleRef.current += dx * 0.015;
      lastMouseXRef.current = e.clientX;
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let lastTime = performance.now();
    const animatePreview = () => {
      animFrameRef.current = requestAnimationFrame(animatePreview);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto gentle rotate when not dragging
      if (!isDraggingRef.current) {
        rotationAngleRef.current += delta * 0.4;
      }

      if (characterRigRef.current) {
        characterRigRef.current.root.rotation.y = rotationAngleRef.current;
        characterRigRef.current.animate(now * 0.001, 0, false);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animatePreview);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [isOpen]);

  // Update 3D Character when appearance changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (characterRigRef.current) {
      scene.remove(characterRigRef.current.root);
    }

    const newRig = createCharacterModel({ ...appearance, isPlayer: true });
    newRig.root.position.set(0, 0, 0);
    newRig.root.rotation.y = rotationAngleRef.current;
    scene.add(newRig.root);
    characterRigRef.current = newRig;
  }, [appearance]);

  const handleRandomize = () => {
    soundManager.playClick();
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const randomHairStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id as any;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randomShirtStyle = SHIRT_STYLES[Math.floor(Math.random() * SHIRT_STYLES.length)].id as any;
    const randomShirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)].id;
    const randomPantsStyle = PANTS_STYLES[Math.floor(Math.random() * PANTS_STYLES.length)].id as any;
    const randomPantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)].id;
    const randomAccessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id as any;

    setAppearance((prev) => ({
      ...prev,
      skinColor: randomSkin,
      hairStyle: randomHairStyle,
      hairColor: randomHairColor,
      shirtStyle: randomShirtStyle,
      shirtColor: randomShirtColor,
      pantsStyle: randomPantsStyle,
      pantsColor: randomPantsColor,
      accessory: randomAccessory,
    }));
  };

  const handleApplyPreset = (presetConfig: CharacterAppearance) => {
    soundManager.playClick();
    setAppearance((prev) => ({
      ...prev,
      ...presetConfig,
    }));
  };

  const handleSave = () => {
    soundManager.playFanfare();
    onSave(appearance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div 
        id="character-creator-modal"
        className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* LEFT COLUMN: Interactive 3D Character Viewport */}
        <div className="md:w-5/12 bg-gradient-to-b from-sky-50 via-slate-50 to-indigo-50/50 p-5 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-200 relative select-none">
          {/* Header Title */}
          <div className="w-full text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Studio Karakter Cisini
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              {appearance.name || 'Pengelana Baru'}
            </h2>
            <p className="text-xs text-slate-500">Putar 360° dengan mouse / sentuhan</p>
          </div>

          {/* 3D WebGL Canvas */}
          <div className="relative w-full aspect-[4/5] max-h-[380px] my-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
            <canvas ref={canvasRef} className="w-full h-full rounded-2xl drop-shadow-md" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/60 text-white text-[11px] font-medium flex items-center gap-1.5 pointer-events-none backdrop-blur-sm">
              <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              Geser untuk memutar
            </div>
          </div>

          {/* Quick Random & Reset Buttons */}
          <div className="w-full flex gap-2">
            <button
              type="button"
              id="btn-randomize-char"
              onClick={handleRandomize}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-500" />
              Acak Tampilan
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Customization Controls & Tabs */}
        <div className="md:w-7/12 flex flex-col justify-between bg-white overflow-hidden">
          {/* Top Bar Tabs */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'profile', label: 'Profil & Preset', icon: User },
                { id: 'hair', label: 'Wajah & Rambut', icon: Scissors },
                { id: 'shirt', label: 'Baju / Atasan', icon: Shirt },
                { id: 'pants', label: 'Bawahan', icon: Palette },
                { id: 'accessory', label: 'Aksesoris', icon: Glasses },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {onClose && !isFirstTime && (
              <button
                type="button"
                id="btn-close-char-creator"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Scrollable Tab Contents */}
          <div className="p-6 overflow-y-auto max-h-[56vh] space-y-6">
            {/* TAB 1: PROFIL & PRESETS */}
            {activeTab === 'profile' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Karakter Anda
                  </label>
                  <input
                    type="text"
                    id="input-character-name"
                    value={appearance.name || ''}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama karaktermu..."
                    maxLength={20}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">Nama ini akan disapa oleh para warga kota Cisini.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gaya / Tipe Karakter
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="btn-gender-male"
                      onClick={() => setAppearance((prev) => ({ ...prev, gender: 'male' }))}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                        appearance.gender === 'male'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pria / Petualang
                    </button>
                    <button
                      type="button"
                      id="btn-gender-female"
                      onClick={() => setAppearance((prev) => ({ ...prev, gender: 'female' }))}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                        appearance.gender === 'female'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Wanita / Petualang
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Pilihan Preset Cepat
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        id={`btn-preset-${idx}`}
                        type="button"
                        onClick={() => handleApplyPreset(preset.config)}
                        className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition group"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600 flex items-center justify-between">
                          {preset.name}
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-80" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{preset.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WAJAH & RAMBUT */}
            {activeTab === 'hair' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Warna Kulit (Khas Nusantara)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        id={`btn-skin-${tone.id.replace('#', '')}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, skinColor: tone.id }));
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                          appearance.skinColor === tone.id
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-xs font-semibold text-slate-700 leading-tight">{tone.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Model Rambut & Penutup Kepala
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        id={`btn-hair-style-${style.id}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, hairStyle: style.id as any }));
                        }}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          appearance.hairStyle === style.id
                            ? 'border-blue-600 bg-blue-50/80 text-blue-800 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                        }`}
                      >
                        <span className="text-xl">{style.icon}</span>
                        <span className="text-xs leading-tight">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Warna Rambut / Hijab
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.id}
                        id={`btn-hair-color-${hc.id.replace('#', '')}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, hairColor: hc.id }));
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                          appearance.hairColor === hc.id
                            ? 'border-blue-600 bg-blue-50 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: hc.color }}
                        />
                        <span className="text-xs text-slate-700">{hc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BAJU / ATASAN */}
            {activeTab === 'shirt' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Model Pakaian Atas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SHIRT_STYLES.map((sh) => (
                      <button
                        key={sh.id}
                        id={`btn-shirt-style-${sh.id}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, shirtStyle: sh.id as any }));
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          appearance.shirtStyle === sh.id
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                          {sh.name}
                          {appearance.shirtStyle === sh.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sh.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Warna Utama Pakaian
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SHIRT_COLORS.map((sc) => (
                      <button
                        key={sc.id}
                        id={`btn-shirt-color-${sc.id.replace('#', '')}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, shirtColor: sc.id }));
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                          appearance.shirtColor === sc.id
                            ? 'border-blue-600 bg-blue-50 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0"
                          style={{ backgroundColor: sc.color }}
                        />
                        <span className="text-xs text-slate-700 truncate">{sc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CELANA / BAWAHAN */}
            {activeTab === 'pants' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Model Pakaian Bawah
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PANTS_STYLES.map((ps) => (
                      <button
                        key={ps.id}
                        id={`btn-pants-style-${ps.id}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, pantsStyle: ps.id as any }));
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          appearance.pantsStyle === ps.id
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                          {ps.name}
                          {appearance.pantsStyle === ps.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ps.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Warna Celana / Rok
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PANTS_COLORS.map((pc) => (
                      <button
                        key={pc.id}
                        id={`btn-pants-color-${pc.id.replace('#', '')}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, pantsColor: pc.id }));
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                          appearance.pantsColor === pc.id
                            ? 'border-blue-600 bg-blue-50 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0"
                          style={{ backgroundColor: pc.color }}
                        />
                        <span className="text-xs text-slate-700 truncate">{pc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AKSESORIS */}
            {activeTab === 'accessory' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Aksesoris Tambahan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.id}
                        id={`btn-accessory-${acc.id}`}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setAppearance((prev) => ({ ...prev, accessory: acc.id as any }));
                        }}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                          appearance.accessory === acc.id
                            ? 'border-blue-600 bg-blue-50/80 text-blue-800 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{acc.icon}</span>
                        <div className="text-left flex-1">
                          <div className="text-xs font-bold">{acc.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {acc.id === 'none' ? 'Tampil natural & sederhana' : 'Aksesoris ikonik penjelajah'}
                          </div>
                        </div>
                        {appearance.accessory === acc.id && (
                          <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 hidden sm:block">
              {isFirstTime ? 'Karakter Anda siap menjelajahi kota Cisini!' : 'Perubahan tersimpan otomatis di game.'}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onClose && !isFirstTime && (
                <button
                  type="button"
                  id="btn-cancel-customizer"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition active:scale-95"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                id="btn-confirm-character"
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                {isFirstTime ? 'Mulai Petualangan di Cisini' : 'Simpan Karakter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
