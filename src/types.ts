export type TimeOfDay = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export interface TimeState {
  hour: number; // 6 to 24
  minute: number; // 0 to 59
  period: TimeOfDay;
  dayCount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'general' | 'quest' | 'mystery';
  description: string;
  iconName: string;
  usable?: boolean;
  canExamine?: boolean;
  examineText?: string;
  quantity: number;
}

export interface DialogueChoice {
  text: string;
  nextId: string;
  relationshipChange?: { npcId: string; amount: number };
  rewardItem?: string;
  triggerQuest?: string;
  triggerClue?: string;
  condition?: (state: GameState) => boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle?: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'thoughtful' | 'surprised' | 'mysterious';
  choices?: DialogueChoice[];
  nextId?: string; // If no choices, auto continue or end
  giveItem?: string;
  takeItem?: string;
  rewardItem?: string;
  triggerQuest?: string;
  relationshipChange?: { npcId: string; amount: number };
  unlockClueId?: string;
  setQuestStep?: { questId: string; step: number };
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  age: number;
  gender?: 'female' | 'male';
  canRomance?: boolean;
  jobPlace?: string;
  description: string;
  personality: string;
  appearance: {
    hairColor: string;
    hairStyle: string;
    shirtColor: string;
    shirtStyle?: string;
    pantsColor: string;
    pantsStyle?: string;
    skinColor: string;
    accessory?: string;
    scale?: number;
  };
  relationship: number; // 0 to 100
  relationshipTitle: string; // Kenalan, Teman, Sahabat, Kepercayaan
  schedule: Record<TimeOfDay, {
    locationName: string;
    position: [number, number, number];
    rotation: number;
    activity: string;
    dialogueTreeId: string;
  }>;
  homeArea: string;
  secretInfo: string;
}

export interface QuestStep {
  id: number;
  description: string;
  targetNPC?: string;
  targetLocation?: string;
  requiredItem?: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  category: 'main' | 'side';
  giverNpcId: string;
  summary: string;
  steps: QuestStep[];
  currentStepIndex: number;
  completed: boolean;
  rewards: {
    relationship?: { npcId: string; amount: number };
    item?: string;
    clueId?: string;
    notes: string;
  };
}

export interface Clue {
  id: string;
  title: string;
  category: 'object' | 'rumor' | 'location' | 'history';
  description: string;
  discoveredAt: string;
  connectedClues: string[];
  solved: boolean;
  notes: string;
  relatedNPC?: string;
}

export interface InteractionTarget {
  id: string;
  type:
    | 'npc'
    | 'item'
    | 'building'
    | 'inspectable'
    | 'door'
    | 'bench'
    | 'bed'
    | 'wardrobe'
    | 'desk'
    | 'fridge'
    | 'job_station'
    | 'food_table';
  name: string;
  promptText: string;
  position: [number, number, number];
  distance?: number;
  data?: any;
}

export type InteractiveTarget = InteractionTarget;

export interface TownLocation {
  id: string;
  name: string;
  description: string;
  mapCoordinates: [number, number]; // 0 to 100%
  worldPosition: [number, number, number];
  isSecret?: boolean;
  discovered?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  showControlsHint: boolean;
  graphicsQuality: 'high' | 'medium';
}

export interface CharacterAppearance {
  name?: string;
  gender?: 'male' | 'female';
  skinColor?: string;
  shirtColor?: string;
  shirtStyle?:
    | 'casual'
    | 'jacket'
    | 'hoodie'
    | 'batik'
    | 'vest'
    | 'oversized_tee'
    | 'kemeja_formal'
    | 'seragam_sekolah'
    | 'kebaya'
    | 'jersey'
    | 'apron_koki'
    | 'jaket_kulit'
    | 'sweater'
    | 'baju_kurir';
  pantsColor?: string;
  pantsStyle?:
    | 'jeans'
    | 'formal'
    | 'cargo'
    | 'skirt'
    | 'pleated_skirt'
    | 'shorts'
    | 'sarung'
    | 'jogger'
    | 'kulot'
    | 'training';
  hairColor?: string;
  hairStyle?:
    | 'short'
    | 'spiky'
    | 'undercut'
    | 'curls'
    | 'long'
    | 'bob'
    | 'bun'
    | 'ponytail'
    | 'twin_tails'
    | 'hijab'
    | 'peci'
    | 'caping'
    | 'blangkon'
    | 'beanie'
    | 'bandana'
    | 'hat';
  accessory?:
    | 'none'
    | 'glasses'
    | 'sunglasses'
    | 'headphone'
    | 'masker'
    | 'tas_kamera'
    | 'apron'
    | 'clipboard'
    | 'satchel'
    | 'backpack'
    | 'scarf'
    | 'hat'
    | 'caping';
  scale?: number;
  isPlayer?: boolean;
}

export interface JobListing {
  id: string;
  title: string;
  employer: string;
  location: string;
  description: string;
  wage: number;
  energyCost: number;
  durationMinutes: number;
  icon: string;
  bonusReward?: string;
  requiredRelationship?: { npcId: string; minPoints: number };
}

export interface GameState {
  player: {
    position: [number, number, number];
    rotation: number;
    name: string;
    coins: number;
    energy: number;
    maxEnergy: number;
    currentZone: 'town' | 'kosan' | 'warung';
    activeCompanionId: string | null;
    appearance?: CharacterAppearance;
  };
  time: TimeState;
  inventory: InventoryItem[];
  quests: Quest[];
  clues: Clue[];
  npcRelationships: Record<string, number>;
  discoveredLocations: string[];
  flags: Record<string, boolean>;
  playTimeMinutes: number;
}
