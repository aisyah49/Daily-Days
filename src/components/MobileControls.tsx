import React, { useRef, useState, useEffect } from 'react';
import { FastForward, Zap, Hand } from 'lucide-react';

interface MobileControlsProps {
  onMove: (vector: { x: number; y: number }, sprint: boolean) => void;
  onInteract: () => void;
  hasInteractionTarget: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onInteract,
  hasInteractionTarget,
}) => {
  const [sprint, setSprint] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 42;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 }, sprint);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onMove({ x: dx / maxRadius, y: dy / maxRadius }, sprint);
    } else {
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * maxRadius;
      const ky = Math.sin(angle) * maxRadius;
      setKnobPos({ x: kx, y: ky });
      onMove({ x: kx / maxRadius, y: ky / maxRadius }, sprint);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 md:hidden flex justify-between items-end p-6 select-none">
      {/* Left: Virtual Joystick */}
      <div
        ref={baseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-32 h-32 rounded-full bg-stone-900/60 border-2 border-stone-600/70 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl"
      >
        {/* Center Guide Ring */}
        <div className="w-12 h-12 rounded-full border border-stone-500/40 pointer-events-none" />

        {/* Joystick Thumb Knob */}
        <div
          className={`w-14 h-14 rounded-full border-2 border-amber-400 shadow-lg pointer-events-none transition-transform ${
            joystickActive ? 'bg-amber-500/90 scale-95' : 'bg-stone-800/90'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Right: Action Buttons (Sprint & Interact) */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Sprint Toggle */}
        <button
          id="mobile-btn-sprint"
          onClick={() => {
            const next = !sprint;
            setSprint(next);
            onMove(
              { x: knobPos.x / maxRadius, y: knobPos.y / maxRadius },
              next
            );
          }}
          className={`w-13 h-13 rounded-full border-2 flex items-center justify-center shadow-xl transition active:scale-95 ${
            sprint
              ? 'bg-amber-500 border-white text-stone-950 font-bold'
              : 'bg-stone-900/80 border-stone-600 text-stone-300'
          }`}
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Big Action / Interact Button */}
        <button
          id="mobile-btn-interact"
          onClick={onInteract}
          className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition transform active:scale-90 ${
            hasInteractionTarget
              ? 'bg-amber-500 border-white text-stone-950 font-black animate-pulse'
              : 'bg-stone-800/80 border-stone-600 text-stone-400'
          }`}
        >
          <Hand className="w-6 h-6" />
          <span className="text-[9px] font-bold">AKSI</span>
        </button>
      </div>
    </div>
  );
};
