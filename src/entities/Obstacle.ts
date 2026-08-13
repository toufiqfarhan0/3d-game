import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator';

export type ObstacleType = 'LOW_BARRIER' | 'HIGH_GATE' | 'FULL_BLOCK' | 'MOVING_DRONE';

const BOX_SIZES: Record<ObstacleType, THREE.Vector3> = {
  LOW_BARRIER: new THREE.Vector3(2.6, 1.0, 1.2),
  HIGH_GATE: new THREE.Vector3(2.8, 1.8, 1.2),
  FULL_BLOCK: new THREE.Vector3(2.4, 2.5, 1.6),
  MOVING_DRONE: new THREE.Vector3(1.8, 1.6, 1.8)
};

const BOX_OFFSETS: Record<ObstacleType, number> = {
  LOW_BARRIER: 0.5,
  HIGH_GATE: 2.0,
  FULL_BLOCK: 1.25,
  MOVING_DRONE: 1.4
};

const _tempCenter = new THREE.Vector3();

export class Obstacle {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: ObstacleType;
  public laneIndex: number;
  public active: boolean = true;
  private moveSpeed: number = 0;
  private moveDir: number = 1;
  private initialX: number = 0;

  // Animation nodes
  private rotatingParts: THREE.Object3D[] = [];
  private beaconLights: THREE.Mesh[] = [];

  constructor(type: ObstacleType, laneIndex: number, posX: number, posZ: number) {
    this.type = type;
    this.laneIndex = laneIndex;
    this.mesh = new THREE.Group();
    this.mesh.position.set(posX, 0, posZ);
    this.initialX = posX;

    this.buildObstacleMesh();
    this.updateBoundingBox();
  }

