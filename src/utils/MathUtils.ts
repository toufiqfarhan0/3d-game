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

/**
 * Swept AABB collision check between moving object box1 (from prevZ1 to currZ1) and obstacle box2.
 * Prevents tunneling through thin obstacles at high speeds while checking X and Y overlaps accurately.
 */
export function checkSweptAABBCollision(
  box1: THREE.Box3,
  box2: THREE.Box3,
  prevZ1: number,
  currZ1: number
): boolean {
  // 1. X overlap check
  if (box1.max.x < box2.min.x || box1.min.x > box2.max.x) {
    return false;
  }

  // 2. Y overlap check
  if (box1.max.y < box2.min.y || box1.min.y > box2.max.y) {
    return false;
  }

  // 3. Swept Z overlap check
  const halfDepth1 = (box1.max.z - box1.min.z) / 2;
  const minZ1 = Math.min(prevZ1, currZ1) - halfDepth1;
  const maxZ1 = Math.max(prevZ1, currZ1) + halfDepth1;

  if (maxZ1 < box2.min.z || minZ1 > box2.max.z) {
    return false;
  }

  return true;
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

