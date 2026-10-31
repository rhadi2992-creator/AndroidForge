import * as THREE from 'three';
import { Character, PlayerAction } from '../types/game';

/**
 * Procedural articulated human runner model with realistic anatomical proportions.
 * Assembled with multiple body segments (Head, Torso, Hips, Arms, Legs, Feet, Gear)
 * and procedural kinematics for running, jumping, sliding, lane changes, and stumbling.
 */
export class CharacterRig {
  public root: THREE.Group;
  public characterData: Character;

  // Articulation Nodes
  private pelvisGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private headGroup: THREE.Group;

  private leftShoulderGroup: THREE.Group;
  private leftElbowGroup: THREE.Group;
  private rightShoulderGroup: THREE.Group;
  private rightElbowGroup: THREE.Group;

  private leftHipGroup: THREE.Group;
  private leftKneeGroup: THREE.Group;
  private rightHipGroup: THREE.Group;
  private rightKneeGroup: THREE.Group;

  // FX Nodes
  public shieldMesh: THREE.Mesh;
  public magnetParticles: THREE.Points;

  // Animation State
  private runCycleTime = 0;
  private currentAction: PlayerAction = 'running';
  private actionProgress = 0;
  private stumbleTime = 0;

  constructor(character: Character) {
    this.characterData = character;
    this.root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.appearance.skinTone),
      roughness: 0.65,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.appearance.hairColor),
      roughness: 0.85,
      metalness: 0.1,
    });

    const jacketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.appearance.jacketColor),
      roughness: 0.45,
      metalness: 0.15,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.appearance.pantsColor),
      roughness: 0.7,
      metalness: 0.05,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.appearance.accentColor),
      roughness: 0.3,
      metalness: 0.5,
      emissive: new THREE.Color(character.appearance.accentColor),
      emissiveIntensity: 0.25,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.4,
      metalness: 0.1,
    });

    // --- PELVIS (Center of Mass: y ~ 0.95m above ground) ---
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.set(0, 0.95, 0);
    this.root.add(this.pelvisGroup);

    const pelvisGeo = new THREE.BoxGeometry(0.32, 0.18, 0.22);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.castShadow = true;
    this.pelvisGroup.add(pelvisMesh);

    // --- TORSO (Chest + Ribs) ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.14, 0);
    this.pelvisGroup.add(this.torsoGroup);

    const torsoGeo = new THREE.BoxGeometry(0.38, 0.44, 0.24);
    const torsoMesh = new THREE.Mesh(torsoGeo, jacketMat);
    torsoMesh.position.set(0, 0.22, 0);
    torsoMesh.castShadow = true;
    this.torsoGroup.add(torsoMesh);

    // Athletic chest emblem / trim
    const trimGeo = new THREE.BoxGeometry(0.4, 0.08, 0.25);
    const trimMesh = new THREE.Mesh(trimGeo, accentMat);
    trimMesh.position.set(0, 0.3, 0);
    this.torsoGroup.add(trimMesh);

    // Optional backpack
    if (character.appearance.hasBackpack) {
      const packGeo = new THREE.BoxGeometry(0.28, 0.32, 0.14);
      const packMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
      const packMesh = new THREE.Mesh(packGeo, packMat);
      packMesh.position.set(0, 0.22, -0.18);
      packMesh.castShadow = true;
      this.torsoGroup.add(packMesh);
    }

    // --- HEAD & NECK ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.46, 0);
    this.torsoGroup.add(this.headGroup);

    // Realistic anatomical proportion: head height ~0.24m (total figure ~1.78m)
    const headGeo = new THREE.BoxGeometry(0.2, 0.24, 0.22);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0.14, 0.02);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.22, 0.1, 0.24);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.24, 0.01);
    this.headGroup.add(hairMesh);

    // Visor for tech characters
    if (character.appearance.hasVisor) {
      const visorGeo = new THREE.BoxGeometry(0.23, 0.07, 0.12);
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(character.appearance.accentColor),
        roughness: 0.1,
        metalness: 0.9,
        transmission: 0.5,
        transparent: true,
        opacity: 0.85,
        emissive: new THREE.Color(character.appearance.accentColor),
        emissiveIntensity: 0.6,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.14, 0.1);
      this.headGroup.add(visorMesh);
    }

    // --- ARMS ---
    // Left Shoulder
    this.leftShoulderGroup = new THREE.Group();
    this.leftShoulderGroup.position.set(-0.24, 0.38, 0);
    this.torsoGroup.add(this.leftShoulderGroup);

    const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8);
    upperArmGeo.translate(0, -0.13, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    leftUpperArm.castShadow = true;
    this.leftShoulderGroup.add(leftUpperArm);

    this.leftElbowGroup = new THREE.Group();
    this.leftElbowGroup.position.set(0, -0.26, 0);
    this.leftShoulderGroup.add(this.leftElbowGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.24, 8);
    forearmGeo.translate(0, -0.12, 0);
    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.castShadow = true;
    this.leftElbowGroup.add(leftForearm);

    // Right Shoulder
    this.rightShoulderGroup = new THREE.Group();
    this.rightShoulderGroup.position.set(0.24, 0.38, 0);
    this.torsoGroup.add(this.rightShoulderGroup);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    rightUpperArm.castShadow = true;
    this.rightShoulderGroup.add(rightUpperArm);

    this.rightElbowGroup = new THREE.Group();
    this.rightElbowGroup.position.set(0, -0.26, 0);
    this.rightShoulderGroup.add(this.rightElbowGroup);

    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.castShadow = true;
    this.rightElbowGroup.add(rightForearm);

    // --- LEGS ---
    // Left Hip
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(-0.11, -0.06, 0);
    this.pelvisGroup.add(this.leftHipGroup);

    const thighGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.42, 8);
    thighGeo.translate(0, -0.21, 0);
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.castShadow = true;
    this.leftHipGroup.add(leftThigh);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.set(0, -0.42, 0);
    this.leftHipGroup.add(this.leftKneeGroup);

    const shinGeo = new THREE.CylinderGeometry(0.062, 0.05, 0.42, 8);
    shinGeo.translate(0, -0.21, 0);
    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.castShadow = true;
    this.leftKneeGroup.add(leftShin);

    const shoeGeo = new THREE.BoxGeometry(0.12, 0.1, 0.26);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.44, 0.06);
    leftShoe.castShadow = true;
    this.leftKneeGroup.add(leftShoe);

    // Right Hip
    this.rightHipGroup = new THREE.Group();
    this.rightHipGroup.position.set(0.11, -0.06, 0);
    this.pelvisGroup.add(this.rightHipGroup);

    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.castShadow = true;
    this.rightHipGroup.add(rightThigh);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.set(0, -0.42, 0);
    this.rightHipGroup.add(this.rightKneeGroup);

    const rightShin = new THREE.Mesh(shinGeo, pantsMat);
    rightShin.castShadow = true;
    this.rightKneeGroup.add(rightShin);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.44, 0.06);
    rightShoe.castShadow = true;
    this.rightKneeGroup.add(rightShoe);

    // --- SHIELD AURA FX ---
    const shieldGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 1.0, 0);
    this.root.add(this.shieldMesh);

    // --- MAGNET PARTICLES ---
    const magGeo = new THREE.BufferGeometry();
    const magCount = 20;
    const magPositions = new Float32Array(magCount * 3);
    for (let i = 0; i < magCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 1.0 + Math.random() * 0.8;
      magPositions[i * 3] = Math.cos(theta) * r;
      magPositions[i * 3 + 1] = 0.5 + Math.random() * 1.2;
      magPositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    magGeo.setAttribute('position', new THREE.BufferAttribute(magPositions, 3));
    const magMat = new THREE.PointsMaterial({
      color: '#fbbf24',
      size: 0.08,
      transparent: true,
      opacity: 0,
    });
    this.magnetParticles = new THREE.Points(magGeo, magMat);
    this.root.add(this.magnetParticles);

    // Contact shadow beneath player feet
    const contactShadowGeo = new THREE.PlaneGeometry(0.8, 1.4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.015;
    this.root.add(contactShadow);
  }

  public setAction(action: PlayerAction) {
    this.currentAction = action;
    this.actionProgress = 0;
  }

  public triggerStumble() {
    this.stumbleTime = 0.6;
  }

  /**
   * Updates skeletal animation frames based on running speed and current player action.
   */
  public update(delta: number, speed: number, hasShield: boolean, hasMagnet: boolean) {
    // Shield FX animation
    if (hasShield) {
      (this.shieldMesh.material as THREE.MeshStandardMaterial).opacity = 0.45 + Math.sin(Date.now() * 0.006) * 0.15;
      this.shieldMesh.rotation.y += delta * 1.5;
    } else {
      (this.shieldMesh.material as THREE.MeshStandardMaterial).opacity = 0;
    }

    // Magnet FX particles animation
    if (hasMagnet) {
      (this.magnetParticles.material as THREE.PointsMaterial).opacity = 0.8;
      this.magnetParticles.rotation.y += delta * 4;
    } else {
      (this.magnetParticles.material as THREE.PointsMaterial).opacity = 0;
    }

    // Stumble countdown
    if (this.stumbleTime > 0) {
      this.stumbleTime -= delta;
      this.torsoGroup.rotation.x = 0.4;
      this.headGroup.rotation.x = -0.3;
      return;
    }

    // Natural running frequency: scales smoothly with game speed
    const runFreq = Math.max(6, Math.min(18, speed * 0.5));
    this.runCycleTime += delta * runFreq;
    const sinCycle = Math.sin(this.runCycleTime);
    const cosCycle = Math.cos(this.runCycleTime);

    if (this.currentAction === 'jumping') {
      // Jump Pose: tuck legs, raise arms forward-up for balance
      this.pelvisGroup.position.y = 0.95;
      this.torsoGroup.rotation.x = 0.1;
      this.leftHipGroup.rotation.x = -0.8;
      this.leftKneeGroup.rotation.x = 1.1;
      this.rightHipGroup.rotation.x = -0.5;
      this.rightKneeGroup.rotation.x = 0.9;

      this.leftShoulderGroup.rotation.x = -0.8;
      this.leftElbowGroup.rotation.x = -0.6;
      this.rightShoulderGroup.rotation.x = -0.9;
      this.rightElbowGroup.rotation.x = -0.5;
      this.leftShoulderGroup.rotation.z = -0.2;
      this.rightShoulderGroup.rotation.z = 0.2;
    } else if (this.currentAction === 'sliding') {
      // Slide Pose: drops torso low to asphalt, legs extend forward
      this.pelvisGroup.position.y = 0.45;
      this.torsoGroup.rotation.x = -0.7; // Lean back
      this.headGroup.rotation.x = 0.5; // Look forward

      this.leftHipGroup.rotation.x = -1.3;
      this.leftKneeGroup.rotation.x = 0.2;
      this.rightHipGroup.rotation.x = -1.4;
      this.rightKneeGroup.rotation.x = 0.3;

      this.leftShoulderGroup.rotation.x = 0.8; // Left hand near road
      this.rightShoulderGroup.rotation.x = -0.4;
      this.leftShoulderGroup.rotation.z = -0.4;
      this.rightShoulderGroup.rotation.z = 0.3;
    } else {
      // Running Cycle
      // Pelvis vertical bounce & subtle hip sway
      this.pelvisGroup.position.y = 0.95 + Math.abs(sinCycle) * 0.05;
      this.pelvisGroup.rotation.y = sinCycle * 0.08;
      this.pelvisGroup.rotation.z = cosCycle * 0.04;

      // Athletic forward spine lean
      this.torsoGroup.rotation.x = 0.18 + Math.abs(cosCycle) * 0.04;
      this.torsoGroup.rotation.y = -sinCycle * 0.08;
      this.headGroup.rotation.x = -0.12;

      // Leg swing (Thighs counter-oscillate)
      this.leftHipGroup.rotation.x = sinCycle * 0.75;
      this.rightHipGroup.rotation.x = -sinCycle * 0.75;

      // Knee flex on backswing
      this.leftKneeGroup.rotation.x = sinCycle > 0 ? sinCycle * 0.9 : 0.15;
      this.rightKneeGroup.rotation.x = sinCycle < 0 ? -sinCycle * 0.9 : 0.15;

      // Arm counter-swing (opposite to legs)
      this.leftShoulderGroup.rotation.x = -sinCycle * 0.7;
      this.rightShoulderGroup.rotation.x = sinCycle * 0.7;
      this.leftElbowGroup.rotation.x = -0.8 - Math.abs(sinCycle) * 0.3;
      this.rightElbowGroup.rotation.x = -0.8 - Math.abs(sinCycle) * 0.3;

      this.leftShoulderGroup.rotation.z = -0.15;
      this.rightShoulderGroup.rotation.z = 0.15;
    }
  }
}
