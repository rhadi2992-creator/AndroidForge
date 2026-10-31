import * as THREE from 'three';

export class VehicleFactory {
  private static wheelGeo: THREE.CylinderGeometry | null = null;
  private static tireMat: THREE.MeshStandardMaterial | null = null;
  private static rimMat: THREE.MeshStandardMaterial | null = null;
  private static glassMat: THREE.MeshPhysicalMaterial | null = null;
  private static headlightMat: THREE.MeshStandardMaterial | null = null;
  private static taillightMat: THREE.MeshStandardMaterial | null = null;

  private static initSharedResources() {
    if (this.wheelGeo) return;
    this.wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
    this.wheelGeo.rotateZ(Math.PI / 2);

    this.tireMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.9,
      metalness: 0.1,
    });

    this.rimMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.2,
      metalness: 0.9,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    this.headlightMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });

    this.taillightMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#ef4444',
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
  }

  /**
   * Creates a multi-part modern sedan vehicle.
   */
  public static createSedan(colorHex = '#2563eb'): THREE.Group {
    this.initSharedResources();
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.3,
      metalness: 0.7,
    });

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.5, 4.2);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0.45, 0);
    chassis.castShadow = true;
    group.add(chassis);

    // Upper Cabin
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.48, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, this.glassMat!);
    cabin.position.set(0, 0.88, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Roof
    const roofGeo = new THREE.BoxGeometry(1.48, 0.06, 2.1);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.13, -0.2);
    group.add(roof);

    // 4 Wheels
    const wheelPositions = [
      [-0.85, 0.35, 1.2],
      [0.85, 0.35, 1.2],
      [-0.85, 0.35, -1.2],
      [0.85, 0.35, -1.2],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(this.wheelGeo!, this.tireMat!);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);

      // Rim
      const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.24, 8);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.rimMat!);
      rim.position.set(x, y, z);
      group.add(rim);
    });

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.12, 0.08);
    const hlLeft = new THREE.Mesh(hlGeo, this.headlightMat!);
    hlLeft.position.set(-0.6, 0.5, 2.12);
    const hlRight = new THREE.Mesh(hlGeo, this.headlightMat!);
    hlRight.position.set(0.6, 0.5, 2.12);
    group.add(hlLeft, hlRight);

    // Taillights
    const tlGeo = new THREE.BoxGeometry(0.35, 0.1, 0.08);
    const tlLeft = new THREE.Mesh(tlGeo, this.taillightMat!);
    tlLeft.position.set(-0.6, 0.52, -2.12);
    const tlRight = new THREE.Mesh(tlGeo, this.taillightMat!);
    tlRight.position.set(0.6, 0.52, -2.12);
    group.add(tlLeft, tlRight);

    // Contact shadow
    const shadowGeo = new THREE.PlaneGeometry(1.9, 4.4);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    group.userData = { width: 1.8, height: 1.2, length: 4.2 };
    return group;
  }

  /**
   * Creates an SUV / Police Interceptor with roof emergency lights.
   */
  public static createSUV(isPolice = true): THREE.Group {
    this.initSharedResources();
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: isPolice ? '#18181b' : '#334155',
      roughness: 0.35,
      metalness: 0.6,
    });

    // High Clearance Chassis
    const chassisGeo = new THREE.BoxGeometry(1.95, 0.75, 4.6);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0.65, 0);
    chassis.castShadow = true;
    group.add(chassis);

    // Tall Cabin
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.7, 2.8);
    const cabin = new THREE.Mesh(cabinGeo, this.glassMat!);
    cabin.position.set(0, 1.25, -0.3);
    cabin.castShadow = true;
    group.add(cabin);

    // SUV Roof
    const roofGeo = new THREE.BoxGeometry(1.68, 0.08, 2.75);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.62, -0.3);
    group.add(roof);

    // Police Lightbar if police
    if (isPolice) {
      const barGeo = new THREE.BoxGeometry(0.9, 0.1, 0.25);
      const barMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 2.0 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 1.72, -0.3);
      group.add(bar);

      // Push bumper
      const bumperGeo = new THREE.BoxGeometry(1.7, 0.4, 0.2);
      const bumperMat = new THREE.MeshStandardMaterial({ color: '#18181b', metalness: 0.9, roughness: 0.2 });
      const bumper = new THREE.Mesh(bumperGeo, bumperMat);
      bumper.position.set(0, 0.5, 2.35);
      group.add(bumper);
    }

    // Large wheels
    const wheelPositions = [
      [-0.95, 0.42, 1.4],
      [0.95, 0.42, 1.4],
      [-0.95, 0.42, -1.4],
      [0.95, 0.42, -1.4],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(this.wheelGeo!, this.tireMat!);
      wheel.scale.set(1.15, 1.15, 1.15);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);
    });

    group.userData = { width: 1.95, height: 1.75, length: 4.6 };
    return group;
  }

  /**
   * Creates a Metro City Transit Bus (Long obstacle spanning large section).
   */
  public static createBus(): THREE.Group {
    this.initSharedResources();
    const group = new THREE.Group();

    const busBodyMat = new THREE.MeshStandardMaterial({
      color: '#0284c7', // Transit blue
      roughness: 0.4,
      metalness: 0.3,
    });

    // Bus main rectangular chassis
    const bodyGeo = new THREE.BoxGeometry(2.3, 2.1, 9.6);
    const body = new THREE.Mesh(bodyGeo, busBodyMat);
    body.position.set(0, 1.4, 0);
    body.castShadow = true;
    group.add(body);

    // Continuous Glass Windows Band
    const windowBandGeo = new THREE.BoxGeometry(2.34, 0.85, 8.8);
    const windowBand = new THREE.Mesh(windowBandGeo, this.glassMat!);
    windowBand.position.set(0, 1.7, 0);
    group.add(windowBand);

    // Front Windshield
    const windshieldGeo = new THREE.BoxGeometry(2.2, 0.9, 0.2);
    const windshield = new THREE.Mesh(windshieldGeo, this.glassMat!);
    windshield.position.set(0, 1.7, 4.75);
    group.add(windshield);

    // LED Destination display
    const ledGeo = new THREE.BoxGeometry(1.6, 0.25, 0.1);
    const ledMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 1.8 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 2.25, 4.76);
    group.add(led);

    // 6 Bus Wheels
    const busWheels = [
      [-1.15, 0.45, 3.2],
      [1.15, 0.45, 3.2],
      [-1.15, 0.45, -2.6],
      [1.15, 0.45, -2.6],
      [-1.15, 0.45, -3.8],
      [1.15, 0.45, -3.8],
    ];
    busWheels.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(this.wheelGeo!, this.tireMat!);
      wheel.scale.set(1.2, 1.2, 1.2);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);
    });

    group.userData = { width: 2.3, height: 2.45, length: 9.6 };
    return group;
  }

  /**
   * Creates a Sport Motorcycle.
   */
  public static createMotorcycle(): THREE.Group {
    this.initSharedResources();
    const group = new THREE.Group();

    const bikeMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.2,
      metalness: 0.8,
    });

    // Frame & Tank
    const tankGeo = new THREE.BoxGeometry(0.5, 0.45, 1.2);
    const tank = new THREE.Mesh(tankGeo, bikeMat);
    tank.position.set(0, 0.7, 0);
    tank.castShadow = true;
    group.add(tank);

    // Engine block
    const engineGeo = new THREE.BoxGeometry(0.44, 0.35, 0.6);
    const engine = new THREE.Mesh(engineGeo, this.rimMat!);
    engine.position.set(0, 0.4, 0);
    group.add(engine);

    // Front & Rear Tire
    const frontWheel = new THREE.Mesh(this.wheelGeo!, this.tireMat!);
    frontWheel.scale.set(0.9, 0.9, 0.7);
    frontWheel.position.set(0, 0.32, 0.8);
    frontWheel.castShadow = true;

    const rearWheel = new THREE.Mesh(this.wheelGeo!, this.tireMat!);
    rearWheel.scale.set(0.95, 0.95, 0.8);
    rearWheel.position.set(0, 0.34, -0.8);
    rearWheel.castShadow = true;

    group.add(frontWheel, rearWheel);

    group.userData = { width: 0.8, height: 1.1, length: 2.2 };
    return group;
  }
}
