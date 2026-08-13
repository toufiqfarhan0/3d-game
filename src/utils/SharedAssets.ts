import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';
import { SEGMENT_LENGTH } from '../entities/TrackSegment';

export class SharedAssets {
  private static instance: SharedAssets;

  // ── Track Geometries ──
  public roadGeo!: THREE.PlaneGeometry;
  public bridgeDeckGeo!: THREE.BoxGeometry;
  public steelBeamGeo!: THREE.BoxGeometry;
  public pierGeo!: THREE.CylinderGeometry;
  public pierCapGeo!: THREE.BoxGeometry;
  public barrierBaseGeo!: THREE.BoxGeometry;
  public barrierTopGeo!: THREE.BoxGeometry;
  public railGeo!: THREE.CylinderGeometry;
  public hazardPlateGeo!: THREE.BoxGeometry;
  public reflectorGeo!: THREE.ConeGeometry;
  public mastGeo!: THREE.CylinderGeometry;
  public poleBaseGeo!: THREE.CylinderGeometry;
  public armGeo!: THREE.CylinderGeometry;
  public headGeo!: THREE.BoxGeometry;
  public lensGeo!: THREE.PlaneGeometry;
  public gantryLegGeo!: THREE.CylinderGeometry;
  public gantryBraceGeo!: THREE.CylinderGeometry;
  public trussTopBotGeo!: THREE.BoxGeometry;
  public strutGeo!: THREE.CylinderGeometry;
  public signGeo!: THREE.BoxGeometry;
  public catwalkGeo!: THREE.BoxGeometry;
  public spireGeo!: THREE.CylinderGeometry;
  public beaconGeo!: THREE.SphereGeometry;
  public hvacGeo!: THREE.BoxGeometry;
  public bldGeos: THREE.BoxGeometry[] = [];
  public setbackGeos: THREE.BoxGeometry[] = [];

  // ── Obstacle Geometries ──
  public lowBarrierBaseGeo!: THREE.BoxGeometry;
  public lowBarrierBoardGeo!: THREE.BoxGeometry;
  public lowBarrierPostGeo!: THREE.CylinderGeometry;
  public beaconBaseGeo!: THREE.CylinderGeometry;
  public beaconDomeGeo!: THREE.CylinderGeometry;
  public highGateColGeo!: THREE.BoxGeometry;
  public highGateFootGeo!: THREE.BoxGeometry;
  public highGatePipeGeo!: THREE.CylinderGeometry;
  public highGateFlangeGeo!: THREE.CylinderGeometry;
  public highGateBoardGeo!: THREE.BoxGeometry;
  public highGateBarGeo!: THREE.CylinderGeometry;
  public containerGeo!: THREE.BoxGeometry;
  public containerCornerGeo!: THREE.BoxGeometry;
  public containerRodGeo!: THREE.CylinderGeometry;
  public containerTopBarGeo!: THREE.BoxGeometry;
  public droneBodyGeo!: THREE.CylinderGeometry;
  public dronePodGeo!: THREE.SphereGeometry;
  public droneArmGeo!: THREE.CylinderGeometry;
  public droneMotorGeo!: THREE.CylinderGeometry;
  public dronePropGeo!: THREE.BoxGeometry;
  public droneLightBeamGeo!: THREE.ConeGeometry;

  // ── Collectible Geometries ──
  public orbCoreGeo!: THREE.SphereGeometry;
  public orbRingGeo!: THREE.TorusGeometry;
  public orbCapGeo!: THREE.CylinderGeometry;
  public shieldCoreGeo!: THREE.OctahedronGeometry;
  public shieldCageGeo!: THREE.IcosahedronGeometry;
  public multiplierCoreGeo!: THREE.CylinderGeometry;
  public multiplierCapGeo!: THREE.CylinderGeometry;
  public multiplierRingGeo!: THREE.TorusGeometry;

  // ── Track Materials ──
  public roadMatDark!: THREE.MeshStandardMaterial;
  public roadMatLight!: THREE.MeshStandardMaterial;
  public concreteMatDark!: THREE.MeshStandardMaterial;
  public concreteMatLight!: THREE.MeshStandardMaterial;
  public steelBeamMatDark!: THREE.MeshStandardMaterial;
  public steelBeamMatLight!: THREE.MeshStandardMaterial;
  public metalPoleMatDark!: THREE.MeshStandardMaterial;
  public metalPoleMatLight!: THREE.MeshStandardMaterial;
  public railMatDark!: THREE.MeshStandardMaterial;
  public railMatLight!: THREE.MeshStandardMaterial;
  public hazardMat!: THREE.MeshStandardMaterial;
  public amberReflectorMat!: THREE.MeshBasicMaterial;
  public lampGlowMatDark!: THREE.MeshBasicMaterial;
  public lampGlowMatLight!: THREE.MeshBasicMaterial;
  public redBeaconMat!: THREE.MeshBasicMaterial;
  public gantryMatDark!: THREE.MeshStandardMaterial;
  public gantryMatLight!: THREE.MeshStandardMaterial;
  public buildingMatsDark: THREE.MeshStandardMaterial[] = [];
  public buildingMatsLight: THREE.MeshStandardMaterial[] = [];

