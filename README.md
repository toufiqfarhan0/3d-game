# AO RUN ⚡

[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-FF8800?style=for-the-badge&logo=webaudio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An endless, high-octane **3D sci-fi runner game** built with **Three.js**, **TypeScript**, and **Vite**. Navigate high-speed neon tracks, dodge procedural sci-fi obstacles, collect energy orbs, activate powerful cyber upgrades, and enjoy meme sound effects and a Disco Ball meme dance break!

---

## 🚀 Overview

**AO RUN** combines classic endless runner mechanics (lane shifting, jumping, sliding) with modern WebGL graphics, procedural track generation, dynamic lighting, and an interactive meme sound engine. The player controls a cybernetic runner traversing synthwave sectors that dynamically change visual themes, speed, and difficulty as distance increases.

### Core Highlights
- **Endless Procedural Track**: Infinite track segment generation with auto-recycling and sector theme color shifts every 400 meters.
- **Customizable Life Modes**: Choose between **1 Life (Hardcore)**, **3 Lives (Default)**, or **5 Lives (Casual)** with visual heart indicators and invincibility frames.
- **Power-ups & Easter Eggs**: Collect Energy Orbs, Cyber Shields, 2X Score Multipliers, and trigger the hilarious **Disco Ball Meme Dance Break**!
- **Meme Sound Effects & Audio Synthesizer**: 10 iconic meme SFX with Web Audio API procedural synthesis fallback for 100% offline, zero-latency audio generation.
- **Dynamic Dual Themes**: Instant toggle between **Dark Mode** (Neon Synthwave) and **Light Mode** (Clean High-Contrast) with real-time lighting adjustments.
- **Cross-Platform Responsive Controls**: Full support for Keyboard (WASD / Arrows / Space), Touch Gestures & Mobile Overlay Buttons, and Mouse interactions.

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose | Key Details |
| :--- | :--- | :--- |
| **Three.js (r160)** | 3D Graphics Engine | WebGL renderer, custom geometry construction, ACES Filmic Tone Mapping, PCF Shadow Mapping, point/hemisphere lighting |
| **TypeScript (v5.3)** | Core Logic & Architecture | Object-oriented modular design, strict static typing, event-driven input architecture |
| **Vite (v5.0)** | Build Tool & Dev Server | Fast Hot Module Replacement (HMR), optimized production bundling with ES modules |
| **Web Audio API** | Procedural Audio Engine | Zero-dependency synthesized audio (oscillators, envelopes, gain nodes, synthwave bass loops) |
| **Vanilla CSS3** | UI & Glassmorphism | CSS Custom Variables, backdrop filters, responsive flex/grid HUD, glitch titles, theme transitions |

---

## 🎮 Key Features

### 1. Endless 3D Procedural Track & Sectors
- **Infinite Generation**: Track segments ($40\text{m}$ each) are spawned ahead of the player and recycled behind to maintain high performance without memory leaks.
- **Dynamic Sector Themes**: Every $400\text{m}$, the environment seamlessly shifts between 5 sci-fi color themes:
  - **Sector 1**: Neon Cyan (`#00f0ff`) — Warm Up
  - **Sector 2**: Synthwave Magenta (`#ff007f`) — City Circuit
  - **Sector 3**: Amber Matrix (`#ffaa00`) — Solar Grid
  - **Sector 4**: Emerald Grid (`#00ff88`) — Cyber Forest
  - **Sector 5**: Violet Apex (`#aa00ff`) — Hyper Drive
- **Progressive Speed Scaling**: Speed dynamically accelerates from base speed ($28\text{ m/s}$) up to maximum speed ($45\text{ m/s}$) as distance increases.

### 2. Player Mechanics & Movement Controls
- **Smooth 3-Lane Shifting**: Player switches between Left ($X = -3.2$), Center ($X = 0$), and Right ($X = 3.2$) lanes using smooth lerp interpolation and bank/roll angles.
- **Jumping**: Jump physics powered by vertical velocity ($v_y = 17$) and gravity ($g = -42\text{ m/s}^2$).
- **Sliding**: Ducking scale deformation ($1.1 \times 0.45 \times 1.2$), torso bend angle ($0.5\text{ rad}$), and collision height reduction over $0.65\text{s}$ duration.
- **Invincibility Frames (i-frames)**: Upon taking damage, the player gains $1.5\text{s}$ of invincibility accompanied by a high-frequency ($14\text{ Hz}$) visual blinking animation to prevent multi-hit crashes.

### 3. Customizable Life Modes
Players can configure their desired difficulty on the Start Screen before running:
- ❤️ **3 Lives (Default Mode)**: Balanced runner experience with heart HUD tracking and i-frame recovery.
- 💀 **1 Life (Hardcore Mode)**: One collision instantly ends the run for maximum challenge.
- 🛡️ **5 Lives (Casual Mode)**: For forgiving exploration and high-score grinding.

### 4. Collectibles & Power-ups
- 🌟 **Energy Orbs**: Gold octahedron gems with surrounding neon halos. Adds $+50 \times \text{Multiplier}$ score and increases Orb currency.
- 🛡️ **Cyber Shield**: Cyan wireframe icosahedron sphere. Completely absorbs 1 fatal obstacle collision with shield-shatter particle explosion.
- ⚡ **2X Score Multiplier**: Electric pink double-cone gem. Doubles score accumulation speed with a dynamic HUD timer bar.
- 🪩 **Disco Ball Meme Dance Break**: Rare collectible triggering dynamic party lights, floating mirror disco ball, and player dance groove!

### 5. Obstacle Types
- 🛑 **Low Barrier**: Hot pink neon hurdle requiring the player to **JUMP**.
- 🪟 **High Gate**: Electric amber laser gate requiring the player to **SLIDE**.
- 📦 **Full Block**: Cyber neon crate blocking an entire lane requiring a **LANE SHIFT**.
- 🛸 **Moving Drone**: Electric violet drone oscillating horizontally across lanes.
- ⚡ **Laser Barrier**: Dual-column high-energy laser fence spanning multiple lanes.

---

## 🔊 Meme Sound Effects System & Web Audio API Engine

AO RUN features a dual-layer audio architecture: an **Interactive Meme Sound Effects System** and a **Web Audio API Procedural Synthesizer**.

### 10 Iconic Meme Sound Effects
1. 🏃 **"RUN" Vine Meme**: High-energy panic cue.
2. 💔 **"They ask you how you are..."**: Melancholic meme reaction.
3. 💻 **Windows XP Error**: Nostalgic error chime.
4. 🎬 **Directed by Robert B. Weide**: Classic end-credits comedy anthem.
5. 🗿 **"Bruh" Sound**: Deep bass impact meme.
6. 😱 **"Are Baap Re"**: Viral Indian meme expression.
7. 🥊 **Classic Punch SFX**: Arcade impact hit.
8. ❓ **"Aayein" / "Huh?"**: Confused meme audio.
9. 💨 **"Faaah"**: High-pitch reaction sound.
10. 🚗 **"Deja Vu"**: Eurobeat drift sound byte.

### Web Audio API Fallback Synthesizer
To guarantee **100% offline compatibility** and **zero-latency audio**, the game includes a built-in Web Audio API synthesizer generating real-time sound effects:
- **Orb Pickup**: Dual-frequency sine wave sweep ($987\text{ Hz} \to 1318\text{ Hz}$).
- **Jump SFX**: Square wave frequency ramp ($150\text{ Hz} \to 450\text{ Hz}$).
- **Slide SFX**: Triangle wave frequency drop ($300\text{ Hz} \to 100\text{ Hz}$).
- **Powerup Arpeggio**: 4-note ascending chord progression (C5 $\to$ E5 $\to$ G5 $\to$ C6).
- **Hit / Crash**: Heavy sawtooth wave frequency drop with exponential gain decay.
- **Synthwave Bass Loop**: 136 BPM pulse loop playing A2 synth bass pattern.

### Interactive Meme Soundboard & Volume Slider
Access the interactive Meme Soundboard modal from the UI menu to audit sound effects, test individual meme audio cues, and adjust the master volume slider.

---

## 🌗 Visuals & Dynamic Dual Themes

### Lighting & Post-Processing
- **ACES Filmic Tone Mapping**: Exposure compensation set to $1.25$ for vivid neon pop.
- **PCF Shadow Mapping**: Dynamic 1024x1024 directional shadow camera following player movement.
- **Fog Effects**: Exponential distance fog (`FogExp2`) blending the track into background color.

### Theme Modes
- **Dark Theme (Default)**: Deep space backdrop (`#050713`), cyan/magenta hemisphere lighting, glowing neon rails.
- **Light Theme**: Clean slate backdrop (`#e2e8f0`), neutral daylight hemisphere, high-contrast dark slate track surface.

---

## 📱 Mobile Controls & Touch Overlay

For touch-screen devices and mobile browsers:
- **Swipe Gestures**: Swipe Left/Right to change lanes, Swipe Up to jump, Swipe Down to slide.
- **On-Screen Touch Buttons**: Dedicated semi-transparent touch zones for **LEFT**, **RIGHT**, **JUMP**, and **SLIDE**.

---

## 📁 Project Architecture

```
cyber-runner-3d/
├── index.html              # Entry HTML file containing Canvas & HUD/Modal UI markup
├── package.json            # Project manifest & dependency configuration
├── tsconfig.json           # TypeScript compilation settings
├── vite.config.ts          # Vite build & server configuration
└── src/
    ├── main.ts             # Application entry point instantiating Game logic
    ├── style.css           # Design tokens, glassmorphism styles & responsive CSS
    ├── audio/
    │   └── SoundManager.ts # Singleton audio controller & Web Audio synth engine
    ├── core/
    │   ├── CameraManager.ts# Third-person camera tracking, speed FOV & screen shake
    │   ├── Game.ts         # Central game loop, state machine & collision solver
    │   └── InputManager.ts # Keyboard, touch gesture & UI button input dispatcher
    ├── entities/
    │   ├── Collectible.ts  # Energy Orbs, Shield, & Multiplier 3D object meshes
    │   ├── Obstacle.ts      # Low barriers, High gates, Full blocks, Drones & Lasers
    │   ├── Player.ts        # Modular 3D player character, physics, roll & i-frames
    │   └── TrackSegment.ts  # Track floor, neon rails, lane lines & side buildings
    ├── managers/
    │   ├── ParticleManager.ts# Additive particle pool for explosions & speed lines
    │   ├── ScoreManager.ts   # Score, distance, orb counting & power-up timing
    │   ├── ShopManager.ts    # Upgrades & skin customization state management
    │   └── TrackManager.ts   # Procedural track segment recycling & pattern spawner
    └── utils/
        └── MathUtils.ts     # AABB collision detection, lerp & lane constants
```

---

## 🕹️ Controls Reference

| Action | Keyboard Input | Mobile / Touch Gesture | On-Screen UI Button |
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
The optimized production build files will be output to the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p center="align">
  Crafted with ❤️ for high-octane 3D gaming enthusiasts!
</p>
