import * as THREE from 'three';
import { Obstacle, ObstacleType } from '../entities/Obstacle';

export class ObstaclePool {
  private scene: THREE.Scene;
  private pools: Map<ObstacleType, Obstacle[]> = new Map();
  private allObstacles: Obstacle[] = [];
  public activeObstacles: Obstacle[] = [];

  constructor(scene: THREE.Scene, initialPerType: number = 8) {
    this.scene = scene;
    const types: ObstacleType[] = ['LOW_BARRIER', 'HIGH_GATE', 'FULL_BLOCK'];

    types.forEach(type => {
      const list: Obstacle[] = [];
      for (let i = 0; i < initialPerType; i++) {
        const obs = new Obstacle(type);
        this.scene.add(obs.mesh);
        list.push(obs);
        this.allObstacles.push(obs);
      }
      this.pools.set(type, list);
    });
  }

  public spawn(type: ObstacleType, laneIndex: number, posX: number, posZ: number): Obstacle {
    let pool = this.pools.get(type);
    if (!pool) {
      pool = [];
      this.pools.set(type, pool);
    }

    let obs = pool.find(o => !o.active);
    if (!obs) {
      obs = new Obstacle(type);
      this.scene.add(obs.mesh);
      pool.push(obs);
      this.allObstacles.push(obs);
    }

    obs.spawn(laneIndex, posX, posZ);
    this.activeObstacles.push(obs);
    return obs;
  }

  public recycle(obs: Obstacle) {
    obs.recycle();
    const idx = this.activeObstacles.indexOf(obs);
    if (idx !== -1) {
      this.activeObstacles.splice(idx, 1);
    }
  }

  public recyclePassed(thresholdZ: number) {
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.mesh.position.z < thresholdZ) {
        obs.recycle();
        this.activeObstacles.splice(i, 1);
      }
    }
  }

  public update(dt: number) {
    for (let i = 0; i < this.activeObstacles.length; i++) {
      this.activeObstacles[i].update(dt);
    }
  }

  public clearAll() {
    for (let i = 0; i < this.allObstacles.length; i++) {
      this.allObstacles[i].recycle();
    }
    this.activeObstacles.length = 0;
  }
}
