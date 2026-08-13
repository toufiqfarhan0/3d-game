import * as THREE from 'three';

interface ParticleNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  size: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export class ParticleManager {
  private scene: THREE.Scene;
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private particleMesh: THREE.Points;

  private maxParticles: number = 800;
  private pool: ParticleNode[] = [];
  private poolIndex: number = 0;
  private positions: Float32Array;
  private colors: Float32Array;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: -1000,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        r: 1,
        g: 1,
        b: 1,
        size: 0,
        life: 0,
        maxLife: 1,
        active: false,
      });
      this.positions[i * 3 + 1] = -1000;
      this.colors[i * 3] = 1;
      this.colors[i * 3 + 1] = 1;
      this.colors[i * 3 + 2] = 1;
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleMesh = new THREE.Points(this.particleGeo, this.particleMat);
    this.particleMesh.frustumCulled = false;
    this.scene.add(this.particleMesh);
  }

  // Fast O(1) ring buffer particle allocator
  private getNextParticle(): ParticleNode {
    const p = this.pool[this.poolIndex];
    this.poolIndex = (this.poolIndex + 1) % this.maxParticles;
    return p;
  }

  public spawnBurst(pos: THREE.Vector3, colorHex: number, count: number = 24) {
    const r = ((colorHex >> 16) & 255) / 255;
    const g = ((colorHex >> 8) & 255) / 255;
    const b = (colorHex & 255) / 255;

    for (let i = 0; i < count; i++) {
      const p = this.getNextParticle();
      p.x = pos.x;
      p.y = pos.y;
      p.z = pos.z;
      p.vx = (Math.random() - 0.5) * 10;
      p.vy = Math.random() * 8 + 2;
      p.vz = (Math.random() - 0.5) * 10;
      p.r = r;
      p.g = g;
      p.b = b;
      p.life = 0;
      p.maxLife = Math.random() * 0.4 + 0.3;
      p.active = true;
    }
  }

  public spawnSlideSparks(playerPos: THREE.Vector3) {
    for (let i = 0; i < 3; i++) {
      const p = this.getNextParticle();
      p.x = playerPos.x + (Math.random() - 0.5) * 0.4;
      p.y = 0.05;
      p.z = playerPos.z - 0.2;
      p.vx = (Math.random() - 0.5) * 4;
      p.vy = Math.random() * 2 + 0.5;
      p.vz = -Math.random() * 8 - 4;
      p.r = 0.96; // 0xf59e0b
      p.g = 0.62;
      p.b = 0.04;
      p.life = 0;
      p.maxLife = 0.22;
      p.active = true;
    }
  }

  public spawnThrusterSparks(playerPos: THREE.Vector3, colorHex: number = 0x38bdf8) {
    if (Math.random() < 0.6) {
      const p = this.getNextParticle();
      p.x = playerPos.x + (Math.random() - 0.5) * 0.2;
      p.y = playerPos.y + 0.7;
      p.z = playerPos.z - 0.35;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -Math.random() * 2 - 1.0;
      p.vz = -Math.random() * 6 - 8;
      p.r = ((colorHex >> 16) & 255) / 255;
      p.g = ((colorHex >> 8) & 255) / 255;
      p.b = (colorHex & 255) / 255;
      p.life = 0;
      p.maxLife = 0.18;
      p.active = true;
    }
  }

  public spawnSpeedLines(cameraPos: THREE.Vector3) {
    if (Math.random() < 0.35) {
      const p = this.getNextParticle();
      p.x = cameraPos.x + (Math.random() - 0.5) * 18;
      p.y = cameraPos.y + (Math.random() - 0.5) * 12;
      p.z = cameraPos.z + 25 + Math.random() * 15;
      p.vx = 0;
      p.vy = 0;
      p.vz = -45;
      p.r = 0.22; // 0x38bdf8
      p.g = 0.74;
      p.b = 0.97;
      p.life = 0;
      p.maxLife = 0.5;
      p.active = true;
    }
  }

  public update(dt: number) {
    let hasUpdates = false;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.y = -1000;
        this.positions[i * 3 + 1] = -1000;
        hasUpdates = true;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      // Gravity on bursts
      p.vy -= 9.8 * dt;

      this.positions[i * 3] = p.x;
      this.positions[i * 3 + 1] = p.y;
      this.positions[i * 3 + 2] = p.z;

      this.colors[i * 3] = p.r;
      this.colors[i * 3 + 1] = p.g;
      this.colors[i * 3 + 2] = p.b;

      hasUpdates = true;
    }

    if (hasUpdates) {
      this.particleGeo.attributes.position.needsUpdate = true;
      this.particleGeo.attributes.color.needsUpdate = true;
    }
  }
}
