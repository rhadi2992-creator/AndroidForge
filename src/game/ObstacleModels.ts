import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';

export interface ObstacleHitbox {
  width: number;
  height: number;
  length: number;
  canJumpOver: boolean;
  canSlideUnder: boolean;
  minJumpHeight?: number;
  maxSlideHeight?: number;
}

export class ObstacleFactory {
  /**
   * Creates an orange & white striped traffic barricade with hazard flashers.
   */
  public static createTrafficBarrier(): THREE.Group {
    const group = new THREE.Group();
    const hazardTex = ProceduralTextures.getHazardTexture();

    const boardMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.4,
      metalness: 0.1,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.3,
      metalness: 0.8,
    });

    // Striped barrier board
    const boardGeo = new THREE.BoxGeometry(2.1, 0.45, 0.08);
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0.75, 0);
    board.castShadow = true;
    group.add(board);

    // Two A-frame metal legs
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8);
    [-0.85, 0.85].forEach((x) => {
      const leg1 = new THREE.Mesh(legGeo, legMat);
      leg1.position.set(x, 0.48, 0.18);
      leg1.rotation.x = 0.25;
      leg1.castShadow = true;

      const leg2 = new THREE.Mesh(legGeo, legMat);
      leg2.position.set(x, 0.48, -0.18);
      leg2.rotation.x = -0.25;
      leg2.castShadow = true;

      group.add(leg1, leg2);
    });

    // Flashing amber caution beacon
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#f59e0b',
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.06, 0);
    group.add(beacon);

    group.userData.hitbox = {
      width: 2.1,
      height: 1.15,
      length: 0.6,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 1.05,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates a concrete Jersey barrier (K-rail).
   */
  public static createJerseyBarrier(): THREE.Group {
    const group = new THREE.Group();
    const concreteMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.85,
      metalness: 0.05,
    });

    // Profile of a highway concrete barrier
    const baseGeo = new THREE.BoxGeometry(2.0, 0.35, 0.7);
    const base = new THREE.Mesh(baseGeo, concreteMat);
    base.position.set(0, 0.175, 0);
    base.castShadow = true;

    const midGeo = new THREE.BoxGeometry(2.0, 0.55, 0.38);
    const mid = new THREE.Mesh(midGeo, concreteMat);
    mid.position.set(0, 0.6, 0);
    mid.castShadow = true;

    // Small reflector on top
    const refGeo = new THREE.BoxGeometry(0.12, 0.08, 0.04);
    const refMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 1.5 });
    const ref = new THREE.Mesh(refGeo, refMat);
    ref.position.set(0, 0.9, 0);

    group.add(base, mid, ref);

    group.userData.hitbox = {
      width: 2.0,
      height: 0.9,
      length: 0.7,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 0.85,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates an overhead highway gantry sign / steel bridge (Requires SLIDE).
   */
  public static createOverheadSign(): THREE.Group {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.3,
      metalness: 0.85,
    });

    // 2 Tall Vertical Steel Support Columns on road edges
    const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.2, 12);
    [-3.8, 3.8].forEach((x) => {
      const post = new THREE.Mesh(postGeo, steelMat);
      post.position.set(x, 2.1, 0);
      post.castShadow = true;
      group.add(post);
    });

    // Overhead truss crossbeam spanning all 3 lanes
    const beamGeo = new THREE.BoxGeometry(8.2, 0.4, 0.5);
    const beam = new THREE.Mesh(beamGeo, steelMat);
    beam.position.set(0, 3.8, 0);
    beam.castShadow = true;
    group.add(beam);

    // Suspended road clearance sign / low obstacle banner
    // Lower clearance: Bottom hangs down to 1.15m height!
    // Player standing height is ~1.78m -> Must slide under!
    const signGeo = new THREE.BoxGeometry(2.3, 1.4, 0.12);
    const signMat = new THREE.MeshStandardMaterial({
      color: '#047857', // Highway green
      roughness: 0.3,
      metalness: 0.2,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.0, 0); // Bottom is at 1.3m, top at 2.7m
    sign.castShadow = true;

    // Caution border on sign
    const borderGeo = new THREE.BoxGeometry(2.2, 0.12, 0.14);
    const borderMat = new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.2 });
    const topBorder = new THREE.Mesh(borderGeo, borderMat);
    topBorder.position.set(0, 2.6, 0);
    const botBorder = new THREE.Mesh(borderGeo, borderMat);
    botBorder.position.set(0, 1.38, 0);

    group.add(sign, topBorder, botBorder);

    group.userData.hitbox = {
      width: 2.3,
      height: 1.5,
      length: 0.5,
      canJumpOver: false,
      canSlideUnder: true,
      maxSlideHeight: 1.25, // If sliding, player height is ~0.6m -> passes safely!
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates a set of traffic cones.
   */
  public static createTrafficCones(): THREE.Group {
    const group = new THREE.Group();

    const coneGeo = new THREE.ConeGeometry(0.24, 0.72, 16);
    coneGeo.translate(0, 0.36, 0);

    const baseGeo = new THREE.BoxGeometry(0.5, 0.05, 0.5);
    baseGeo.translate(0, 0.025, 0);

    const coneMat = new THREE.MeshStandardMaterial({
      color: '#f97316',
      roughness: 0.4,
      metalness: 0.1,
    });

    const stripeMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.3,
      metalness: 0.3,
    });

    [-0.55, 0.55].forEach((x) => {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 0, 0);
      cone.castShadow = true;

      const base = new THREE.Mesh(baseGeo, coneMat);
      base.position.set(x, 0, 0);
      base.castShadow = true;

      // Reflective white stripe collar
      const collarGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.18, 16);
      const collar = new THREE.Mesh(collarGeo, stripeMat);
      collar.position.set(x, 0.35, 0);

      group.add(cone, base, collar);
    });

    group.userData.hitbox = {
      width: 1.6,
      height: 0.75,
      length: 0.6,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 0.7,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates a road trench / construction excavation gap (Requires JUMP).
   */
  public static createRoadTrench(): THREE.Group {
    const group = new THREE.Group();

    // Dark pit hole in the road
    const pitGeo = new THREE.BoxGeometry(2.2, 0.6, 2.8);
    const pitMat = new THREE.MeshStandardMaterial({
      color: '#09090b',
      roughness: 0.95,
      metalness: 0.05,
    });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, -0.28, 0);

    // Warning steel trench plates & flashing markers
    const plateGeo = new THREE.BoxGeometry(0.4, 0.06, 2.9);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#71717a', metalness: 0.9, roughness: 0.2 });
    const p1 = new THREE.Mesh(plateGeo, plateMat);
    p1.position.set(-1.15, 0.02, 0);
    const p2 = new THREE.Mesh(plateGeo, plateMat);
    p2.position.set(1.15, 0.02, 0);

    group.add(pit, p1, p2);

    group.userData.hitbox = {
      width: 2.2,
      height: 0.5,
      length: 2.8,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 0.5,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates a street football / soccer ball.
   */
  public static createFootball(): THREE.Group {
    const group = new THREE.Group();
    const ballGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.4,
      metalness: 0.1,
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 0.24, 0);
    ball.castShadow = true;

    // Black hexagon patches
    const patchMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.5 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 6), patchMat);
    p1.position.set(0, 0.47, 0);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 6), patchMat);
    p2.position.set(0.18, 0.24, 0.12);
    p2.rotation.x = Math.PI / 3;

    group.add(ball, p1, p2);

    group.userData.hitbox = {
      width: 0.6,
      height: 0.5,
      length: 0.6,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 0.4,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates an empty street bottle obstacle / distraction prop.
   */
  public static createBottle(): THREE.Group {
    const group = new THREE.Group();
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.8,
    });
    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 10);
    const neckGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.15, 10);
    neckGeo.translate(0, 0.25, 0);

    const body = new THREE.Mesh(bodyGeo, bottleMat);
    const neck = new THREE.Mesh(neckGeo, bottleMat);
    body.position.set(0, 0.175, 0);
    body.castShadow = true;
    neck.castShadow = true;

    // Laying slightly tilted on road
    group.add(body, neck);
    group.rotation.z = Math.PI / 2.3;
    group.position.y = 0.08;

    group.userData.hitbox = {
      width: 0.4,
      height: 0.3,
      length: 0.6,
      canJumpOver: true,
      canSlideUnder: false,
      minJumpHeight: 0.25,
    } as ObstacleHitbox;

    return group;
  }

  /**
   * Creates a bundle of recovered bank cash notes dropped by the suspect.
   */
  public static createMoneyStack(): THREE.Group {
    const group = new THREE.Group();
    const cashMat = new THREE.MeshStandardMaterial({
      color: '#15803d', // Banknote green
      roughness: 0.6,
      metalness: 0.1,
    });
    const bandMat = new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.3 });

    const stackGeo = new THREE.BoxGeometry(0.35, 0.14, 0.24);
    const stack = new THREE.Mesh(stackGeo, cashMat);
    stack.position.set(0, 0.07, 0);
    stack.castShadow = true;

    const bandGeo = new THREE.BoxGeometry(0.08, 0.15, 0.25);
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0, 0.07, 0);

    group.add(stack, band);
    return group;
  }

  /**
   * Creates a dropped diamond jewellery piece.
   */
  public static createJewelleryPiece(): THREE.Group {
    const group = new THREE.Group();
    const gemGeo = new THREE.OctahedronGeometry(0.22);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.22, 0);

    const ringGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.15 });
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.1, 0);

    group.add(gem, ring);
    return group;
  }
}
