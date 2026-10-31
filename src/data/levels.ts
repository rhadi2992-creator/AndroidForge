import { EnvironmentType, LevelDefinition, MissionType, StoryMissionDetails } from '../types/game';

const ENV_ROTATION: EnvironmentType[] = [
  'modern-city',
  'residential-streets',
  'shopping-district',
  'industrial-area',
  'highway',
  'night-city',
  'rainy-city',
  'green-park',
  'old-town',
  'downtown-traffic',
];

interface StoryTemplate {
  missionType: MissionType;
  title: string;
  intro: string;
  victimName: string;
  victimRole: string;
  suspectName: string;
  suspectTitle: string;
  stolenItemName: string;
  stolenItemIcon: string;
  victimDialogue: string;
  baseRecoveryTarget: number;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  {
    missionType: 'bank-robbery',
    title: 'Central Vault Robbery',
    intro: 'A notorious robber broke into the Central City Bank vault, grabbed heavy cash sacks, and is sprinting down the avenue into traffic!',
    victimName: 'Arthur Vance',
    victimRole: 'Metro Bank Manager',
    suspectName: 'Slick Eddie',
    suspectTitle: 'Vault Breaker',
    stolenItemName: 'Bank Cash Sacks',
    stolenItemIcon: '💰',
    victimDialogue: 'Thank heavens! The vault reserves are safe! Take this criminal to the police precinct!',
    baseRecoveryTarget: 3,
  },
  {
    missionType: 'handbag-snatch',
    title: 'Sidewalk Handbag Snatch',
    intro: 'A woman standing near the cafe had her luxury designer handbag snatched right out of her hands! The thief is fleeing down the street!',
    victimName: 'Sarah Jenkins',
    victimRole: 'City Pedestrian',
    suspectName: 'Shadow Fox',
    suspectTitle: 'Alley Pickpocket',
    stolenItemName: 'Designer Handbag',
    stolenItemIcon: '👜',
    victimDialogue: 'Oh thank you so much! My passport, phone and family photos were inside! You are a hero!',
    baseRecoveryTarget: 1,
  },
  {
    missionType: 'jewellery-heist',
    title: 'Grand Diamond Heist',
    intro: 'The display window at Bellini Jewelers was smashed! The suspect is fleeing through the district dropping precious gems along the asphalt!',
    victimName: 'Marco Bellini',
    victimRole: 'Master Jeweller',
    suspectName: 'The Phantom Jewel Thief',
    suspectTitle: 'Diamond Smuggler',
    stolenItemName: 'Diamond Royale Necklace',
    stolenItemIcon: '💎',
    victimDialogue: 'Incredible recovery! The city jewel collection is preserved thanks to your brave pursuit!',
    baseRecoveryTarget: 5,
  },
  {
    missionType: 'phone-theft',
    title: 'Flagship Phone Theft',
    intro: 'A tourist admiring the skyline had their flagship smartphone swiped by a swift street runner weaving through oncoming traffic!',
    victimName: 'Liam Chen',
    victimRole: 'Visiting Tourist',
    suspectName: 'Danny Sprint',
    suspectTitle: 'Transit Thief',
    stolenItemName: 'Flagship Smartphone',
    stolenItemIcon: '📱',
    victimDialogue: 'Unbelievable! You caught him! All my travel documents and photos are recovered!',
    baseRecoveryTarget: 1,
  },
  {
    missionType: 'backpack-recovery',
    title: 'Campus Tech Backpack',
    intro: 'A college researcher had their gear backpack stolen containing valuable thesis research and tech blueprints!',
    victimName: 'Maya Patel',
    victimRole: 'Tech Researcher',
    suspectName: 'Jax Rigger',
    suspectTitle: 'Rooftop Scavenger',
    stolenItemName: 'Research Tech Backpack',
    stolenItemIcon: '🎒',
    victimDialogue: 'My years of scientific research are saved! I cannot thank you enough!',
    baseRecoveryTarget: 1,
  },
  {
    missionType: 'briefcase-chase',
    title: 'Confidential Executive Briefcase',
    intro: 'A corporate courier carrying encrypted trade contracts was intercepted on the avenue! Stop the courier before they reach their getaway car!',
    victimName: 'Elena Rostova',
    victimRole: 'Executive Officer',
    suspectName: 'Agent Zero',
    suspectTitle: 'Corporate Spy',
    stolenItemName: 'Encrypted Briefcase',
    stolenItemIcon: '💼',
    victimDialogue: 'The security of our entire foundation was in that case. Flawless work, officer!',
    baseRecoveryTarget: 1,
  },
  {
    missionType: 'museum-relic',
    title: 'Ancient Golden Relic',
    intro: 'An antiquity smuggler snuck an ancient golden chalice from the Museum of Fine Arts! Chase them down through Old Town!',
    victimName: 'Professor Sterling',
    victimRole: 'Museum Curator',
    suspectName: 'Victor Ramos',
    suspectTitle: 'Antiquity Smuggler',
    stolenItemName: 'Golden Royal Relic',
    stolenItemIcon: '🏺',
    victimDialogue: 'A priceless historical treasure returned to the people! Exemplary courage!',
    baseRecoveryTarget: 1,
  },
  {
    missionType: 'delivery-package',
    title: 'Stolen Priority Delivery',
    intro: 'A porch pirate stole rare medical supplies from an emergency courier van! Intercept the fleeing suspect immediately!',
    victimName: 'Carlos Gomez',
    victimRole: 'Express Courier',
    suspectName: 'Buster Brown',
    suspectTitle: 'Porch Pirate',
    stolenItemName: 'Emergency Medical Box',
    stolenItemIcon: '📦',
    victimDialogue: 'You saved lives today by catching that thief so quickly! Outstanding pursuit!',
    baseRecoveryTarget: 2,
  },
];

