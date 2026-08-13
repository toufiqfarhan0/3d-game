import * as THREE from 'three';

export const LANE_X_POSITIONS = [3.2, 0.0, -3.2];
export const TRACK_SPEED_BASE = 28; // initial running speed (units/sec)
export const TRACK_SPEED_MAX = 55;  // max speed cap

export interface AABB {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Simple Box Collision Detection between 3D object bounding boxes
export function checkAABBCollision(box1: THREE.Box3, box2: THREE.Box3): boolean {
  return box1.intersectsBox(box2);
}

// Deeply dispose of Three.js Object3D hierarchy (geometries & materials) to prevent WebGL memory leaks
export function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    } else if (child instanceof THREE.Light) {
      child.dispose();
    }
  });
}

