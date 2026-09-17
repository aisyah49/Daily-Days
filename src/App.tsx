import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameEngine } from './game/GameEngine';
import { CharacterAppearance } from './game/CharacterModel';
import { soundManager } from './audio/soundManager';
import { 
  GameState, 
  TimeState, 
  InventoryItem, 
  Quest, 
  Clue, 
  InteractionTarget, 
  DialogueNode, 
  DialogueChoice,
  TimeOfDay,
  JobListing
} from './types';
import { 
  INITIAL_ITEMS, 
  INITIAL_QUESTS, 
  INITIAL_CLUES, 
  NPCS_DATA, 
  DIALOGUE_NODES, 
  ALL_CLUES_DATABASE,
  TOWN_LOCATIONS 
} from './data/gameData';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { DialogueModal } from './components/DialogueModal';
import { InventoryModal } from './components/InventoryModal';
import { QuestModal } from './components/QuestModal';
import { RelationshipModal } from './components/RelationshipModal';
import { ClueBoardModal } from './components/ClueBoardModal';
import { MapModal } from './components/MapModal';
import { PauseModal } from './components/PauseModal';
import { JobModal } from './components/JobModal';
import { MobileControls } from './components/MobileControls';
import { Sparkles, CheckCircle2, Award, Clock } from 'lucide-react';

