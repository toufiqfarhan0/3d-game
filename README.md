# ⚡ CYBER RUNNER 3D ⚡
> An endless, high-octane 3D sci-fi synthwave runner game built with Three.js, TypeScript, and Vite. Dodge neon obstacles, gather energy orbs, activate shields, and trigger hilarious meme sound effects!

![Cyber Runner 3D Banner](https://img.shields.io/badge/Game-Cyber_Runner_3D-00f0ff?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=for-the-badge&logo=vite)

---

## 🎮 Features & Highlights

### 🏎️ Core Gameplay & Controls
- **Procedural 3D Track Generation:** Continuous, infinitely generated track segments with dynamic lighting shifts across 5 unique sci-fi sectors (*Neon Cyclone, Synthwave City, Amber Matrix, Emerald Grid, Violet Apex*).
- **Fluid Movement Controls:**
  - **Change Lane:** `A` / `D` or `Left Arrow` / `Right Arrow`
  - **Jump:** `W` or `Up Arrow`
  - **Slide:** `S` or `Down Arrow`
  - **Pause Game:** `P` or `ESC`
- **Mobile Touch Overlay:** Built-in responsive touch buttons for mobile & tablet gameplay.

### 💖 Life Selection Modes
Customizable difficulty modes available directly from the start screen:
- ❤️ **3 Lives (Default):** Standard arcade mode with i-frame invincibility flashes upon taking damage.
- 💀 **1 Life (Hardcore):** One crash ends your run!
- 🛡️ **5 Lives (Casual):** Relaxed exploration mode for practice.

### ⚡ Collectibles & Power-Ups
- ◆ **Energy Orbs:** Collect orbs along the track to boost your score counter.
- 🛡️ **Cyber Shield:** Temporary barrier that protects from a fatal obstacle crash.
- ⚡ **Score Multiplier:** Boosts your points multiplier (`2x`) for high score runs.
- 🪩 **Disco Ball / Meme Dance Break:** Triggers a 4.5-second celebratory dance pause with party lights, floating banners, and upbeat music!

### 🔊 Meme Sound Effects & Procedural Audio Engine
Featuring **10 iconic meme sound effects** integrated across all gameplay triggers:
1. **Game Start:** *"RUN"* Vine Meme
2. **1st Life Lost:** *"They ask you how you are... fine"*
3. **2nd Life Lost:** Windows XP Startup & Error Sound
4. **Game Over:** *Directed by Robert B. Weide* Theme
5. **Move Left:** *"Bruh"* Meme Sound
6. **Move Right:** *"Are Baap Re"* Meme Sound
7. **Jump:** Punch Impact Sound Effect
8. **Slide:** *"Aayein"* & *"Huh?"* (50/50 Random Selection)
9. **Coin Pickup:** *"Faaah"* Meme Sound
10. **Dance Zone:** *"Deja Vu"* Eurobeat Meme Track

> **Web Audio API Fallback Synthesizer:** If remote audio files fail to load or are blocked by browser autoplay/CORS policies, `SoundManager` automatically switches to high-quality procedural Web Audio API sound synthesis, ensuring **100% offline & zero-latency audio reliability**.

### 🎛️ Interactive Meme Soundboard & Volume Controls
- **Meme Soundboard:** Click **▶ PLAY** on any sound in the Meme Guide Modal to test audio effects live.
- **Master Volume Slider:** Real-time gain control (`0%` to `100%`) with automatic `localStorage` persistence.
- **Floating Meme Toast Badges:** In-game visual badge popups (*"BRUH!"*, *"AAYEIN!"*, *"FAAAH!"*) when meme sounds trigger.

### 🌙 Dual Sci-Fi Themes
- **Cyber Dark Theme:** Neon cyan & magenta ambient lighting with filmic ACES tone mapping.
- **Sci-Fi Light Theme:** Clean daylight palette with soft shadow mapping.
- Toggle anytime via the Start Screen, HUD, or Pause Menu.

---

## 🛠️ Tech Stack & Architecture

| Component | Technology Used |
|-----------|-----------------|
| **Engine** | [Three.js](https://threejs.org/) (WebGL rendering, PCF shadows, FogExp2) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict typing) |
| **Bundler** | [Vite](https://vitejs.dev/) |
| **Audio Engine** | Web Audio API + HTMLAudioElement fallback system |
| **Styling** | Vanilla CSS (CSS variables, backdrop blur, glassmorphism) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/toufiqfarhan0/3d-game.git
   cd 3d-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` or `http://localhost:5173` in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
3d-game/
├── index.html               # Main UI overlays (HUD, Start, Pause, Meme Soundboard)
├── package.json             # Scripts & dependencies
├── vite.config.ts           # Vite configuration
├── src/
│   ├── main.ts              # Game entry point
│   ├── style.css            # Sci-Fi glassmorphism UI design system
│   ├── audio/
│   │   └── SoundManager.ts  # Meme sound manager & Web Audio synth engine
│   ├── core/
│   │   ├── Game.ts          # Game loop, state management, & collision handler
│   │   ├── CameraManager.ts # Dynamic third-person camera & shake effects
│   │   └── InputManager.ts  # Keyboard & mobile touch control bindings
│   ├── entities/
│   │   ├── Player.ts        # Runner mesh, movement physics, lives, & animations
│   │   ├── Obstacle.ts      # Procedural track obstacles (Barriers, Spikes)
│   │   ├── Collectible.ts   # Energy Orbs, Powerups, & Disco Ball
│   │   └── TrackSegment.ts  # Modular 3D track segments
│   ├── managers/
│   │   ├── TrackManager.ts  # Infinite procedural segment recycler & spawner
│   │   ├── ScoreManager.ts  # Distance, multipliers, coins, & localStorage high score
│   │   ├── ParticleManager.ts# Speed lines & explosion bursts
│   │   └── ShopManager.ts   # Powerup durations & skin customizer
│   └── ui/
│       └── UIManager.ts     # HUD updates, soundboard triggers, theme toggles, & toasts
```

---

## 📜 License
Licensed under the [MIT License](LICENSE).
