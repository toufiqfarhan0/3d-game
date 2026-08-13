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
  
  private laneIndex: number = 1;
  private targetX: number = LANE_X_POSITIONS[1];
  private currentX: number = LANE_X_POSITIONS[1];

  // Physics state
  private posY: number = 0;
  private velY: number = 0;
  private gravity: number = -44;
  private jumpForce: number = 17.5;
  private isGrounded: boolean = true;

  // Slide state
  public isSliding: boolean = false;
  private slideTimer: number = 0;
  private slideDuration: number = 0.65;

  // Hierarchical Body Rig for Realistic Skeletal Animation
  private bodyRoot!: THREE.Group;
  private torsoGroup!: THREE.Group;
  private headGroup!: THREE.Group;
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group;
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private leftShinGroup!: THREE.Group;
  private rightShinGroup!: THREE.Group;
  private shieldMesh!: THREE.Mesh;
  private thrusterLight!: THREE.PointLight;
  private jetFlameMesh!: THREE.Mesh;

  // Active Powerups State
  public shieldActive: boolean = false;

  // Lives & Invincibility State
  public lives: number = 3;
  public maxLives: number = 3;
  public isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private invincibilityDuration: number = 1.5;

  // Current Skin Colors
  private primaryColor: number = 0x0284c7; // Tactical Cyan/Blue
  private glowColor: number = 0x38bdf8;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.createPlayerMesh();
    scene.add(this.mesh);
    this.updateBoundingBox();
  }

  private createPlayerMesh() {
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }

    this.bodyRoot = new THREE.Group();
    this.mesh.add(this.bodyRoot);

    // Realistic Carbon & Armor Materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: this.primaryColor,
      metalness: 0.8,
      roughness: 0.25,
    });

    const carbonSuitMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.4,
      roughness: 0.7,
    });

    const goldVisorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.9,
      roughness: 0.3,
    });

    // ── 1. TORSO & SPINE EXOSKELETON ──────────────────────────────────
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 1.1;
    this.bodyRoot.add(this.torsoGroup);

    // Inner undersuit chest
    const underTorsoGeo = new THREE.BoxGeometry(0.65, 0.7, 0.4);
    const underTorso = new THREE.Mesh(underTorsoGeo, carbonSuitMat);
    this.torsoGroup.add(underTorso);

    // Armor Chest Plate with angular chamfer
    const chestPlateGeo = new THREE.BoxGeometry(0.72, 0.45, 0.25);
    const chestPlate = new THREE.Mesh(chestPlateGeo, armorMat);
    chestPlate.position.set(0, 0.12, 0.16);
    this.torsoGroup.add(chestPlate);

    // Core Power Arc Reactor
    const reactorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12);
    const reactorMat = new THREE.MeshBasicMaterial({ color: this.glowColor });
    const reactor = new THREE.Mesh(reactorGeo, reactorMat);
    reactor.rotation.x = Math.PI / 2;
    reactor.position.set(0, 0.12, 0.28);
    this.torsoGroup.add(reactor);

    // Spine Column Exoskeleton vertebrae
    [-0.2, -0.05, 0.1, 0.25].forEach(sy => {
      const vertGeo = new THREE.BoxGeometry(0.2, 0.08, 0.12);
      const vert = new THREE.Mesh(vertGeo, jointMat);
      vert.position.set(0, sy, -0.22);
      this.torsoGroup.add(vert);
    });

    // Twin Jet Thruster Pack on Back
    const jetpackGeo = new THREE.BoxGeometry(0.55, 0.5, 0.25);
    const jetpack = new THREE.Mesh(jetpackGeo, armorMat);
    jetpack.position.set(0, 0.05, -0.28);
    this.torsoGroup.add(jetpack);

    // Thruster exhaust nozzles
    [-0.16, 0.16].forEach(jx => {
      const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.18, 8);
      const nozzle = new THREE.Mesh(nozzleGeo, jointMat);
      nozzle.position.set(jx, -0.24, -0.28);
      this.torsoGroup.add(nozzle);
    });

    // Jet Flame Glow
    const flameGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: this.glowColor });
    this.jetFlameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.jetFlameMesh.rotation.x = Math.PI;
    this.jetFlameMesh.position.set(0, -0.4, -0.28);
    this.torsoGroup.add(this.jetFlameMesh);

    this.thrusterLight = new THREE.PointLight(this.glowColor, 2.5, 6);
    this.thrusterLight.position.set(0, -0.3, -0.5);
    this.torsoGroup.add(this.thrusterLight);

    // ── 2. HEAD & AERODYNAMIC HELMET ──────────────────────────────────
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.55, 0);
    this.torsoGroup.add(this.headGroup);

    // Helmet outer shell
    const helmetGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.scale.set(1.0, 1.15, 1.15);
    this.headGroup.add(helmet);

    // Seamless Gold Curved Reflective Visor
    const visorGeo = new THREE.SphereGeometry(0.25, 12, 12, 0, Math.PI, 0, Math.PI * 0.55);
    const visor = new THREE.Mesh(visorGeo, goldVisorMat);
    visor.rotation.x = Math.PI / 2;
    visor.position.set(0, 0.02, 0.08);
    this.headGroup.add(visor);

    // Side Ear Comms Antennas
    [-0.28, 0.28].forEach(ex => {
      const earGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
      const ear = new THREE.Mesh(earGeo, jointMat);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(ex, 0, 0);
      this.headGroup.add(ear);
    });

    // ── 3. ARTICULATED SPRINT ARMS ────────────────────────────────────
    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.46, 0.28, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const shoulderGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const lShoulder = new THREE.Mesh(shoulderGeo, armorMat);
    this.leftArmGroup.add(lShoulder);

    const bicepGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.35, 8);
    const lBicep = new THREE.Mesh(bicepGeo, carbonSuitMat);
    lBicep.position.y = -0.2;
    this.leftArmGroup.add(lBicep);

    const forearmGeo = new THREE.BoxGeometry(0.16, 0.38, 0.16);
    const lForearm = new THREE.Mesh(forearmGeo, armorMat);
    lForearm.position.set(0, -0.45, 0.08);
    this.leftArmGroup.add(lForearm);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.46, 0.28, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rShoulder = new THREE.Mesh(shoulderGeo, armorMat);
    this.rightArmGroup.add(rShoulder);

    const rBicep = new THREE.Mesh(bicepGeo, carbonSuitMat);
    rBicep.position.y = -0.2;
    this.rightArmGroup.add(rBicep);

    const rForearm = new THREE.Mesh(forearmGeo, armorMat);
    rForearm.position.set(0, -0.45, 0.08);
    this.rightArmGroup.add(rForearm);

    // ── 4. ARTICULATED LEGS & BOOSTER RUNNER BOOTS ─────────────────────
    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.22, -0.35, 0);
    this.torsoGroup.add(this.leftLegGroup);

    const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.45, 8);
    const lThigh = new THREE.Mesh(thighGeo, carbonSuitMat);
    lThigh.position.y = -0.22;
    this.leftLegGroup.add(lThigh);

    const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), armorMat);
    lKnee.position.set(0, -0.44, 0.05);
    this.leftLegGroup.add(lKnee);

    this.leftShinGroup = new THREE.Group();
    this.leftShinGroup.position.set(0, -0.44, 0);
    this.leftLegGroup.add(this.leftShinGroup);

    const shinGeo = new THREE.BoxGeometry(0.18, 0.42, 0.2);
    const lShin = new THREE.Mesh(shinGeo, armorMat);
    lShin.position.y = -0.22;
    this.leftShinGroup.add(lShin);

    const bootGeo = new THREE.BoxGeometry(0.2, 0.14, 0.35);
    const lBoot = new THREE.Mesh(bootGeo, jointMat);
    lBoot.position.set(0, -0.44, 0.08);
    this.leftShinGroup.add(lBoot);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.22, -0.35, 0);
    this.torsoGroup.add(this.rightLegGroup);

    const rThigh = new THREE.Mesh(thighGeo, carbonSuitMat);
    rThigh.position.y = -0.22;
    this.rightLegGroup.add(rThigh);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), armorMat);
    rKnee.position.set(0, -0.44, 0.05);
    this.rightLegGroup.add(rKnee);

    this.rightShinGroup = new THREE.Group();
    this.rightShinGroup.position.set(0, -0.44, 0);
    this.rightLegGroup.add(this.rightShinGroup);

    const rShin = new THREE.Mesh(shinGeo, armorMat);
    rShin.position.y = -0.22;
    this.rightShinGroup.add(rShin);

    const rBoot = new THREE.Mesh(bootGeo, jointMat);
    rBoot.position.set(0, -0.44, 0.08);
    this.rightShinGroup.add(rBoot);

    // ── 5. HOLOGRAPHIC FORCEFIELD SHIELD SPHERE ───────────────────────
    const shieldGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 0.9;
    this.shieldMesh.visible = false;
    this.bodyRoot.add(this.shieldMesh);

    // Shadows
    this.mesh.traverse(child => {
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

    // Realistic lean / banking angle in turns
    const rollAngle = (this.currentX - this.targetX) * 0.18;
    this.bodyRoot.rotation.z = rollAngle;
    this.bodyRoot.rotation.y = -rollAngle * 0.4;

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

    // 3. Sprint Cycle Skeletal Animation
    const runCycleSpeed = 16;
    const runTime = performance.now() * 0.001 * runCycleSpeed;

    if (this.isGrounded && !this.isSliding) {
      // Forward Sprint Lean
      this.torsoGroup.rotation.x = 0.22;
      this.bodyRoot.position.y = Math.sin(runTime * 2) * 0.06;

      // Arm Swings
      this.leftArmGroup.rotation.x = Math.sin(runTime) * 0.85;
      this.rightArmGroup.rotation.x = -Math.sin(runTime) * 0.85;

      // Leg Cycles with knee flexion
      this.leftLegGroup.rotation.x = -Math.sin(runTime) * 0.95;
      this.rightLegGroup.rotation.x = Math.sin(runTime) * 0.95;

      this.leftShinGroup.rotation.x = Math.max(0, Math.sin(runTime) * 0.8);
      this.rightShinGroup.rotation.x = Math.max(0, -Math.sin(runTime) * 0.8);

      this.bodyRoot.scale.set(1, 1, 1);
    } else if (!this.isGrounded) {
      // In-air Aerodynamic Jump Tuck
      this.torsoGroup.rotation.x = -0.15;
      this.leftLegGroup.rotation.x = -0.6;
      this.rightLegGroup.rotation.x = 0.3;
      this.leftShinGroup.rotation.x = 0.8;
      this.rightShinGroup.rotation.x = 0.4;

      this.leftArmGroup.rotation.x = -0.9;
      this.rightArmGroup.rotation.x = -0.9;
    } else if (this.isSliding) {
      // Low Slide Tuck
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
      this.torsoGroup.rotation.x = 0.75;
      this.bodyRoot.position.y = -0.4;
      this.leftLegGroup.rotation.x = 1.1;
      this.rightLegGroup.rotation.x = 1.1;
      this.leftShinGroup.rotation.x = 0.4;
      this.rightShinGroup.rotation.x = 0.4;
      this.bodyRoot.scale.set(1.1, 0.5, 1.25);
    }

    // 4. Thruster Jet Flame Flicker
    if (this.jetFlameMesh) {
      this.jetFlameMesh.scale.y = 0.8 + Math.random() * 0.5;
    }

    // 5. Shield Rotation
    if (this.shieldMesh) {
      this.shieldMesh.visible = this.shieldActive;
      if (this.shieldActive) {
        this.shieldMesh.rotation.y += dt * 2.5;
        this.shieldMesh.rotation.x += dt * 1.5;
      }
    }

    // 6. Invincibility i-frame Blinking
    if (this.isInvincible) {
      this.invincibilityTimer -= dt;
      this.mesh.visible = Math.floor(this.invincibilityTimer * 14) % 2 === 0;

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
    const height = this.isSliding ? 0.8 : 1.9;
    const width = 0.9;
    const depth = 0.85;

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
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.mesh.visible = true;
    this.mesh.position.set(this.currentX, 0, 0);
  }
}
