import * as THREE from 'three';
import { LANE_X_POSITIONS, randomChoice } from '../utils/MathUtils';

export const SEGMENT_LENGTH = 40;

export class TrackSegment {
  public mesh: THREE.Group;
  public length: number = SEGMENT_LENGTH;
  private roadMat!: THREE.MeshStandardMaterial;
  private sideMat!: THREE.MeshStandardMaterial;
  private pillarMat!: THREE.MeshStandardMaterial;

  constructor(posZ: number, themeColor: number = 0x00f0ff, isLightMode: boolean = false) {
    this.mesh = new THREE.Group();
    this.mesh.position.z = posZ;
    this.buildSegment(themeColor, isLightMode);
  }

  private buildSegment(themeColor: number, isLightMode: boolean) {
    // 1. Road Floor Surface
    const roadWidth = 12;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, SEGMENT_LENGTH);
    this.roadMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0x334155 : 0x0c1122,
      roughness: 0.3,
      metalness: 0.7
    });
    const road = new THREE.Mesh(roadGeo, this.roadMat);
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
    this.sideMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0xc7d2fe : 0x090e1f,
      roughness: 0.4,
      metalness: 0.6
    });

    const buildingGeo = new THREE.BoxGeometry(10, 25 + Math.random() * 30, 8);
    const bLeft = new THREE.Mesh(buildingGeo, this.sideMat);
    bLeft.position.set(-13, bLeft.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    const bRight = new THREE.Mesh(buildingGeo, this.sideMat);
    bRight.position.set(13, bRight.geometry.parameters.height / 2, Math.random() * SEGMENT_LENGTH);

    this.mesh.add(bLeft, bRight);

    // Side Light Pillars with PointLights for vibrant track side ambient glow
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 6.5, 12);
    this.pillarMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0x94a3b8 : 0x1f293d,
      metalness: 0.8
    });
    const lampMat = new THREE.MeshBasicMaterial({ color: themeColor });

    for (let z = 10; z < SEGMENT_LENGTH; z += 20) {
      const pLeft = new THREE.Mesh(pillarGeo, this.pillarMat);
      pLeft.position.set(-6.5, 3.25, z);

      const lampLeft = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lampMat);
      lampLeft.position.set(-6.5, 6.5, z);

      const pRight = new THREE.Mesh(pillarGeo, this.pillarMat);
      pRight.position.set(6.5, 3.25, z);

      const lampRight = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lampMat);
      lampRight.position.set(6.5, 6.5, z);

      this.mesh.add(pLeft, lampLeft, pRight, lampRight);
    }
  }

  public updateTheme(isLightMode: boolean) {
    if (this.roadMat) this.roadMat.color.setHex(isLightMode ? 0x334155 : 0x0c1122);
    if (this.sideMat) this.sideMat.color.setHex(isLightMode ? 0xc7d2fe : 0x090e1f);
    if (this.pillarMat) this.pillarMat.color.setHex(isLightMode ? 0x94a3b8 : 0x1f293d);
  }
}
