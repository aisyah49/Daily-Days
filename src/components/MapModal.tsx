import React, { useState } from 'react';
import { TownLocation, NPCData, TimeOfDay } from '../types';
import { TOWN_LOCATIONS } from '../data/gameData';
import { Map as MapIcon, X, MapPin, Compass, Navigation, Eye } from 'lucide-react';

interface MapModalProps {
  locations: TownLocation[];
  npcs: Record<string, NPCData>;
  currentPeriod: TimeOfDay;
  playerPosition: [number, number, number];
  onFastTravel: (pos: [number, number, number]) => void;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  locations = TOWN_LOCATIONS,
  npcs,
  currentPeriod,
  playerPosition,
  onFastTravel,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<TownLocation>(locations[0]);

  // Map coordinate conversion: world space (-70 to 70) to percentage (5% to 95%)
  const worldToMap = (x: number, z: number): { left: string; top: string } => {
    const normX = ((x + 75) / 150) * 100;
    const normY = ((z + 75) / 150) * 100;
    return {
      left: `${Math.max(5, Math.min(95, normX))}%`,
      top: `${Math.max(5, Math.min(95, normY))}%`,
    };
  };

  const playerCoord = worldToMap(playerPosition[0], playerPosition[2]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[92vh] text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-700/60 text-teal-400">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Peta Panduan Kota Cisini</h2>
              <p className="text-xs text-stone-400">Peta topografi kawasan dan sebaran warga di waktu {currentPeriod}</p>
            </div>
          </div>
          <button
            id="map-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto py-3">
          {/* Visual Map Surface */}
          <div className="md:col-span-2 relative aspect-square bg-[#3a4a3b] rounded-2xl border-2 border-stone-700 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Roads & Pathways Texture Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              {/* East-West road */}
              <div className="absolute top-[58%] left-0 right-0 h-8 bg-stone-600/80" />
              {/* North-South road */}
              <div className="absolute left-[62%] top-0 bottom-0 w-8 bg-stone-600/80" />
              {/* Alun-Alun Plaza circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-stone-400/40 border border-stone-300/30" />
              {/* Hill elevation curve */}
              <div className="absolute top-0 left-0 w-44 h-44 rounded-br-full bg-emerald-900/50 border-r border-b border-emerald-700/40" />
              {/* Park pond */}
              <div className="absolute bottom-6 left-12 w-24 h-24 rounded-full bg-sky-600/40 border border-sky-400/30" />
            </div>

            {/* Compass Rose */}
            <div className="absolute top-3 right-3 p-2 rounded-xl bg-stone-900/80 border border-stone-700 flex flex-col items-center text-[10px] font-mono text-amber-300">
              <Compass className="w-5 h-5 mb-0.5 text-amber-400" />
              <span>UTARA</span>
            </div>

            {/* Location Landmarks Pins */}
            {locations.map((loc) => {
              const coord = worldToMap(loc.worldPosition[0], loc.worldPosition[2]);
              const isSelected = selectedLocation.id === loc.id;

              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  style={{ left: coord.left, top: coord.top }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full border shadow-lg transition-transform transform hover:scale-125 z-10 ${
                    isSelected
                      ? 'bg-amber-400 border-white text-stone-950 scale-125 ring-4 ring-amber-400/40'
                      : loc.isSecret
                      ? 'bg-purple-600 border-purple-300 text-white'
                      : 'bg-stone-900/90 border-amber-400/70 text-amber-300'
                  }`}
                  title={loc.name}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              );
            })}

            {/* NPCs Dynamic Pins according to time schedule */}
            {(Object.values(npcs) as NPCData[]).map((npc) => {
              const pos = npc.schedule[currentPeriod].position;
              const coord = worldToMap(pos[0], pos[2]);

              return (
                <div
                  key={npc.id}
                  title={`${npc.name} (${npc.schedule[currentPeriod].locationName})`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-md z-20 flex items-center justify-center text-[8px] font-bold text-stone-900"
                  style={{
                    left: coord.left,
                    top: coord.top,
                    backgroundColor: npc.appearance.shirtColor,
                  }}
                >
                  •
                </div>
              );
            })}

            {/* Player Marker */}
            <div
              style={{ left: playerCoord.left, top: playerCoord.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse flex items-center justify-center">
                <Navigation className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold whitespace-nowrap shadow">
                Kamu
              </span>
            </div>
          </div>

          {/* Location Details & Fast Travel */}
          <div className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-semibold mb-1">
                <MapPin className="w-4 h-4" />
                <span>DETAIL LOKASI KOTA</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-stone-100 mb-2">
                {selectedLocation.name}
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-700">
                {selectedLocation.description}
              </p>

              {/* Residents currently here */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Warga di Sekitar Area Ini ({currentPeriod}):
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.values(npcs) as NPCData[])
                    .filter((n) => {
                      const npcPos = n.schedule[currentPeriod].position;
                      const dist = Math.hypot(
                        npcPos[0] - selectedLocation.worldPosition[0],
                        npcPos[2] - selectedLocation.worldPosition[2]
                      );
                      return dist < 22;
                    })
                    .map((n) => (
                      <span
                        key={n.id}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-200"
                      >
                        {n.name} ({n.role})
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Fast Travel Button */}
            <div className="pt-4 border-t border-stone-700/80">
              <button
                id="map-fast-travel-btn"
                onClick={() => {
                  onFastTravel(selectedLocation.worldPosition);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
              >
                <Navigation className="w-4 h-4" />
                <span>Berjalan Cepat ke Sini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
