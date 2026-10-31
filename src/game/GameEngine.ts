import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Character, EnvironmentType, GraphicsQuality, Lane, LevelDefinition, PowerUpActive, PowerUpType, RunStats } from '../types/game';
import { CharacterRig } from './CharacterModel';
import { SuspectRig } from './SuspectModel';
import { EnvironmentManager } from './EnvironmentManager';
import { VehicleFactory } from './VehicleModels';
import { ObstacleFactory, ObstacleHitbox } from './ObstacleModels';
import { soundEngine } from './AudioSynthesizer';
import { admobService } from '../services/admobBridge';

interface TrackChunk {
  group: THREE.Group;
  zStart: number;
  zEnd: number;
}

interface ActiveObstacle {
  mesh: THREE.Group;
  lane: Lane;
  z: number;
  hitbox: ObstacleHitbox;
  isMoving: boolean;
  speed: number;
  passed: boolean;
  isKickable?: boolean;
}

interface ActivePickup {
  mesh: THREE.Group;
  type: 'coin' | 'gem' | 'stolen-item' | 'football' | PowerUpType;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Environment & Scenery
  public envManager: EnvironmentManager;

  // Characters
  public characterRig: CharacterRig;
  public currentCharacter: Character;
  public suspect: SuspectRig | null = null;
  public policeCar: THREE.Group | null = null;

  // Track & Pooling
  private chunks: TrackChunk[] = [];
  private readonly CHUNK_LENGTH = 40;
  private readonly VISIBLE_CHUNKS = 8;
  private nextChunkZ = 0;

  // Game Entities
  private obstacles: ActiveObstacle[] = [];
  private pickups: ActivePickup[] = [];

  // Player Kinematics
  public currentLane: Lane = 0;
  public targetLane: Lane = 0;
  public playerX = 0;
  public playerY = 0;
  public playerZ = 0;
  public playerVy = 0;
  public isJumping = false;
  public isSliding = false;
  private slideTimer = 0;
  private readonly SLIDE_DURATION = 0.75;
  private readonly JUMP_GRAVITY = -34;
  private readonly JUMP_INITIAL_VELOCITY = 10.8;

  // Gameplay Run State
  public isRunning = false;
  public isPaused = false;
  public currentSpeed = 18;
  public currentLevel: LevelDefinition | null = null;
  public isEndlessMode = false;
  public stats: RunStats;

  // Power-Ups
  public activePowerUps: Map<PowerUpType, PowerUpActive> = new Map();
  public isInvulnerable = false;
  private invulnerableTimer = 0;

  // Performance & Loop
  private isSoftwareGl = false;
  private frameId = 0;
  private clock = new THREE.Clock();

  // Callbacks for React UI
  public onStatsUpdate?: (stats: RunStats, speed: number, powerUps: PowerUpActive[]) => void;
  public onGameOver?: (stats: RunStats) => void;
  public onLevelComplete?: (stats: RunStats) => void;

  constructor(container: HTMLElement, character: Character, environmentType: EnvironmentType = 'modern-city') {
    this.container = container;
    this.currentCharacter = character;

    this.stats = {
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      obstaclesDodged: 0,
      hasUsedRevive: false,
      isCompleted: false,
      suspectDistance: 28,
      recoveredItemsCount: 0,
      distractionKicksAvailable: 2,
      suspectCaptured: false,
      suspectEscaped: false,
    };

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 350);
    this.camera.position.set(0, 3.8, -4.8);
    this.camera.lookAt(0, 1.4, 6.0);

    // 4. Studio Environment Lighting
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Environment & Weather Rig
    this.envManager = new EnvironmentManager(this.scene, environmentType);

    // 6. Character
    this.characterRig = new CharacterRig(character);
    this.scene.add(this.characterRig.root);

    // 7. Initial Track Chunks
    this.buildInitialTrack();

    // 8. Event Listeners
    window.addEventListener('resize', this.onWindowResize);

