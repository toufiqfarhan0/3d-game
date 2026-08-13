import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export class ParticleManager {
  private scene: THREE.Scene;
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private particleMesh: THREE.Points;

  private maxParticles: number = 600;
  private particles: Particle[] = [];
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

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

  public spawnBurst(pos: THREE.Vector3, colorHex: number, count: number = 20) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );

      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color: col,
        size: Math.random() * 0.4 + 0.2,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.3
      });
    }
  }

  public spawnSpeedLines(cameraPos: THREE.Vector3) {
    if (Math.random() < 0.4 && this.particles.length < this.maxParticles) {
      const pos = new THREE.Vector3(
        cameraPos.x + (Math.random() - 0.5) * 16,
        cameraPos.y + (Math.random() - 0.5) * 10,
        cameraPos.z + 20 + Math.random() * 15
      );

      this.particles.push({
        position: pos,
        velocity: new THREE.Vector3(0, 0, -40),
        color: new THREE.Color(0x00f0ff),
        size: 0.15,
        life: 0,
        maxLife: 0.5
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, dt);
    }

    // Update Buffer Attributes
    for (let i = 0; i < this.maxParticles; i++) {
      if (i < this.particles.length) {
        const p = this.particles[i];
        this.positions[i * 3] = p.position.x;
        this.positions[i * 3 + 1] = p.position.y;
        this.positions[i * 3 + 2] = p.position.z;

        this.colors[i * 3] = p.color.r;
        this.colors[i * 3 + 1] = p.color.g;
        this.colors[i * 3 + 2] = p.color.b;

        this.sizes[i] = p.size * (1 - p.life / p.maxLife);
      } else {
        this.positions[i * 3] = 0;
        this.positions[i * 3 + 1] = -1000;
        this.positions[i * 3 + 2] = 0;
      }
    }

    this.particleGeo.attributes.position.needsUpdate = true;
    this.particleGeo.attributes.color.needsUpdate = true;
  }
}
