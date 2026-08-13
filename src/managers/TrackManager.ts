import * as THREE from 'three';
import { TrackSegment, SEGMENT_LENGTH } from '../entities/TrackSegment';
import { ObstaclePool } from './ObstaclePool';
import { CollectiblePool } from './CollectiblePool';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { LANE_X_POSITIONS, randomChoice } from '../utils/MathUtils';

export class TrackManager {
  private scene: THREE.Scene;
  private segments: TrackSegment[] = [];
  private obstaclePool: ObstaclePool;
  private collectiblePool: CollectiblePool;

  private numSegments: number = 10;
  private furthestZ: number = 0;
  private sectorThemeIndex: number = 0;
  public isLightMode: boolean = false;

  private themeColors: number[] = [
    0x00f0ff, // Sector 1: Cyan
    0xff007f, // Sector 2: Magenta
    0xffaa00, // Sector 3: Gold
    0x00ff88, // Sector 4: Emerald
    0xaa00ff  // Sector 5: Violet
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.obstaclePool = new ObstaclePool(this.scene, 10);
    this.collectiblePool = new CollectiblePool(this.scene);

    // Pre-instantiate fixed segment pool
    for (let i = 0; i < this.numSegments; i++) {
      const segment = new TrackSegment(i * SEGMENT_LENGTH, this.themeColors[0], this.isLightMode);
      this.segments.push(segment);
      this.scene.add(segment.mesh);
    }
  }

  public get obstacles(): Obstacle[] {
    return this.obstaclePool.activeObstacles;
  }

  public get collectibles(): Collectible[] {
    return this.collectiblePool.activeCollectibles;
  }

  public recycleObstacle(obs: Obstacle) {
    this.obstaclePool.recycle(obs);
  }

  public recycleCollectible(col: Collectible) {
    this.collectiblePool.recycle(col);
  }

  public setTheme(theme: 'dark' | 'light') {
    this.isLightMode = theme === 'light';
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].updateTheme(this.isLightMode);
    }
  }

  public initTrack() {
    this.obstaclePool.clearAll();
    this.collectiblePool.clearAll();

    this.furthestZ = 0;
    this.sectorThemeIndex = 0;

    for (let i = 0; i < this.numSegments; i++) {
      const z = i * SEGMENT_LENGTH;
      const themeColor = this.themeColors[0];
      const hasGantry = i > 0 && (i % 2 === 0);
      this.segments[i].reposition(z, themeColor, this.isLightMode, hasGantry);

      if (i > 0) {
        this.generatePatternForSegment(z);
      }
      this.furthestZ = z + SEGMENT_LENGTH;
    }
  }

  private generatePatternForSegment(startZ: number) {
    // Generate 2 obstacle groups per segment
    const spawnZ1 = startZ + 15;
    const spawnZ2 = startZ + 30;

    this.spawnObstacleGroup(spawnZ1);
    this.spawnObstacleGroup(spawnZ2);
  }

  private spawnObstacleGroup(posZ: number) {
    // Ensure at least 1 lane is completely open!
    const availableLanes = [0, 1, 2];
    const openLane = randomChoice(availableLanes);
    const blockedLanes = availableLanes.filter(l => l !== openLane);

    // Pick obstacle types
    const types: ObstacleType[] = ['LOW_BARRIER', 'HIGH_GATE', 'FULL_BLOCK'];
    
    for (let i = 0; i < blockedLanes.length; i++) {
      const laneIdx = blockedLanes[i];
      const type = randomChoice(types);
      const posX = LANE_X_POSITIONS[laneIdx];
      this.obstaclePool.spawn(type, laneIdx, posX, posZ);
    }

    // Spawn Energy Cells on the open lane
    const orbLaneX = LANE_X_POSITIONS[openLane];
    for (let i = 0; i < 4; i++) {
      const orbZ = posZ - 6 + i * 3;
      this.collectiblePool.spawn('ORB', orbLaneX, 1.0, orbZ);
    }

    // 18% Chance for a rare Power-up
    if (Math.random() < 0.18) {
      const pTypes: CollectibleType[] = ['SHIELD', 'MULTIPLIER'];
      const pType = randomChoice(pTypes);
      this.collectiblePool.spawn(pType, orbLaneX, 1.2, posZ + 8);
    }
  }

  public update(playerZ: number, dt: number) {
    // Recalculate Sector Color theme every 400m
    const currentSector = Math.floor(playerZ / 400);
    if (currentSector !== this.sectorThemeIndex) {
      this.sectorThemeIndex = currentSector;
    }

    // Recycle oldest track segment when behind player (frustum cull threshold: 10m behind player)
    if (this.segments.length > 0) {
      const firstSegment = this.segments[0];
      if (firstSegment.mesh.position.z + SEGMENT_LENGTH < playerZ - 10) {
        const recycledSegment = this.segments.shift()!;
        const themeColor = this.themeColors[this.sectorThemeIndex % this.themeColors.length];
        const hasGantry = Math.random() < 0.5;

        recycledSegment.reposition(this.furthestZ, themeColor, this.isLightMode, hasGantry);
        this.segments.push(recycledSegment);

        this.generatePatternForSegment(this.furthestZ);
        this.furthestZ += SEGMENT_LENGTH;
      }
    }

    // Recycle passed obstacles and update active ones
    this.obstaclePool.recyclePassed(playerZ - 10);
    this.obstaclePool.update(dt);

    // Recycle passed collectibles and update active ones
    this.collectiblePool.recyclePassed(playerZ - 10);
    this.collectiblePool.update(dt);
  }

  public clearAll() {
    this.obstaclePool.clearAll();
    this.collectiblePool.clearAll();
  }
}
