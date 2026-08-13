import * as THREE from 'three';
import { LANE_X_POSITIONS, randomChoice } from '../utils/MathUtils';

export const SEGMENT_LENGTH = 40;

export class TrackSegment {
  public mesh: THREE.Group;
  public length: number = SEGMENT_LENGTH;

  constructor(posZ: number, themeColor: number = 0x00f0ff) {
    this.mesh = new THREE.Group();
    this.mesh.position.z = posZ;
    this.buildSegment(themeColor);
  }

  private buildSegment(themeColor: number) {
    // 1. Road Floor Surface
    const roadWidth = 12;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, SEGMENT_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      roughness: 0.4,
      metalness: 0.6
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = SEGMENT_LENGTH / 2;
    road.receiveShadow = true;
    this.mesh.add(road);

    // 2. Neon Lane Dividers
    const lineMat = new THREE.MeshBasicMaterial({ color: themeColor });
    const lineGeo = new THREE.BoxGeometry(0.1, 0.05, SEGMENT_LENGTH);

    // Left & Right Outer Rails
    const railLeft = new THREE.Mesh(lineGeo, lineMat);
    railLeft.position.set(-roadWidth / 2, 0.05, SEGMENT_LENGTH / 2);
    const railRight = new THREE.Mesh(lineGeo, lineMat);
    railRight.position.set(roadWidth / 2, 0.05, SEGMENT_LENGTH / 2);
    this.mesh.add(railLeft, railRight);

    // Dotted Center Lane Dividers
    const dashGeo = new THREE.BoxGeometry(0.08, 0.04, 3);
    for (let z = 2; z < SEGMENT_LENGTH; z += 6) {
      const dash1 = new THREE.Mesh(dashGeo, lineMat);
      dash1.position.set(-1.6, 0.04, z);
      const dash2 = new THREE.Mesh(dashGeo, lineMat);
      dash2.position.set(1.6, 0.04, z);
      this.mesh.add(dash1, dash2);
    }

    // 3. Side Scenery / Sci-Fi Buildings & Light Poles
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.5,
      metalness: 0.5
    });

    const buildingGeo = new THREE.BoxGeometry(10, 20 + Math.random() * 30, 8);
    const bLeft = new THREE.Mesh(buildingGeo, sideMat);
    bLeft.position.set(-12, bLeft.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    const bRight = new THREE.Mesh(buildingGeo, sideMat);
    bRight.position.set(12, bRight.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    this.mesh.add(bLeft, bRight);

    // Side Light Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f293d });
    const lampMat = new THREE.MeshBasicMaterial({ color: themeColor });

    for (let z = 5; z < SEGMENT_LENGTH; z += 20) {
      const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
      pLeft.position.set(-6.5, 3, z);

      const lampLeft = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampMat);
      lampLeft.position.set(-6.5, 6, z);

      const pRight = new THREE.Mesh(pillarGeo, pillarMat);
      pRight.position.set(6.5, 3, z);

      const lampRight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampMat);
      lampRight.position.set(6.5, 6, z);

      this.mesh.add(pLeft, lampLeft, pRight, lampRight);
    }
  }
}
