export interface ActivePowerup {
  type: 'SHIELD' | 'MULTIPLIER';
  duration: number;
  maxDuration: number;
}

export class ScoreManager {
  public score: number = 0;
  public distance: number = 0;
  public coins: number = 0;
  public highScore: number = 0;
  public totalCoinsOwned: number = 0;
  public multiplier: number = 1;
  public activePowerups: Map<string, ActivePowerup> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage() {
    const hs = localStorage.getItem('cyber_runner_highscore');
    this.highScore = hs ? parseInt(hs, 10) : 0;

    const coins = localStorage.getItem('cyber_runner_coins');
    this.totalCoinsOwned = coins ? parseInt(coins, 10) : 0;
  }

  public saveToStorage() {
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('cyber_runner_highscore', String(this.highScore));
    }
    localStorage.setItem('cyber_runner_coins', String(this.totalCoinsOwned));
  }

  public resetRun() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.multiplier = 1;
    this.activePowerups.clear();
  }

  public addOrb(amount: number = 1) {
    this.coins += amount;
    this.totalCoinsOwned += amount;
    this.score += 50 * this.multiplier;
    this.saveToStorage();
  }

  public activatePowerup(type: 'SHIELD' | 'MULTIPLIER', durationSec: number) {
    this.activePowerups.set(type, {
      type,
      duration: durationSec,
      maxDuration: durationSec
    });

    if (type === 'MULTIPLIER') {
      this.multiplier = 2;
    }
  }

  public hasPowerup(type: 'SHIELD' | 'MULTIPLIER'): boolean {
    return this.activePowerups.has(type);
  }

  public consumeShield(): boolean {
    if (this.activePowerups.has('SHIELD')) {
      this.activePowerups.delete('SHIELD');
      return true;
    }
    return false;
  }

  public update(dt: number, currentSpeed: number, playerZ: number) {
    // 1. Distance & Score accumulation based on speed
    this.distance = Math.floor(playerZ);
    this.score += currentSpeed * dt * 2.5 * this.multiplier;

    // 2. Powerup Timers update
    this.activePowerups.forEach((pu, key) => {
      if (key !== 'SHIELD') { // Shield stays until consumed by collision
        pu.duration -= dt;
        if (pu.duration <= 0) {
          if (key === 'MULTIPLIER') this.multiplier = 1;
          this.activePowerups.delete(key);
        }
      }
    });

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }
  }
}