    // Pre-warm shader pipeline
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  public setQuality(quality: GraphicsQuality) {
    if (quality === 'low') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    }
  }

  public changeCharacter(character: Character) {
    this.currentCharacter = character;
    this.scene.remove(this.characterRig.root);
    this.characterRig = new CharacterRig(character);
    this.characterRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    this.scene.add(this.characterRig.root);
  }

  public setEnvironment(type: EnvironmentType) {
    this.envManager.applyEnvironment(type);
  }

  // --- TRACK & CHUNK GENERATION ---

  private buildInitialTrack() {
    this.nextChunkZ = -20;
    for (let i = 0; i < this.VISIBLE_CHUNKS; i++) {
      this.spawnChunk(i < 2); // First 2 chunks have no obstacles for fair start
    }
  }

  private spawnChunk(safeZone = false) {
    const chunkGroup = new THREE.Group();
    const zStart = this.nextChunkZ;
    const zEnd = zStart + this.CHUNK_LENGTH;
    const centerZ = (zStart + zEnd) / 2;

    // Road Surface (3 lanes wide = 7.2m + 1.2m shoulder = 8.4m)
    const roadGeo = new THREE.PlaneGeometry(8.4, this.CHUNK_LENGTH);
    const roadMesh = new THREE.Mesh(roadGeo, this.envManager.roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, centerZ);
    roadMesh.receiveShadow = true;
    chunkGroup.add(roadMesh);

    // Sidewalks on Left and Right
    const swGeo = new THREE.PlaneGeometry(3.6, this.CHUNK_LENGTH);
    const leftSw = new THREE.Mesh(swGeo, this.envManager.sidewalkMaterial);
    leftSw.rotation.x = -Math.PI / 2;
    leftSw.position.set(-6.0, 0.12, centerZ);
    leftSw.receiveShadow = true;

    const rightSw = new THREE.Mesh(swGeo, this.envManager.sidewalkMaterial);
    rightSw.rotation.x = -Math.PI / 2;
    rightSw.position.set(6.0, 0.12, centerZ);
    rightSw.receiveShadow = true;
    chunkGroup.add(leftSw, rightSw);

    // Urban Scenery: Buildings, Trees, Streetlights
    const scenerySpacing = 16;
    for (let z = zStart + 8; z < zEnd; z += scenerySpacing) {
      // Left Building
      const bLeft = this.envManager.createBuilding(18 + Math.random() * 24, 10, 14);
      bLeft.position.set(-13.5, 0, z);
      chunkGroup.add(bLeft);

      // Right Building
      const bRight = this.envManager.createBuilding(18 + Math.random() * 24, 10, 14);
      bRight.position.set(13.5, 0, z);
      chunkGroup.add(bRight);

      // Streetlights
      const lampLeft = this.envManager.createStreetlight();
      lampLeft.position.set(-4.5, 0, z);
      lampLeft.rotation.y = Math.PI / 2;
      const lampRight = this.envManager.createStreetlight();
      lampRight.position.set(4.5, 0, z);
      lampRight.rotation.y = -Math.PI / 2;
      chunkGroup.add(lampLeft, lampRight);

      // Park trees if environment has foliage
      if (this.envManager.config.foliageStyle !== 'none') {
        const tree = this.envManager.createTree();
        tree.position.set(Math.random() > 0.5 ? -6.8 : 6.8, 0, z + 6);
        chunkGroup.add(tree);
      }
    }

    this.scene.add(chunkGroup);
    this.chunks.push({ group: chunkGroup, zStart, zEnd });
    this.nextChunkZ = zEnd;

    // Spawn Obstacles, Pickups & Story items
    if (!safeZone) {
      this.populateChunkContent(zStart, zEnd);
    }
  }

  private populateChunkContent(zStart: number, zEnd: number) {
    const lanes: Lane[] = [-1, 0, 1];
    const density = this.currentLevel ? this.currentLevel.obstacleDensity : 2.5;
    const count = Math.min(3, Math.floor(density));

    for (let i = 0; i < count; i++) {
      const obstacleZ = zStart + 10 + (i * (this.CHUNK_LENGTH - 12)) / count;
      // Guaranteed fair gameplay: keep at least 1 lane open
      const blockedLanes = [lanes[Math.floor(Math.random() * lanes.length)]];
      if (density >= 3.0 && Math.random() > 0.4) {
        const otherLanes = lanes.filter((l) => l !== blockedLanes[0]);
        blockedLanes.push(otherLanes[Math.floor(Math.random() * otherLanes.length)]);
      }

      blockedLanes.forEach((lane) => {
        this.spawnObstacleAt(lane, obstacleZ);
      });

      // In the safe lane, spawn collectibles (coins, gems, footballs, dropped stolen loot)
      const freeLanes = lanes.filter((l) => !blockedLanes.includes(l));
      if (freeLanes.length > 0) {
        this.spawnPickupsPattern(freeLanes[0], obstacleZ - 4, obstacleZ + 6);
      }
    }
  }

  private spawnObstacleAt(lane: Lane, z: number) {
    const laneX = lane * 2.4;
    const canHaveMoving = this.currentLevel ? this.currentLevel.hasMovingTraffic : true;
    const canHaveOverhead = this.currentLevel ? this.currentLevel.hasOverheadObstacles : true;

    const roll = Math.random();
    let mesh: THREE.Group;
    let isMoving = false;
    let speed = 0;
    let isKickable = false;

    if (roll < 0.22) {
      // Parked or traffic sedan
      mesh = VehicleFactory.createSedan(Math.random() > 0.5 ? '#2563eb' : '#dc2626');
      if (canHaveMoving && Math.random() > 0.4) {
        isMoving = true;
        speed = 8 + Math.random() * 6;
      }
    } else if (roll < 0.4) {
      // City Bus or SUV
      if (Math.random() > 0.4) {
        mesh = VehicleFactory.createBus();
      } else {
        mesh = VehicleFactory.createSUV(Math.random() > 0.5);
      }
    } else if (roll < 0.55) {
      // Traffic Barricade with hazard stripes
      mesh = ObstacleFactory.createTrafficBarrier();
    } else if (roll < 0.7 && canHaveOverhead) {
      // Overhead sign (SLIDE UNDER)
      mesh = ObstacleFactory.createOverheadSign();
    } else if (roll < 0.8) {
      // Jersey Concrete barrier
      mesh = ObstacleFactory.createJerseyBarrier();
    } else if (roll < 0.9) {
      // Street Bottle obstacle (kickable / jumpable)
      mesh = ObstacleFactory.createBottle();
      isKickable = true;
    } else {
      // Cones or trench
      mesh = Math.random() > 0.5 ? ObstacleFactory.createTrafficCones() : ObstacleFactory.createRoadTrench();
    }

    mesh.position.set(laneX, 0, z);
    this.scene.add(mesh);

    const hitbox = (mesh.userData.hitbox as ObstacleHitbox) || {
      width: mesh.userData.width || 1.8,
      height: mesh.userData.height || 1.4,
      length: mesh.userData.length || 4.0,
      canJumpOver: false,
      canSlideUnder: false,
    };

    this.obstacles.push({
      mesh,
      lane,
      z,
      hitbox,
      isMoving,
      speed,
      passed: false,
      isKickable,
    });
  }

  private spawnPickupsPattern(lane: Lane, zStart: number, zEnd: number) {
    const count = 4;
    const step = (zEnd - zStart) / count;

    for (let i = 0; i < count; i++) {
      const z = zStart + i * step;
      const roll = Math.random();

      // Check if dropped stolen loot should spawn
      if (i === 1 && roll < 0.35) {
        this.spawnStolenItemPickup(lane, z);
      } else if (i === 2 && roll < 0.22) {
        // Football collectible / distraction ammo
        this.spawnFootballPickup(lane, z);
      } else if (i === 2 && roll < 0.34) {
        // Power-Up
        const puTypes: PowerUpType[] = ['magnet', 'shield', 'boost', 'double-coins', 'invincible'];
        const pType = puTypes[Math.floor(Math.random() * puTypes.length)];
        this.spawnPowerUp(pType, lane, z);
      } else if (roll < 0.45) {
        // Diamond Gem
        this.spawnGem(lane, z);
      } else {
        // Gold Coin
        this.spawnCoin(lane, z);
      }
    }
  }

  private spawnStolenItemPickup(lane: Lane, z: number) {
    const missionType = this.currentLevel?.story.missionType || 'bank-robbery';
    let group: THREE.Group;

    if (missionType === 'bank-robbery') {
      group = ObstacleFactory.createMoneyStack();
    } else if (missionType === 'jewellery-heist') {
      group = ObstacleFactory.createJewelleryPiece();
    } else {
      group = ObstacleFactory.createMoneyStack();
    }

    group.position.set(lane * 2.4, 0.4, z);
    this.scene.add(group);

    this.pickups.push({
      mesh: group,
      type: 'stolen-item',
      lane,
      z,
      y: 0.4,
      collected: false,
    });
  }

  private spawnFootballPickup(lane: Lane, z: number) {
    const group = ObstacleFactory.createFootball();
    group.position.set(lane * 2.4, 0.1, z);
    this.scene.add(group);

    this.pickups.push({
      mesh: group,
      type: 'football',
      lane,
      z,
      y: 0.3,
      collected: false,
    });
  }

  private spawnCoin(lane: Lane, z: number, y = 0.8) {
    const group = new THREE.Group();
    const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
    coinGeo.rotateZ(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#f59e0b',
      emissiveIntensity: 0.3,
      metalness: 0.95,
      roughness: 0.15,
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    group.add(coinMesh);

    group.position.set(lane * 2.4, y, z);
    this.scene.add(group);

    this.pickups.push({
      mesh: group,
      type: 'coin',
      lane,
      z,
      y,
      collected: false,
    });
  }

  private spawnGem(lane: Lane, z: number, y = 0.9) {
    const group = new THREE.Group();
    const gemGeo = new THREE.OctahedronGeometry(0.32);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    group.add(gemMesh);

    group.position.set(lane * 2.4, y, z);
    this.scene.add(group);

    this.pickups.push({
      mesh: group,
      type: 'gem',
      lane,
      z,
      y,
      collected: false,
    });
  }

  private spawnPowerUp(type: PowerUpType, lane: Lane, z: number) {
    const group = new THREE.Group();
    let col = '#fbbf24';
    if (type === 'shield') col = '#38bdf8';
    if (type === 'boost') col = '#ec4899';
    if (type === 'double-coins') col = '#10b981';
    if (type === 'invincible') col = '#a855f7';

    const geo = new THREE.IcosahedronGeometry(0.42);
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.9,
      metalness: 0.6,
      roughness: 0.2,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    group.position.set(lane * 2.4, 1.1, z);
    this.scene.add(group);

    this.pickups.push({
      mesh: group,
      type,
      lane,
      z,
      y: 1.1,
      collected: false,
    });
  }

  // --- CONTROLS & DISTRACTION ABILITIES ---

  public moveLaneLeft() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as Lane;
      soundEngine.playLaneChange();
      admobService.triggerHaptic(20);
    }
  }

  public moveLaneRight() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as Lane;
      soundEngine.playLaneChange();
      admobService.triggerHaptic(20);
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.isSliding = false;
      this.playerVy = this.JUMP_INITIAL_VELOCITY;
      this.characterRig.setAction('jumping');
      soundEngine.playJump();
      admobService.triggerHaptic(25);
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused) return;
    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    this.characterRig.setAction('sliding');
    soundEngine.playSlide();
    admobService.triggerHaptic(25);

    if (this.isJumping) {
      this.playerVy = -18;
    }
  }

  /**
   * Distraction Kick Ability:
   * Launches a road projectile / whistle that distracts and slows down the fleeing suspect by 45%!
   */
  public kickDistraction() {
    if (!this.isRunning || this.isPaused) return;
    if (this.stats.distractionKicksAvailable <= 0) return;
    if (!this.suspect || this.suspect.isCaptured) return;

    this.stats.distractionKicksAvailable--;
    soundEngine.playDistractionKick();
    admobService.triggerHaptic(40);

    // Trigger suspect stumble
    this.suspect.triggerDistractionSlowdown();
    setTimeout(() => {
      soundEngine.playSuspectStumble();
    }, 180);
  }

  // --- GAME LIFECYCLE ---

  public startRun(level?: LevelDefinition) {
    this.currentLevel = level || null;
    this.isEndlessMode = !level;
    this.currentSpeed = level ? level.baseSpeed : 18;

    this.stats = {
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      obstaclesDodged: 0,
      hasUsedRevive: false,
      isCompleted: false,
      suspectDistance: 28,
      recoveredItemsCount: 0,
      distractionKicksAvailable: 2,
      suspectCaptured: false,
      suspectEscaped: false,
    };

    this.currentLane = 0;
    this.targetLane = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.activePowerUps.clear();
    this.isInvulnerable = false;

    // Reset Track & Entities
    this.clearAllTrack();
    this.buildInitialTrack();

    // Spawn Suspect Rig ahead of the player
    if (this.suspect) {
      this.scene.remove(this.suspect.root);
    }
    const missionType = level ? level.story.missionType : 'bank-robbery';
    this.suspect = new SuspectRig(missionType);
    this.suspect.z = 28;
    this.scene.add(this.suspect.root);

    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startMusic();

    this.clock.start();
    this.tick();
  }

  public pause() {
    this.isPaused = true;
    soundEngine.stopMusic();
  }

  public resume() {
    this.isPaused = false;
    this.clock.start();
    soundEngine.startMusic();
    this.tick();
  }

  public revivePlayer() {
    this.stats.hasUsedRevive = true;
    this.isInvulnerable = true;
    this.invulnerableTimer = 3.5;
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.characterRig.setAction('running');

    this.playerZ += 6;
    if (this.suspect) {
      // Keep suspect at fair chase distance on revive
      this.suspect.z = Math.max(this.suspect.z, this.playerZ + 20);
    }

    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startMusic();
    this.clock.start();
    this.tick();
  }

  private clearAllTrack() {
    this.chunks.forEach((c) => this.scene.remove(c.group));
    this.chunks = [];

    this.obstacles.forEach((o) => this.scene.remove(o.mesh));
    this.obstacles = [];

    this.pickups.forEach((p) => this.scene.remove(p.mesh));
    this.pickups = [];

    if (this.suspect) {
      this.scene.remove(this.suspect.root);
      this.suspect = null;
    }

    if (this.policeCar) {
      this.scene.remove(this.policeCar);
      this.policeCar = null;
    }
  }

  // --- MAIN SIMULATION LOOP ---

  private tick = () => {
    if (!this.isRunning || this.isPaused) return;

    const delta = Math.min(0.08, this.clock.getDelta());

    this.updatePhysics(delta);
    this.updateSuspectAndChase(delta);
    this.updatePowerUps(delta);
    this.updateObstaclesAndCollisions(delta);
    this.updatePickups(delta);
    this.updateTrackRecycling();
    this.updateCamera(delta);

    this.envManager.update(delta, this.playerZ);

    const hasShield = this.activePowerUps.has('shield') || (this.isInvulnerable && this.invulnerableTimer > 0);
    const hasMagnet = this.activePowerUps.has('magnet');
    this.characterRig.update(delta, this.currentSpeed, hasShield, hasMagnet);

    // Audio step
    if (!this.isJumping && !this.isSliding && Math.random() < delta * 4) {
      soundEngine.playFootstep();
    }

    this.renderer.render(this.scene, this.camera);

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.currentSpeed, Array.from(this.activePowerUps.values()));
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  // --- PHYSICS & KINEMATICS ---

  private updatePhysics(delta: number) {
    let speedMult = 1.0;
    if (this.activePowerUps.has('boost')) speedMult = 1.6;
    const effectiveSpeed = this.currentSpeed * (1 + this.currentCharacter.stats.speedBonus) * speedMult;

    const forwardDistance = effectiveSpeed * delta;
    this.playerZ += forwardDistance;
    this.stats.distance = Math.floor(this.playerZ);
    this.stats.score += Math.floor(forwardDistance * (this.activePowerUps.has('double-coins') ? 20 : 10));

    // Smooth Lane Switching
    const targetX = this.targetLane * 2.4;
    const agility = this.currentCharacter.stats.agility;
    this.playerX = THREE.MathUtils.damp(this.playerX, targetX, 14 * agility, delta);

    // Jump / Gravity Physics
    if (this.isJumping) {
      this.playerY += this.playerVy * delta;
      this.playerVy += this.JUMP_GRAVITY * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVy = 0;
        this.isJumping = false;
        if (!this.isSliding) {
          this.characterRig.setAction('running');
        }
      }
    }

    // Slide Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        if (!this.isJumping) {
          this.characterRig.setAction('running');
        }
      }
    }

    this.characterRig.root.position.set(this.playerX, this.playerY, this.playerZ);

    const laneDelta = targetX - this.playerX;
    this.characterRig.root.rotation.z = -laneDelta * 0.15;
    this.characterRig.root.rotation.y = laneDelta * 0.1;
  }

  // --- SUSPECT CHASE & CATCH LOGIC ---

  private updateSuspectAndChase(delta: number) {
    if (!this.suspect) return;

    let speedMult = 1.0;
    if (this.activePowerUps.has('boost')) speedMult = 1.6;
    const effectivePlayerSpeed = this.currentSpeed * (1 + this.currentCharacter.stats.speedBonus) * speedMult;

    this.suspect.update(delta, this.playerZ, effectivePlayerSpeed);

    const distanceAhead = this.suspect.z - this.playerZ;
    this.stats.suspectDistance = Math.max(0, Math.round(distanceAhead * 10) / 10);

    // 1. Check Suspect Escaped
    if (distanceAhead > 65) {
      this.stats.suspectEscaped = true;
      this.handleCrash(true);
      return;
    }

    // 2. Check Suspect Caught / Reached Capture Checkpoint
    const checkpointReached = this.currentLevel && this.stats.distance >= this.currentLevel.distanceObjective;
    const closedGap = distanceAhead <= 2.4 && Math.abs(this.suspect.x - this.playerX) < 1.8;

    if ((closedGap || checkpointReached) && !this.stats.suspectCaptured) {
      this.catchSuspect();
    }
  }

  private catchSuspect() {
    this.stats.suspectCaptured = true;
    this.stats.isCompleted = true;
    this.isRunning = false;

    // Trigger suspect surrender animation
    if (this.suspect) {
      this.suspect.triggerSurrender();
    }

    soundEngine.playCatchTackle();
    soundEngine.playPoliceSiren();
    admobService.triggerHaptic(90);

    // Spawn Police Interceptor Car with flashing beacons
    const police = VehicleFactory.createSUV(true);
    police.position.set(this.playerX > 0 ? -2.4 : 2.4, 0, this.playerZ + 6);
    this.scene.add(police);
    this.policeCar = police;

    setTimeout(() => {
      soundEngine.playHandoverSuccess();
      if (this.onLevelComplete) {
        this.onLevelComplete(this.stats);
      }
    }, 700);
  }

  private updatePowerUps(delta: number) {
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    for (const [type, pu] of this.activePowerUps.entries()) {
      pu.remainingTime -= delta;
      if (pu.remainingTime <= 0) {
        this.activePowerUps.delete(type);
      }
    }
  }

  private updateObstaclesAndCollisions(delta: number) {
    const playerRadius = 0.45;
    const isPlayerSliding = this.isSliding;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      if (obs.isMoving) {
        obs.z += obs.speed * delta;
        obs.mesh.position.z = obs.z;
      }

      if (!obs.passed && obs.z < this.playerZ - 2) {
        obs.passed = true;
        this.stats.obstaclesDodged++;
      }

      const dz = Math.abs(obs.z - this.playerZ);
      const obsHalfLength = obs.hitbox.length / 2;

      if (dz < obsHalfLength + 0.3) {
        const dx = Math.abs(obs.mesh.position.x - this.playerX);
        const obsHalfWidth = obs.hitbox.width / 2;

        if (dx < obsHalfWidth + playerRadius) {
          // Jumped over?
          if (obs.hitbox.canJumpOver && this.playerY > (obs.hitbox.minJumpHeight || 0.8)) {
            continue;
          }

          // Slid under?
          if (obs.hitbox.canSlideUnder && isPlayerSliding && this.playerY < 0.2) {
            continue;
          }

          // Road bottle/football kick interaction (arcade distraction kick without crashing!)
          if (obs.isKickable) {
            soundEngine.playDistractionKick();
            this.stats.distractionKicksAvailable = Math.min(3, this.stats.distractionKicksAvailable + 1);
            if (this.suspect) this.suspect.triggerDistractionSlowdown();
            this.scene.remove(obs.mesh);
            this.obstacles.splice(i, 1);
            continue;
          }

          // Invulnerable or Boost mode: Destroy obstacle
          if (this.isInvulnerable || this.activePowerUps.has('invincible') || this.activePowerUps.has('boost')) {
            soundEngine.playCollision();
            this.scene.remove(obs.mesh);
            this.obstacles.splice(i, 1);
            continue;
          }

          // Shield absorbs hit
          if (this.activePowerUps.has('shield')) {
            this.activePowerUps.delete('shield');
            soundEngine.playShieldBreak();
            this.characterRig.triggerStumble();
            this.isInvulnerable = true;
            this.invulnerableTimer = 1.8;
            continue;
          }

          // Fatal Collision
          this.handleCrash(false);
          return;
        }
      }
    }
  }

  private updatePickups(delta: number) {
    const hasMagnet = this.activePowerUps.has('magnet');
    const magnetRadius = 14;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];

      pickup.mesh.rotation.y += delta * 3.5;

      // Magnet attraction
      if (hasMagnet && (pickup.type === 'coin' || pickup.type === 'gem' || pickup.type === 'stolen-item')) {
        const dist = Math.hypot(pickup.mesh.position.x - this.playerX, pickup.z - this.playerZ);
        if (dist < magnetRadius) {
          pickup.mesh.position.x = THREE.MathUtils.damp(pickup.mesh.position.x, this.playerX, 12, delta);
          pickup.z = THREE.MathUtils.damp(pickup.z, this.playerZ, 12, delta);
          pickup.mesh.position.z = pickup.z;
        }
      }

      const dz = Math.abs(pickup.z - this.playerZ);
      const dx = Math.abs(pickup.mesh.position.x - this.playerX);
      const dy = Math.abs(pickup.y - this.playerY);

      if (dz < 1.3 && dx < 1.0 && dy < 1.6) {
        this.collectPickup(pickup);
        this.scene.remove(pickup.mesh);
        this.pickups.splice(i, 1);
        continue;
      }

      if (pickup.z < this.playerZ - 10) {
        this.scene.remove(pickup.mesh);
        this.pickups.splice(i, 1);
      }
    }
  }

  private collectPickup(pickup: ActivePickup) {
    if (pickup.type === 'coin') {
      const multiplier = this.activePowerUps.has('double-coins') ? 2 : 1;
      this.stats.coins += multiplier;
      this.stats.score += 50 * multiplier;
      soundEngine.playCoin();
      admobService.triggerHaptic(12);
    } else if (pickup.type === 'gem') {
      this.stats.gems += 1;
      this.stats.score += 500;
      soundEngine.playGem();
      admobService.triggerHaptic(25);
    } else if (pickup.type === 'stolen-item') {
      // Recovered dropped loot from suspect!
      this.stats.recoveredItemsCount++;
      this.stats.score += 800;
      this.stats.coins += 25;
      soundEngine.playPowerUpCollect();
      admobService.triggerHaptic(30);
    } else if (pickup.type === 'football') {
      // Added distraction kick ammo!
      this.stats.distractionKicksAvailable = Math.min(3, this.stats.distractionKicksAvailable + 1);
      this.stats.score += 200;
      soundEngine.playDistractionKick();
      admobService.triggerHaptic(20);
    } else {
      // Power-Up collected
      const baseDuration = 10;
      const duration = baseDuration * this.currentCharacter.stats.magnetBonus;
      this.activePowerUps.set(pickup.type, {
        type: pickup.type,
        duration,
        remainingTime: duration,
      });
      soundEngine.playPowerUpCollect();
      admobService.triggerHaptic(40);
    }
  }

  private updateTrackRecycling() {
    if (this.chunks.length > 0 && this.chunks[0].zEnd < this.playerZ - 15) {
      const oldChunk = this.chunks.shift()!;
      this.scene.remove(oldChunk.group);
      this.spawnChunk(false);
    }
  }

  private updateCamera(delta: number) {
    const targetCamX = this.playerX * 0.45;
    const targetCamY = 3.6 + this.playerY * 0.4;
    const targetCamZ = this.playerZ - 4.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 20, delta);

    // Look towards the suspect ahead!
    const lookTargetZ = this.suspect ? THREE.MathUtils.lerp(this.playerZ + 6.0, this.suspect.z, 0.4) : this.playerZ + 6.0;
    this.camera.lookAt(this.playerX * 0.2, 1.4 + this.playerY * 0.3, lookTargetZ);

    const targetFov = this.activePowerUps.has('boost') ? 78 : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 6, delta);
    this.camera.updateProjectionMatrix();
  }

  private handleCrash(suspectEscaped = false) {
    this.isRunning = false;
    soundEngine.stopMusic();
    soundEngine.playCollision();
    admobService.triggerHaptic(80);

    this.characterRig.setAction('crash');

    if (this.onGameOver) {
      this.onGameOver(this.stats);
    }
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    soundEngine.stopMusic();
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}