  // ── Obstacle Materials ──
  public obsSteelMat!: THREE.MeshStandardMaterial;
  public pipeMat!: THREE.MeshStandardMaterial;
  public containerMats: Record<string, THREE.MeshStandardMaterial> = {};
  public containerCornerMat!: THREE.MeshStandardMaterial;
  public droneBodyMat!: THREE.MeshStandardMaterial;
  public dronePodMat!: THREE.MeshStandardMaterial;
  public dronePropMat!: THREE.MeshBasicMaterial;
  public droneLightBeamMat!: THREE.MeshBasicMaterial;
  public amberBeaconOnMat!: THREE.MeshBasicMaterial;
  public amberBeaconOffMat!: THREE.MeshBasicMaterial;

  // ── Collectible Materials ──
  public colMetalMat!: THREE.MeshStandardMaterial;
  public colChromeMat!: THREE.MeshStandardMaterial;
  public orbCoreMat!: THREE.MeshStandardMaterial;
  public shieldCoreMat!: THREE.MeshStandardMaterial;
  public shieldCageMat!: THREE.MeshStandardMaterial;
  public multiplierCoreMat!: THREE.MeshStandardMaterial;

  private constructor() {
    this.initGeometries();
    this.initMaterials();
  }

  public static getInstance(): SharedAssets {
    if (!SharedAssets.instance) {
      SharedAssets.instance = new SharedAssets();
    }
    return SharedAssets.instance;
  }

  private initGeometries() {
    const roadWidth = 12;
    const roadLength = SEGMENT_LENGTH;

    // Track
    this.roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
    this.bridgeDeckGeo = new THREE.BoxGeometry(roadWidth + 1.6, 0.8, roadLength);
    this.steelBeamGeo = new THREE.BoxGeometry(0.5, 0.9, roadLength);
    this.pierGeo = new THREE.CylinderGeometry(1.6, 2.0, 18, 10);
    this.pierCapGeo = new THREE.BoxGeometry(11, 1.4, 3.2);
    this.barrierBaseGeo = new THREE.BoxGeometry(0.7, 0.45, roadLength);
    this.barrierTopGeo = new THREE.BoxGeometry(0.4, 0.65, roadLength);
    this.railGeo = new THREE.CylinderGeometry(0.08, 0.08, roadLength, 6);
    this.hazardPlateGeo = new THREE.BoxGeometry(0.42, 0.4, 0.8);
    this.reflectorGeo = new THREE.ConeGeometry(0.08, 0.12, 5);

    this.mastGeo = new THREE.CylinderGeometry(0.12, 0.18, 9, 6);
    this.poleBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.5, 6);
    this.armGeo = new THREE.CylinderGeometry(0.07, 0.09, 3.2, 6);
    this.headGeo = new THREE.BoxGeometry(0.8, 0.2, 0.45);
    this.lensGeo = new THREE.PlaneGeometry(0.65, 0.35);

