import * as THREE from 'three';
import { SharedAssets } from '../utils/SharedAssets';

export type CollectibleType = 'ORB' | 'SHIELD' | 'MULTIPLIER';

const BOX_SIZE = new THREE.Vector3(1.0, 1.0, 1.0);

export class Collectible {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: CollectibleType;
  public active: boolean = false;
  private rotationSpeed: number = 2.2;
  private gyroRings: THREE.Mesh[] = [];

  constructor(type: CollectibleType) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.visible = false;
    this.buildCollectibleMesh();
  }

  private buildCollectibleMesh() {
    const assets = SharedAssets.getInstance();

    switch (this.type) {
      case 'ORB': {
        const core = new THREE.Mesh(assets.orbCoreGeo, assets.orbCoreMat);
        this.mesh.add(core);

        const ring1 = new THREE.Mesh(assets.orbRingGeo, assets.colChromeMat);
        ring1.rotation.x = Math.PI / 3;

        const ring2 = new THREE.Mesh(assets.orbRingGeo, assets.colMetalMat);
        ring2.rotation.y = Math.PI / 3;

        this.gyroRings.push(ring1, ring2);
        this.mesh.add(ring1, ring2);

        [-0.32, 0.32].forEach(y => {
          const cap = new THREE.Mesh(assets.orbCapGeo, assets.colMetalMat);
          cap.position.y = y;
          this.mesh.add(cap);
        });
        break;
      }

      case 'SHIELD': {
        const core = new THREE.Mesh(assets.shieldCoreGeo, assets.shieldCoreMat);
        this.mesh.add(core);

        const cage = new THREE.Mesh(assets.shieldCageGeo, assets.shieldCageMat);
        this.gyroRings.push(cage);
        this.mesh.add(cage);
        break;
      }

      case 'MULTIPLIER': {
        const core = new THREE.Mesh(assets.multiplierCoreGeo, assets.multiplierCoreMat);
        this.mesh.add(core);

        [-0.32, 0.32].forEach(y => {
          const cap = new THREE.Mesh(assets.multiplierCapGeo, assets.colChromeMat);
          cap.position.y = y;
          this.mesh.add(cap);
        });

        const ring = new THREE.Mesh(assets.multiplierRingGeo, assets.colChromeMat);
        ring.rotation.x = Math.PI / 2;
        this.gyroRings.push(ring);
        this.mesh.add(ring);
        break;
      }
    }
  }

  public spawn(posX: number, posY: number, posZ: number) {
    this.mesh.position.set(posX, posY, posZ);
    this.active = true;
    this.mesh.visible = true;
    this.updateBoundingBox();
  }

  public recycle() {
    this.active = false;
    this.mesh.visible = false;
    this.mesh.position.set(0, -100, 0);
  }

  public update(dt: number) {
    if (!this.active) return;

    // Smooth floating rotation
    this.mesh.rotation.y += this.rotationSpeed * dt;

    // Counter-rotating gyro rings
    for (let i = 0; i < this.gyroRings.length; i++) {
      const r = this.gyroRings[i];
      r.rotation.x += (i % 2 === 0 ? 1 : -1) * dt * 2.8;
      r.rotation.z += dt * 1.8;
    }

    this.updateBoundingBox();
  }

  public updateBoundingBox() {
    this.boundingBox.setFromCenterAndSize(this.mesh.position, BOX_SIZE);
  }
}
