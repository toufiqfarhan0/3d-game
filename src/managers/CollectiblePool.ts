import * as THREE from 'three';
import { Collectible, CollectibleType } from '../entities/Collectible';

export class CollectiblePool {
  private scene: THREE.Scene;
  private pools: Map<CollectibleType, Collectible[]> = new Map();
  private allCollectibles: Collectible[] = [];
  public activeCollectibles: Collectible[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Pre-allocate pools: 45 orbs, 6 shields, 6 multipliers
    this.initPool('ORB', 45);
    this.initPool('SHIELD', 6);
    this.initPool('MULTIPLIER', 6);
  }

  private initPool(type: CollectibleType, count: number) {
    const list: Collectible[] = [];
    for (let i = 0; i < count; i++) {
      const col = new Collectible(type);
      this.scene.add(col.mesh);
      list.push(col);
      this.allCollectibles.push(col);
    }
    this.pools.set(type, list);
  }

  public spawn(type: CollectibleType, posX: number, posY: number, posZ: number): Collectible {
    let pool = this.pools.get(type);
    if (!pool) {
      pool = [];
      this.pools.set(type, pool);
    }

    let col = pool.find(c => !c.active);
    if (!col) {
      col = new Collectible(type);
      this.scene.add(col.mesh);
      pool.push(col);
      this.allCollectibles.push(col);
    }

    col.spawn(posX, posY, posZ);
    this.activeCollectibles.push(col);
    return col;
  }

  public recycle(col: Collectible) {
    col.recycle();
    const idx = this.activeCollectibles.indexOf(col);
    if (idx !== -1) {
      this.activeCollectibles.splice(idx, 1);
    }
  }

  public recyclePassed(thresholdZ: number) {
    for (let i = this.activeCollectibles.length - 1; i >= 0; i--) {
      const col = this.activeCollectibles[i];
      if (col.mesh.position.z < thresholdZ) {
        col.recycle();
        this.activeCollectibles.splice(i, 1);
      }
    }
  }

  public update(dt: number) {
    for (let i = 0; i < this.activeCollectibles.length; i++) {
      this.activeCollectibles[i].update(dt);
    }
  }

  public clearAll() {
    for (let i = 0; i < this.allCollectibles.length; i++) {
      this.allCollectibles[i].recycle();
    }
    this.activeCollectibles = [];
  }
}
