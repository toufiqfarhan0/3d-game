# Cyber Runner 3D ⚡

[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-FF8800?style=for-the-badge&logo=webaudio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An endless, high-octane **3D sci-fi runner game** built with **Three.js**, **TypeScript**, and **Vite**. Navigate high-speed neon tracks, dodge procedural sci-fi obstacles, collect energy orbs, activate cyber upgrades, trigger hilarious meme sound effects, and experience the epic **Disco Ball Meme Dance Break**!

---

## 🚀 Overview

**Cyber Runner 3D** (AO RUN) combines classic endless runner mechanics (lane shifting, jumping, sliding) with modern WebGL graphics, procedural track generation, dynamic lighting, and an interactive meme sound engine. The player controls a cybernetic runner traversing infinite synthwave sectors that dynamically evolve in visual theme, speed, and difficulty as distance increases.

### Core Highlights
- **Endless Procedural Track**: Infinite track segment generation with auto-recycling and sector theme color shifts every $400\text{m}$.
- **Customizable Life Modes**: Choose between **1 Life (Hardcore)**, **3 Lives (Default)**, or **5 Lives (Casual)** with visual heart indicators and invincibility frames.
- **Power-ups & Easter Eggs**: Collect Energy Orbs, Cyber Shields, 2X Score Multipliers, and trigger the hilarious **Disco Ball Meme Dance Break**!
- **Meme Sound Effects & Audio Synthesizer**: 10 iconic meme SFX with Web Audio API procedural synthesis fallback for 100% offline, zero-latency audio generation.
- **Interactive Soundboard & Volume Controls**: Audition meme audio cues live, adjust master volume, or toggle mute via the interactive soundboard.
- **Dynamic Dual Themes**: Instant real-time toggle between **Dark Mode** (Neon Synthwave) and **Light Mode** (Clean High-Contrast).
- **Cross-Platform Responsive Controls**: Full support for Keyboard (WASD / Arrows / Space), Mobile Touch Gestures, and semi-transparent On-Screen Touch Overlay buttons.

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose | Key Details |
| :--- | :--- | :--- |
| **Three.js (r160)** | 3D WebGL Graphics Engine | Render loop, procedural meshes, ACES Filmic tone mapping, PCF soft shadow mapping, point/directional lighting |
| **TypeScript (v5.3)** | Core Logic & Architecture | Object-oriented modular design, strict static typing, event-driven input architecture |
| **Vite (v5.0)** | Build Tool & Dev Server | Fast Hot Module Replacement (HMR), optimized production ES module bundling |
| **Web Audio API** | Procedural Audio Synthesizer | Zero-external-dependency audio synthesis (sine/square/sawtooth oscillators, envelopes, 136 BPM bass loop) |
| **Vanilla CSS3** | UI & Glassmorphism | Custom CSS variables, backdrop filters, responsive flex/grid HUD, glitch text animations, theme transitions |

---

## 🎮 Key Features

### 1. Endless 3D Procedural Track & Sectors
- **Infinite Generation**: Track segments ($40\text{m}$ each) are dynamically spawned ahead of the player and recycled behind to maximize performance and maintain a zero-memory-leak profile.
- **Dynamic Sector Themes**: Every $400\text{m}$, the track seamlessly shifts color palettes across 5 distinct sci-fi sectors:
  - **Sector 1**: Neon Cyan (`#00f0ff`) — Warm Up
  - **Sector 2**: Synthwave Magenta (`#ff007f`) — City Circuit
  - **Sector 3**: Amber Matrix (`#ffaa00`) — Solar Grid
  - **Sector 4**: Emerald Grid (`#00ff88`) — Cyber Forest
  - **Sector 5**: Violet Apex (`#aa00ff`) — Hyper Drive
- **Progressive Velocity**: Track speed dynamically scales from base velocity ($28\text{ m/s}$) up to maximum velocity ($45\text{ m/s}$) as distance increases.

### 2. Player Mechanics & Movement Controls
- **Smooth 3-Lane Shifting**: Transition fluidly between Left ($X = -3.2$), Center ($X = 0$), and Right ($X = 3.2$) lanes using lerp interpolation with realistic banking/roll rotation.
- **Jumping Physics**: Jump mechanics powered by vertical velocity ($v_y = 17$) and gravity ($g = -42\text{ m/s}^2$).
- **Sliding Physics**: Ducking scale deformation ($1.1 \times 0.45 \times 1.2$), torso bend angle ($0.5\text{ rad}$), and lowered collision bounding box over a $0.65\text{s}$ duration.
- **Invincibility Frames (i-frames)**: Taking damage grants $1.5\text{s}$ of invincibility accompanied by a high-frequency ($14\text{ Hz}$) visual blinking effect to protect against multi-hit crashes.

### 3. Customizable Life Modes
Players can configure their desired difficulty mode on the Start Screen before starting a run:
- ❤️ **3 Lives (Default Mode)**: Standard arcade experience with heart HUD tracking and i-frame recovery.
- 💀 **1 Life (Hardcore Mode)**: A single obstacle collision instantly ends the run.
- 🛡️ **5 Lives (Casual Mode)**: High forgiveness mode designed for casual play, testing, and high-score grinding.

### 4. Collectibles & Power-ups
- 🌟 **Energy Orbs**: Gold octahedron gems with surrounding neon halos. Grants $+50 \times \text{Multiplier}$ score points and increases Orb count.
- 🛡️ **Cyber Shield**: Cyan wireframe icosahedron sphere. Completely absorbs 1 fatal collision accompanied by a shield shatter particle explosion.
- ⚡ **2X Score Multiplier**: Electric pink double-cone gem. Doubles score accumulation speed with an active HUD timer bar.
- 🪩 **Disco Ball Meme Dance Break**: A rare special collectible that triggers dynamic party lights, a spinning mirror disco ball, a custom dance groove animation, and an energetic meme music celebration!

### 5. Procedural Obstacles
- 🛑 **Low Barrier**: Neon pink hurdle requiring a **JUMP**.
- 🪟 **High Laser Gate**: Amber energy barrier requiring a **SLIDE**.
- 📦 **Full Lane Block**: Cyber neon crate blocking an entire lane, requiring a **LANE SHIFT**.
- 🛸 **Moving Drone**: Electric violet drone oscillating horizontally across adjacent lanes.
- ⚡ **Laser Barrier**: Dual-column laser fence spanning multiple lanes.

---

## 🔊 Meme Sound System & Web Audio API Engine

Cyber Runner 3D features a dual-layer audio architecture: an **Interactive Meme Sound Effects System** and an offline **Web Audio API Procedural Synthesizer**.

### 10 Iconic Meme Sound Effects & Triggers
1. 🏃 **Game Start:** *"RUN"* Vine Meme
2. 💔 **1st Life Lost:** *"They ask you how you are... fine"* Melancholic reaction
3. 💻 **2nd Life Lost:** Windows XP Error sound
4. 🎬 **Game Over:** *Directed by Robert B. Weide* Theme
5. 🗿 **Move Left:** *"Bruh"* Meme Sound Effect
6. 😱 **Move Right:** *"Are Baap Re"* Meme Sound
7. 🥊 **Jump:** Classic Arcade Punch Impact Sound Effect
8. ❓ **Slide:** *"Aayein"* / *"Huh?"* (50/50 Random Selection)
9. 💨 **Coin Pickup:** *"Faaah"* Meme Sound
10. 🚗 **Dance Break:** *"Deja Vu"* Eurobeat Meme Track

### Web Audio API Fallback Synthesizer
To guarantee **100% offline operation** with **zero latency** and zero external audio file dependencies, `SoundManager` includes a procedural synthesizer:
- **Orb Pickup**: Dual-frequency sine wave sweep ($987.77\text{ Hz} \to 1318.51\text{ Hz}$).
- **Jump SFX**: Square wave frequency ramp ($150\text{ Hz} \to 450\text{ Hz}$).
- **Slide SFX**: Triangle wave frequency drop ($300\text{ Hz} \to 100\text{ Hz}$).
- **Powerup Arpeggio**: Ascending 4-note chord progression (C5 $\to$ E5 $\to$ G5 $\to$ C6).
- **Hit / Crash**: Heavy sawtooth wave frequency drop with exponential gain decay.
- **Synthwave Bass Loop**: 136 BPM pulse loop generating an A2 synth bass pattern.

### Interactive Meme Soundboard & Volume Controls
- **Meme Soundboard Modal**: Audition and test all 10 meme sound effects live directly from the settings modal.
- **Master Volume Slider**: Real-time gain control (`0%` to `100%`) with automatic state saving in `localStorage`.
- **Floating Meme Toast Badges**: In-game visual badge popups (*"BRUH!"*, *"AAYEIN!"*, *"FAAAH!"*) when meme sounds trigger.

---

## 🌗 Dynamic Dual Themes (Dark / Light)

- **Dark Theme (Default)**: Deep space canvas background (`#050713`), vibrant neon cyan/magenta lighting, glowing track rails, and synthwave visuals.
- **Light Theme**: Clean slate backdrop (`#e2e8f0`), neutral daylight directional lighting, and dark slate track surface for maximum daytime visibility.
- **State Persistence**: Theme preference is automatically saved in `localStorage` (`cyber_runner_theme`).

---

## 📱 Mobile Controls & Touch Overlay

Optimized for mobile browsers and touch-screen devices:
- **Touch Gestures**: Swipe Left / Right to shift lanes, Swipe Up to jump, and Swipe Down to slide.
- **On-Screen Touch Controls**: Dedicated semi-transparent touch overlay buttons (`◀`, `▶`, `JUMP`, `SLIDE`) for direct touch interaction.

---

## 📁 Project Architecture

```
cyber-runner-3d/
├── index.html              # Entry HTML file with WebGL canvas, HUD overlays & modals
├── package.json            # Project manifest & dependency configuration
├── tsconfig.json           # TypeScript strict compilation settings
├── vite.config.ts          # Vite server & production build configuration
└── src/
    ├── main.ts             # Application entry point instantiating core Game engine
    ├── style.css           # CSS design tokens, glassmorphic UI, responsive layouts & themes
    ├── audio/
    │   └── SoundManager.ts # Singleton audio manager & Web Audio API synthesizer engine
    ├── core/
    │   ├── CameraManager.ts# Third-person camera tracking, speed FOV scaling & camera shake
    │   ├── Game.ts         # Central game loop, state machine & collision solver
    │   └── InputManager.ts # Keyboard, touch gesture & UI button event dispatcher
    ├── entities/
    │   ├── Collectible.ts  # Energy Orbs, Cyber Shield & Score Multiplier 3D meshes
    │   ├── Obstacle.ts      # Low barriers, High laser gates, Full blocks, Drones & Lasers
    │   ├── Player.ts        # Modular 3D player mesh, physics, lane shifting, ducking & i-frames
    │   └── TrackSegment.ts  # Procedural track floor, neon rails, lane markers & side buildings
    ├── managers/
    │   ├── ParticleManager.ts# Particle pool for explosions, shield shatters & speed lines
    │   ├── ScoreManager.ts   # Score calculation, distance tracking & power-up durations
    │   ├── ShopManager.ts    # Upgrades & skin customization state management
    │   └── TrackManager.ts   # Segment recycling, sector theme shifts & obstacle spawner
    ├── ui/
    │   └── UIManager.ts    # HUD overlay, life mode selector, theme toggles & modals
    └── utils/
        └── MathUtils.ts     # AABB collision math, lerp helpers & lane position constants
```

---

## 🕹️ Controls Reference

| Action | Keyboard Input | Mobile Touch Gesture | On-Screen Touch Button |
| :--- | :--- | :--- | :--- |
| **Move Left** | `A` or `◄ Left Arrow` | Swipe Left | `◀` Touch Zone |
| **Move Right** | `D` or `► Right Arrow` | Swipe Right | `▶` Touch Zone |
| **Jump** | `W` or `▲ Up Arrow` or `Space` | Swipe Up | `JUMP` Button |
| **Slide** | `S` or `▼ Down Arrow` | Swipe Down | `SLIDE` Button |
| **Pause / Resume** | `P` or `Escape` | Tap HUD Pause Button | `⏸` Pause Button |
| **Toggle Theme** | — | — | `☀️ / 🌙` Theme Button |
| **Toggle Sound** | — | — | `🔊 / 🔇` Sound Button |

---

## 🛠️ Setup & Development Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/toufiqfarhan0/3d-game.git
cd 3d-game
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Crafted with ❤️ for high-octane 3D gaming enthusiasts!
</p>
