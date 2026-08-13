# AO RUN ⚡

[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-FF8800?style=for-the-badge&logo=webaudio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![AO Agents](https://img.shields.io/badge/Made_with-AO_Agents-00f0ff?style=for-the-badge&logo=robot&logoColor=black)](https://aoagents.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An endless, high-octane **3D sci-fi runner game** built with **Three.js**, **TypeScript**, and **Vite**. Navigate high-speed elevated expressways, dodge realistic sci-fi obstacles, collect energy data orbs, activate cyber upgrades, and experience ultra-smooth 60+ FPS gameplay.

---

## 🚀 Overview

**AO RUN** merges classic endless runner gameplay (lane shifting, jumping, sliding) with a hyper-realistic 3D expressway environment, zero-GC object pooling performance engine, tactical military HUD aesthetics, and responsive cross-platform controls.

### 🌟 Key Highlights
- **Realistic 3D Expressway & Metropolis**: 3-lane PBR asphalt with division paint, concrete K-Rail Jersey barriers, elevated bridge substructure, overhead LED gantries, cobra-head streetlights, and glowing skyscraper facades.
- **Articulated Exoskeleton Runner**: Modular character featuring carbon-fiber armor, spine vertebrae, gold reflective helmet visor, jetpack thrusters, realistic running mechanics, jump tucks, and slide friction sparks.
- **Realistic Obstacles**: Construction barricades with active flashing amber strobes, overhead industrial steam pipes with clearance telltale bars, and ISO shipping containers with twistlocks.
- **Zero-GC Performance Engine**: `SharedAssets` singleton, fixed 10-segment track pool, pre-allocated obstacle/collectible pools, $O(1)$ ring buffer particle system, capped `devicePixelRatio: 2`, and fast AABB collision math to maintain locked 60+ FPS.
- **Tactical Cyberpunk HUD**: Military-grade glassmorphic panels with polygon clip-paths (`clip-path: polygon(...)`), segmented energy cell health indicators, dynamic power-up capsules, CRT scanline overlay, reticle crosshair, and zero-padded metric score display.
- **Fully Responsive Design**: Fluid `clamp()` typography and container layouts adapting seamlessly across mobile (320px+), tablet (768px+), desktop (1024px+), and landscape viewports with `touch-action: manipulation` optimization.
- **Customizable Life Modes**: Choose between **1 Core (Hardcore)**, **3 Cores (Standard)**, or **5 Cores (Overcharged)**.
- **AO Branding**: Sleek footer badge crediting [AO (https://aoagents.dev/)](https://aoagents.dev/).

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose | Key Details |
| :--- | :--- | :--- |
| **Three.js (r160)** | 3D Graphics Engine | WebGL renderer, custom PBR materials, ACES Filmic Tone Mapping, directional shadow maps, exponential fog (`FogExp2`) |
| **TypeScript (v5.3)** | Core Logic & Systems | Strict static typing, modular object-oriented architecture, zero-alloc event handlers |
| **Vite (v5.0)** | Build Tool & Server | Instant HMR dev server, tree-shaken production bundling with ES modules |
| **Web Audio API** | Procedural Audio | Zero-dependency synthesized audio (oscillators, envelopes, gain nodes, ambient synthwave loops) |
| **Vanilla CSS3** | HUD & Tactical UI | CSS custom properties, backdrop-filter glassmorphism, polygon clip-paths, fluid `clamp()` responsive scaling |
| **AO Agents Framework** | AI Orchestration | Multi-agent autonomous system engineering by [AO](https://aoagents.dev/) |

---

## 🎮 Game Features & Mechanics

### 1. Realistic 3D Highway & Metropolis
- **3-Lane PBR Asphalt**: Division markings featuring solid yellow left edge, 2 dashed white lane lines, and solid white right shoulder.
- **Elevated Substructure**: Concrete bridge deck slab, steel I-beams, and massive cylindrical pier columns with hammerhead caps.
- **Jersey K-Rail Barriers**: Precast concrete crash barriers with hazard stripes and reflective amber markers.
- **Metropolis Backdrop**: Dense skyline of skyscrapers with window mullions, rooftop penthouses, and red FAA aviation beacons.

### 2. Obstacles & Drones
- 🚧 **Construction Barricade**: Low hazard barrier with active flashing amber strobe light (**JUMP** over).
- 💨 **Industrial Steam Pipe**: Overhead high clearance pipe with hanging warning telltale bars (**SLIDE** under).
- 📦 **ISO Shipping Container**: Heavy intermodal cargo block occupying an entire lane (**LANE SHIFT**).
- 🛸 **Autonomous Police Drone**: Quad-rotor drone with spinning blades and downward scanning light cone (**LANE SHIFT**).

### 3. Collectibles & Cyber Upgrades
- ❖ **Energy Data Orbs**: Gold octahedron gems adding $+50 \times \text{Multiplier}$ score and Orb currency.
- 🛡️ **Kinetic Shield Barrier**: Cyan wireframe sphere absorbing 1 fatal collision crash with a shield-shatter particle explosion.
- ⚡ **Quantum Score Surge**: Electric pink cone doubling score accumulation speed with a dynamic HUD timer capsule.

### 4. Zero-GC Performance Optimization
- **Shared Assets**: Pre-allocated Three.js geometries and PBR materials shared across all track segments and obstacles.
- **Track & Obstacle Pooling**: Fixed 10-segment track pool relocated ahead using `reposition()` instead of calling `scene.remove()` or `geometry.dispose()`.
- **$O(1)$ Particle Ring Buffer**: Single `THREE.Points` BufferGeometry with an 800-node ring buffer for thruster sparks, ore pickups, and slide friction sparks without runtime heap allocations.
- **Fast Collision Checks**: High-speed AABB bounding box and sphere math replacing heavy mesh raycasting.

---

## 📱 Mobile Controls & Touch Overlay

For touch-screen devices and mobile browsers:
- **Swipe Gestures**: Swipe Left/Right to change lanes, Swipe Up to jump, Swipe Down to slide.
- **On-Screen Touch Zones**: Semi-transparent tactical touch buttons for **LEFT (◀)**, **RIGHT (▶)**, **JUMP**, and **SLIDE**.
- **Touch Manipulation**: `touch-action: manipulation` enabled to prevent double-tap zoom delay or gesture conflicts.

---

## 📁 Project Architecture

```
3d-game/
├── index.html              # Entry HTML with tactical HUD & AO credit markup
├── package.json            # Project dependencies & build scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build settings
└── src/
    ├── main.ts             # Application entry point
    ├── style.css           # Tactical design tokens, clip-path panels & responsive CSS
    ├── audio/
    │   └── SoundManager.ts # Web Audio synth engine & sound manager
    ├── core/
    │   ├── CameraManager.ts# Camera tracking, speed FOV & camera shake
    │   ├── Game.ts         # Main game loop, state machine & collision solver
    │   └── InputManager.ts # Keyboard, touch gesture & mobile input dispatcher
    ├── entities/
    │   ├── Collectible.ts  # Energy Orbs, Shield, & Multiplier 3D meshes
    │   ├── Obstacle.ts      # Barricades, Steam pipes, Cargo containers & Drones
    │   ├── Player.ts        # Modular exoskeleton runner, physics & jetpack
    │   └── TrackSegment.ts  # 3-lane asphalt highway, Jersey barriers & buildings
    ├── managers/
    │   ├── ParticleManager.ts# Single BufferGeometry ring-buffer particle system
    │   ├── ScoreManager.ts   # Score, distance, orb metrics & powerup timers
    │   ├── ShopManager.ts    # Upgrades & suit customization state
    │   └── TrackManager.ts   # Zero-GC track segment recycling & pattern spawner
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
| **Toggle Audio** | — | — | `🔊 / 🔇` Audio Button |

---

## 🛠️ Setup & Development Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
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
The compiled, optimized production files will be output to the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤖 Built with Agent Orchestrator (AO)

This project was developed and orchestrated using [Agent Orchestrator (AO)](https://aoagents.dev/) — the multi-agent framework for autonomous software engineering.

<p align="center">
  Crafted with ❤️ and <a href="https://aoagents.dev/">Agent Orchestrator (AO)</a>
</p>
