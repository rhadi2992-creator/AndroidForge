export type Screen = 
  | 'splash'
  | 'main-menu'
  | 'gameplay'
  | 'level-select'
  | 'character-select'
  | 'shop'
  | 'settings'
  | 'android-info';

export type Lane = -1 | 0 | 1; // Left, Center, Right

export type PlayerAction = 'idle' | 'running' | 'jumping' | 'sliding' | 'lane-change-left' | 'lane-change-right' | 'stumble' | 'crash' | 'tackle';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export type EnvironmentType = 
  | 'modern-city'
  | 'residential-streets'
  | 'shopping-district'
  | 'industrial-area'
  | 'highway'
  | 'night-city'
  | 'rainy-city'
  | 'green-park'
  | 'old-town'
  | 'downtown-traffic';

export type MissionType = 
  | 'bank-robbery'
  | 'handbag-snatch'
  | 'jewellery-heist'
  | 'phone-theft'
  | 'backpack-recovery'
  | 'briefcase-chase'
  | 'museum-relic'
  | 'delivery-package';

export type ObstacleType = 
  | 'parked-sedan'
  | 'moving-sedan'
  | 'moving-suv'
  | 'city-bus'
  | 'motorcycle'
  | 'traffic-barrier'
  | 'jersey-barrier'
  | 'construction-zone'
  | 'traffic-cones'
  | 'low-hurdle'
  | 'overhead-sign'
  | 'road-trench'
  | 'road-bottle'
  | 'road-football';

export type PowerUpType = 
  | 'magnet'
  | 'shield'
  | 'boost'
  | 'double-coins'
  | 'invincible'
  | 'distraction-throw';

export interface PowerUpActive {
  type: PowerUpType;
  remainingTime: number;
  duration: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  unlocked: boolean;
  costCoins: number;
  costGems: number;
  stats: {
    speedBonus: number; // 0 to 1
    agility: number; // Lane switch speed factor
    magnetBonus: number; // Extra duration seconds
    shieldStrength: number; // Max hits or bonus duration
  };
  appearance: {
    skinTone: string;
    hairColor: string;
    jacketColor: string;
    pantsColor: string;
    accentColor: string;
    hasVisor?: boolean;
    hasHoodie?: boolean;
    hasBackpack?: boolean;
  };
}

export interface StoryMissionDetails {
  missionType: MissionType;
  storyTitle: string;
  storyIntro: string;
  victimName: string;
  victimRole: string;
  suspectName: string;
  suspectTitle: string;
  stolenItemName: string;
  stolenItemIcon: string;
  victimDialogue: string;
  recoveryTarget: number; // e.g. 5 jewellery pieces or 1 stolen bag
}

export interface LevelDefinition {
  levelNumber: number;
  tier: 'beginner' | 'easy-medium' | 'medium' | 'hard' | 'expert';
  environment: EnvironmentType;
  distanceObjective: number; // meters
  coinObjective: number;
  baseSpeed: number; // initial m/s
  obstacleDensity: number; // 1 to 5
  rewardCoins: number;
  rewardGems: number;
  hasMovingTraffic: boolean;
  hasOverheadObstacles: boolean;
  story: StoryMissionDetails;
}

export interface PlayerProgress {
  coins: number;
  gems: number;
  highScore: number;
  totalDistanceRun: number;
  unlockedLevel: number;
  completedLevels: Record<number, { stars: number; highScore: number; recovered: boolean }>;
  selectedCharacterId: string;
  unlockedCharacters: string[];
  // Story recovery statistics
  recoveredJewellery: number;
  recoveredHandbags: number;
  arrestedSuspects: number;
  totalRecoveredItems: number;
  powerUpUpgrades: {
    magnet: number; // level 1-5
    shield: number;
    boost: number;
    doubleCoins: number;
    invincible: number;
  };
  settings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    vibrationEnabled: boolean;
    graphicsQuality: GraphicsQuality;
    swipeSensitivity: number; // 0.5 to 2.0
  };
}

export interface RunStats {
  score: number;
  distance: number;
  coins: number;
  gems: number;
  obstaclesDodged: number;
  hasUsedRevive: boolean;
  isCompleted: boolean;
  // Story Chase metrics
  suspectDistance: number; // distance in meters ahead of player
  recoveredItemsCount: number; // items recovered in current mission
  distractionKicksAvailable: number;
  suspectCaptured: boolean;
  suspectEscaped: boolean;
}
