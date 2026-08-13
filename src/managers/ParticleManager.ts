import * as THREE from 'three';

interface ParticleNode {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
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

  private maxParticles: number = 600;
  private pool: ParticleNode[] = [];
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private defaultColor: THREE.Color = new THREE.Color(0x00f0ff);

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    // Initialize particle pool once
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        position: new THREE.Vector3(0, -1000, 0),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(0xffffff),
        size: 0,
        life: 0,
        maxLife: 1,
        active: false
      });
      this.positions[i * 3 + 1] = -1000;
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleMesh = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particleMesh);
  }

  private getInactiveParticle(): ParticleNode | null {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) {
        return this.pool[i];
      }
    }
    return null;
  }

  public spawnBurst(pos: THREE.Vector3, colorHex: number, count: number = 20) {
    for (let i = 0; i < count; i++) {
      const p = this.getInactiveParticle();
      if (!p) break;

      p.position.copy(pos);
      p.velocity.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );
      p.color.setHex(colorHex);
      p.size = Math.random() * 0.4 + 0.2;
      p.life = 0;
      p.maxLife = Math.random() * 0.4 + 0.3;
      p.active = true;
    }
  }

  public spawnSpeedLines(cameraPos: THREE.Vector3) {
    if (Math.random() < 0.4) {
      const p = this.getInactiveParticle();
      if (!p) return;

      p.position.set(
        cameraPos.x + (Math.random() - 0.5) * 16,
        cameraPos.y + (Math.random() - 0.5) * 10,
        cameraPos.z + 20 + Math.random() * 15
      );
      p.velocity.set(0, 0, -40);
      p.color.setHex(0x00f0ff);
      p.size = 0.15;
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
        p.position.set(0, -1000, 0);
        this.positions[i * 3 + 1] = -1000;
        hasUpdates = true;
        continue;
      }

      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;

      this.positions[i * 3] = p.position.x;
      this.positions[i * 3 + 1] = p.position.y;
      this.positions[i * 3 + 2] = p.position.z;

      this.colors[i * 3] = p.color.r;
      this.colors[i * 3 + 1] = p.color.g;
      this.colors[i * 3 + 2] = p.color.b;

      this.sizes[i] = p.size * (1 - p.life / p.maxLife);
      hasUpdates = true;
    }

    if (hasUpdates) {
      this.particleGeo.attributes.position.needsUpdate = true;
      this.particleGeo.attributes.color.needsUpdate = true;
    }
  }
}

