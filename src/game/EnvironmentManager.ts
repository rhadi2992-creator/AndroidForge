import * as THREE from 'three';
import { EnvironmentConfig, ENVIRONMENTS } from '../data/environments';
import { EnvironmentType } from '../types/game';
import { ProceduralTextures } from './ProceduralTextures';

export class EnvironmentManager {
  public currentType: EnvironmentType;
  public config: EnvironmentConfig;
  public scene: THREE.Scene;

  // Lighting nodes
  public dirLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;

  // Weather FX
  private rainParticles: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;

  // Road & Sidewalk Materials
  public roadMaterial: THREE.MeshStandardMaterial;
  public sidewalkMaterial: THREE.MeshStandardMaterial;
  public buildingMaterials: THREE.MeshStandardMaterial[] = [];

  constructor(scene: THREE.Scene, initialType: EnvironmentType = 'modern-city') {
    this.scene = scene;
    this.currentType = initialType;
    this.config = ENVIRONMENTS[initialType];

    // Sunlight (Key light with shadow mapping)
    this.dirLight = new THREE.DirectionalLight(this.config.sunColor, this.config.sunIntensity);
    this.dirLight.position.set(18, 32, 24);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    const d = 16;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);

    // Hemisphere Light (sky/ground contrast)
    this.hemiLight = new THREE.HemisphereLight(this.config.skyColor, '#1f2937', this.config.ambientIntensity);
    this.scene.add(this.hemiLight);

    // Ambient Light fill
    this.ambientLight = new THREE.AmbientLight(this.config.ambientColor, 0.4);
    this.scene.add(this.ambientLight);

    // Road & Sidewalk PBR materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      roughness: this.config.wetRoad ? 0.2 : 0.75,
      metalness: this.config.wetRoad ? 0.4 : 0.1,
    });

    this.sidewalkMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.05,
    });

    this.applyEnvironment(initialType);
    this.setupRain();
  }

  public applyEnvironment(type: EnvironmentType) {
    this.currentType = type;
    this.config = ENVIRONMENTS[type];

    // Update scene background & fog
    this.scene.background = new THREE.Color(this.config.skyColor);
    this.scene.fog = new THREE.FogExp2(this.config.fogColor, this.config.fogDensity);

    // Update lighting
    this.dirLight.color.set(this.config.sunColor);
    this.dirLight.intensity = this.config.sunIntensity;
    this.hemiLight.color.set(this.config.skyColor);
    this.hemiLight.intensity = this.config.ambientIntensity;
    this.ambientLight.color.set(this.config.ambientColor);

    // Update road texture & wetness
    const roadTex = ProceduralTextures.getRoadTexture(
      this.config.roadColor,
      this.config.roadMarkingColor,
      this.config.wetRoad
    );
    this.roadMaterial.map = roadTex;
    this.roadMaterial.roughness = this.config.wetRoad ? 0.18 : 0.75;
    this.roadMaterial.metalness = this.config.wetRoad ? 0.35 : 0.1;
    this.roadMaterial.needsUpdate = true;

    // Update sidewalk texture
    const swTex = ProceduralTextures.getSidewalkTexture(this.config.sidewalkColor);
    this.sidewalkMaterial.map = swTex;
    this.sidewalkMaterial.needsUpdate = true;

    // Build unique facade materials for this environment
    this.buildingMaterials = this.config.buildingPalette.map((col) => {
      const facadeTex = ProceduralTextures.getBuildingFacadeTexture(col, this.config.isNight);
      return new THREE.MeshStandardMaterial({
        color: col,
        map: facadeTex,
        roughness: 0.6,
        metalness: 0.2,
      });
    });

    // Toggle rain
    if (this.rainParticles) {
      this.rainParticles.visible = this.config.isRainy;
    }
  }

  private setupRain() {
    const rainCount = 1800;
    const geo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 40;
      this.rainPositions[i * 3 + 1] = Math.random() * 25;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const mat = new THREE.PointsMaterial({
      color: '#cbd5e1',
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });

    this.rainParticles = new THREE.Points(geo, mat);
    this.rainParticles.visible = this.config.isRainy;
    this.scene.add(this.rainParticles);
  }

  public update(delta: number, playerZ: number) {
    // Keep lights centered near player for sharp shadows
    this.dirLight.position.z = playerZ - 8;
    this.dirLight.target.position.z = playerZ + 12;
    this.dirLight.target.updateMatrixWorld();

    // Rain animation
    if (this.config.isRainy && this.rainParticles && this.rainPositions) {
      const attr = this.rainParticles.geometry.attributes.position;
      const count = attr.count;
      for (let i = 0; i < count; i++) {
        let y = this.rainPositions[i * 3 + 1] - delta * 32;
        if (y < 0) y = 25;
        this.rainPositions[i * 3 + 1] = y;
        this.rainPositions[i * 3 + 2] = playerZ + ((this.rainPositions[i * 3 + 2] - playerZ + 30) % 60) - 30;
      }
      attr.needsUpdate = true;
    }
  }

  /**
   * Builds a multi-part architectural building structure (3-12 parts: base, tower, roof mechanicals).
   */
  public createBuilding(height: number, width: number, depth: number): THREE.Group {
    const group = new THREE.Group();
    const mat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)] || this.buildingMaterials[0];

    // Main tower
    const towerGeo = new THREE.BoxGeometry(width, height, depth);
    const tower = new THREE.Mesh(towerGeo, mat);
    tower.position.set(0, height / 2, 0);
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Rooftop HVAC unit
    const hvacGeo = new THREE.BoxGeometry(width * 0.4, 1.2, depth * 0.4);
    const hvacMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.8 });
    const hvac = new THREE.Mesh(hvacGeo, hvacMat);
    hvac.position.set(0, height + 0.6, 0);
    hvac.castShadow = true;
    group.add(hvac);

    // Rooftop communications antenna
    const antGeo = new THREE.CylinderGeometry(0.04, 0.08, 4.0, 8);
    const antMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.2, metalness: 0.9 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(width * 0.2, height + 2.0, 0);
    group.add(ant);

    return group;
  }

  /**
   * Creates a modern streetlamp with warm or neon illumination.
   */
  public createStreetlight(): THREE.Group {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3, metalness: 0.85 });

    // Vertical pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 5.2, 8);
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.set(0, 2.6, 0);
    pole.castShadow = true;

    // Arm cantilever
    const armGeo = new THREE.BoxGeometry(1.2, 0.08, 0.08);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(0.5, 5.15, 0);

    // Lamp head luminaire
    const lampGeo = new THREE.BoxGeometry(0.4, 0.1, 0.2);
    const lampMat = new THREE.MeshStandardMaterial({
      color: this.config.isNight ? '#fef08a' : '#ffffff',
      emissive: this.config.isNight ? '#fef08a' : '#ffffff',
      emissiveIntensity: 2.0,
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(1.0, 5.08, 0);

    group.add(pole, arm, lamp);
    return group;
  }

  /**
   * Creates an urban sidewalk tree.
   */
  public createTree(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#573d26', roughness: 0.9, metalness: 0.05 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.8, metalness: 0.1 });

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 2.4, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0, 1.2, 0);
    trunk.castShadow = true;

    // Foliage canopy (clustered volumes)
    const foliageGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(0, 3.2, 0);
    foliage.castShadow = true;

    group.add(trunk, foliage);
    return group;
  }
}