    this.gantryLegGeo = new THREE.CylinderGeometry(0.22, 0.26, 7.5, 6);
    this.gantryBraceGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 5);
    this.trussTopBotGeo = new THREE.BoxGeometry(15.5, 0.2, 0.2);
    this.strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 5);
    this.signGeo = new THREE.BoxGeometry(9.5, 2.4, 0.4);
    this.catwalkGeo = new THREE.BoxGeometry(11, 0.12, 1.2);

    this.spireGeo = new THREE.CylinderGeometry(0.08, 0.25, 12, 5);
    this.beaconGeo = new THREE.SphereGeometry(0.2, 5, 5);
    this.hvacGeo = new THREE.BoxGeometry(2.4, 1.4, 2.0);

    // Pre-allocated skyscraper variations
    const bldSizes = [
      { w: 18, h: 50, d: 16 },
      { w: 22, h: 75, d: 18 },
      { w: 16, h: 42, d: 14 },
      { w: 24, h: 90, d: 20 },
      { w: 20, h: 60, d: 16 },
      { w: 15, h: 48, d: 15 },
    ];
    this.bldGeos = bldSizes.map(s => new THREE.BoxGeometry(s.w, s.h, s.d));
    this.setbackGeos = bldSizes.map(s => new THREE.BoxGeometry(s.w * 0.65, 8, s.d * 0.65));

    // Obstacles
    this.lowBarrierBaseGeo = new THREE.BoxGeometry(2.5, 0.5, 0.7);
    this.lowBarrierBoardGeo = new THREE.BoxGeometry(2.6, 0.45, 0.18);
    this.lowBarrierPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 6);
    this.beaconBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.15, 6);
    this.beaconDomeGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 6);

    this.highGateColGeo = new THREE.BoxGeometry(0.3, 3.4, 0.3);
    this.highGateFootGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    this.highGatePipeGeo = new THREE.CylinderGeometry(0.26, 0.26, 2.9, 10);
    this.highGateFlangeGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.12, 10);
    this.highGateBoardGeo = new THREE.BoxGeometry(2.7, 0.6, 0.12);
    this.highGateBarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5);

    this.containerGeo = new THREE.BoxGeometry(2.35, 2.4, 1.5);
    this.containerCornerGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    this.containerRodGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6);
    this.containerTopBarGeo = new THREE.BoxGeometry(2.38, 0.15, 0.15);

    this.droneBodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 6);
    this.dronePodGeo = new THREE.SphereGeometry(0.22, 8, 8);
    this.droneArmGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 5);
    this.droneMotorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 6);
    this.dronePropGeo = new THREE.BoxGeometry(0.7, 0.02, 0.08);
    this.droneLightBeamGeo = new THREE.ConeGeometry(0.6, 1.4, 10, 1, true);

    // Collectibles
    this.orbCoreGeo = new THREE.SphereGeometry(0.28, 10, 10);
    this.orbRingGeo = new THREE.TorusGeometry(0.48, 0.04, 6, 16);
    this.orbCapGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8);

    this.shieldCoreGeo = new THREE.OctahedronGeometry(0.25, 1);
    this.shieldCageGeo = new THREE.IcosahedronGeometry(0.48, 1);

    this.multiplierCoreGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8);
    this.multiplierCapGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 8);
    this.multiplierRingGeo = new THREE.TorusGeometry(0.45, 0.03, 6, 14);
  }

  private initMaterials() {
    const roadTexDark = TextureGenerator.createRoadTexture(false);
    const roadTexLight = TextureGenerator.createRoadTexture(true);
    const concreteTexDark = TextureGenerator.createConcreteTexture(false);
    const concreteTexLight = TextureGenerator.createConcreteTexture(true);
    const hazardTex = TextureGenerator.createHazardTexture();

    // Road
    this.roadMatDark = new THREE.MeshStandardMaterial({ map: roadTexDark, roughness: 0.65, metalness: 0.1 });
    this.roadMatLight = new THREE.MeshStandardMaterial({ map: roadTexLight, roughness: 0.8, metalness: 0.1 });

    // Concrete
    this.concreteMatDark = new THREE.MeshStandardMaterial({ map: concreteTexDark, roughness: 0.85, metalness: 0.15 });
    this.concreteMatLight = new THREE.MeshStandardMaterial({ map: concreteTexLight, roughness: 0.85, metalness: 0.15 });

    // Steel & metals
    this.steelBeamMatDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.35 });
    this.steelBeamMatLight = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.35 });

    this.metalPoleMatDark = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
    this.metalPoleMatLight = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });

    this.railMatDark = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    this.railMatLight = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    this.hazardMat = new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.35, metalness: 0.25 });
    this.amberReflectorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.lampGlowMatDark = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.lampGlowMatLight = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    this.redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    this.gantryMatDark = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 });
    this.gantryMatLight = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.35 });

    // Building facade materials
    for (let i = 0; i < 4; i++) {
      this.buildingMatsDark.push(
        new THREE.MeshStandardMaterial({
          map: TextureGenerator.createBuildingFacadeTexture(i, false),
          roughness: 0.5,
          metalness: 0.2,
        })
      );
      this.buildingMatsLight.push(
        new THREE.MeshStandardMaterial({
          map: TextureGenerator.createBuildingFacadeTexture(i, true),
          roughness: 0.5,
          metalness: 0.2,
        })
      );
    }

    // Obstacle materials
    this.obsSteelMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.9, roughness: 0.25 });
    this.pipeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.8, roughness: 0.3 });

    const containerColors = ['#0284c7', '#ea580c', '#15803d', '#dc2626', '#475569'];
    containerColors.forEach(hex => {
      this.containerMats[hex] = new THREE.MeshStandardMaterial({
        map: TextureGenerator.createContainerTexture(hex),
        metalness: 0.6,
        roughness: 0.45,
      });
    });

    this.containerCornerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95, roughness: 0.2 });
    this.droneBodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
    this.dronePodMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.1 });
    this.dronePropMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.droneLightBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    this.amberBeaconOnMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.amberBeaconOffMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });

    // Collectible materials
    this.colMetalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.95, roughness: 0.15 });
    this.colChromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });
    this.orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    this.shieldCoreMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 1.8,
    });
    this.shieldCageMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true,
    });
    this.multiplierCoreMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xb91c1c,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
  }
}