  private buildObstacleMesh() {
    const hazardTex = TextureGenerator.createHazardTexture();
    const hazardMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.35,
      metalness: 0.25,
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.9,
      roughness: 0.25,
    });

    const concreteTex = TextureGenerator.createConcreteTexture();
    const concreteMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    switch (this.type) {
      case 'LOW_BARRIER': {
        // ── 1. REALISTIC ROADWORK CONSTRUCTION BARRICADE (JUMP OVER) ──
        // Precast concrete barrier base
        const baseGeo = new THREE.BoxGeometry(2.5, 0.5, 0.7);
        const barrierBase = new THREE.Mesh(baseGeo, concreteMat);
        barrierBase.position.y = 0.25;
        barrierBase.castShadow = true;
        barrierBase.receiveShadow = true;

        // Heavy hazard striped crash barrier board
        const boardGeo = new THREE.BoxGeometry(2.6, 0.45, 0.18);
        const board = new THREE.Mesh(boardGeo, hazardMat);
        board.position.set(0, 0.65, 0);
        board.castShadow = true;

        // Steel mounting uprights
        [-1.1, 1.1].forEach(x => {
          const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8);
          const post = new THREE.Mesh(postGeo, steelMat);
          post.position.set(x, 0.45, 0);
          this.mesh.add(post);

          // Amber flashing construction strobe beacon
          const beaconBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.15, 8);
          const bBase = new THREE.Mesh(beaconBaseGeo, steelMat);
          bBase.position.set(x, 0.92, 0);

          const beaconDomeGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const beacon = new THREE.Mesh(beaconDomeGeo, beaconMat);
          beacon.position.set(x, 1.05, 0);

          this.mesh.add(bBase, beacon);
          this.beaconLights.push(beacon);
        });

        this.mesh.add(barrierBase, board);
        break;
      }

      case 'HIGH_GATE': {
        // ── 2. REALISTIC INDUSTRIAL OVERHEAD PIPE & CLEARANCE GANTRY (SLIDE UNDER) ──
        // Heavy steel support columns
        [-1.3, 1.3].forEach(x => {
          const colGeo = new THREE.BoxGeometry(0.3, 3.4, 0.3);
          const col = new THREE.Mesh(colGeo, steelMat);
          col.position.set(x, 1.7, 0);
          col.castShadow = true;
          this.mesh.add(col);

          // Foot mounting flange with bolts
          const footGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
          const foot = new THREE.Mesh(footGeo, steelMat);
          foot.position.set(x, 0.05, 0);
          this.mesh.add(foot);
        });

        // Main industrial high-pressure steam pipe spanning across top
        const pipeGeo = new THREE.CylinderGeometry(0.26, 0.26, 2.9, 12);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: 0x991b1b, // Industrial Hazard Red Pipe
          metalness: 0.8,
          roughness: 0.3,
        });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(0, 2.5, 0);
        pipe.castShadow = true;

        // Pipe Flange Rings
        [-1.1, 0, 1.1].forEach(fx => {
          const flangeGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12);
          const flange = new THREE.Mesh(flangeGeo, steelMat);
          flange.rotation.z = Math.PI / 2;
          flange.position.set(fx, 2.5, 0);
          this.mesh.add(flange);
        });

        // Overhead Hazard Clearance Warning Board hanging beneath pipe
        const boardGeo = new THREE.BoxGeometry(2.7, 0.6, 0.12);
        const board = new THREE.Mesh(boardGeo, hazardMat);
        board.position.set(0, 1.9, 0);
        board.castShadow = true;

        // Hanging height limiter telltale bars
        [-0.8, -0.27, 0.27, 0.8].forEach(hx => {
          const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6);
          const bar = new THREE.Mesh(barGeo, steelMat);
          bar.position.set(hx, 1.45, 0);
          this.mesh.add(bar);
        });

        this.mesh.add(pipe, board);
        break;
      }

      case 'FULL_BLOCK': {
        // ── 3. REALISTIC ISO FREIGHT SHIPPING CONTAINER (CHANGE LANE) ──
        const containerColors = ['#0284c7', '#ea580c', '#15803d', '#dc2626', '#475569'];
        const cColor = containerColors[Math.floor(Math.random() * containerColors.length)];
        const containerTex = TextureGenerator.createContainerTexture(cColor);

        const containerMat = new THREE.MeshStandardMaterial({
          map: containerTex,
          metalness: 0.6,
          roughness: 0.45,
        });

        // Container Main Body
        const cGeo = new THREE.BoxGeometry(2.35, 2.4, 1.5);
        const container = new THREE.Mesh(cGeo, containerMat);
        container.position.y = 1.2;
        container.castShadow = true;
        container.receiveShadow = true;

        // Cast Steel ISO Corner Twistlock Blocks
        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95, roughness: 0.2 });
        [-1.175, 1.175].forEach(cx => {
          [0.1, 2.3].forEach(cy => {
            [-0.75, 0.75].forEach(cz => {
              const cornerGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
              const corner = new THREE.Mesh(cornerGeo, cornerMat);
              corner.position.set(cx, cy, cz);
              this.mesh.add(corner);
            });
          });
        });

        // Rear Vertical Door Locking Bars
        [-0.4, 0.4].forEach(bx => {
          const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8);
          const rod = new THREE.Mesh(rodGeo, steelMat);
          rod.position.set(bx, 1.2, 0.77);
          this.mesh.add(rod);
        });

        // Top Warning Reflector Bar
        const topBarGeo = new THREE.BoxGeometry(2.38, 0.15, 0.15);
        const topBar = new THREE.Mesh(topBarGeo, hazardMat);
        topBar.position.set(0, 2.45, 0.7);

        this.mesh.add(container, topBar);
        break;
      }

      case 'MOVING_DRONE': {
        // ── 4. REALISTIC AUTONOMOUS HIGHWAY PATROL DRONE (MOVING HAZARD) ──
        // Aerodynamic Core Fuselage
        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          metalness: 0.9,
          roughness: 0.2,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.4;
        body.castShadow = true;

        // Optical Camera Gimbal Pod (Front Surveillance Sensor)
        const podGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.1 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(0, 1.2, 0.35);

        // 4 Rotor Boom Arms (Carbon Fiber Tubes)
        const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
        angles.forEach(ang => {
          const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
          const arm = new THREE.Mesh(armGeo, steelMat);
          arm.rotation.z = Math.PI / 2;
          arm.rotation.y = ang;
          arm.position.set(Math.cos(ang) * 0.45, 1.4, Math.sin(ang) * 0.45);
          this.mesh.add(arm);

          // Motor Nacelle Housing
          const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 8);
          const motor = new THREE.Mesh(motorGeo, steelMat);
          motor.position.set(Math.cos(ang) * 0.9, 1.45, Math.sin(ang) * 0.9);
          this.mesh.add(motor);

          // Spinning Propeller Rotor Blades
          const propGeo = new THREE.BoxGeometry(0.7, 0.02, 0.08);
          const propMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const prop = new THREE.Mesh(propGeo, propMat);
          prop.position.set(Math.cos(ang) * 0.9, 1.55, Math.sin(ang) * 0.9);
          this.mesh.add(prop);
          this.rotatingParts.push(prop);
        });

        // Downward Searchlight Beam
        const lightBeamGeo = new THREE.ConeGeometry(0.6, 1.4, 12, 1, true);
        const lightBeamMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const lightBeam = new THREE.Mesh(lightBeamGeo, lightBeamMat);
        lightBeam.position.set(0, 0.7, 0);
        this.mesh.add(lightBeam);

        this.mesh.add(body, pod);
        this.moveSpeed = 3.8;
        break;
      }
    }
  }

  public update(dt: number) {
    if (!this.active) return;

    if (this.type === 'MOVING_DRONE') {
      this.mesh.position.x += this.moveSpeed * this.moveDir * dt;
      if (Math.abs(this.mesh.position.x - this.initialX) > 2.4) {
        this.moveDir *= -1;
      }

      // Rotate drone propellers
      this.rotatingParts.forEach(part => {
        part.rotation.y += dt * 35;
      });

      // Subtle hover bobbing
      this.mesh.position.y = Math.sin(performance.now() * 0.005) * 0.12;
    }

    // Blink construction beacon lights
    if (this.beaconLights.length > 0) {
      const isBeaconOn = Math.floor(performance.now() * 0.004) % 2 === 0;
      this.beaconLights.forEach(b => {
        (b.material as THREE.MeshBasicMaterial).color.setHex(isBeaconOn ? 0xf59e0b : 0x451a03);
      });
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
