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
        // Glowing Gold Energy Diamond / Octahedron
        const geo = new THREE.OctahedronGeometry(0.4, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          emissive: 0xff8800,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.9
        });
        const orb = new THREE.Mesh(geo, mat);
        this.mesh.add(orb);

        const pointLight = new THREE.PointLight(0xffaa00, 1.5, 3);
        this.mesh.add(pointLight);
        break;
      }

      case 'MAGNET': {
        // Horseshoe Magnet Icon
        const torusGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0044, metalness: 0.8, roughness: 0.2 });
        const magnet = new THREE.Mesh(torusGeo, mat);
        magnet.rotation.z = Math.PI;

        const tipGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
        const t1 = new THREE.Mesh(tipGeo, tipMat);
        t1.position.set(-0.35, 0.1, 0);
        const t2 = new THREE.Mesh(tipGeo, tipMat);
        t2.position.set(0.35, 0.1, 0);

        this.mesh.add(magnet, t1, t2);
        break;
      }

      case 'SHIELD': {
        // Glowing Cyan Sphere Bubble
        const geo = new THREE.IcosahedronGeometry(0.45, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x00aaff,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          wireframe: true
        });
        const shield = new THREE.Mesh(geo, mat);
        this.mesh.add(shield);

        const light = new THREE.PointLight(0x00f0ff, 2, 4);
        this.mesh.add(light);
        break;
      }

      case 'MULTIPLIER': {
        // Double Lightning Bolt
        const geo = new THREE.ConeGeometry(0.35, 0.8, 4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff007f,
          emissive: 0xff0055,
          emissiveIntensity: 1.0,
          roughness: 0.1
        });
        const bolt = new THREE.Mesh(geo, mat);
        bolt.rotation.z = Math.PI;
        this.mesh.add(bolt);
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
