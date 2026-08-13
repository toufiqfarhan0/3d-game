import * as THREE from 'three';

/**
 * Procedural PBR Texture Generator for Realistic Three.js Assets
 * Generates high-detail textures using 2D Canvas with zero external network requests.
 */
export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates a realistic asphalt highway road texture with lane markings, aggregate noise, and subtle grime.
   */
  public static createRoadTexture(isLightMode: boolean = false): THREE.CanvasTexture {
    const key = `road_${isLightMode}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Base asphalt color
    const baseColor = isLightMode ? '#4b5563' : '#1e2230';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Asphalt aggregate noise & pebble grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * (isLightMode ? 28 : 22);
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Realistic longitudinal wheel wear tracks (2 per lane = 6 tracks across 3 lanes)
    const wheelTracks = [
      160, 280, // Lane 1 (Left)
      452, 572, // Lane 2 (Center)
      744, 864  // Lane 3 (Right)
    ];
    wheelTracks.forEach(x => {
      const grad = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
      const darkAlpha = isLightMode ? 0.14 : 0.22;
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, `rgba(0,0,0,${darkAlpha})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 30, 0, 60, 1024);
    });

    // 4. Outer Concrete Curbs / Gutters
    ctx.fillStyle = isLightMode ? '#9ca3af' : '#2d3748';
    ctx.fillRect(0, 0, 48, 1024);
    ctx.fillRect(976, 0, 48, 1024);

    // Edge gutter drainage lines
    ctx.strokeStyle = isLightMode ? '#6b7280' : '#1a202c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, 0); ctx.lineTo(48, 1024);
    ctx.moveTo(976, 0); ctx.lineTo(976, 1024);
    ctx.stroke();

    // 5. Left Shoulder Solid Yellow Line (Highway standard)
    ctx.fillStyle = '#f59e0b';
    ctx.globalAlpha = 0.95;
    ctx.fillRect(64, 0, 12, 1024);

    // 6. Right Shoulder Solid White Line (Highway standard fog line)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(948, 0, 12, 1024);

    // 7. TWO Dashed White Lane Dividers (Dividing the road into exactly 3 equal lanes)
    // Lane 1: 64px to 368px (Center: ~216px, 3D X = -3.2)
    // Lane 2: 368px to 656px (Center: 512px, 3D X = 0.0)
    // Lane 3: 656px to 948px (Center: ~802px, 3D X = +3.2)
    const dashLength = 128;
    const gapLength = 128;
    const dividerXPositions = [368, 656];

    dividerXPositions.forEach(divX => {
      for (let y = 10; y < 1024; y += dashLength + gapLength) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(divX - 5, y, 10, dashLength);
      }
    });

    // 8. Subtle Painted Highway Speed Chevrons in each lane
    const laneCenters = [216, 512, 802];
    ctx.strokeStyle = isLightMode ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    laneCenters.forEach(cx => {
      [200, 712].forEach(cy => {
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy + 20);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 30, cy + 20);
        ctx.stroke();
      });
    });

    ctx.globalAlpha = 1.0;

    // 8. Transverse highway expansion joints / crack lines
    ctx.strokeStyle = isLightMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Generates a concrete texture with formwork lines, tie holes, and weathering.
   */
  public static createConcreteTexture(isLightMode: boolean = false): THREE.CanvasTexture {
    const key = `concrete_${isLightMode}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const base = isLightMode ? '#cbd5e1' : '#334155';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    // Noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 20;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Concrete formwork panels
    ctx.strokeStyle = isLightMode ? '#94a3b8' : '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 504, 250);
    ctx.strokeRect(4, 258, 504, 250);

    // Tie holes
    ctx.fillStyle = isLightMode ? '#64748b' : '#0f172a';
    const holes = [[30, 30], [482, 30], [30, 224], [482, 224], [30, 284], [482, 284], [30, 482], [482, 482]];
    holes.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Generates a high-rise building facade texture with detailed architectural windows, mullions, and illuminated rooms.
   */
  public static createBuildingFacadeTexture(styleIndex: number, isLightMode: boolean = false): THREE.CanvasTexture {
    const key = `bldg_${styleIndex}_${isLightMode}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base wall
    const wallColors = isLightMode 
      ? ['#e2e8f0', '#f1f5f9', '#cbd5e1', '#e5e7eb']
      : ['#0f172a', '#1e293b', '#182033', '#111928'];
    const wallColor = wallColors[styleIndex % wallColors.length];
    ctx.fillStyle = wallColor;
    ctx.fillRect(0, 0, 512, 1024);

    // Grid config
    const cols = 8;
    const rows = 24;
    const cellW = 512 / cols;
    const cellH = 1024 / rows;
    const padX = cellW * 0.18;
    const padY = cellH * 0.22;

    const warmLight = ['#fef08a', '#fed7aa', '#fde047', '#ffedd5'];
    const coolLight = ['#bae6fd', '#7dd3fc', '#e0f2fe', '#67e8f9'];
    const darkWindow = isLightMode ? '#334155' : '#030712';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + padX;
        const y = r * cellH + padY;
        const w = cellW - padX * 2;
        const h = cellH - padY * 2;

        // Window Frame (spandrel / mullion)
        ctx.fillStyle = isLightMode ? '#94a3b8' : '#0b0f19';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

        // Window glass
        const isLit = Math.random() > 0.45;
        if (isLit && !isLightMode) {
          const isWarm = Math.random() > 0.4;
          const lightPool = isWarm ? warmLight : coolLight;
          ctx.fillStyle = lightPool[Math.floor(Math.random() * lightPool.length)];
          ctx.fillRect(x, y, w, h);

          // Subtle interior silhouette or blinds
          if (Math.random() > 0.5) {
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(x, y, w, h * (0.3 + Math.random() * 0.4));
          }
        } else {
          ctx.fillStyle = darkWindow;
          ctx.fillRect(x, y, w, h);
          // Subtle sky reflection
          const grad = ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, isLightMode ? 'rgba(186,230,253,0.4)' : 'rgba(56,189,248,0.12)');
          grad.addColorStop(1, 'rgba(0,0,0,0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);
        }

        // Horizontal mullion division
        ctx.fillStyle = isLightMode ? '#64748b' : '#090d16';
        ctx.fillRect(x, y + h * 0.45, w, 2);
      }
    }

    // Vertical structural columns / fins
    ctx.fillStyle = isLightMode ? '#64748b' : '#334155';
    for (let c = 0; c <= cols; c++) {
      ctx.fillRect(c * cellW - 2, 0, 4, 1024);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Generates industrial hazard warning stripes texture (e.g. for barriers, cranes, clearance posts).
   */
  public static createHazardTexture(): THREE.CanvasTexture {
    const key = 'hazard_stripes';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#eab308'; // Safety Yellow
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#18181b'; // Dark Carbon
    const stripeWidth = 32;
    for (let i = -256; i < 512; i += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeWidth, 0);
      ctx.lineTo(i + stripeWidth - 256, 256);
      ctx.lineTo(i - 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Generates corrugated metal / ISO shipping container siding texture.
   */
  public static createContainerTexture(colorHex: string = '#0284c7'): THREE.CanvasTexture {
    const key = `container_${colorHex}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Corrugation ridges
    const ridgeWidth = 32;
    for (let x = 0; x < 512; x += ridgeWidth) {
      const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0.25)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.05)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ridgeWidth, 512);
    }

    // Steel structural frame border
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, 512, 16);
    ctx.fillRect(0, 496, 512, 16);
    ctx.fillRect(0, 0, 16, 512);
    ctx.fillRect(496, 0, 16, 512);

    // Stenciled container identification codes
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MSCU 948201-4', 32, 50);
    ctx.font = '14px monospace';
    ctx.fillText('MAX GR  32,500 KG', 32, 80);
    ctx.fillText('PAYLOAD 28,750 KG', 32, 100);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Generates a realistic highway electronic overhead VMS (Variable Message Sign) canvas texture.
   */
  public static createHighwaySignTexture(signText: string, sectorText: string): THREE.CanvasTexture {
    const key = `sign_${signText}_${sectorText}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background housing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 256);

    // Amber LED matrix sign area
    ctx.fillStyle = '#020617';
    ctx.fillRect(16, 16, 992, 224);

    // Amber LED glow text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fillText(signText, 512, 90);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillText(sectorText, 512, 160);

    // Hazard border around the VMS
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 992, 224);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}
