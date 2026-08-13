import * as THREE from 'three';
import { LANE_X_POSITIONS, lerp } from '../utils/MathUtils';
import { SoundManager } from '../audio/SoundManager';

export interface Skin {
  id: string;
  name: string;
  price: number;
  primaryColor: number;
  glowColor: number;
  equipped: boolean;
}

export class Player {
  public mesh: THREE.Group;
  public boundingBox: THREE.Box3 = new THREE.Box3();
  
  private laneIndex: number = 1; // 0: Left, 1: Center, 2: Right
  private targetX: number = LANE_X_POSITIONS[1];
  private currentX: number = LANE_X_POSITIONS[1];

  // Physics state
  private posY: number = 0;
  private velY: number = 0;
  private gravity: number = -42;
  private jumpForce: number = 17;
  private isGrounded: boolean = true;

  // Slide state
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private slideDuration: number = 0.65; // seconds

  // Mesh Parts for animation
  private torsoMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private visorMesh!: THREE.Mesh;
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private shieldMesh!: THREE.Mesh;
  private thrusterGlow!: THREE.PointLight;

  // Active Powerups State
  public shieldActive: boolean = false;
  public magnetActive: boolean = false;
  public magnetRadius: number = 15;

  // Lives & Invincibility State
  public lives: number = 3;
  public maxLives: number = 3;
  public isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private invincibilityDuration: number = 1.5; // seconds