export function generate100StoryLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];

  for (let i = 1; i <= 100; i++) {
    let tier: LevelDefinition['tier'];
    let baseSpeed: number;
    let distanceObjective: number;
    let coinObjective: number;
    let obstacleDensity: number;
    let rewardCoins: number;
    let rewardGems: number;
    let hasMovingTraffic = false;
    let hasOverheadObstacles = false;

    // Environment cycles smoothly
    const envIndex = (i - 1) % ENV_ROTATION.length;
    const environment = ENV_ROTATION[envIndex];

    // Story template rotation
    const storyTemplate = STORY_TEMPLATES[(i - 1) % STORY_TEMPLATES.length];

    if (i <= 20) {
      // Beginner
      tier = 'beginner';
      baseSpeed = 16 + (i - 1) * 0.3; // 16 to 21.7 m/s
      distanceObjective = 350 + i * 25; // 375m to 850m
      coinObjective = 40 + i * 5; // 45 to 140 coins
      obstacleDensity = 1.2 + (i / 20) * 0.8;
      rewardCoins = 200 + i * 25;
      rewardGems = i % 5 === 0 ? 3 : 1;
      hasMovingTraffic = i >= 12;
      hasOverheadObstacles = i >= 8;
    } else if (i <= 40) {
      // Easy to Medium
      tier = 'easy-medium';
      const step = i - 20;
      baseSpeed = 22 + step * 0.25; // 22.25 to 27 m/s
      distanceObjective = 850 + step * 40; // 890m to 1650m
      coinObjective = 140 + step * 8; // 148 to 300 coins
      obstacleDensity = 2.0 + (step / 20) * 0.8;
      rewardCoins = 650 + step * 40;
      rewardGems = step % 5 === 0 ? 5 : 2;
      hasMovingTraffic = true;
      hasOverheadObstacles = true;
    } else if (i <= 60) {
      // Medium
      tier = 'medium';
      const step = i - 40;
      baseSpeed = 27 + step * 0.2; // 27.2 to 31 m/s
      distanceObjective = 1650 + step * 50; // 1700m to 2650m
      coinObjective = 300 + step * 10; // 310 to 500 coins
      obstacleDensity = 2.8 + (step / 20) * 0.8;
      rewardCoins = 1450 + step * 50;
      rewardGems = step % 4 === 0 ? 6 : 3;
      hasMovingTraffic = true;
      hasOverheadObstacles = true;
    } else if (i <= 80) {
      // Hard
      tier = 'hard';
      const step = i - 60;
      baseSpeed = 31 + step * 0.2; // 31.2 to 35 m/s
      distanceObjective = 2650 + step * 60; // 2710m to 3850m
      coinObjective = 500 + step * 12; // 512 to 740 coins
      obstacleDensity = 3.6 + (step / 20) * 0.7;
      rewardCoins = 2500 + step * 70;
      rewardGems = step % 3 === 0 ? 8 : 4;
      hasMovingTraffic = true;
      hasOverheadObstacles = true;
    } else {
      // Expert (81-100)
      tier = 'expert';
      const step = i - 80;
      baseSpeed = 35 + step * 0.25; // 35.25 to 40 m/s
      distanceObjective = 3850 + step * 80; // 3930m to 5450m
      coinObjective = 750 + step * 15; // 765 to 1050 coins
      obstacleDensity = 4.3 + (step / 20) * 0.7;
      rewardCoins = 4000 + step * 120;
      rewardGems = 8 + Math.floor(step / 3);
      hasMovingTraffic = true;
      hasOverheadObstacles = true;
    }

    const story: StoryMissionDetails = {
      missionType: storyTemplate.missionType,
      storyTitle: `${storyTemplate.title} #${i}`,
      storyIntro: storyTemplate.intro,
      victimName: storyTemplate.victimName,
      victimRole: storyTemplate.victimRole,
      suspectName: `${storyTemplate.suspectName} ${i > 20 ? `(Mark ${Math.floor(i / 10)})` : ''}`,
      suspectTitle: storyTemplate.suspectTitle,
      stolenItemName: storyTemplate.stolenItemName,
      stolenItemIcon: storyTemplate.stolenItemIcon,
      victimDialogue: storyTemplate.victimDialogue,
      recoveryTarget: storyTemplate.baseRecoveryTarget + (i > 50 ? 2 : 0),
    };

    levels.push({
      levelNumber: i,
      tier,
      environment,
      distanceObjective,
      coinObjective,
      baseSpeed: Math.round(baseSpeed * 10) / 10,
      obstacleDensity: Math.round(obstacleDensity * 10) / 10,
      rewardCoins,
      rewardGems,
      hasMovingTraffic,
      hasOverheadObstacles,
      story,
    });
  }

  return levels;
}

export const LEVELS = generate100StoryLevels();

export function getLevel(num: number): LevelDefinition {
  const found = LEVELS.find((l) => l.levelNumber === num);
  return found || LEVELS[0];
}
