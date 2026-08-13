import * as THREE from 'three';

export type ObstacleType = 'LOW_BARRIER' | 'HIGH_GATE' | 'FULL_BLOCK' | 'MOVING_DRONE' | 'LASER_BARRIER';

export class Obstacle {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  public type: ObstacleType;
  public laneIndex: number;
  public active: boolean = true;
  private moveSpeed: number = 0;
  private moveDir: number = 1;
  private initialX: number = 0;

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
    switch (this.type) {
      case 'LOW_BARRIER': {
        // Require JUMP (Height: 0.8m)
        const frameGeo = new THREE.BoxGeometry(2.4, 0.7, 0.4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff0055,
          emissive: 0xaa0033,
          emissiveIntensity: 0.5,
          roughness: 0.3
        });
        const barrier = new THREE.Mesh(frameGeo, mat);
        barrier.position.y = 0.35;
        this.mesh.add(barrier);

        // Warning Light
        const light = new THREE.PointLight(0xff0055, 2, 4);
        light.position.y = 0.8;
        this.mesh.add(light);
        break;
      }

      case 'HIGH_GATE': {
        // Require SLIDE (Beam at height 1.6m - 2.8m, clear below 1.2m)
        const pillarGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
        const beamGeo = new THREE.BoxGeometry(2.6, 0.8, 0.4);
        const gateMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.7 });
        const laserMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

        const p1 = new THREE.Mesh(pillarGeo, gateMat);
        p1.position.set(-1.2, 1.5, 0);
        const p2 = new THREE.Mesh(pillarGeo, gateMat);
        p2.position.set(1.2, 1.5, 0);

        const beam = new THREE.Mesh(beamGeo, laserMat);
        beam.position.set(0, 2.2, 0);

        this.mesh.add(p1, p2, beam);
        break;
      }

      case 'FULL_BLOCK': {
        // Require LANE CHANGE (Full crate block 2.4m x 2.4m x 2.4m)
        const boxGeo = new THREE.BoxGeometry(2.2, 2.4, 1.2);
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0x222a42,
          metalness: 0.8,
          roughness: 0.2
        });
        const block = new THREE.Mesh(boxGeo, boxMat);
        block.position.y = 1.2;

        // Glowing trim edges
        const trimGeo = new THREE.BoxGeometry(2.25, 0.1, 1.25);
        const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.y = 1.2;

        this.mesh.add(block, trim);
        break;
      }

      case 'MOVING_DRONE': {
        // Side-to-side drone moving obstacle
        const droneGeo = new THREE.SphereGeometry(0.7, 12, 12);
        const droneMat = new THREE.MeshStandardMaterial({ color: 0x9900ff, metalness: 0.9 });
        const ringGeo = new THREE.TorusGeometry(1.0, 0.08, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });

        const core = new THREE.Mesh(droneGeo, droneMat);
        core.position.y = 1.3;
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 1.3;
        ring.rotation.x = Math.PI / 2;

        this.mesh.add(core, ring);
        this.moveSpeed = 4.0;
        break;
      }

      case 'LASER_BARRIER': {
        // Dual lane wide laser barrier requiring quick dodge
        const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 12);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const p1 = new THREE.Mesh(postGeo, postMat);
        p1.position.set(-2.8, 1.5, 0);
        const p2 = new THREE.Mesh(postGeo, postMat);
        p2.position.set(2.8, 1.5, 0);

        const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.6, 8);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
        const laser = new THREE.Mesh(laserGeo, laserMat);
        laser.rotation.z = Math.PI / 2;
        laser.position.set(0, 1.2, 0);

        this.mesh.add(p1, p2, laser);
        break;
      }
    }

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  public update(dt: number) {
    if (!this.active) return;

    if (this.type === 'MOVING_DRONE') {
      this.mesh.position.x += this.moveSpeed * this.moveDir * dt;
      if (Math.abs(this.mesh.position.x - this.initialX) > 2.2) {
        this.moveDir *= -1;
      }
      this.mesh.rotation.y += dt * 3;
    }

    this.updateBoundingBox();
  }

  public updateBoundingBox() {
    switch (this.type) {
      case 'LOW_BARRIER':
        this.boundingBox.setFromCenterAndSize(
          new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 0.35, this.mesh.position.z),
          new THREE.Vector3(2.4, 0.7, 0.4)
        );
        break;
      case 'HIGH_GATE':
        this.boundingBox.setFromCenterAndSize(
          new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 2.2, this.mesh.position.z),
          new THREE.Vector3(2.6, 0.8, 0.4)
        );
        break;
      case 'FULL_BLOCK':
        this.boundingBox.setFromCenterAndSize(
          new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 1.2, this.mesh.position.z),
          new THREE.Vector3(2.2, 2.4, 1.2)
        );
        break;
      case 'MOVING_DRONE':
        this.boundingBox.setFromCenterAndSize(
          new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 1.3, this.mesh.position.z),
          new THREE.Vector3(1.8, 1.6, 1.8)
        );
        break;
      case 'LASER_BARRIER':
        this.boundingBox.setFromCenterAndSize(
          new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 1.2, this.mesh.position.z),
          new THREE.Vector3(5.6, 0.3, 0.3)
        );
        break;
    }
  }
}