  // Current Skin Colors
  private primaryColor: number = 0x00f0ff;
  private glowColor: number = 0x00ffff;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.createPlayerMesh();
    scene.add(this.mesh);
    this.updateBoundingBox();
  }

  private createPlayerMesh() {
    // Clear existing
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }

    const primaryMat = new THREE.MeshStandardMaterial({
      color: this.primaryColor,
      emissive: this.primaryColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });

    const darkArmorMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.3,
      metalness: 0.7
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: this.glowColor
    });

    // 1. Torso / Body Armor
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.2, 0.6);
    this.torsoMesh = new THREE.Mesh(torsoGeo, primaryMat);
    this.torsoMesh.position.y = 1.4;
    this.mesh.add(this.torsoMesh);

    // Core Chest Glow
    const chestCoreGeo = new THREE.BoxGeometry(0.4, 0.5, 0.62);
    const chestCore = new THREE.Mesh(chestCoreGeo, glowMat);
    this.torsoMesh.add(chestCore);

    // 2. Head & Visor
    const headGeo = new THREE.BoxGeometry(0.6, 0.5, 0.5);
    this.headMesh = new THREE.Mesh(headGeo, darkArmorMat);
    this.headMesh.position.set(0, 0.9, 0);
    this.torsoMesh.add(this.headMesh);

    const visorGeo = new THREE.BoxGeometry(0.55, 0.18, 0.52);
    this.visorMesh = new THREE.Mesh(visorGeo, glowMat);
    this.visorMesh.position.set(0, 0.05, 0.02);
    this.headMesh.add(this.visorMesh);

    // Jetpack Thruster on back
    const jetpackGeo = new THREE.BoxGeometry(0.6, 0.7, 0.3);
    const jetpack = new THREE.Mesh(jetpackGeo, darkArmorMat);
    jetpack.position.set(0, 0, -0.4);
    this.torsoMesh.add(jetpack);

    this.thrusterGlow = new THREE.PointLight(this.glowColor, 3, 7);
    this.thrusterGlow.position.set(0, -0.3, -0.6);
    this.torsoMesh.add(this.thrusterGlow);

    // Ground Neon Underglow Light
    const underglowLight = new THREE.PointLight(this.glowColor, 2.5, 5);
    underglowLight.position.set(0, 0.2, 0);
    this.mesh.add(underglowLight);

    // Neon Footprint Ring
    const ringGeo = new THREE.RingGeometry(0.6, 0.75, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: this.glowColor, side: THREE.DoubleSide });
    const underglowRing = new THREE.Mesh(ringGeo, ringMat);
    underglowRing.rotation.x = -Math.PI / 2;
    underglowRing.position.y = 0.02;
    this.mesh.add(underglowRing);

    // 3. Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);

    this.leftLegGroup = new THREE.Group();
    const leftLeg = new THREE.Mesh(legGeo, darkArmorMat);
    leftLeg.position.y = -0.4;
    this.leftLegGroup.position.set(-0.28, 0.8, 0);
    this.leftLegGroup.add(leftLeg);
    this.mesh.add(this.leftLegGroup);

    this.rightLegGroup = new THREE.Group();
    const rightLeg = new THREE.Mesh(legGeo, darkArmorMat);
    rightLeg.position.y = -0.4;
    this.rightLegGroup.position.set(0.28, 0.8, 0);
    this.rightLegGroup.add(rightLeg);
    this.mesh.add(this.rightLegGroup);

    // 4. Energy Shield Sphere (hidden by default)
    const shieldGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.2;
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);

    // Enable shadows
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  public setSkin(primary: number, glow: number) {
    this.primaryColor = primary;
    this.glowColor = glow;
    this.createPlayerMesh();
  }

  public moveLeft() {
    if (this.laneIndex > 0) {
      this.laneIndex--;
      this.targetX = LANE_X_POSITIONS[this.laneIndex];
    }
  }

  public moveRight() {
    if (this.laneIndex < 2) {
      this.laneIndex++;
      this.targetX = LANE_X_POSITIONS[this.laneIndex];
    }
  }

  public jump() {
    if (this.isGrounded) {
      this.velY = this.jumpForce;
      this.isGrounded = false;
      this.isSliding = false;
      SoundManager.getInstance().playJump();
    }
  }

  public slide() {
    if (this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      SoundManager.getInstance().playSlide();
    }
  }

  public resetLives(maxLives: number = 3) {
    this.maxLives = maxLives;
    this.lives = maxLives;
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.mesh.visible = true;
  }

  public takeDamage(amount: number = 1): number {
    this.lives = Math.max(0, this.lives - amount);
    this.isInvincible = true;
    this.invincibilityTimer = this.invincibilityDuration;
    return this.lives;
  }

  public update(dt: number) {
    // 1. Smooth Lane Horizontal lerp
    this.currentX = lerp(this.currentX, this.targetX, dt * 18);
    this.mesh.position.x = this.currentX;

    // Bank / roll angle when changing lanes
    const rollAngle = (this.currentX - this.targetX) * 0.15;
    this.mesh.rotation.z = rollAngle;

    // 2. Vertical Jump Physics
    if (!this.isGrounded) {
      this.posY += this.velY * dt;
      this.velY += this.gravity * dt;

      if (this.posY <= 0) {
        this.posY = 0;
        this.velY = 0;
        this.isGrounded = true;
      }
    }
    this.mesh.position.y = this.posY;

    // 3. Slide Timer & Animation
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
      // Duck down mesh scale
      this.mesh.scale.set(1.1, 0.45, 1.2);
      this.torsoMesh.rotation.x = 0.5;
    } else {
      this.mesh.scale.set(1, 1, 1);
      this.torsoMesh.rotation.x = 0;
    }

    // 4. Running Legs Animation
    if (this.isGrounded && !this.isSliding) {
      const time = performance.now() * 0.015;
      this.leftLegGroup.rotation.x = Math.sin(time) * 0.7;
      this.rightLegGroup.rotation.x = -Math.sin(time) * 0.7;
      this.torsoMesh.position.y = 1.4 + Math.sin(time * 2) * 0.05;
    } else if (!this.isGrounded) {
      // Tuck legs in air
      this.leftLegGroup.rotation.x = -0.5;
      this.rightLegGroup.rotation.x = 0.4;
    }

    // 5. Shield Mesh Rotation & Visibility
    if (this.shieldMesh) {
      this.shieldMesh.visible = this.shieldActive;
      if (this.shieldActive) {
        this.shieldMesh.rotation.y += dt * 3;
        this.shieldMesh.rotation.z += dt * 2;
      }
    }

    // 6. Invincibility i-frame Blinking Animation
    if (this.isInvincible) {
      this.invincibilityTimer -= dt;
      const blinkFrequency = 14; // Blinks per second
      this.mesh.visible = Math.floor(this.invincibilityTimer * blinkFrequency) % 2 === 0;

      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.mesh.visible = true;
      }
    }

    this.updateBoundingBox();
  }

  private static _centerBuffer = new THREE.Vector3();
  private static _sizeBuffer = new THREE.Vector3();

  public updateBoundingBox() {
    const height = this.isSliding ? 0.7 : 1.8;
    const width = 0.9;
    const depth = 0.8;

    Player._centerBuffer.set(this.mesh.position.x, this.mesh.position.y + height / 2, this.mesh.position.z);
    Player._sizeBuffer.set(width, height, depth);

    this.boundingBox.setFromCenterAndSize(Player._centerBuffer, Player._sizeBuffer);
  }

  public reset() {
    this.laneIndex = 1;
    this.targetX = LANE_X_POSITIONS[1];
    this.currentX = LANE_X_POSITIONS[1];
    this.posY = 0;
    this.velY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.shieldActive = false;
    this.magnetActive = false;
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.mesh.visible = true;
    this.mesh.position.set(this.currentX, 0, 0);
  }
}
