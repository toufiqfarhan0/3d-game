import * as THREE from 'three';

export type CollectibleType = 'ORB' | 'MAGNET' | 'SHIELD' | 'MULTIPLIER';

export class Collectible {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: CollectibleType;
  public active: boolean = true;
  private rotationSpeed: number = 2.5;

  constructor(type: CollectibleType, posX: number, posY: number, posZ: number) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.position.set(posX, posY, posZ);

    this.buildCollectibleMesh();
    this.updateBoundingBox();
  }

  private buildCollectibleMesh() {
    switch (this.type) {
      case 'ORB': {
        // Glowing Sun Gold Energy Diamond Octahedron + Outer Halo
        const geo = new THREE.OctahedronGeometry(0.42, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xffaa00,
          emissiveIntensity: 1.5,
          roughness: 0.1,
          metalness: 0.9
        });
        const orb = new THREE.Mesh(geo, mat);

        // Surrounding Neon Halo Ring
        const haloGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 24);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 3;

        this.mesh.add(orb, halo);

        const pointLight = new THREE.PointLight(0xffd700, 3.0, 6);
        this.mesh.add(pointLight);
        break;
      }

      case 'MAGNET': {
        // Horseshoe Magnet: Hot Neon Crimson Body + Electric Neon Cyan Tips
        const torusGeo = new THREE.TorusGeometry(0.38, 0.12, 10, 20, Math.PI);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff0055,
          emissive: 0xdd0044,
          emissiveIntensity: 1.2,
          metalness: 0.9,
          roughness: 0.1
        });
        const magnet = new THREE.Mesh(torusGeo, mat);
        magnet.rotation.z = Math.PI;

        const tipGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
        const tipMat = new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1.8,
          metalness: 0.9
        });
        const t1 = new THREE.Mesh(tipGeo, tipMat);
        t1.position.set(-0.38, 0.1, 0);
        const t2 = new THREE.Mesh(tipGeo, tipMat);
        t2.position.set(0.38, 0.1, 0);

        const pointLight = new THREE.PointLight(0xff0055, 3.2, 6);

        this.mesh.add(magnet, t1, t2, pointLight);
        break;
      }

      case 'SHIELD': {
        // Glowing Neon Cyan Shield Sphere (Solid inner core + outer wireframe)
        const innerGeo = new THREE.OctahedronGeometry(0.3, 1);
        const innerMat = new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1.8
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);

        const geo = new THREE.IcosahedronGeometry(0.48, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x00aaff,
          emissiveIntensity: 1.2,
          roughness: 0.1,
          wireframe: true
        });
        const shield = new THREE.Mesh(geo, mat);

        const light = new THREE.PointLight(0x00ffff, 3.5, 7);

        this.mesh.add(inner, shield, light);
        break;
      }

      case 'MULTIPLIER': {
        // Neon Electric Pink/Magenta Double Cone Gem + Neon Ring
        const geo = new THREE.ConeGeometry(0.38, 0.85, 5);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff00aa,
          emissive: 0xff00aa,
          emissiveIntensity: 1.8,
          roughness: 0.1,
          metalness: 0.8
        });
        const bolt1 = new THREE.Mesh(geo, mat);
        bolt1.rotation.z = Math.PI;

        const bolt2 = new THREE.Mesh(geo, mat);
        bolt2.position.y = 0.2;

        const ringGeo = new THREE.TorusGeometry(0.48, 0.04, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff66cc });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;

        const light = new THREE.PointLight(0xff00aa, 3.5, 7);

        this.mesh.add(bolt1, bolt2, ring, light);
        break;
      }
    }
  }

  public update(dt: number) {
    if (!this.active) return;

    // Bobbing & Rotating animation
    this.mesh.rotation.y += this.rotationSpeed * dt;
    this.mesh.position.y += Math.sin(performance.now() * 0.004 + this.mesh.position.z) * 0.003;

    this.updateBoundingBox();
  }

  public updateBoundingBox() {
    this.boundingBox.setFromCenterAndSize(
      this.mesh.position,
      new THREE.Vector3(0.9, 0.9, 0.9)
    );
  }
}