const SAVE_KEY = 'cisini_stories_save_data';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App & UI Mode
  const [gameMode, setGameMode] = useState<'menu' | 'playing'>('menu');
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'inventory'
    | 'quests'
    | 'clues'
    | 'map'
    | 'relationships'
    | 'pause'
    | 'dialogue'
    | 'inspect'
    | 'bench'
    | 'customize'
    | 'jobs'
  >('none');

  // Life Simulation Stats: Coins & Energy
  const [coins, setCoins] = useState<number>(50000);
  const [energy, setEnergy] = useState<number>(85);
  const maxEnergy = 100;
  const [currentZone, setCurrentZone] = useState<'town' | 'kosan' | 'warung'>('town');
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);

  // Interior Door Transition State
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<string>('');

  // Character Customization State
  const [playerAppearance, setPlayerAppearance] = useState<CharacterAppearance>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.playerAppearance) return parsed.playerAppearance;
        }
      } catch (e) {}
    }
    return {
      name: 'Arga',
      gender: 'male',
      skinColor: '#f5d0a9',
      shirtColor: '#2563eb',
      shirtStyle: 'jacket',
      pantsColor: '#1e293b',
      pantsStyle: 'jeans',
      hairColor: '#18181b',
      hairStyle: 'spiky',
      accessory: 'backpack',
      isPlayer: true,
    };
  });

  // Audio state
  const [isMuted, setIsMuted] = useState(false);

  // Game Engine State
  const [time, setTime] = useState<TimeState>({
    hour: 8,
    minute: 30,
    period: 'Pagi',
    dayCount: 1,
  });
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 10]);
  const [playerRotation, setPlayerRotation] = useState<number>(0);
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);

  // Gameplay State
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [clues, setClues] = useState<Clue[]>(INITIAL_CLUES);
  const [relationships, setRelationships] = useState<Record<string, number>>({
    pak_joko: 15,
    bu_siti: 20,
    rian: 10,
    maya: 10,
    pak_rt: 15,
    nenek_minah: 25,
    pak_tejo: 15,
    budi: 15,
  });
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Active dialogue & inspect target
  const [currentDialogueNode, setCurrentDialogueNode] = useState<DialogueNode | null>(null);
  const [currentNpcId, setCurrentNpcId] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<{ title: string; text: string } | null>(null);

  // Banner notification toast
  const [toast, setToast] = useState<{ title: string; message: string; type: 'quest' | 'clue' | 'item' } | null>(null);

  const showToast = (title: string, message: string, type: 'quest' | 'clue' | 'item' = 'quest') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Check saved state in localStorage
  const hasSaveData = typeof window !== 'undefined' && !!localStorage.getItem(SAVE_KEY);

  // Initialize Game Engine when starting play
  useEffect(() => {
    if (gameMode !== 'playing' || !containerRef.current || engineRef.current) return;

    const engine = new GameEngine(
      containerRef.current,
      {
        onInteractionTargetChange: (target) => {
          setInteractionTarget(target);
        },
        onTimeChange: (newTime) => {
          setTime(newTime);
        },
        onPlayerPositionChange: (pos, rot) => {
          setPlayerPosition(pos);
          setPlayerRotation(rot);
        },
        onLocationDiscovered: (locId) => {},
      },
      playerAppearance
    );

    engineRef.current = engine;
    soundManager.startBackgroundMusic(time.period);

    return () => {
      engine.destroy();
      engineRef.current = null;
      soundManager.stopAll();
    };
  }, [gameMode]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'playing') return;

      const key = e.key.toLowerCase();
      if (activeModal !== 'none') {
        if (key === 'escape') {
          setActiveModal('none');
          setCurrentDialogueNode(null);
        }
        return;
      }

      if (key === 'e' || key === ' ') {
        handleInteract();
      } else if (key === 'i') {
        setActiveModal('inventory');
        soundManager.playInteract();
      } else if (key === 'k') {
        setActiveModal('jobs');
        soundManager.playInteract();
      } else if (key === 'q') {
        setActiveModal('quests');
        soundManager.playInteract();
      } else if (key === 'j') {
        setActiveModal('clues');
        soundManager.playInteract();
      } else if (key === 'm') {
        setActiveModal('map');
        soundManager.playInteract();
      } else if (key === 'r') {
        setActiveModal('relationships');
        soundManager.playInteract();
      } else if (key === 'c') {
        setActiveModal('customize');
        soundManager.playInteract();
      } else if (key === 'escape') {
        setActiveModal('pause');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, activeModal, interactionTarget]);

  // Start New Game
  const handleStartNewGame = () => {
    setInventory(INITIAL_ITEMS);
    setQuests(INITIAL_QUESTS);
    setClues(INITIAL_CLUES);
    setCoins(50000);
    setEnergy(85);
    setCurrentZone('town');
    setActiveCompanionId(null);
    setGameMode('playing');
    setActiveModal('none');
    soundManager.playQuestAccept();
  };

  // Continue Saved Game
  const handleContinueGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.inventory) setInventory(data.inventory);
        if (data.quests) setQuests(data.quests);
        if (data.clues) setClues(data.clues);
        if (data.relationships) setRelationships(data.relationships);
        if (data.time) setTime(data.time);
        if (typeof data.coins === 'number') setCoins(data.coins);
        if (typeof data.energy === 'number') setEnergy(data.energy);
        if (data.currentZone) setCurrentZone(data.currentZone);
        if (data.activeCompanionId) {
          setActiveCompanionId(data.activeCompanionId);
          if (engineRef.current) engineRef.current.setCompanion(data.activeCompanionId);
        }
        if (data.playerAppearance) {
          setPlayerAppearance(data.playerAppearance);
          if (engineRef.current) {
            engineRef.current.updatePlayerAppearance(data.playerAppearance);
          }
        }
        setLastSavedAt(data.savedAt || null);
      } catch (e) {}
    }
    setGameMode('playing');
    setActiveModal('none');
    soundManager.playQuestAccept();
  };

  // Save Game State
  const handleSaveGame = () => {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const saveData = {
      inventory,
      quests,
      clues,
      relationships,
      time,
      coins,
      energy,
      currentZone,
      activeCompanionId,
      playerAppearance,
      savedAt: now,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    setLastSavedAt(now);
    soundManager.playInteract();
  };

  // Character save callback
  const handleSaveAppearance = (newAppearance: CharacterAppearance) => {
    setPlayerAppearance(newAppearance);
    if (engineRef.current) {
      engineRef.current.updatePlayerAppearance(newAppearance);
    }
    if (gameMode === 'menu') {
      setGameMode('playing');
      soundManager.playQuestAccept();
    }
    setActiveModal('none');
    showToast('Tampilan Diperbarui!', `Selamat bertualang, ${newAppearance.name || 'Pengelana'}!`, 'item');
  };

  // Audio Toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // Forward Time
  const handleForwardTime = () => {
    if (engineRef.current) {
      engineRef.current.forwardTimeStep();
    }
  };

  // Unlock Clue Helper
  const unlockClue = useCallback((clueId: string) => {
    setClues((prev) => {
      if (prev.some((c) => c.id === clueId)) return prev;
      const dbClue = ALL_CLUES_DATABASE[clueId];
      if (!dbClue) return prev;

      soundManager.playClueFound();
      showToast('Petunjuk Baru Terungkap!', dbClue.title, 'clue');
      return [...prev, dbClue];
    });
  }, []);

  // Modify Relationship Helper
  const modifyRelationship = useCallback((npcId: string, amount: number) => {
    setRelationships((prev) => {
      const current = prev[npcId] ?? 15;
      const next = Math.min(100, Math.max(0, current + amount));
      return { ...prev, [npcId]: next };
    });
  }, []);

  // Update Quest Step
  const updateQuestStep = useCallback((questId: string, stepIndex: number) => {
    setQuests((prev) => {
      return prev.map((q) => {
        if (q.id !== questId) return q;

        const newSteps = q.steps.map((s, idx) => {
          if (idx < stepIndex) return { ...s, completed: true };
          return s;
        });

        const isCompleted = stepIndex >= q.steps.length;
        if (isCompleted && !q.completed) {
          soundManager.playQuestComplete();
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          showToast('Misi Selesai!', q.title, 'quest');

          if (q.rewards.relationship) {
            modifyRelationship(q.rewards.relationship.npcId, q.rewards.relationship.amount);
          }
          if (q.rewards.clueId) {
            unlockClue(q.rewards.clueId);
          }
        }

        return {
          ...q,
          currentStepIndex: stepIndex,
          steps: newSteps,
          completed: isCompleted,
        };
      });
    });
  }, [modifyRelationship, unlockClue]);

  // Give Item Helper
  const addItemToInventory = useCallback((itemId: string, name?: string) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i));
      }

      let newItem: InventoryItem = {
        id: itemId,
        name: name || itemId,
        category: 'quest',
        description: 'Benda penting yang kamu dapatkan dalam petualangan di Cisini.',
        iconName: 'key',
        quantity: 1,
      };

      if (itemId === 'nasi_soto_bungkus') {
        newItem = {
          id: 'nasi_soto_bungkus',
          name: 'Bungkus Nasi Soto Bu Siti',
          category: 'quest',
          description: 'Nasi soto ayam hangat terbungkus daun pisang yang harum untuk Pak Tejo.',
          iconName: 'package',
          quantity: 1,
        };
      } else if (itemId === 'roda_gigi_kuno') {
        newItem = {
          id: 'roda_gigi_kuno',
          name: 'Roda Gigi Kuningan Antik',
          category: 'mystery',
          description: 'Roda gigi berukir bunga dan roda air yang ditemukan Pak Tejo di bawah beringin.',
          iconName: 'key',
          quantity: 1,
        };
      } else if (itemId === 'kunci_kuningan_joko') {
        newItem = {
          id: 'kunci_kuningan_joko',
          name: 'Kunci Melati Pak Joko',
          category: 'mystery',
          description: 'Kunci antik kuningan berukir melati peninggalan perintis toko kelontong.',
          iconName: 'key',
          quantity: 1,
        };
      } else if (itemId === 'sketsa_lambang_maya') {
        newItem = {
          id: 'sketsa_lambang_maya',
          name: 'Sketsa Lambang Cisini Maya',
          category: 'mystery',
          description: 'Gambar tangan rapi dari Maya yang memuat susunan relief tiga keluarga pendiri.',
          iconName: 'book',
          quantity: 1,
        };
      }

      showToast('Benda Baru Diperoleh!', newItem.name, 'item');
      soundManager.playInteract();
      return [...prev, newItem];
    });
  }, []);

  // Take Item Helper
  const removeItemFromInventory = useCallback((itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Zone Teleportation with Fade-to-Black Transition
  const handleTeleportZone = (targetZone: 'town' | 'kosan' | 'warung', title: string) => {
    setIsTransitioning(true);
    setTransitionMessage(title);
    soundManager.playDoor();

    setTimeout(() => {
      if (engineRef.current) {
        if (targetZone === 'kosan') {
          engineRef.current.teleportPlayer(80, 0.1, 78, 0);
        } else if (targetZone === 'warung') {
          engineRef.current.teleportPlayer(80, 0.1, 117, 0);
        } else {
          // Returning to town
          if (currentZone === 'kosan') {
            engineRef.current.teleportPlayer(-42, 0.1, -33.4, Math.PI);
          } else {
            engineRef.current.teleportPlayer(-10, 0.1, -5.0, Math.PI);
          }
        }
      }
      setCurrentZone(targetZone);
      setInteractionTarget(null);
      showToast(title, targetZone === 'town' ? 'Kembali ke Jalanan Kota Cisini' : 'Berhasil masuk ke dalam ruangan', 'quest');

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 250);
  };

  // Sleep in Bed (Kosan) -> Advance day & full energy
  const handleSleepInBed = () => {
    setTime((prev) => ({
      hour: 6,
      minute: 0,
      period: 'Pagi',
      dayCount: prev.dayCount + 1,
    }));
    setEnergy(maxEnergy);
    soundManager.playQuestComplete();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast('Selamat Pagi!', `Hari ke-${time.dayCount + 1} di Cisini. Energi & stamina pulih 100%!`, 'quest');
  };

  // Drink from Fridge (Kosan) -> +35 Energy
  const handleDrinkFromFridge = () => {
    setEnergy((prev) => Math.min(maxEnergy, prev + 35));
    soundManager.playInteract();
    showToast('Minuman Dingin Segar', 'Tegukan air dingin segar! Stamina +35%', 'item');
  };

  // Eat Food at Warung Table
  const handleEatInWarung = () => {
    if (coins >= 15000) {
      setCoins((c) => c - 15000);
      setEnergy(maxEnergy);
      modifyRelationship('bu_siti', 10);
      soundManager.playQuestComplete();
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      showToast('Soto Ayam Lezat Bu Siti', 'Menikmati seporsi soto ayam hangat gurih! Stamina 100%!', 'item');
    } else {
      setEnergy((e) => Math.min(maxEnergy, e + 20));
      soundManager.playInteract();
      showToast('Kebaikan Bu Siti', 'Bu Siti: "Nggak apa-apa le, minum teh manis hangat dulu ya!" (+20% Stamina)', 'item');
    }
  };

  // Set active companion (Ajak jalan bareng / lepas)
  const handleSetCompanion = (npcId: string | null) => {
    setActiveCompanionId(npcId);
    if (engineRef.current) {
      engineRef.current.setCompanion(npcId);
    }
    if (npcId) {
      const npc = NPCS_DATA[npcId];
      soundManager.playQuestAccept();
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
      showToast('Teman Menemani!', `${npc?.name || 'Teman'} sekarang ikut berjalan dan menjelajahi Cisini bersamamu!`, 'quest');
    } else {
      soundManager.playInteract();
      showToast('Teman Pamit', 'Teman jalan kembali ke rutinitas hariannya.', 'quest');
    }
  };

  // Give gift to an NPC (Beri Hadiah)
  const handleGiveGift = (npcId: string) => {
    const npc = NPCS_DATA[npcId];
    if (coins >= 10000) {
      setCoins((c) => c - 10000);
      modifyRelationship(npcId, 15);
      soundManager.playQuestAccept();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      showToast('Hadiah Diberikan!', `Kamu mentraktir ${npc?.name || 'warga'} oleh-oleh hangat! (+15% Hubungan)`, 'quest');
    } else {
      modifyRelationship(npcId, 5);
      soundManager.playInteract();
      showToast('Obrolan Hangat', `Kamu menyapa hangat ${npc?.name || 'warga'} dengan senyuman tulus. (+5% Hubungan)`, 'quest');
    }
  };

  // Handle Working a Job
  const handleWorkJob = (job: JobListing) => {
    setEnergy((prev) => Math.max(0, prev - job.energyCost));
    setCoins((prev) => prev + job.wage);
    if (job.requiredRelationship) {
      modifyRelationship(job.requiredRelationship.npcId, 12);
    }
    if (job.id === 'job_warung_assistant') {
      addItemToInventory('soto_ayam_bungkus', 'Bungkus Soto Ayam Hangat');
    }
    soundManager.playQuestComplete();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    showToast('Pekerjaan Selesai!', `Kamu menyelesaikan "${job.title}". Upah +Rp ${job.wage.toLocaleString('id-ID')} masuk ke dompetmu!`, 'quest');
  };

  // Handle Interaction Trigger (E / Button)
  const handleInteract = () => {
    if (!interactionTarget) return;
    if (engineRef.current) {
      engineRef.current.triggerInteractGesture();
    }

    if (interactionTarget.type === 'npc' && interactionTarget.data?.npcId) {
      const npcId = interactionTarget.data.npcId;
      const npc = NPCS_DATA[npcId];
      if (npc) {
        setCurrentNpcId(npcId);
        const schedule = npc.schedule[time.period];
        const dialogueId = schedule.dialogueTreeId;
        const node = DIALOGUE_NODES[dialogueId] || DIALOGUE_NODES[`${npcId}_pagi`];
        if (node) {
          setCurrentDialogueNode(node);
          setActiveModal('dialogue');
          soundManager.playInteract();
        }
      }
    } else if (interactionTarget.type === 'item') {
      const itemData = interactionTarget.data;
      if (itemData) {
        addItemToInventory(itemData.itemId, itemData.name);
        if (engineRef.current) {
          engineRef.current.removeInteractiveTarget(interactionTarget.id);
        }
        setInteractionTarget(null);
      }
    } else if (interactionTarget.type === 'inspectable') {
      setInspectData(interactionTarget.data);
      setActiveModal('inspect');
      soundManager.playInteract();
    } else if (interactionTarget.type === 'bench') {
      setActiveModal('bench');
      soundManager.playInteract();
    } else if (interactionTarget.type === 'door') {
      if (interactionTarget.id === 'door_enter_kosan') {
        handleTeleportZone('kosan', 'Memasuki Kamar Kosan No. 07');
      } else if (interactionTarget.id === 'door_exit_kosan') {
        handleTeleportZone('town', 'Keluar ke Jalanan Kota Cisini');
      } else if (interactionTarget.id === 'door_enter_warung') {
        handleTeleportZone('warung', 'Memasuki Warung Bu Siti');
      } else if (interactionTarget.id === 'door_exit_warung') {
        handleTeleportZone('town', 'Keluar ke Alun-Alun Cisini');
      } else {
        // Check if player has all 3 mystery items to unlock the storehouse
        const hasKey = inventory.some((i) => i.id === 'kunci_kuningan_joko');
        const hasGear = inventory.some((i) => i.id === 'roda_gigi_kuno');
        const hasSketch = inventory.some((i) => i.id === 'sketsa_lambang_maya');

        if (hasKey && hasGear && hasSketch) {
          // Complete final main quest
          updateQuestStep('main_03_kapsul_persaudaraan', 3);
          unlockClue('clue_surat_pendiri');
          setInspectData({
            title: 'Kapsul Waktu 1994 Berhasil Terbuka!',
            text: 'Dengan memasukkan Kunci Melati Pak Joko, memasang Roda Gigi Pak Tejo, dan mencocokkan Sketsa Maya, gembok kuningan terbuka dengan dentang melodi lembut! Di dalamnya tersimpan surat wasiat pendiri Cisini dan album kenangan bersama. Seluruh warga berkumpul dalam kehangatan dan rasa syukur.',
          });
          setActiveModal('inspect');
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        } else {
          setInspectData({
            title: 'Pintu Gudang Kapsul Waktu Terkunci',
            text: 'Pintu besi tua ini memiliki tiga slot kuningan berukir: Satu untuk Kunci Melati (Pak Joko), satu untuk Roda Gigi Kuno (Pak Tejo), dan satu untuk Kode Aksara (Maya). Kamu perlu mengumpulkan ketiganya untuk membuka rahasia ini.',
          });
          setActiveModal('inspect');
        }
      }
    } else if (interactionTarget.type === 'bed') {
      handleSleepInBed();
    } else if (interactionTarget.type === 'wardrobe') {
      setActiveModal('customize');
      soundManager.playInteract();
    } else if (interactionTarget.type === 'desk') {
      setActiveModal('clues');
      soundManager.playInteract();
    } else if (interactionTarget.type === 'fridge') {
      handleDrinkFromFridge();
    } else if (interactionTarget.type === 'job_station') {
      setActiveModal('jobs');
      soundManager.playInteract();
    } else if (interactionTarget.type === 'food_table') {
      handleEatInWarung();
    }
  };

  // Dialogue Choice Selection
  const handleSelectChoice = (choice: DialogueChoice) => {
    if (choice.relationshipChange) {
      modifyRelationship(choice.relationshipChange.npcId, choice.relationshipChange.amount);
    }
    if (choice.rewardItem) {
      addItemToInventory(choice.rewardItem);
    }
    if (choice.triggerQuest) {
      const q = quests.find((item) => item.id === choice.triggerQuest);
      if (q && !q.completed) {
        showToast('Misi Baru Diterima!', q.title, 'quest');
        soundManager.playQuestAccept();
      }
    }
    if (choice.triggerClue) {
      unlockClue(choice.triggerClue);
    }

    const nextNode = DIALOGUE_NODES[choice.nextId];
    if (nextNode) {
      handleProcessDialogueNode(nextNode);
    } else {
      setActiveModal('none');
      setCurrentDialogueNode(null);
    }
  };

  const handleNextDialogueNode = (nextId?: string) => {
    if (!nextId) {
      setActiveModal('none');
      setCurrentDialogueNode(null);
      return;
    }
    const nextNode = DIALOGUE_NODES[nextId];
    if (nextNode) {
      handleProcessDialogueNode(nextNode);
    } else {
      setActiveModal('none');
      setCurrentDialogueNode(null);
    }
  };

  const handleProcessDialogueNode = (node: DialogueNode) => {
    if (node.giveItem) {
      addItemToInventory(node.giveItem);
    }
    if (node.takeItem) {
      removeItemFromInventory(node.takeItem);
    }
    if (node.unlockClueId) {
      unlockClue(node.unlockClueId);
    }
    if (node.setQuestStep) {
      updateQuestStep(node.setQuestStep.questId, node.setQuestStep.step);
    }
    setCurrentDialogueNode(node);
  };

  // Fast travel from Map modal
  const handleFastTravel = (pos: [number, number, number]) => {
    if (engineRef.current) {
      engineRef.current.teleportPlayer(pos[0], 0, pos[2] + 2.5);
    }
  };

  // Active quest display
  const activeQuest = quests.find((q) => !q.completed) || quests[0] || null;

  return (
    <main id="cisini-app-root" className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        id="cisini-canvas-container"
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Main Menu Screen */}
      {gameMode === 'menu' && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenCustomize={() => {
            setActiveModal('customize');
            soundManager.playInteract();
          }}
          hasSaveData={hasSaveData}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* In-Game HUD (Overlays during gameplay) */}
      {gameMode === 'playing' && (
        <>
          <HUD
            time={time}
            activeQuest={activeQuest}
            interactionTarget={interactionTarget}
            coins={coins}
            energy={energy}
            maxEnergy={maxEnergy}
            currentZone={currentZone}
            companionName={activeCompanionId ? NPCS_DATA[activeCompanionId]?.name : null}
            onOpenInventory={() => { setActiveModal('inventory'); soundManager.playInteract(); }}
            onOpenQuests={() => { setActiveModal('quests'); soundManager.playInteract(); }}
            onOpenClues={() => { setActiveModal('clues'); soundManager.playInteract(); }}
            onOpenMap={() => { setActiveModal('map'); soundManager.playInteract(); }}
            onOpenRelationships={() => { setActiveModal('relationships'); soundManager.playInteract(); }}
            onOpenJobs={() => { setActiveModal('jobs'); soundManager.playInteract(); }}
            onOpenCustomize={() => { setActiveModal('customize'); soundManager.playInteract(); }}
            onOpenPause={() => { setActiveModal('pause'); soundManager.playInteract(); }}
            onInteract={handleInteract}
            onForwardTime={handleForwardTime}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            playerPosition={playerPosition}
            playerRotation={playerRotation}
          />

          {/* Mobile Joystick & Action Buttons */}
          <MobileControls
            onMove={(vec, sprint) => {
              if (engineRef.current) {
                engineRef.current.setVirtualMove(vec, sprint);
              }
            }}
            onInteract={handleInteract}
            hasInteractionTarget={!!interactionTarget}
          />
        </>
      )}

      {/* Dialogue Modal */}
      {activeModal === 'dialogue' && currentDialogueNode && (
        <DialogueModal
          dialogueNode={currentDialogueNode}
          npc={currentNpcId ? NPCS_DATA[currentNpcId] : undefined}
          relationshipScore={currentNpcId ? relationships[currentNpcId] : 15}
          gameState={{
            player: { position: playerPosition, rotation: playerRotation, name: 'Pengelana' },
            time,
            inventory,
            quests,
            clues,
            npcRelationships: relationships,
            discoveredLocations: [],
            flags: {},
            playTimeMinutes: 0,
          }}
          onSelectChoice={handleSelectChoice}
          onNextNode={handleNextDialogueNode}
          onClose={() => {
            setActiveModal('none');
            setCurrentDialogueNode(null);
          }}
        />
      )}

      {/* Inventory Modal */}
      {activeModal === 'inventory' && (
        <InventoryModal
          items={inventory}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Quests Modal */}
      {activeModal === 'quests' && (
        <QuestModal
          quests={quests}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Relationship / Resident Directory Modal */}
      {activeModal === 'relationships' && (
        <RelationshipModal
          npcs={NPCS_DATA}
          relationships={relationships}
          currentPeriod={time.period}
          activeCompanionId={activeCompanionId}
          onSetCompanion={handleSetCompanion}
          onGiveGift={handleGiveGift}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Jobs / Work Minigame Modal */}
      {activeModal === 'jobs' && (
        <JobModal
          coins={coins}
          energy={energy}
          maxEnergy={maxEnergy}
          relationships={relationships}
          onClose={() => setActiveModal('none')}
          onWorkJob={handleWorkJob}
        />
      )}

      {/* Clues & Mystery Board Modal */}
      {activeModal === 'clues' && (
        <ClueBoardModal
          clues={clues}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Map Modal */}
      {activeModal === 'map' && (
        <MapModal
          locations={TOWN_LOCATIONS}
          npcs={NPCS_DATA}
          currentPeriod={time.period}
          playerPosition={playerPosition}
          onFastTravel={handleFastTravel}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Pause & Save/Load Modal */}
      {activeModal === 'pause' && (
        <PauseModal
          onClose={() => setActiveModal('none')}
          onSaveGame={handleSaveGame}
          onLoadGame={handleContinueGame}
          onOpenCustomize={() => {
            setActiveModal('customize');
            soundManager.playInteract();
          }}
          onReturnToMainMenu={() => {
            setGameMode('menu');
            setActiveModal('none');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          lastSavedAt={lastSavedAt}
        />
      )}

      {/* Character Creator Modal */}
      {activeModal === 'customize' && (
        <CharacterCreatorModal
          isOpen={true}
          initialAppearance={playerAppearance}
          onSave={handleSaveAppearance}
          onClose={() => setActiveModal('none')}
          isFirstTime={gameMode === 'menu'}
        />
      )}

      {/* Inspectable Target Popup (Plaque, Door, Sign) */}
      {activeModal === 'inspect' && inspectData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>PEMERIKSAAN OBJEK CISINI</span>
            </div>
            <h3 className="text-xl font-bold text-stone-100 mb-3">{inspectData.title}</h3>
            <p className="text-sm text-stone-300 leading-relaxed bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
              {inspectData.text}
            </p>
            <button
              id="inspect-close-btn"
              onClick={() => {
                setActiveModal('none');
                setInspectData(null);
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow transition"
            >
              Tutup Catatan
            </button>
          </div>
        </div>
      )}

      {/* Bench Rest / Time Changer Modal */}
      {activeModal === 'bench' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-bold">Duduk Santai & Atur Waktu</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Kamu bisa beristirahat sejenak di bangku ini dan menikmati pergantian suasana kota Cisini:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(['Pagi', 'Siang', 'Sore', 'Malam'] as TimeOfDay[]).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    if (engineRef.current) {
                      engineRef.current.setPeriod(period);
                    }
                    setActiveModal('none');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    time.period === period
                      ? 'bg-amber-500 text-stone-950 border-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                  }`}
                >
                  <span>Waktu {period}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-semibold mt-1"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-stone-900/95 border-2 border-amber-400 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          <div className="p-2 rounded-xl bg-amber-500 text-stone-950">
            {toast.type === 'quest' ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{toast.title}</div>
            <div className="text-sm font-semibold text-stone-200">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Interior Door Transition Fade-to-Black */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center text-stone-100 pointer-events-auto select-none transition-opacity duration-300 animate-in fade-in">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-base font-bold text-amber-300 tracking-wide">{transitionMessage}</span>
          <span className="text-xs text-stone-400 mt-1">Cisini Stories</span>
        </div>
      )}
    </main>
  );
}
