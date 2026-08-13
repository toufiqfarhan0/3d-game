import * as THREE from 'three';

export type CollectibleType = 'ORB' | 'SHIELD' | 'MULTIPLIER';

const BOX_SIZE = new THREE.Vector3(1.0, 1.0, 1.0);

export class Collectible {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: CollectibleType;
  public active: boolean = true;
  private rotationSpeed: number = 2.2;
  private innerCore!: THREE.Mesh;
  private gyroRings: THREE.Mesh[] = [];

  constructor(type: CollectibleType, posX: number, posY: number, posZ: number) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.position.set(posX, posY, posZ);

    this.buildCollectibleMesh();
    this.updateBoundingBox();
  }

  private buildCollectibleMesh() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.95,
      roughness: 0.15,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.1,
    });

    switch (this.type) {
      case 'ORB': {
        // ── 1. REALISTIC QUANTUM ENERGY POWER CELL ──
        // Glowing Plasma Core
        const coreGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 2.2,
          roughness: 0.1,
        });
        this.innerCore = new THREE.Mesh(coreGeo, coreMat);
        this.mesh.add(this.innerCore);

        // Magnetic Containment Ring (Titanium Gyroscope)
        const ringGeo = new THREE.TorusGeometry(0.48, 0.04, 8, 24);
        const ring1 = new THREE.Mesh(ringGeo, chromeMat);
        ring1.rotation.x = Math.PI / 3;

        const ring2 = new THREE.Mesh(ringGeo, metalMat);
        ring2.rotation.y = Math.PI / 3;

        this.gyroRings.push(ring1, ring2);
        this.mesh.add(ring1, ring2);

        // End Cap Emitters
        [-0.32, 0.32].forEach(y => {
          const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
          const cap = new THREE.Mesh(capGeo, metalMat);
          cap.position.y = y;
          this.mesh.add(cap);
        });
        break;
      }

      case 'SHIELD': {
        // ── 2. REALISTIC KINETIC FORCEFIELD GENERATOR POD ──
        const coreGeo = new THREE.OctahedronGeometry(0.25, 1);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 2.0,
        });
        this.innerCore = new THREE.Mesh(coreGeo, coreMat);
        this.mesh.add(this.innerCore);

        // Hexagonal Shield Cage
        const cageGeo = new THREE.IcosahedronGeometry(0.48, 1);
        const cageMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.9,
          roughness: 0.1,
          wireframe: true,
        });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        this.gyroRings.push(cage);
        this.mesh.add(cage);
        break;
      }

      case 'MULTIPLIER': {
        // ── 3. OVERCHARGE ION REACTOR CANISTER ──
        const canisterGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
        const canisterMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          emissive: 0xb91c1c,
          emissiveIntensity: 1.8,
          roughness: 0.2,
        });
        this.innerCore = new THREE.Mesh(canisterGeo, canisterMat);
        this.mesh.add(this.innerCore);

        // Heavy Top and Bottom Caps
        [-0.32, 0.32].forEach(y => {
          const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12);
          const cap = new THREE.Mesh(capGeo, chromeMat);
          cap.position.y = y;
          this.mesh.add(cap);
        });

        // Orbiting Particle Ring
        const ringGeo = new THREE.TorusGeometry(0.45, 0.03, 8, 20);
        const ring = new THREE.Mesh(ringGeo, chromeMat);
        ring.rotation.x = Math.PI / 2;
        this.gyroRings.push(ring);
        this.mesh.add(ring);
        break;
      }
    }
  }

  public update(dt: number) {
    if (!this.active) return;

    // Smooth floating rotation
    this.mesh.rotation.y += this.rotationSpeed * dt;

    // Counter-rotating gyro rings
    this.gyroRings.forEach((r, idx) => {
      r.rotation.x += (idx % 2 === 0 ? 1 : -1) * dt * 2.8;
      r.rotation.z += dt * 1.8;
    });

    // Realistic floating bobbing motion
    this.mesh.position.y += Math.sin(performance.now() * 0.004 + this.mesh.position.z) * 0.003;

    this.updateBoundingBox();
  }

  public updateBoundingBox() {
    this.boundingBox.setFromCenterAndSize(this.mesh.position, BOX_SIZE);
  }
}
