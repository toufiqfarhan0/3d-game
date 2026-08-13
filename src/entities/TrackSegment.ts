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
      color: 0x0c1122,
      roughness: 0.3,
      metalness: 0.7
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = SEGMENT_LENGTH / 2;
    road.receiveShadow = true;
    this.mesh.add(road);

    // 2. Neon Outer Rails & Lane Dividers
    const lineMat = new THREE.MeshBasicMaterial({ color: themeColor });
    const lineGeo = new THREE.BoxGeometry(0.18, 0.08, SEGMENT_LENGTH);

    // Left & Right Outer Rails
    const railLeft = new THREE.Mesh(lineGeo, lineMat);
    railLeft.position.set(-roadWidth / 2, 0.05, SEGMENT_LENGTH / 2);
    const railRight = new THREE.Mesh(lineGeo, lineMat);
    railRight.position.set(roadWidth / 2, 0.05, SEGMENT_LENGTH / 2);
    this.mesh.add(railLeft, railRight);

    // Dotted Center Lane Dividers
    const dashGeo = new THREE.BoxGeometry(0.12, 0.06, 3.2);
    for (let z = 2; z < SEGMENT_LENGTH; z += 6) {
      const dash1 = new THREE.Mesh(dashGeo, lineMat);
      dash1.position.set(-1.6, 0.04, z);
      const dash2 = new THREE.Mesh(dashGeo, lineMat);
      dash2.position.set(1.6, 0.04, z);
      this.mesh.add(dash1, dash2);
    }

    // 3. Side Scenery / Sci-Fi Buildings & Glowing Light Pillars
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x090e1f,
      roughness: 0.4,
      metalness: 0.6
    });

    const buildingGeo = new THREE.BoxGeometry(10, 25 + Math.random() * 30, 8);
    const bLeft = new THREE.Mesh(buildingGeo, sideMat);
    bLeft.position.set(-13, bLeft.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    const bRight = new THREE.Mesh(buildingGeo, sideMat);
    bRight.position.set(13, bRight.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    this.mesh.add(bLeft, bRight);

    // Side Light Pillars with PointLights for vibrant track side ambient glow
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 6.5, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f293d, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: themeColor });

    for (let z = 10; z < SEGMENT_LENGTH; z += 20) {
      const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
      pLeft.position.set(-6.5, 3.25, z);

      const lampLeft = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), lampMat);
      lampLeft.position.set(-6.5, 6.5, z);

      const lightLeft = new THREE.PointLight(themeColor, 1.8, 8);
      lightLeft.position.set(-6.5, 6.5, z);

      const pRight = new THREE.Mesh(pillarGeo, pillarMat);
      pRight.position.set(6.5, 3.25, z);

      const lampRight = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), lampMat);
      lampRight.position.set(6.5, 6.5, z);

      const lightRight = new THREE.PointLight(themeColor, 1.8, 8);
      lightRight.position.set(6.5, 6.5, z);

      this.mesh.add(pLeft, lampLeft, lightLeft, pRight, lampRight, lightRight);
    }
  }
}
