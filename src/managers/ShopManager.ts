import { Skin } from '../entities/Player';

export interface UpgradeLevel {
  level: number;
  maxLevel: number;
  baseCost: number;
}

export class ShopManager {
  public upgrades = {
    magnet: { level: 1, maxLevel: 5, baseCost: 50 },
    shield: { level: 1, maxLevel: 5, baseCost: 75 },
    multiplier: { level: 1, maxLevel: 5, baseCost: 100 }
  };

  public skins: Skin[] = [
    { id: 'cyan', name: 'Neon Cyan', price: 0, primaryColor: 0x00f0ff, glowColor: 0x00ffff, equipped: true },
    { id: 'pink', name: 'Synth Pink', price: 100, primaryColor: 0xff007f, glowColor: 0xff00ff, equipped: false },
    { id: 'gold', name: 'Gold Champion', price: 250, primaryColor: 0xffaa00, glowColor: 0xffd700, equipped: false },
    { id: 'matrix', name: 'Matrix Green', price: 400, primaryColor: 0x00ff88, glowColor: 0x00ffaa, equipped: false },
    { id: 'violet', name: 'Violet Surge', price: 600, primaryColor: 0xaa00ff, glowColor: 0xdd00ff, equipped: false }
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedUpg = localStorage.getItem('cyber_runner_upgrades');
    if (savedUpg) {
      try {
        this.upgrades = JSON.parse(savedUpg);
      } catch (e) {}
    }

    const savedSkins = localStorage.getItem('cyber_runner_skins');
    if (savedSkins) {
      try {
        const parsed: Array<{ id: string; equipped: boolean }> = JSON.parse(savedSkins);
        this.skins.forEach(s => {
          const found = parsed.find(p => p.id === s.id);
          if (found) {
            s.equipped = found.equipped;
          }
        });
      } catch (e) {}
    }
  }

  public saveToStorage() {
    localStorage.setItem('cyber_runner_upgrades', JSON.stringify(this.upgrades));
    const skinState = this.skins.map(s => ({ id: s.id, equipped: s.equipped }));
    localStorage.setItem('cyber_runner_skins', JSON.stringify(skinState));
  }

  public getUpgradeCost(type: 'magnet' | 'shield' | 'multiplier'): number {
    const item = this.upgrades[type];
    return item.baseCost * item.level;
  }

  public canUpgrade(type: 'magnet' | 'shield' | 'multiplier', currentCoins: number): boolean {
    const item = this.upgrades[type];
    return item.level < item.maxLevel && currentCoins >= this.getUpgradeCost(type);
  }

  public upgrade(type: 'magnet' | 'shield' | 'multiplier', scoreMgr: any): boolean {
    if (this.canUpgrade(type, scoreMgr.totalCoinsOwned)) {
      const cost = this.getUpgradeCost(type);
      scoreMgr.totalCoinsOwned -= cost;
      scoreMgr.saveToStorage();

      this.upgrades[type].level++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public equipSkin(skinId: string): Skin | null {
    let equippedSkin: Skin | null = null;
    this.skins.forEach(s => {
      if (s.id === skinId) {
        s.equipped = true;
        equippedSkin = s;
      } else {
        s.equipped = false;
      }
    });
    this.saveToStorage();
    return equippedSkin;
  }

  public getEquippedSkin(): Skin {
    return this.skins.find(s => s.equipped) || this.skins[0];
  }

  public getPowerupDuration(type: 'magnet' | 'shield' | 'multiplier'): number {
    const baseDuration = type === 'shield' ? 1 : 8;
    return baseDuration + (this.upgrades[type].level - 1) * 2.5;
  }
}
