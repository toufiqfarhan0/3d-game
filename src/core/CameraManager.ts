import * as THREE from 'three';
import { lerp } from '../utils/MathUtils';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private targetOffset: THREE.Vector3 = new THREE.Vector3(0, 3.8, -7.5);
  private lookAtPos: THREE.Vector3 = new THREE.Vector3(0, 1.6, 12);
  private shakeIntensity: number = 0;

  constructor(fov: number = 65, aspect: number = window.innerWidth / window.innerHeight) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 500);
    this.reset();
  }

  public triggerShake(intensity: number = 0.4) {
    this.shakeIntensity = intensity;
  }

  public reset(playerPos?: THREE.Vector3) {
    const px = playerPos ? playerPos.x : 0;
    const py = playerPos ? playerPos.y : 0;
    const pz = playerPos ? playerPos.z : 0;

    this.shakeIntensity = 0;
    this.camera.fov = 65;
    this.camera.updateProjectionMatrix();

    const startX = px * 0.55;
    const startY = py + this.targetOffset.y;
    const startZ = pz + this.targetOffset.z;

    this.camera.position.set(startX, startY, startZ);
    this.lookAtPos.set(px * 0.25, py + 1.6, pz + 12);
    this.camera.lookAt(this.lookAtPos);
  }

  public update(playerPos: THREE.Vector3, playerSpeed: number, dt: number) {
    // Exact frame-rate independent exponential damping
    const posAlpha = 1 - Math.exp(-14 * dt);
    const lookAlpha = 1 - Math.exp(-16 * dt);

    // 1. Smooth Camera Position
    const targetX = playerPos.x * 0.55;
    const targetY = playerPos.y + this.targetOffset.y;
    const targetZ = playerPos.z + this.targetOffset.z;

    this.camera.position.x = lerp(this.camera.position.x, targetX, posAlpha);
    this.camera.position.y = lerp(this.camera.position.y, targetY, posAlpha);
    this.camera.position.z = targetZ; // Lock Z directly to player to avoid any forward/backward lag

    // 2. Camera Shake Effect
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2.5);
    }

    // 3. Dynamic FOV Zoom speed effect with smooth damping
    const targetFOV = 65 + (playerSpeed - 28) * 0.35;
    if (Math.abs(this.camera.fov - targetFOV) > 0.05) {
      const fovAlpha = 1 - Math.exp(-6 * dt);
      this.camera.fov = lerp(this.camera.fov, targetFOV, fovAlpha);
      this.camera.updateProjectionMatrix();
    }

    // 4. Smooth Look-At Target (matching camera damping to prevent parallax jitter)
    const targetLookX = playerPos.x * 0.25;
    const targetLookY = playerPos.y + 1.6;
    const targetLookZ = playerPos.z + 12;

    this.lookAtPos.x = lerp(this.lookAtPos.x, targetLookX, lookAlpha);
    this.lookAtPos.y = lerp(this.lookAtPos.y, targetLookY, lookAlpha);
    this.lookAtPos.z = targetLookZ;

    this.camera.lookAt(this.lookAtPos);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
