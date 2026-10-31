import * as THREE from 'three';
import { Lane, MissionType } from '../types/game';

/**
 * Procedural Articulated 3D Fleeing Suspect.
 * Runs ahead of the player carrying the stolen property (handbag, money sack, jewellery box).
 * Features running kinematics, evasive lane-changing, stumble reactions, and hands-up surrender.
 */
export class SuspectRig {
  public root: THREE.Group;
  public stolenItemMesh: THREE.Group;

  // Body parts
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

  // Running Kinematics & State
  private runCycleTime = 0;
  public isStumbled = false;
  private stumbleTimer = 0;
  public isCaptured = false;

  // Evasive Pathing
  public currentLane: Lane = 0;
  public targetLane: Lane = 0;
  public x = 0;
  public z = 30; // Starts 30m ahead of player
  private laneSwitchTimer = 2.0;

  constructor(missionType: MissionType = 'bank-robbery') {
    this.root = new THREE.Group();

    // Suspect Materials: Dark street hoodie & stealth cargo pants
    const skinMat = new THREE.MeshStandardMaterial({
      color: '#a37151',
      roughness: 0.65,
      metalness: 0.05,
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
      color: '#1e293b', // Dark stealth slate hoodie
      roughness: 0.8,
      metalness: 0.1,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: '#0f172a', // Midnight black joggers
      roughness: 0.7,
      metalness: 0.05,
    });

    const maskMat = new THREE.MeshStandardMaterial({
      color: '#18181b', // Black robber mask
      roughness: 0.9,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: '#ef4444', // Red athletic sneakers
      roughness: 0.4,
      metalness: 0.2,
    });

    // --- PELVIS ---
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.set(0, 0.95, 0);
    this.root.add(this.pelvisGroup);

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.22), pantsMat);
    pelvisMesh.castShadow = true;
    this.pelvisGroup.add(pelvisMesh);

    // --- TORSO ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.14, 0);
    this.pelvisGroup.add(this.torsoGroup);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.24), hoodieMat);
    torsoMesh.position.set(0, 0.22, 0);
    torsoMesh.castShadow = true;
    this.torsoGroup.add(torsoMesh);

    // --- HEAD with Mask & Cap ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.46, 0);
    this.torsoGroup.add(this.headGroup);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.22), skinMat);
    headMesh.position.set(0, 0.14, 0.02);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Robber mask covering lower face
    const maskMesh = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.12, 0.12), maskMat);
    maskMesh.position.set(0, 0.1, 0.08);
    this.headGroup.add(maskMesh);

    // Cap / Beanie
    const beanieMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.24), hoodieMat);
    beanieMesh.position.set(0, 0.23, 0.01);
    this.headGroup.add(beanieMesh);

    // --- ARMS ---
    // Left Arm
    this.leftShoulderGroup = new THREE.Group();
    this.leftShoulderGroup.position.set(-0.24, 0.38, 0);
    this.torsoGroup.add(this.leftShoulderGroup);

    const upperArmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.26, 8);
    upperArmGeo.translate(0, -0.13, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, hoodieMat);
    leftUpperArm.castShadow = true;
    this.leftShoulderGroup.add(leftUpperArm);

    this.leftElbowGroup = new THREE.Group();
    this.leftElbowGroup.position.set(0, -0.26, 0);
    this.leftShoulderGroup.add(this.leftElbowGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8);
    forearmGeo.translate(0, -0.12, 0);
    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.castShadow = true;
    this.leftElbowGroup.add(leftForearm);

    // Right Arm (carries the stolen property)
    this.rightShoulderGroup = new THREE.Group();
    this.rightShoulderGroup.position.set(0.24, 0.38, 0);
    this.torsoGroup.add(this.rightShoulderGroup);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, hoodieMat);
    rightUpperArm.castShadow = true;
    this.rightShoulderGroup.add(rightUpperArm);

    this.rightElbowGroup = new THREE.Group();
    this.rightElbowGroup.position.set(0, -0.26, 0);
    this.rightShoulderGroup.add(this.rightElbowGroup);

    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.castShadow = true;
    this.rightElbowGroup.add(rightForearm);

    // --- STOLEN ITEM ATTACHED TO RIGHT HAND ---
    this.stolenItemMesh = this.buildStolenItem(missionType);
    this.stolenItemMesh.position.set(0, -0.25, 0.1);
    this.rightElbowGroup.add(this.stolenItemMesh);

    // --- LEGS ---
    // Left Leg
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(-0.11, -0.06, 0);
    this.pelvisGroup.add(this.leftHipGroup);

    const thighGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.42, 8);
    thighGeo.translate(0, -0.21, 0);
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.castShadow = true;
    this.leftHipGroup.add(leftThigh);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.set(0, -0.42, 0);
    this.leftHipGroup.add(this.leftKneeGroup);

    const shinGeo = new THREE.CylinderGeometry(0.06, 0.048, 0.42, 8);
    shinGeo.translate(0, -0.21, 0);
    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.castShadow = true;
    this.leftKneeGroup.add(leftShin);

    const shoeGeo = new THREE.BoxGeometry(0.12, 0.1, 0.26);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.44, 0.06);
    leftShoe.castShadow = true;
    this.leftKneeGroup.add(leftShoe);

    // Right Leg
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

    // Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.8, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    this.root.add(shadow);
  }

  private buildStolenItem(type: MissionType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'bank-robbery') {
      // Burlap Cash Sack with dollar sign
      const sackMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.9 });
      const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), sackMat);
      sack.scale.set(1.0, 1.3, 0.9);
      sack.castShadow = true;
      group.add(sack);
    } else if (type === 'handbag-snatch') {
      // Luxury leather handbag
      const bagMat = new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.3, metalness: 0.2 });
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.32), bagMat);
      bag.castShadow = true;
      // Handle strap
      const strapGeo = new THREE.TorusGeometry(0.12, 0.018, 8, 16, Math.PI);
      const strapMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8 });
      const strap = new THREE.Mesh(strapGeo, strapMat);
      strap.position.set(0, 0.12, 0);
      group.add(bag, strap);
    } else if (type === 'jewellery-heist') {
      // Velvet jewellery treasure chest box with glowing gems
      const boxMat = new THREE.MeshStandardMaterial({ color: '#4c1d95', roughness: 0.4 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.26), boxMat);
      box.castShadow = true;
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12),
        new THREE.MeshPhysicalMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 1.0, roughness: 0.1 })
      );
      gem.position.set(0, 0.12, 0);
      group.add(box, gem);
    } else {
      // Tech case / package
      const caseMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3, metalness: 0.5 });
      const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.3), caseMat);
      caseMesh.castShadow = true;
      group.add(caseMesh);
    }

    return group;
  }

  public triggerDistractionSlowdown() {
    this.isStumbled = true;
    this.stumbleTimer = 2.4; // 2.4s stumble and slowdown
  }

  public triggerSurrender() {
    this.isCaptured = true;
    // Hands up in surrender!
    this.leftShoulderGroup.rotation.x = -2.8;
    this.rightShoulderGroup.rotation.x = -2.8;
    this.leftElbowGroup.rotation.x = 0;
    this.rightElbowGroup.rotation.x = 0;
    this.torsoGroup.rotation.x = -0.1;
  }

  public update(delta: number, playerZ: number, playerSpeed: number) {
    if (this.isCaptured) {
      // Stays still in surrender
      return;
    }

    // Handle stumble timer
    if (this.stumbleTimer > 0) {
      this.stumbleTimer -= delta;
      if (this.stumbleTimer <= 0) {
        this.isStumbled = false;
      }
    }

    // Suspect speed: slightly slower than top player speed so a skilled player catches up,
    // and significantly slower if stumbled!
    let suspectSpeed = playerSpeed * 0.94;
    if (this.isStumbled) {
      suspectSpeed *= 0.55; // 45% slowdown when distracted!
      this.torsoGroup.rotation.x = 0.5; // Wobble forward
      this.headGroup.rotation.y = 0.4; // Looks back nervously
    } else {
      this.torsoGroup.rotation.x = 0.2;
      this.headGroup.rotation.y = 0;
    }

    this.z += suspectSpeed * delta;

    // Evasive lane changing AI
    this.laneSwitchTimer -= delta;
    if (this.laneSwitchTimer <= 0) {
      this.laneSwitchTimer = 2.5 + Math.random() * 2.0;
      const choices: Lane[] = [-1, 0, 1];
      const nextLane = choices[Math.floor(Math.random() * choices.length)];
      this.targetLane = nextLane;
    }

    // Smooth lane dampening
    const targetX = this.targetLane * 2.4;
    this.x = THREE.MathUtils.damp(this.x, targetX, 5.0, delta);
    this.root.position.set(this.x, 0, this.z);

    // Running animation cycle
    const runFreq = this.isStumbled ? 7 : 14;
    this.runCycleTime += delta * runFreq;
    const sinCycle = Math.sin(this.runCycleTime);

    this.pelvisGroup.position.y = 0.95 + Math.abs(sinCycle) * 0.05;
    this.leftHipGroup.rotation.x = sinCycle * 0.75;
    this.rightHipGroup.rotation.x = -sinCycle * 0.75;

    this.leftKneeGroup.rotation.x = sinCycle > 0 ? sinCycle * 0.9 : 0.15;
    this.rightKneeGroup.rotation.x = sinCycle < 0 ? -sinCycle * 0.9 : 0.15;

    this.leftShoulderGroup.rotation.x = -sinCycle * 0.7;
    // Right arm grips stolen item securely while pumping
    this.rightShoulderGroup.rotation.x = sinCycle * 0.4 - 0.3;
    this.rightElbowGroup.rotation.x = -1.2;
  }
}
