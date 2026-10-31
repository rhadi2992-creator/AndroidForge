import * as THREE from 'three';

export class ProceduralTextures {
  private static roadCache: Map<string, THREE.CanvasTexture> = new Map();
  private static sidewalkCache: THREE.CanvasTexture | null = null;
  private static buildingCache: Map<string, THREE.CanvasTexture> = new Map();
  private static barrierCache: THREE.CanvasTexture | null = null;

  /**
   * Generates a realistic high-definition asphalt road texture with dashed center lines,
   * edge solid lines, aggregate bitumen grain, and subtle tire track weathering.
   */
  public static getRoadTexture(roadColorHex: string, markingColorHex: string, wet = false): THREE.CanvasTexture {
    const key = `${roadColorHex}_${markingColorHex}_${wet}`;
    if (this.roadCache.has(key)) {
      return this.roadCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base asphalt color
    ctx.fillStyle = roadColorHex;
    ctx.fillRect(0, 0, 1024, 1024);

    // Bitumen grain & micro-noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * (wet ? 18 : 28);
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle tire wear grooves in lane centers
    const laneX = [256, 512, 768];
    laneX.forEach((lx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(lx - 45, 0, 90, 1024);
    });

    // Solid outer shoulder lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(36, 0, 16, 1024);
    ctx.fillRect(1024 - 52, 0, 16, 1024);

    // Dashed lane divider lines (for 3 lanes: dividers at 341 and 682)
    ctx.fillStyle = markingColorHex;
    const dashLength = 96;
    const gapLength = 64;
    const totalSegment = dashLength + gapLength;
    for (let y = 0; y < 1024; y += totalSegment) {
      // Left divider
      ctx.fillRect(341 - 7, y, 14, dashLength);
      // Right divider
      ctx.fillRect(682 - 7, y, 14, dashLength);
    }

    // Wet puddles / reflections if rainy
    if (wet) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(300, 400, 120, 60, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(750, 800, 140, 70, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.roadCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a concrete sidewalk paver texture with expansion joints and curb line.
   */
  public static getSidewalkTexture(sidewalkColorHex = '#94a3b8'): THREE.CanvasTexture {
    if (this.sidewalkCache) return this.sidewalkCache;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete base
    ctx.fillStyle = sidewalkColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Add concrete grit
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Paver tile seams (128x128 grid)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Curb chamfer line on edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, 24, 512);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(24, 0, 4, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.sidewalkCache = texture;
    return texture;
  }

  /**
   * Generates architectural glass facade with illuminated office windows.
   */
  public static getBuildingFacadeTexture(baseColorHex: string, isNight: boolean): THREE.CanvasTexture {
    const key = `${baseColorHex}_${isNight}`;
    if (this.buildingCache.has(key)) return this.buildingCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete/Mullion wall base
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Architectural grid of windows
    const cols = 8;
    const rows = 12;
    const padX = 14;
    const padY = 10;
    const winW = (512 - padX * (cols + 1)) / cols;
    const winH = (512 - padY * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padX + c * (winW + padX);
        const y = padY + r * (winH + padY);

        if (isNight) {
          // In night mode, some windows are brightly lit warm amber or cool white, others dark
          const lit = Math.random() > 0.4;
          if (lit) {
            ctx.fillStyle = Math.random() > 0.3 ? '#fef08a' : '#93c5fd';
          } else {
            ctx.fillStyle = '#0f172a';
          }
        } else {
          // Daytime glass reflection with subtle gradient
          const grad = ctx.createLinearGradient(x, y, x, y + winH);
          grad.addColorStop(0, '#94a3b8');
          grad.addColorStop(1, '#334155');
          ctx.fillStyle = grad;
        }

        ctx.fillRect(x, y, winW, winH);

        // Window frame
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, winW, winH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.buildingCache.set(key, texture);
    return texture;
  }

  /**
   * Generates diagonal hazard stripes for construction barricades.
   */
  public static getHazardTexture(): THREE.CanvasTexture {
    if (this.barrierCache) return this.barrierCache;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#f97316'; // Vivid orange
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#ffffff';
    const stripeW = 32;
    ctx.beginPath();
    for (let x = -256; x < 512; x += stripeW * 2) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + 256, 256);
      ctx.lineTo(x + 256, 256);
      ctx.closePath();
    }
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.barrierCache = texture;
    return texture;
  }
}
