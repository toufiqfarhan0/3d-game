import * as THREE from 'three';
import { Player } from '../entities/Player';
import { TrackManager } from '../managers/TrackManager';
import { ParticleManager } from '../managers/ParticleManager';
import { ScoreManager } from '../managers/ScoreManager';
import { ShopManager } from '../managers/ShopManager';
import { SoundManager } from '../audio/SoundManager';
import { CameraManager } from './CameraManager';
import { InputManager } from './InputManager';
import { UIManager } from '../ui/UIManager';
import { checkAABBCollision, checkSweptAABBCollision, TRACK_SPEED_BASE, TRACK_SPEED_MAX } from '../utils/MathUtils';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  public state: GameState = 'START';
  public currentSpeed: number = TRACK_SPEED_BASE;

  private player!: Player;
  private trackMgr!: TrackManager;
  private particleMgr!: ParticleManager;
  private scoreMgr!: ScoreManager;
  private shopMgr!: ShopManager;
  private soundMgr!: SoundManager;
  private cameraMgr!: CameraManager;
  private inputMgr!: InputManager;
  private uiMgr!: UIManager;

  private lastFrameTime: number = performance.now();
  private dirLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private groundMesh!: THREE.Mesh;
  private groundMat!: THREE.MeshStandardMaterial;
  private starfield!: THREE.Points;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    this.initThreeJS();
    this.initManagers();
    this.bindEvents();
    this.setupResizeHandler();

    this.uiMgr.showStartScreen();
    this.startRenderLoop();
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x131729);
    this.scene.fog = new THREE.FogExp2(0x131729, 0.007);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    // ── LIGHTING ──────────────────────────────────────────────────
    // Ambient fill
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    // Hemisphere: warm cyan sky, deep indigo ground
    this.hemiLight = new THREE.HemisphereLight(0x5ad4ff, 0x3a1fa0, 1.0);
    this.scene.add(this.hemiLight);

    // Main directional light — optimized shadow map and tight bounds
    this.dirLight = new THREE.DirectionalLight(0xfff4e0, 1.6);
    this.dirLight.position.set(12, 30, 15);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width  = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far  = 70;
    this.dirLight.shadow.camera.left   = -10;
    this.dirLight.shadow.camera.right  = 10;
    this.dirLight.shadow.camera.top    = 15;
    this.dirLight.shadow.camera.bottom = -10;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Rim light from behind for depth
    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.5);
    rimLight.position.set(-10, 10, -20);
    this.scene.add(rimLight);

    // ── WIDE GROUND PLANE ─────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(300, 2000, 1, 1);
    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0x0e1228,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, this.groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(0, -0.05, 1000);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // ── STARFIELD ─────────────────────────────────────────────────
    this.buildStarfield();
  }

  private buildStarfield() {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const starColors = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xaaccff),
      new THREE.Color(0xffeebb),
      new THREE.Color(0x88aaff),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = 20 + Math.random() * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
      const c = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.starfield = new THREE.Points(geo, mat);
    this.starfield.frustumCulled = false;
    this.scene.add(this.starfield);
  }

  public setTheme(theme: 'dark' | 'light') {
    const isLight = theme === 'light';
    const bgHex = isLight ? 0xb8d4f0 : 0x131729;

    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(bgHex, isLight ? 0.005 : 0.007);

    if (this.ambientLight) {
      this.ambientLight.intensity = isLight ? 1.4 : 0.9;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(isLight ? 0xffffff : 0x5ad4ff);
      this.hemiLight.groundColor.setHex(isLight ? 0xd4c09a : 0x3a1fa0);
      this.hemiLight.intensity = isLight ? 1.2 : 1.0;
    }
    if (this.groundMat) {
      this.groundMat.color.setHex(isLight ? 0xc8d4e0 : 0x0e1228);
      this.groundMat.roughness = isLight ? 0.9 : 0.8;
      this.groundMat.metalness = isLight ? 0.0 : 0.2;
      this.groundMat.needsUpdate = true;
    }
    if (this.starfield) {
      this.starfield.visible = !isLight;
    }
    if (this.trackMgr) {
      this.trackMgr.setTheme(theme);
    }
  }

  private initManagers() {
    this.soundMgr = SoundManager.getInstance();
    this.scoreMgr = new ScoreManager();
    this.shopMgr = new ShopManager();
    this.cameraMgr = new CameraManager();
    this.inputMgr = new InputManager();

    this.player = new Player(this.scene);
    const skin = this.shopMgr.getEquippedSkin();
    this.player.setSkin(skin.primaryColor, skin.glowColor);

    this.trackMgr = new TrackManager(this.scene);
    this.particleMgr = new ParticleManager(this.scene);
    this.uiMgr = new UIManager(this.scoreMgr, this.soundMgr);

    // Apply saved theme to 3D scene
    this.setTheme(this.uiMgr.currentTheme);

    // Bind Mobile Touch Buttons
    this.inputMgr.bindTouchButtons('touch-left', 'touch-right', 'touch-jump', 'touch-slide');
  }

  private bindEvents() {
    // Controls Mapping
    this.inputMgr.on('LANE_LEFT', () => {
      if (this.state === 'PLAYING') this.player.moveLeft();
    });
    this.inputMgr.on('LANE_RIGHT', () => {
      if (this.state === 'PLAYING') this.player.moveRight();
    });
    this.inputMgr.on('JUMP', () => {
      if (this.state === 'PLAYING') this.player.jump();
      else if (this.state === 'START' || this.state === 'GAMEOVER') this.startGame();
    });
    this.inputMgr.on('SLIDE', () => {
      if (this.state === 'PLAYING') this.player.slide();
    });
    this.inputMgr.on('PAUSE', () => {
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
    });

    // UI Buttons
    document.getElementById('btn-start-game')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart-game')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart-pause')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-pause-hud')?.addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume-game')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit-main')?.addEventListener('click', () => this.quitToMain());

    // Sound Toggle
    const handleSoundToggle = () => {
      this.soundMgr.toggleMute();
      this.uiMgr.updateSoundUI();
    };

    document.getElementById('btn-toggle-sound')?.addEventListener('click', handleSoundToggle);
    document.getElementById('btn-toggle-sound-hud')?.addEventListener('click', handleSoundToggle);
    document.getElementById('btn-toggle-sound-pause')?.addEventListener('click', handleSoundToggle);

    // Theme Toggle Buttons
    const handleThemeToggle = () => {
      this.uiMgr.toggleTheme((newTheme) => {
        this.setTheme(newTheme);
      });
    };

    document.getElementById('btn-toggle-theme')?.addEventListener('click', handleThemeToggle);
    document.getElementById('btn-toggle-theme-pause')?.addEventListener('click', handleThemeToggle);
    document.getElementById('btn-toggle-theme-hud')?.addEventListener('click', handleThemeToggle);

    // Tab visibility handling to prevent delta time explosion
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
      this.lastFrameTime = performance.now();
    });
  }

  public startGame() {
    this.state = 'PLAYING';
    this.currentSpeed = TRACK_SPEED_BASE;

    this.scoreMgr.resetRun();
    this.player.reset();
    
    // Initialize Starting Lives from UI selection (Default 3 lives)
    const selectedLives = this.uiMgr.selectedLives || 3;
    this.player.resetLives(selectedLives);
    this.uiMgr.updateLives(this.player.lives, this.player.maxLives);

    this.trackMgr.initTrack();

    this.uiMgr.showHUD();
    this.soundMgr.startMusic();
    this.lastFrameTime = performance.now();
  }

  public pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.uiMgr.showPauseModal();
  }

  public resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.uiMgr.hidePauseModal();
    this.lastFrameTime = performance.now();
  }

  public gameOver() {
    this.state = 'GAMEOVER';
    this.soundMgr.playCrash();
    this.cameraMgr.triggerShake(0.8);

    const isNewHighScore = this.scoreMgr.score > this.scoreMgr.highScore;
    this.scoreMgr.saveToStorage();
    const hitsTaken = this.player.maxLives - this.player.lives;
    this.uiMgr.showGameOverModal(isNewHighScore, hitsTaken);
  }

  public quitToMain() {
    this.state = 'START';
    this.soundMgr.stopMusic();
    this.uiMgr.showStartScreen();
  }

  private startRenderLoop() {
    this.lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      requestAnimationFrame(loop);

      const rawDt = (currentTime - this.lastFrameTime) * 0.001;
      this.lastFrameTime = currentTime;

      // Delta time clamping: minimum 1ms, maximum 33ms (~30 FPS floor) to prevent physics tunneling
      const dt = Math.min(Math.max(rawDt, 0.001), 0.033);

      if (this.state === 'PLAYING') {
        this.updateGameLogic(dt);
      }

      this.renderer.render(this.scene, this.cameraMgr.camera);
    };

    requestAnimationFrame(loop);
  }

  private updateGameLogic(dt: number) {
    // 1. Gradually increase track speed over distance
    this.currentSpeed = Math.min(TRACK_SPEED_MAX, TRACK_SPEED_BASE + (this.player.mesh.position.z / 150));

    // 2. Move player along track Z axis
    const prevPlayerZ = this.player.mesh.position.z;
    this.player.mesh.position.z += this.currentSpeed * dt;
    this.player.update(dt);
    const currPlayerZ = this.player.mesh.position.z;

    // Track directional shadow light to follow player tightly
    if (this.dirLight) {
      this.dirLight.position.set(
        this.player.mesh.position.x + 12,
        30,
        this.player.mesh.position.z + 15
      );
      this.dirLight.target = this.player.mesh;
    }

    // Slide ground plane forward so it never falls behind the camera
    if (this.groundMesh) {
      this.groundMesh.position.z = this.player.mesh.position.z + 500;
    }

    // Update active powerups state on player
    this.player.shieldActive = this.scoreMgr.hasPowerup('SHIELD');

    // 3. Track Manager update (recycling segments & spawning from zero-GC pools)
    this.trackMgr.update(this.player.mesh.position.z, dt);

    // 4. Optimized Spatial Collision Checks: Player vs Obstacles
    const obstacles = this.trackMgr.obstacles;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      if (!obs.active) continue;

      // Fast Z-axis spatial cull before AABB math
      const obsZ = obs.mesh.position.z;
      if (obsZ < currPlayerZ - 2 || obsZ > currPlayerZ + 12) continue;

      if (checkSweptAABBCollision(this.player.boundingBox, obs.boundingBox, prevPlayerZ, currPlayerZ)) {
        if (this.player.isInvincible) continue;

        if (this.scoreMgr.consumeShield()) {
          // Shield protected from fatal crash!
          this.trackMgr.recycleObstacle(obs);
          this.soundMgr.playShieldBreak();
          this.particleMgr.spawnBurst(this.player.mesh.position, 0x00f0ff, 30);
          this.cameraMgr.triggerShake(0.4);
        } else {
          // Deactivate hit obstacle
          this.trackMgr.recycleObstacle(obs);

          // Take damage: lose 1 life
          const remainingLives = this.player.takeDamage(1);
          this.uiMgr.updateLives(remainingLives, this.player.maxLives);
          this.uiMgr.flashDamageScreen();

          if (remainingLives <= 0) {
            this.gameOver();
          } else {
            this.soundMgr.playHit();
            this.particleMgr.spawnBurst(this.player.mesh.position, 0xff0055, 30);
            this.cameraMgr.triggerShake(0.5);
          }
        }
      }
    }

    // 5. Optimized Spatial Collision Checks: Player vs Collectibles
    const collectibles = this.trackMgr.collectibles;
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const col = collectibles[i];
      if (!col.active) continue;

      // Fast Z-axis spatial cull before AABB check
      const colZ = col.mesh.position.z;
      if (colZ < currPlayerZ - 2 || colZ > currPlayerZ + 8) continue;

      if (checkAABBCollision(this.player.boundingBox, col.boundingBox)) {
        const colPos = col.mesh.position.clone();
        const colType = col.type;
        this.trackMgr.recycleCollectible(col);

        if (colType === 'ORB') {
          this.scoreMgr.addOrb(1);
          this.soundMgr.playCoin();
          this.particleMgr.spawnBurst(colPos, 0xffaa00, 14);
        } else {
          const duration = this.shopMgr.getPowerupDuration(colType as any);
          this.scoreMgr.activatePowerup(colType as any, duration);
          this.soundMgr.playPowerup();
          this.particleMgr.spawnBurst(colPos, 0x00f0ff, 25);
        }
      }
    }

    // 6. Particle Effects Update (Bursts on ore pickup & collisions)
    this.particleMgr.update(dt);

    // 7. Camera Tracking & FOV Update
    this.cameraMgr.update(this.player.mesh.position, this.currentSpeed, dt);

    // 8. Score & HUD UI update
    const currentSectorIndex = Math.floor(this.player.mesh.position.z / 400);
    this.scoreMgr.update(dt, this.currentSpeed, this.player.mesh.position.z);
    this.uiMgr.updateHUD(this.currentSpeed, currentSectorIndex);
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.cameraMgr.resize(width, height);
    });
  }
}
