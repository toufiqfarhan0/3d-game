import * as THREE from 'three';
import { lerp } from '../utils/MathUtils';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private targetOffset: THREE.Vector3 = new THREE.Vector3(0, 3.8, -7.5);
  private currentPos: THREE.Vector3 = new THREE.Vector3();
  private shakeIntensity: number = 0;

  constructor(fov: number = 65, aspect: number = window.innerWidth / window.innerHeight) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 500);
    this.camera.position.set(0, 3.8, -7.5);
    this.camera.lookAt(0, 1.8, 10);
  }

  public triggerShake(intensity: number = 0.4) {
    this.shakeIntensity = intensity;
  }

  public update(playerPos: THREE.Vector3, playerSpeed: number, dt: number) {
    // 1. Target Camera Position behind & above player
    const desiredX = lerp(this.camera.position.x, playerPos.x * 0.6, dt * 8);
    const desiredY = lerp(this.camera.position.y, playerPos.y + this.targetOffset.y, dt * 8);
    const desiredZ = playerPos.z + this.targetOffset.z;

    this.camera.position.set(desiredX, desiredY, desiredZ);

    // 2. Camera Shake Effect
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2);
    }

    // 3. Dynamic FOV Zoom speed effect
    const targetFOV = 65 + (playerSpeed - 28) * 0.4;
    this.camera.fov = lerp(this.camera.fov, targetFOV, dt * 5);
    this.camera.updateProjectionMatrix();

    // Look slightly ahead of player
    this.camera.lookAt(playerPos.x * 0.3, playerPos.y + 1.6, playerPos.z + 12);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
