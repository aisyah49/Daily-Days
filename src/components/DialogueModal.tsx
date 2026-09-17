import React, { useState, useEffect } from 'react';
import { DialogueNode, DialogueChoice, NPCData, GameState } from '../types';
import { soundManager } from '../audio/soundManager';
import { MessageSquare, Heart, ArrowRight, X } from 'lucide-react';

interface DialogueModalProps {
  dialogueNode: DialogueNode;
  npc?: NPCData;
  relationshipScore?: number;
  gameState: GameState;
  onSelectChoice: (choice: DialogueChoice) => void;
  onNextNode: (nextId?: string) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  dialogueNode,
  npc,
  relationshipScore = 15,
  gameState,
  onSelectChoice,
  onNextNode,
  onClose,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = dialogueNode.text;

    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 3 === 0) {
          soundManager.playDialogueBlip(npc?.appearance.scale && npc.appearance.scale < 0.9 ? 540 : 380);
        }
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [dialogueNode]);

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(dialogueNode.text);
      setIsTyping(false);
    }
  };

  // Filter choices based on condition (e.g. required item in inventory)
  const availableChoices = dialogueNode.choices?.filter((c) => {
    if (!c.condition) return true;
    return c.condition(gameState);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs select-none">
      <div 
        onClick={handleSkipTyping}
        className="w-full max-w-3xl bg-stone-900/95 border-2 border-stone-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md text-stone-100 flex flex-col md:flex-row gap-5 relative animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Close Button */}
        <button
          id="dialogue-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Character Portrait */}
        <div className="flex md:flex-col items-center gap-3 shrink-0">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-amber-400/80 shadow-md flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: npc?.appearance.shirtColor || '#2563eb' }}
          >
            {/* Stylized face avatar */}
            <div 
              className="w-12 h-12 rounded-full border border-stone-900/40 relative shadow-inner"
              style={{ backgroundColor: npc?.appearance.skinColor || '#f1be96' }}
            >
              {/* Hair */}
              <div 
                className="absolute -top-1 inset-x-0 h-5 rounded-t-full"
                style={{ backgroundColor: npc?.appearance.hairColor || '#1f1f1f' }}
              />
              {/* Eyes */}
              <div className="absolute top-5 left-2.5 w-1.5 h-2 bg-stone-900 rounded-full" />
              <div className="absolute top-5 right-2.5 w-1.5 h-2 bg-stone-900 rounded-full" />
              {/* Smile */}
              <div className="absolute bottom-2 inset-x-3 h-1 border-b-2 border-stone-800 rounded-full" />
            </div>

            {/* Accessory Badge */}
            {npc?.appearance.accessory && (
              <span className="absolute bottom-1 right-1 text-[10px] bg-stone-900/90 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                {npc.appearance.accessory}
              </span>
            )}
          </div>

          {/* Relationship Heart Meter */}
          {npc && (
            <div className="flex flex-col items-center text-xs">
              <div className="flex items-center gap-1 text-pink-400 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-pink-400" />
                <span>{relationshipScore}%</span>
              </div>
              <span className="text-[11px] text-stone-400">{npc.relationshipTitle}</span>
            </div>
          )}
        </div>

        {/* Dialogue Content */}
        <div className="flex-1 flex flex-col justify-between min-h-[140px]">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-amber-400 tracking-tight">
                {dialogueNode.speaker}
              </h3>
              {dialogueNode.speakerTitle && (
                <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
                  {dialogueNode.speakerTitle}
                </span>
              )}
            </div>

            {/* Speech bubble body */}
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed min-h-[56px] font-sans">
              {displayedText}
              {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse" />}
            </p>
          </div>

          {/* Choices or Next Button */}
          <div className="mt-4 pt-3 border-t border-stone-800 flex flex-col gap-2">
            {!isTyping && availableChoices && availableChoices.length > 0 ? (
              <div className="flex flex-col gap-2">
                {availableChoices.map((choice, idx) => (
                  <button
                    key={idx}
                    id={`dialogue-choice-${idx}`}
                    onClick={() => onSelectChoice(choice)}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-amber-600/90 hover:text-stone-950 text-stone-200 border border-stone-700 hover:border-amber-400 text-xs sm:text-sm font-medium transition flex items-center justify-between group"
                  >
                    <span>{choice.text}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            ) : !isTyping ? (
              <div className="flex justify-end">
                <button
                  id="dialogue-next-btn"
                  onClick={() => onNextNode(dialogueNode.nextId)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow transition"
                >
                  <span>{dialogueNode.nextId ? 'Lanjut' : 'Tutup Percakapan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
