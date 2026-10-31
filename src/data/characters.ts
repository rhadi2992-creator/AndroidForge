import { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'marcus-dash',
    name: 'Marcus "Dash" Vance',
    title: 'Street Parkour Specialist',
    description: 'A seasoned urban runner with quick reflexes and balanced athletic endurance for navigating heavy city traffic.',
    unlocked: true,
    costCoins: 0,
    costGems: 0,
    stats: {
      speedBonus: 0.1,
      agility: 1.0,
      magnetBonus: 1.0,
      shieldStrength: 1.0,
    },
    appearance: {
      skinTone: '#a47252',
      hairColor: '#1c1917',
      jacketColor: '#e11d48', // Crimson sports windbreaker
      pantsColor: '#1e293b',  // Dark slate athletic joggers
      accentColor: '#f59e0b', // Amber accents & watch
      hasBackpack: true,
    },
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    title: 'Urban Infiltrator',
    description: 'Fast, agile, and razor-sharp. Her lightweight tactical gear provides superior lane-changing speed and coin attraction.',
    unlocked: false,
    costCoins: 2500,
    costGems: 15,
    stats: {
      speedBonus: 0.15,
      agility: 1.35,
      magnetBonus: 1.4,
      shieldStrength: 1.0,
    },
    appearance: {
      skinTone: '#e0b59b',
      hairColor: '#451a03',
      jacketColor: '#0284c7', // Sky cyan tactical runner jacket
      pantsColor: '#0f172a',  // Black compression leggings
      accentColor: '#38bdf8', // Neon cyan accents
      hasBackpack: false,
    },
  },
  {
    id: 'takeshi-sato',
    name: 'Takeshi Sato',
    title: 'Cyber Courier',
    description: 'Equipped with a high-tech HUD visor and kinetic capacitors that extend power-up durations significantly.',
    unlocked: false,
    costCoins: 6000,
    costGems: 30,
    stats: {
      speedBonus: 0.2,
      agility: 1.15,
      magnetBonus: 1.8,
      shieldStrength: 1.25,
    },
    appearance: {
      skinTone: '#d9a785',
      hairColor: '#09090b',
      jacketColor: '#10b981', // Emerald techwear jacket
      pantsColor: '#27272a',  // Dark cargo pants
      accentColor: '#34d399', // Bright mint glow
      hasVisor: true,
      hasHoodie: true,
    },
  },
  {
    id: 'amara-okafor',
    name: 'Amara Okafor',
    title: 'Apex Sprinter',
    description: 'A champion athlete whose explosive acceleration and long stride give her unmatched top-end velocity.',
    unlocked: false,
    costCoins: 12000,
    costGems: 60,
    stats: {
      speedBonus: 0.35,
      agility: 1.25,
      magnetBonus: 1.2,
      shieldStrength: 1.3,
    },
    appearance: {
      skinTone: '#5c3826',
      hairColor: '#171717',
      jacketColor: '#8b5cf6', // Electric violet athletic top
      pantsColor: '#18181b',  // Onyx track shorts
      accentColor: '#c084fc', // Lilac racing stripes
      hasVisor: true,
    },
  },
  {
    id: 'jax-stone',
    name: 'Jax "Brawler" Stone',
    title: 'Heavyweight Enforcer',
    description: 'Built like a vault. His durable armor absorbs sudden impacts and maintains maximum stability at top speeds.',
    unlocked: false,
    costCoins: 20000,
    costGems: 100,
    stats: {
      speedBonus: 0.05,
      agility: 0.95,
      magnetBonus: 1.0,
      shieldStrength: 2.0,
    },
    appearance: {
      skinTone: '#b98b71',
      hairColor: '#292524',
      jacketColor: '#d97706', // Heavy amber leather motorcycle jacket
      pantsColor: '#374151',  // Rugged denim/cargo trousers
      accentColor: '#fbbf24', // Brass hardware & steel buckles
      hasBackpack: true,
    },
  },
];
