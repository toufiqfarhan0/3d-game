import { ScoreManager } from '../managers/ScoreManager';
import { SoundManager } from '../audio/SoundManager';

export class UIManager {
  private scoreMgr: ScoreManager;
  private soundMgr: SoundManager;

  public selectedLives: number = 3;
  public currentTheme: 'dark' | 'light' = 'dark';

  // DOM Elements
  private hudOverlay: HTMLElement;
  private hudScore: HTMLElement;
  private hudMultiplier: HTMLElement;
  private hudDistance: HTMLElement;
  private hudCoins: HTMLElement;
  private hudPowerups: HTMLElement;
  private levelBadge: HTMLElement;
  private hudLivesContainer: HTMLElement;
  private damageFlash: HTMLElement;

  private startScreen: HTMLElement;
  private pauseModal: HTMLElement;
  private gameoverModal: HTMLElement;
  private newRecordTag: HTMLElement;

  private startHighScore: HTMLElement;
  private goScore: HTMLElement;
  private goDist: HTMLElement;
  private goCoins: HTMLElement;
  private goHits: HTMLElement;
  private goBest: HTMLElement;

  constructor(scoreMgr: ScoreManager, soundMgr: SoundManager) {
    this.scoreMgr = scoreMgr;
    this.soundMgr = soundMgr;

    const savedTheme = localStorage.getItem('cyber_runner_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    }

    this.hudOverlay = document.getElementById('hud-overlay')!;
    this.hudScore = document.getElementById('hud-score-val')!;
    this.hudMultiplier = document.getElementById('hud-multiplier')!;
    this.hudDistance = document.getElementById('hud-dist-val')!;
    this.hudCoins = document.getElementById('hud-coins-val')!;
    this.hudPowerups = document.getElementById('hud-powerups')!;
    this.levelBadge = document.getElementById('level-badge')!;
    this.hudLivesContainer = document.getElementById('hud-lives-container')!;
    this.damageFlash = document.getElementById('damage-flash')!;

    this.startScreen = document.getElementById('start-screen')!;
    this.pauseModal = document.getElementById('pause-modal')!;
    this.gameoverModal = document.getElementById('gameover-modal')!;
    this.newRecordTag = document.getElementById('new-highscore-tag')!;

    this.startHighScore = document.getElementById('start-high-score')!;
    this.goScore = document.getElementById('go-score')!;
    this.goDist = document.getElementById('go-dist')!;
    this.goCoins = document.getElementById('go-coins')!;
    this.goHits = document.getElementById('go-hits')!;
    this.goBest = document.getElementById('go-best')!;

    this.initLifeModeSelector();
    this.applyThemeUI();
    this.updateStartScreen();
  }

  public toggleTheme(onThemeChanged?: (theme: 'dark' | 'light') => void) {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cyber_runner_theme', this.currentTheme);
    this.applyThemeUI();
    if (onThemeChanged) {
      onThemeChanged(this.currentTheme);
    }
  }

  public applyThemeUI() {
    const isLight = this.currentTheme === 'light';
    document.body.classList.toggle('light-theme', isLight);

    // Update Start screen theme button
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    if (themeIcon && themeLabel) {
      themeIcon.textContent = isLight ? '🌙' : '☀️';
      themeLabel.textContent = `THEME: ${isLight ? 'LIGHT' : 'DARK'}`;
    }

    // Update Pause screen theme button
    const themeIconPause = document.getElementById('theme-icon-pause');
    const themeLabelPause = document.getElementById('theme-label-pause');
    if (themeIconPause && themeLabelPause) {
      themeIconPause.textContent = isLight ? '🌙' : '☀️';
      themeLabelPause.textContent = `THEME: ${isLight ? 'LIGHT' : 'DARK'}`;
    }

    // Update HUD theme button
    const themeIconHud = document.getElementById('theme-icon-hud');
    if (themeIconHud) {
      themeIconHud.textContent = isLight ? '🌙' : '☀️';
    }
  }

  public updateStartScreen() {
    this.startHighScore.textContent = String(this.scoreMgr.highScore);
    const soundLabel = document.getElementById('sound-label');
    const soundIcon = document.getElementById('sound-icon');
    if (soundLabel && soundIcon) {
      soundLabel.textContent = `SOUND: ${this.soundMgr.getIsMuted() ? 'OFF' : 'ON'}`;
      soundIcon.textContent = this.soundMgr.getIsMuted() ? '🔇' : '🔊';
    }
    this.applyThemeUI();
  }

  public showStartScreen() {
    this.hudOverlay.classList.add('hidden');
    this.pauseModal.classList.add('hidden');
    this.gameoverModal.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    this.updateStartScreen();
  }

  public showHUD() {
    this.startScreen.classList.add('hidden');
    this.pauseModal.classList.add('hidden');
    this.gameoverModal.classList.add('hidden');
    this.hudOverlay.classList.remove('hidden');
  }

  public showPauseModal() {
    this.pauseModal.classList.remove('hidden');
  }

  public hidePauseModal() {
    this.pauseModal.classList.add('hidden');
  }

  private initLifeModeSelector() {
    const btns = document.querySelectorAll('.life-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const livesVal = parseInt(btn.getAttribute('data-lives') || '3', 10);
        this.selectedLives = livesVal;
      });
    });
  }

  public updateLives(currentLives: number, maxLives: number) {
    if (!this.hudLivesContainer) return;
    this.hudLivesContainer.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
      const heart = document.createElement('span');
      const isAlive = i < currentLives;
      heart.className = `heart-icon ${isAlive ? 'active' : 'lost'}`;
      heart.textContent = '❤️';
      this.hudLivesContainer.appendChild(heart);
    }
  }

  public flashDamageScreen() {
    if (!this.damageFlash) return;
    this.damageFlash.classList.add('flash-active');
    setTimeout(() => {
      this.damageFlash.classList.remove('flash-active');
    }, 150);
  }

  public showGameOverModal(isNewHighScore: boolean, hitsTaken: number = 3) {
    this.hudOverlay.classList.add('hidden');
    this.gameoverModal.classList.remove('hidden');

    this.goScore.textContent = String(Math.floor(this.scoreMgr.score));
    this.goDist.textContent = `${this.scoreMgr.distance}m`;
    this.goCoins.textContent = String(this.scoreMgr.coins);
    if (this.goHits) {
      this.goHits.textContent = `${hitsTaken} / ${this.selectedLives}`;
    }
    this.goBest.textContent = String(this.scoreMgr.highScore);

    if (isNewHighScore) {
      this.newRecordTag.classList.remove('hidden');
    } else {
      this.newRecordTag.classList.add('hidden');
    }
  }

  private _lastScore: number = -1;
  private _lastDist: number = -1;
  private _lastCoins: number = -1;
  private _lastMult: number = -1;
  private _lastSector: number = -1;

  public updateHUD(speed: number, currentSectorIndex: number) {
    const currentScore = Math.floor(this.scoreMgr.score);
    if (currentScore !== this._lastScore) {
      this._lastScore = currentScore;
      this.hudScore.textContent = String(currentScore);
    }

    const currentDist = this.scoreMgr.distance;
    if (currentDist !== this._lastDist) {
      this._lastDist = currentDist;
      this.hudDistance.textContent = `${currentDist}m`;
    }

    const currentCoins = this.scoreMgr.coins;
    if (currentCoins !== this._lastCoins) {
      this._lastCoins = currentCoins;
      this.hudCoins.textContent = String(currentCoins);
    }

    const currentMult = this.scoreMgr.multiplier;
    if (currentMult !== this._lastMult) {
      this._lastMult = currentMult;
      this.hudMultiplier.textContent = `${currentMult}x`;
    }

    if (currentSectorIndex !== this._lastSector) {
      this._lastSector = currentSectorIndex;
      const sectorNames = ['SECTOR 1 • NEON CYCLONE', 'SECTOR 2 • SYNTHWAVE CITY', 'SECTOR 3 • AMBER MATRIX', 'SECTOR 4 • EMERALD GRID', 'SECTOR 5 • VIOLET APEX'];
      this.levelBadge.textContent = sectorNames[currentSectorIndex % sectorNames.length];
    }

    // Efficient Power-up Pills update
    if (this.scoreMgr.activePowerups.size === 0) {
      if (this.hudPowerups.children.length > 0) {
        this.hudPowerups.innerHTML = '';
      }
    } else {
      this.scoreMgr.activePowerups.forEach((pu) => {
        let pill = this.hudPowerups.querySelector(`[data-type="${pu.type}"]`) as HTMLElement;
        const icons = { SHIELD: '🛡️', MULTIPLIER: '⚡' };
        const titles = { SHIELD: 'SHIELD ACTIVE', MULTIPLIER: '2X SCORE' };
        const pct = Math.max(0, Math.min(100, (pu.duration / pu.maxDuration) * 100));

        if (!pill) {
          pill = document.createElement('div');
          pill.className = 'powerup-pill';
          pill.setAttribute('data-type', pu.type);
          pill.innerHTML = `
            <span class="powerup-pill-icon">${icons[pu.type]}</span>
            <div class="powerup-pill-info">
              <span class="powerup-pill-title">${titles[pu.type]}</span>
              <div class="powerup-timer-bar">
                <div class="powerup-timer-fill"></div>
              </div>
            </div>
          `;
          this.hudPowerups.appendChild(pill);
        }

        const fill = pill.querySelector('.powerup-timer-fill') as HTMLElement;
        if (fill) {
          fill.style.width = pu.type === 'SHIELD' ? '100%' : `${pct.toFixed(1)}%`;
        }
      });

      // Remove expired pills
      const childArray = Array.from(this.hudPowerups.children);
      for (const child of childArray) {
        const type = child.getAttribute('data-type');
        if (type && !this.scoreMgr.activePowerups.has(type as any)) {
          child.remove();
        }
      }
    }
  }
}
