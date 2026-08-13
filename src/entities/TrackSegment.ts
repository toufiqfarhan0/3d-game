import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator';

export const SEGMENT_LENGTH = 40;

export class TrackSegment {
  public mesh: THREE.Group;
  public length: number = SEGMENT_LENGTH;

  private roadMat!: THREE.MeshStandardMaterial;
  private bridgeDeckMat!: THREE.MeshStandardMaterial;
  private jerseyBarrierMat!: THREE.MeshStandardMaterial;
  private metalPoleMat!: THREE.MeshStandardMaterial;
  private buildingMats: THREE.MeshStandardMaterial[] = [];

  constructor(posZ: number, themeColor: number = 0x00f0ff, isLightMode: boolean = false) {
    this.mesh = new THREE.Group();
    this.mesh.position.z = posZ;
    this.buildSegment(themeColor, isLightMode);
  }

  private buildSegment(themeColor: number, isLightMode: boolean) {
    const roadWidth = 12;
    const roadLength = SEGMENT_LENGTH;

    // ── 1. REALISTIC ASPHALT HIGHWAY ROAD DECK ────────────────────────
    const roadTex = TextureGenerator.createRoadTexture(isLightMode);
    this.roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: isLightMode ? 0.8 : 0.65,
      metalness: 0.1,
    });

    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
    const road = new THREE.Mesh(roadGeo, this.roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, roadLength / 2);
    road.receiveShadow = true;
    this.mesh.add(road);

    // ── 2. ELEVATED HIGHWAY BRIDGE STRUCTURE (CONCRETE SLAB & PIERS) ─
    const concreteTex = TextureGenerator.createConcreteTexture(isLightMode);
    this.bridgeDeckMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughness: 0.85,
      metalness: 0.15,
    });

    // Concrete Bridge Deck Slab underneath road
    const deckGeo = new THREE.BoxGeometry(roadWidth + 1.6, 0.8, roadLength);
    const bridgeDeck = new THREE.Mesh(deckGeo, this.bridgeDeckMat);
    bridgeDeck.position.set(0, -0.4, roadLength / 2);
    bridgeDeck.receiveShadow = true;
    bridgeDeck.castShadow = true;
    this.mesh.add(bridgeDeck);

    // Steel Support I-Beams underneath bridge deck
    const steelBeamMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0x475569 : 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });
    [-4, 0, 4].forEach(x => {
      const beamGeo = new THREE.BoxGeometry(0.5, 0.9, roadLength);
      const beam = new THREE.Mesh(beamGeo, steelBeamMat);
      beam.position.set(x, -1.0, roadLength / 2);
      this.mesh.add(beam);
    });

    // Massive Concrete Bridge Pier supporting column (every segment)
    const pierGeo = new THREE.CylinderGeometry(1.6, 2.0, 18, 12);
    const pier = new THREE.Mesh(pierGeo, this.bridgeDeckMat);
    pier.position.set(0, -10.0, roadLength / 2);
    pier.receiveShadow = true;
    this.mesh.add(pier);

    // Pier Crosshead (hammerhead cap)
    const capGeo = new THREE.BoxGeometry(11, 1.4, 3.2);
    const cap = new THREE.Mesh(capGeo, this.bridgeDeckMat);
    cap.position.set(0, -1.8, roadLength / 2);
    this.mesh.add(cap);

    // ── 3. REALISTIC CONCRETE JERSEY HIGHWAY BARRIERS (K-RAILS) ──────
    this.jerseyBarrierMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const hazardTex = TextureGenerator.createHazardTexture();
    const hazardMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.4,
      metalness: 0.2,
    });

    [-1, 1].forEach(side => {
      const barrierX = side * (roadWidth / 2 + 0.35);

      // Lower flared concrete base
      const baseGeo = new THREE.BoxGeometry(0.7, 0.45, roadLength);
      const bBase = new THREE.Mesh(baseGeo, this.jerseyBarrierMat);
      bBase.position.set(barrierX, 0.22, roadLength / 2);
      bBase.castShadow = true;
      bBase.receiveShadow = true;
      this.mesh.add(bBase);

      // Upper tapered concrete barrier
      const topGeo = new THREE.BoxGeometry(0.4, 0.65, roadLength);
      const bTop = new THREE.Mesh(topGeo, this.jerseyBarrierMat);
      bTop.position.set(barrierX, 0.7, roadLength / 2);
      bTop.castShadow = true;
      bTop.receiveShadow = true;
      this.mesh.add(bTop);

      // Metal crash rail tube mounted on top of concrete barrier
      const railGeo = new THREE.CylinderGeometry(0.08, 0.08, roadLength, 8);
      const railMat = new THREE.MeshStandardMaterial({
        color: isLightMode ? 0x94a3b8 : 0x64748b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(barrierX, 1.15, roadLength / 2);
      this.mesh.add(rail);

      // Hazard Warning Stripes on barrier nose ends
      for (let z = 6; z < roadLength; z += 12) {
        const hazardPlateGeo = new THREE.BoxGeometry(0.42, 0.4, 0.8);
        const hazardPlate = new THREE.Mesh(hazardPlateGeo, hazardMat);
        hazardPlate.position.set(barrierX, 0.65, z);
        this.mesh.add(hazardPlate);

        // Amber road reflector stud
        const reflectorGeo = new THREE.ConeGeometry(0.08, 0.12, 6);
        const refMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const ref = new THREE.Mesh(reflectorGeo, refMat);
        ref.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        ref.position.set(barrierX - side * 0.22, 0.8, z);
        this.mesh.add(ref);
      }
    });

    // ── 4. REALISTIC HIGHWAY COBRA-HEAD LED STREETLIGHTS ──────────────
    this.metalPoleMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0x94a3b8 : 0x334155,
      metalness: 0.85,
      roughness: 0.3,
    });

    const lampGlowMat = new THREE.MeshBasicMaterial({
      color: isLightMode ? 0xfffbeb : 0x38bdf8,
    });

    for (let z = 10; z < roadLength; z += 20) {
      [-1, 1].forEach(side => {
        const poleX = side * 7.6;
        const armDir = -side; // curves inward toward roadway

        // Tapered vertical steel mast
        const mastGeo = new THREE.CylinderGeometry(0.12, 0.18, 9, 8);
        const mast = new THREE.Mesh(mastGeo, this.metalPoleMat);
        mast.position.set(poleX, 4.5, z);
        mast.castShadow = true;
        this.mesh.add(mast);

        // Concrete pole foundation base
        const poleBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8);
        const poleBase = new THREE.Mesh(poleBaseGeo, this.jerseyBarrierMat);
        poleBase.position.set(poleX, 0.25, z);
        this.mesh.add(poleBase);

        // Curved mast arm extending over lane
        const armGeo = new THREE.CylinderGeometry(0.07, 0.09, 3.2, 8);
        const arm = new THREE.Mesh(armGeo, this.metalPoleMat);
        arm.rotation.z = armDir * (Math.PI / 3.5);
        arm.position.set(poleX + armDir * 1.3, 9.2, z);
        this.mesh.add(arm);

        // Realistic Cobra-head luminaire fixture
        const headGeo = new THREE.BoxGeometry(0.8, 0.2, 0.45);
        const head = new THREE.Mesh(headGeo, this.metalPoleMat);
        head.position.set(poleX + armDir * 2.5, 9.7, z);
        this.mesh.add(head);

        // LED light emitting lens
        const lensGeo = new THREE.PlaneGeometry(0.65, 0.35);
        const lens = new THREE.Mesh(lensGeo, lampGlowMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(poleX + armDir * 2.5, 9.58, z);
        this.mesh.add(lens);
      });
    }

    // ── 5. REALISTIC SKYSCRAPERS & URBAN METROPOLIS ARCHITECTURE ──────
    [-1, 1].forEach(side => {
      const numBuildings = 3;
      const stepZ = roadLength / numBuildings;

      for (let i = 0; i < numBuildings; i++) {
        const bldZ = i * stepZ + stepZ * 0.5 + (Math.random() - 0.5) * 6;
        const bldX = side * (18 + Math.random() * 10);
        const bldWidth = 14 + Math.random() * 12;
        const bldHeight = 35 + Math.random() * 80;
        const bldDepth = 12 + Math.random() * 10;

        const facadeTex = TextureGenerator.createBuildingFacadeTexture(i, isLightMode);
        const bldMat = new THREE.MeshStandardMaterial({
          map: facadeTex,
          roughness: 0.4,
          metalness: 0.3,
        });
        this.buildingMats.push(bldMat);

        // Main Skyscraper Tower Body
        const bldGeo = new THREE.BoxGeometry(bldWidth, bldHeight, bldDepth);
        const building = new THREE.Mesh(bldGeo, bldMat);
        building.position.set(bldX, bldHeight / 2 - 2, bldZ);
        building.castShadow = true;
        building.receiveShadow = true;
        this.mesh.add(building);

        // Architectural Rooftop Mechanical Penthouse / Setback
        const setbackH = 6 + Math.random() * 8;
        const setbackGeo = new THREE.BoxGeometry(bldWidth * 0.65, setbackH, bldDepth * 0.65);
        const setback = new THREE.Mesh(setbackGeo, this.bridgeDeckMat);
        setback.position.set(bldX, bldHeight + setbackH / 2 - 2, bldZ);
        this.mesh.add(setback);

        // Rooftop Telecommunications Tower / Spire with Blinking FAA Hazard Beacon
        const spireH = 8 + Math.random() * 12;
        const spireGeo = new THREE.CylinderGeometry(0.08, 0.25, spireH, 6);
        const spire = new THREE.Mesh(spireGeo, this.metalPoleMat);
        spire.position.set(bldX, bldHeight + setbackH + spireH / 2 - 2, bldZ);
        this.mesh.add(spire);

        // Red aviation warning beacon
        const beaconGeo = new THREE.SphereGeometry(0.2, 6, 6);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(bldX, bldHeight + setbackH + spireH - 2, bldZ);
        this.mesh.add(beacon);

        // Rooftop HVAC Industrial Vents & Chiller units
        [-1, 1].forEach(hx => {
          const hvacGeo = new THREE.BoxGeometry(2.4, 1.4, 2.0);
          const hvac = new THREE.Mesh(hvacGeo, this.metalPoleMat);
          hvac.position.set(bldX + hx * (bldWidth * 0.3), bldHeight - 1.3, bldZ);
          this.mesh.add(hvac);
        });
      }
    });

    // ── 6. OVERHEAD HIGHWAY STEEL TRUSS GANTRY & ELECTRONIC VMS SIGN ──
    if (Math.random() < 0.5) {
      this.buildOverheadSignGantry(roadLength * 0.5, themeColor, isLightMode);
    }
  }

  private buildOverheadSignGantry(z: number, themeColor: number, isLightMode: boolean) {
    const gantryMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0x64748b : 0x334155,
      metalness: 0.85,
      roughness: 0.35,
    });

    const gantryWidth = 15.5;
    const gantryHeight = 7.5;

    // Steel Tubular Support Legs on each side
    [-1, 1].forEach(side => {
      const legX = side * (gantryWidth / 2);
      const legGeo = new THREE.CylinderGeometry(0.22, 0.26, gantryHeight, 8);
      const leg = new THREE.Mesh(legGeo, gantryMat);
      leg.position.set(legX, gantryHeight / 2, z);
      leg.castShadow = true;
      this.mesh.add(leg);

      // Diagonal safety brace
      const braceGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 6);
      const brace = new THREE.Mesh(braceGeo, gantryMat);
      brace.rotation.z = side * (Math.PI / 4);
      brace.position.set(legX - side * 0.9, 1.4, z);
      this.mesh.add(brace);
    });

    // Overhead Steel Box Truss
    const trussTopGeo = new THREE.BoxGeometry(gantryWidth, 0.2, 0.2);
    const trussTop = new THREE.Mesh(trussTopGeo, gantryMat);
    trussTop.position.set(0, gantryHeight + 0.4, z);
    this.mesh.add(trussTop);

    const trussBotGeo = new THREE.BoxGeometry(gantryWidth, 0.2, 0.2);
    const trussBot = new THREE.Mesh(trussBotGeo, gantryMat);
    trussBot.position.set(0, gantryHeight - 0.4, z);
    this.mesh.add(trussBot);

    // Diagonal lattice struts
    for (let x = -gantryWidth / 2 + 1; x < gantryWidth / 2; x += 1.8) {
      const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6);
      const strut = new THREE.Mesh(strutGeo, gantryMat);
      strut.rotation.z = Math.PI / 4;
      strut.position.set(x, gantryHeight, z);
      this.mesh.add(strut);
    }

    // Overhead Highway Electronic Variable Message Sign (VMS)
    const signTexts = ['AUTOMATED HIGHWAY SYSTEM', 'EXPRESSWAY SECTOR 7', 'CAUTION: FAST DRONES', 'SPEED LIMIT 90 KM/H'];
    const signText = signTexts[Math.floor(Math.random() * signTexts.length)];
    const signTex = TextureGenerator.createHighwaySignTexture(signText, 'MAINTAIN SAFE LANE DISTANCE');

    const signGeo = new THREE.BoxGeometry(9.5, 2.4, 0.4);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.4,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, gantryHeight - 0.2, z);
    this.mesh.add(sign);

    // Maintenance Catwalk underneath sign
    const catwalkGeo = new THREE.BoxGeometry(11, 0.12, 1.2);
    const catwalk = new THREE.Mesh(catwalkGeo, gantryMat);
    catwalk.position.set(0, gantryHeight - 1.5, z);
    this.mesh.add(catwalk);
  }

  public updateTheme(isLightMode: boolean) {
    if (this.roadMat) {
      this.roadMat.map = TextureGenerator.createRoadTexture(isLightMode);
      this.roadMat.roughness = isLightMode ? 0.8 : 0.65;
      this.roadMat.needsUpdate = true;
    }
    if (this.bridgeDeckMat) {
      this.bridgeDeckMat.map = TextureGenerator.createConcreteTexture(isLightMode);
      this.bridgeDeckMat.needsUpdate = true;
    }
    if (this.jerseyBarrierMat) {
      this.jerseyBarrierMat.map = TextureGenerator.createConcreteTexture(isLightMode);
      this.jerseyBarrierMat.needsUpdate = true;
    }
    if (this.metalPoleMat) {
      this.metalPoleMat.color.setHex(isLightMode ? 0x94a3b8 : 0x334155);
      this.metalPoleMat.needsUpdate = true;
    }
    this.buildingMats.forEach((m, idx) => {
      m.map = TextureGenerator.createBuildingFacadeTexture(idx, isLightMode);
      m.needsUpdate = true;
    });
  }
}
