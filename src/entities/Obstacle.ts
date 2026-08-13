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
        // Require JUMP: Hot Neon Pink / Magenta glowing barrier
        const frameGeo = new THREE.BoxGeometry(2.4, 0.7, 0.4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff0055,
          emissive: 0xff0055,
          emissiveIntensity: 0.9,
          roughness: 0.2,
          metalness: 0.6
        });
        const barrier = new THREE.Mesh(frameGeo, mat);
        barrier.position.y = 0.35;

        // Ultra-bright neon top strip
        const stripGeo = new THREE.BoxGeometry(2.44, 0.12, 0.44);
        const stripMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.y = 0.35;

        // Side neon beacon posts
        const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12);
        const postMat = new THREE.MeshStandardMaterial({
          color: 0xff00aa,
          emissive: 0xff00aa,
          emissiveIntensity: 1.2
        });
        const post1 = new THREE.Mesh(postGeo, postMat);
        post1.position.set(-1.2, 0.45, 0);
        const post2 = new THREE.Mesh(postGeo, postMat);
        post2.position.set(1.2, 0.45, 0);

        this.mesh.add(barrier, strip, post1, post2);

        // Warning Light
        const light = new THREE.PointLight(0xff0055, 3.5, 6);
        light.position.y = 0.9;
        this.mesh.add(light);
        break;
      }

      case 'HIGH_GATE': {
        // Require SLIDE: Electric Neon Amber/Yellow Gate with intense laser beam
        const pillarGeo = new THREE.BoxGeometry(0.35, 3, 0.35);
        const gateMat = new THREE.MeshStandardMaterial({
          color: 0xff9900,
          emissive: 0xff6600,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8
        });

        const p1 = new THREE.Mesh(pillarGeo, gateMat);
        p1.position.set(-1.2, 1.5, 0);
        const p2 = new THREE.Mesh(pillarGeo, gateMat);
        p2.position.set(1.2, 1.5, 0);

        // Pulsing Neon Laser Overhead Gate
        const beamGeo = new THREE.BoxGeometry(2.6, 0.7, 0.4);
        const beamMat = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 1.5
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, 2.2, 0);

        // Inner glowing core laser
        const innerGeo = new THREE.BoxGeometry(2.65, 0.2, 0.45);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const innerBeam = new THREE.Mesh(innerGeo, innerMat);
        innerBeam.position.set(0, 2.2, 0);

        // Ground clearance warning illumination light
        const light1 = new THREE.PointLight(0xffff00, 3.0, 7);
        light1.position.set(0, 1.8, 0);

        this.mesh.add(p1, p2, beam, innerBeam, light1);
        break;
      }

      case 'FULL_BLOCK': {
        // Require LANE CHANGE: Cyber Neon Crate with Glowing Blue & Pink Edge Grid & Central Symbol
        const boxGeo = new THREE.BoxGeometry(2.2, 2.4, 1.2);
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          emissive: 0x0a1128,
          metalness: 0.9,
          roughness: 0.2
        });
        const block = new THREE.Mesh(boxGeo, boxMat);
        block.position.y = 1.2;

        // Glowing Neon Edge Framework
        const edgeHorizGeo = new THREE.BoxGeometry(2.3, 0.12, 1.3);
        const edgeCyanMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const topEdge = new THREE.Mesh(edgeHorizGeo, edgeCyanMat);
        topEdge.position.y = 2.38;
        const midEdge = new THREE.Mesh(edgeHorizGeo, edgeCyanMat);
        midEdge.position.y = 1.2;
        const botEdge = new THREE.Mesh(edgeHorizGeo, edgeCyanMat);
        botEdge.position.y = 0.02;

        // Glowing Front Warning Cross Symbol
        const cross1Geo = new THREE.BoxGeometry(1.4, 0.18, 1.32);
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
        const cross1 = new THREE.Mesh(cross1Geo, crossMat);
        cross1.position.set(0, 1.2, 0);
        cross1.rotation.z = Math.PI / 4;

        const cross2 = new THREE.Mesh(cross1Geo, crossMat);
        cross2.position.set(0, 1.2, 0);
        cross2.rotation.z = -Math.PI / 4;

        // Top Beacon Light
        const beaconGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, 2.55, 0);

        const light = new THREE.PointLight(0x00ffff, 4.0, 8);
        light.position.set(0, 2.4, 0);

        this.mesh.add(block, topEdge, midEdge, botEdge, cross1, cross2, beacon, light);
        break;
      }

      case 'MOVING_DRONE': {
        // Side-to-side drone moving obstacle: Electric Violet & Neon Cyan
        const droneGeo = new THREE.SphereGeometry(0.65, 16, 16);
        const droneMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x9333ea,
          emissiveIntensity: 1.2,
          metalness: 0.9
        });
        const core = new THREE.Mesh(droneGeo, droneMat);
        core.position.y = 1.3;

        // Double Counter-Rotating Neon Rings
        const ring1Geo = new THREE.TorusGeometry(1.0, 0.08, 12, 32);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.position.y = 1.3;
        ring1.rotation.x = Math.PI / 2;

        const ring2Geo = new THREE.TorusGeometry(1.2, 0.06, 12, 32);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.position.y = 1.3;
        ring2.rotation.y = Math.PI / 4;

        const light = new THREE.PointLight(0xbf00ff, 4.5, 8);
        light.position.y = 1.3;

        this.mesh.add(core, ring1, ring2, light);
        this.moveSpeed = 4.0;
        break;
      }

      case 'LASER_BARRIER': {
        // Dual lane laser barrier: Neon Crimson Posts + Dual Intense Laser Beams
        const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 3, 12);
        const postMat = new THREE.MeshStandardMaterial({
          color: 0x222222,
          emissive: 0xff0055,
          emissiveIntensity: 0.6,
          metalness: 0.8
        });

        const p1 = new THREE.Mesh(postGeo, postMat);
        p1.position.set(-2.8, 1.5, 0);
        const p2 = new THREE.Mesh(postGeo, postMat);
        p2.position.set(2.8, 1.5, 0);

        // Glowing Ring Collars on posts
        const ringGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const r1 = new THREE.Mesh(ringGeo, ringMat);
        r1.position.set(-2.8, 1.2, 0);
        r1.rotation.x = Math.PI / 2;
        const r2 = new THREE.Mesh(ringGeo, ringMat);
        r2.position.set(2.8, 1.2, 0);
        r2.rotation.x = Math.PI / 2;

        // Outer Hot Pink Laser
        const laserOuterGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.6, 12);
        const laserOuterMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const laserOuter = new THREE.Mesh(laserOuterGeo, laserOuterMat);
        laserOuter.rotation.z = Math.PI / 2;
        laserOuter.position.set(0, 1.2, 0);

        // Inner White-Hot Beam Core
        const laserInnerGeo = new THREE.CylinderGeometry(0.05, 0.05, 5.65, 12);
        const laserInnerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const laserInner = new THREE.Mesh(laserInnerGeo, laserInnerMat);
        laserInner.rotation.z = Math.PI / 2;
        laserInner.position.set(0, 1.2, 0);

        const light = new THREE.PointLight(0xff0055, 4.0, 9);
        light.position.set(0, 1.2, 0);

        this.mesh.add(p1, p2, r1, r2, laserOuter, laserInner, light);
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
