import * as THREE from 'three';
import { SharedAssets } from '../utils/SharedAssets';

export type ObstacleType = 'LOW_BARRIER' | 'HIGH_GATE' | 'FULL_BLOCK';

const BOX_SIZES: Record<ObstacleType, THREE.Vector3> = {
  LOW_BARRIER: new THREE.Vector3(2.6, 1.0, 1.2),
  HIGH_GATE: new THREE.Vector3(2.8, 1.8, 1.2),
  FULL_BLOCK: new THREE.Vector3(2.4, 2.5, 1.6)
};

const BOX_OFFSETS: Record<ObstacleType, number> = {
  LOW_BARRIER: 0.5,
  HIGH_GATE: 2.0,
  FULL_BLOCK: 1.25
};

const _tempCenter = new THREE.Vector3();

export class Obstacle {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: ObstacleType;
  public laneIndex: number = 1;
  public active: boolean = false;

  // Animation nodes
  private beaconLights: THREE.Mesh[] = [];

  constructor(type: ObstacleType) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.visible = false;
    this.buildObstacleMesh();
  }

  private buildObstacleMesh() {
    const assets = SharedAssets.getInstance();

    switch (this.type) {
      case 'LOW_BARRIER': {
        const barrierBase = new THREE.Mesh(assets.lowBarrierBaseGeo, assets.concreteMatDark);
        barrierBase.position.y = 0.25;
        barrierBase.castShadow = true;

        const board = new THREE.Mesh(assets.lowBarrierBoardGeo, assets.hazardMat);
        board.position.set(0, 0.65, 0);
        board.castShadow = true;

        [-1.1, 1.1].forEach(x => {
          const post = new THREE.Mesh(assets.lowBarrierPostGeo, assets.obsSteelMat);
          post.position.set(x, 0.45, 0);
          this.mesh.add(post);

          const bBase = new THREE.Mesh(assets.beaconBaseGeo, assets.obsSteelMat);
          bBase.position.set(x, 0.92, 0);

          const beacon = new THREE.Mesh(assets.beaconDomeGeo, assets.amberBeaconOnMat);
          beacon.position.set(x, 1.05, 0);

          this.mesh.add(bBase, beacon);
          this.beaconLights.push(beacon);
        });

        this.mesh.add(barrierBase, board);
        break;
      }

      case 'HIGH_GATE': {
        [-1.3, 1.3].forEach(x => {
          const col = new THREE.Mesh(assets.highGateColGeo, assets.obsSteelMat);
          col.position.set(x, 1.7, 0);
          col.castShadow = true;
          this.mesh.add(col);

          const foot = new THREE.Mesh(assets.highGateFootGeo, assets.obsSteelMat);
          foot.position.set(x, 0.05, 0);
          this.mesh.add(foot);
        });

        const pipe = new THREE.Mesh(assets.highGatePipeGeo, assets.pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(0, 2.5, 0);
        pipe.castShadow = true;

        [-1.1, 0, 1.1].forEach(fx => {
          const flange = new THREE.Mesh(assets.highGateFlangeGeo, assets.obsSteelMat);
          flange.rotation.z = Math.PI / 2;
          flange.position.set(fx, 2.5, 0);
          this.mesh.add(flange);
        });

        const board = new THREE.Mesh(assets.highGateBoardGeo, assets.hazardMat);
        board.position.set(0, 1.9, 0);
        board.castShadow = true;

        [-0.8, -0.27, 0.27, 0.8].forEach(hx => {
          const bar = new THREE.Mesh(assets.highGateBarGeo, assets.obsSteelMat);
          bar.position.set(hx, 1.45, 0);
          this.mesh.add(bar);
        });

        this.mesh.add(pipe, board);
        break;
      }

      case 'FULL_BLOCK': {
        const containerColors = ['#0284c7', '#ea580c', '#15803d', '#dc2626', '#475569'];
        const cColor = containerColors[Math.floor(Math.random() * containerColors.length)];
        const containerMat = assets.containerMats[cColor] || assets.containerMats['#0284c7'];

        const container = new THREE.Mesh(assets.containerGeo, containerMat);
        container.position.y = 1.2;
        container.castShadow = true;

        [-1.175, 1.175].forEach(cx => {
          [0.1, 2.3].forEach(cy => {
            [-0.75, 0.75].forEach(cz => {
              const corner = new THREE.Mesh(assets.containerCornerGeo, assets.containerCornerMat);
              corner.position.set(cx, cy, cz);
              this.mesh.add(corner);
            });
          });
        });

        [-0.4, 0.4].forEach(bx => {
          const rod = new THREE.Mesh(assets.containerRodGeo, assets.obsSteelMat);
          rod.position.set(bx, 1.2, 0.77);
          this.mesh.add(rod);
        });

        const topBar = new THREE.Mesh(assets.containerTopBarGeo, assets.hazardMat);
        topBar.position.set(0, 2.45, 0.7);

        this.mesh.add(container, topBar);
        break;
      }
    }
  }

  public spawn(laneIndex: number, posX: number, posZ: number) {
    this.laneIndex = laneIndex;
    this.mesh.position.set(posX, 0, posZ);
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

    // Blink construction beacon lights
    if (this.beaconLights.length > 0) {
      const assets = SharedAssets.getInstance();
      const isBeaconOn = Math.floor(performance.now() * 0.004) % 2 === 0;
      const targetMat = isBeaconOn ? assets.amberBeaconOnMat : assets.amberBeaconOffMat;
      if (this.beaconLights[0].material !== targetMat) {
        for (let i = 0; i < this.beaconLights.length; i++) {
          this.beaconLights[i].material = targetMat;
        }
      }
    }

    this.updateBoundingBox();
  }

  public updateBoundingBox() {
    const offsetY = BOX_OFFSETS[this.type];
    const size = BOX_SIZES[this.type];

    _tempCenter.set(this.mesh.position.x, this.mesh.position.y + offsetY, this.mesh.position.z);
    this.boundingBox.setFromCenterAndSize(_tempCenter, size);
  }
}
