import * as THREE from 'three';
import { TrackSegment, SEGMENT_LENGTH } from '../entities/TrackSegment';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { LANE_X_POSITIONS, randomChoice, randomRange, disposeObject3D } from '../utils/MathUtils';

export class TrackManager {
  private scene: THREE.Scene;
  private segments: TrackSegment[] = [];
  public obstacles: Obstacle[] = [];
  public collectibles: Collectible[] = [];

  private numSegments: number = 8;
  private furthestZ: number = 0;
  private sectorThemeIndex: number = 0;

  private themeColors: number[] = [
    0x00f0ff, // Sector 1: Cyan
    0xff007f, // Sector 2: Magenta
    0xffaa00, // Sector 3: Gold
    0x00ff88, // Sector 4: Emerald
    0xaa00ff  // Sector 5: Violet
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public initTrack() {
    this.clearAll();

    this.furthestZ = 0;
    for (let i = 0; i < this.numSegments; i++) {
      this.spawnSegment(i === 0); // First segment clean without obstacles
    }
  }

  private spawnSegment(isSafeStart: boolean) {
    const themeColor = this.themeColors[this.sectorThemeIndex % this.themeColors.length];
    const segment = new TrackSegment(this.furthestZ, themeColor);
    this.segments.push(segment);
    this.scene.add(segment.mesh);

    if (!isSafeStart) {
      this.generatePatternForSegment(this.furthestZ);
    }

    this.furthestZ += SEGMENT_LENGTH;
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
    const types: ObstacleType[] = ['LOW_BARRIER', 'HIGH_GATE', 'FULL_BLOCK', 'MOVING_DRONE'];
    
    blockedLanes.forEach(laneIdx => {
      const type = randomChoice(types);
      const posX = LANE_X_POSITIONS[laneIdx];
      const obstacle = new Obstacle(type, laneIdx, posX, posZ);
      this.obstacles.push(obstacle);
      this.scene.add(obstacle.mesh);
    });

    // Spawn Energy Orbs on the open lane or over jump barriers
    const orbLaneX = LANE_X_POSITIONS[openLane];
    for (let i = 0; i < 4; i++) {
      const orbZ = posZ - 6 + i * 3;
      const orb = new Collectible('ORB', orbLaneX, 1.0, orbZ);
      this.collectibles.push(orb);
      this.scene.add(orb.mesh);
    }

    // 15% Chance for a rare Power-up
    if (Math.random() < 0.15) {
      const pTypes: CollectibleType[] = ['MAGNET', 'SHIELD', 'MULTIPLIER'];
      const pType = randomChoice(pTypes);
      const pOrb = new Collectible(pType, orbLaneX, 1.2, posZ + 8);
      this.collectibles.push(pOrb);
      this.scene.add(pOrb.mesh);
    }
  }

  public update(playerZ: number, dt: number) {
    // Recalculate Sector Color theme every 400m
    const currentSector = Math.floor(playerZ / 400);
    if (currentSector !== this.sectorThemeIndex) {
      this.sectorThemeIndex = currentSector;
    }

    // Recycle old track segments behind player
    if (this.segments.length > 0) {
      const firstSegment = this.segments[0];
      if (firstSegment.mesh.position.z + SEGMENT_LENGTH < playerZ - 20) {
        this.scene.remove(firstSegment.mesh);
        disposeObject3D(firstSegment.mesh);
        this.segments.shift();

        this.spawnSegment(false);
      }
    }

    // Update active obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(dt);

      // Cleanup past obstacles
      if (obs.mesh.position.z < playerZ - 20) {
        this.scene.remove(obs.mesh);
        disposeObject3D(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // Update active collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.update(dt);

      // Cleanup past collectibles
      if (col.mesh.position.z < playerZ - 20) {
        this.scene.remove(col.mesh);
        disposeObject3D(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }
  }

  public clearAll() {
    this.segments.forEach(s => {
      this.scene.remove(s.mesh);
      disposeObject3D(s.mesh);
    });
    this.obstacles.forEach(o => {
      this.scene.remove(o.mesh);
      disposeObject3D(o.mesh);
    });
    this.collectibles.forEach(c => {
      this.scene.remove(c.mesh);
      disposeObject3D(c.mesh);
    });

    this.segments = [];
    this.obstacles = [];
    this.collectibles = [];
  }
}
