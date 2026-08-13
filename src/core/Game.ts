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
import { checkAABBCollision, TRACK_SPEED_BASE, TRACK_SPEED_MAX } from '../utils/MathUtils';

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

  private clock: THREE.Clock = new THREE.Clock();

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
    this.scene.background = new THREE.Color(0x050713);
    // Reduced fog density so obstacles are clearly visible from further away
    this.scene.fog = new THREE.FogExp2(0x050713, 0.006);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ACES Filmic Tone Mapping for vibrant neon glow pop
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Ambient Lighting & Hemisphere Cyan/Magenta Sci-Fi Fill Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0xaa00ff, 0.6);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    this.scene.add(dirLight);
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
    this.uiMgr = new UIManager(this.scoreMgr, this.shopMgr, this.soundMgr);

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

    // Shop Buttons
    document.getElementById('btn-open-shop')?.addEventListener('click', () => this.uiMgr.openShopModal(this.player));
    document.getElementById('btn-gameover-shop')?.addEventListener('click', () => this.uiMgr.openShopModal(this.player));
    document.getElementById('btn-close-shop')?.addEventListener('click', () => this.uiMgr.closeShopModal());

    // Upgrades Purchases
    const bindUpgBtn = (type: 'magnet' | 'shield' | 'multiplier') => {
      document.getElementById(`btn-upg-${type}`)?.addEventListener('click', () => {
        if (this.shopMgr.upgrade(type, this.scoreMgr)) {
          this.soundMgr.playPowerup();
          this.uiMgr.renderShopUI(this.player);
        }
      });
    };
    bindUpgBtn('magnet');
    bindUpgBtn('shield');
    bindUpgBtn('multiplier');

    // Sound Toggle
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      this.soundMgr.toggleMute();
      this.uiMgr.updateStartScreen();
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
    this.clock.start();
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
    this.clock.start();
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
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.1);

      if (this.state === 'PLAYING') {
        this.updateGameLogic(dt);
      }

      this.renderer.render(this.scene, this.cameraMgr.camera);
    };
    loop();
  }

  private updateGameLogic(dt: number) {
    // 1. Gradually increase track speed over distance
    this.currentSpeed = Math.min(TRACK_SPEED_MAX, TRACK_SPEED_BASE + (this.player.mesh.position.z / 150));

    // 2. Move player along track Z axis
    this.player.mesh.position.z += this.currentSpeed * dt;
    this.player.update(dt);

    // Update active powerups state on player
    this.player.shieldActive = this.scoreMgr.hasPowerup('SHIELD');
    this.player.magnetActive = this.scoreMgr.hasPowerup('MAGNET');

    // 3. Track Manager update (recycling segments & spawning)
    this.trackMgr.update(this.player.mesh.position.z, dt);

    // 4. Magnet Attractor Logic
    if (this.player.magnetActive) {
      this.trackMgr.collectibles.forEach(col => {
        if (col.active && col.type === 'ORB') {
          const dist = col.mesh.position.distanceTo(this.player.mesh.position);
          if (dist < this.player.magnetRadius) {
            col.mesh.position.lerp(this.player.mesh.position, dt * 10);
          }
        }
      });
    }

    // 5. Collision Checks: Player vs Obstacles
    this.trackMgr.obstacles.forEach(obs => {
      if (obs.active && checkAABBCollision(this.player.boundingBox, obs.boundingBox)) {
        // Skip collision if player is currently invincible (i-frame)
        if (this.player.isInvincible) return;

        if (this.scoreMgr.consumeShield()) {
          // Shield protected from fatal crash!
          obs.active = false;
          obs.mesh.visible = false;
          this.soundMgr.playShieldBreak();
          this.particleMgr.spawnBurst(this.player.mesh.position, 0x00f0ff, 30);
          this.cameraMgr.triggerShake(0.4);
        } else {
          // Deactivate hit obstacle so player doesn't continuously collide
          obs.active = false;
          obs.mesh.visible = false;

          // Take damage: lose 1 life
          const remainingLives = this.player.takeDamage(1);
          this.uiMgr.updateLives(remainingLives, this.player.maxLives);
          this.uiMgr.flashDamageScreen();

          if (remainingLives <= 0) {
            // All 3 lives lost -> Game Over!
            this.gameOver();
          } else {
            // Non-fatal hit: play hit sound effect, explosion particles, camera shake
            this.soundMgr.playHit();
            this.particleMgr.spawnBurst(this.player.mesh.position, 0xff0055, 30);
            this.cameraMgr.triggerShake(0.5);
          }
        }
      }
    });

    // 6. Collision Checks: Player vs Collectibles
    this.trackMgr.collectibles.forEach(col => {
      if (col.active && checkAABBCollision(this.player.boundingBox, col.boundingBox)) {
        col.active = false;
        col.mesh.visible = false;

        if (col.type === 'ORB') {
          this.scoreMgr.addOrb(1);
          this.soundMgr.playCoin();
          this.particleMgr.spawnBurst(col.mesh.position, 0xffaa00, 12);
        } else {
          // Power-up
          const duration = this.shopMgr.getPowerupDuration(col.type as any);
          this.scoreMgr.activatePowerup(col.type as any, duration);
          this.soundMgr.playPowerup();
          this.particleMgr.spawnBurst(col.mesh.position, 0x00f0ff, 25);
        }
      }
    });

    // 7. Particle Effects & Speed Lines
    this.particleMgr.spawnSpeedLines(this.cameraMgr.camera.position);
    this.particleMgr.update(dt);

    // 8. Camera Tracking & FOV Update
    this.cameraMgr.update(this.player.mesh.position, this.currentSpeed, dt);

    // 9. Score & HUD UI update
    const currentSectorIndex = Math.floor(this.player.mesh.position.z / 400);
    this.scoreMgr.update(dt, this.currentSpeed, this.player.mesh.position.z);
    this.uiMgr.updateHUD(this.currentSpeed, currentSectorIndex);
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.renderer.setSize(width, height);
      this.cameraMgr.resize(width, height);
    });
  }
}
