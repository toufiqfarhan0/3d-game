import * as THREE from 'three';
import { SharedAssets } from '../utils/SharedAssets';
import { TextureGenerator } from '../utils/TextureGenerator';

export const SEGMENT_LENGTH = 40;

export class TrackSegment {
  public mesh: THREE.Group;
  public length: number = SEGMENT_LENGTH;

  private roadMesh!: THREE.Mesh;
  private bridgeDeckMesh!: THREE.Mesh;
  private steelBeamMeshes: THREE.Mesh[] = [];
  private pierMesh!: THREE.Mesh;
  private pierCapMesh!: THREE.Mesh;
  private barrierBaseMeshes: THREE.Mesh[] = [];
  private barrierTopMeshes: THREE.Mesh[] = [];
  private railMeshes: THREE.Mesh[] = [];
  private metalPoleMeshes: THREE.Mesh[] = [];
  private lampLensMeshes: THREE.Mesh[] = [];
  private gantryGroup!: THREE.Group;
  private gantrySignMesh!: THREE.Mesh;
  private gantrySignMat!: THREE.MeshStandardMaterial;
  private buildingMeshes: THREE.Mesh[] = [];

  constructor(posZ: number, themeColor: number = 0x00f0ff, isLightMode: boolean = false) {
    this.mesh = new THREE.Group();
    this.mesh.position.z = posZ;
    this.buildSegment(themeColor, isLightMode);
  }

  private buildSegment(themeColor: number, isLightMode: boolean) {
    const assets = SharedAssets.getInstance();
    const roadWidth = 12;
    const roadLength = SEGMENT_LENGTH;

    // ── 1. ROAD DECK ──────────────────────────────────────────────
    this.roadMesh = new THREE.Mesh(
      assets.roadGeo,
      isLightMode ? assets.roadMatLight : assets.roadMatDark
    );
    this.roadMesh.rotation.x = -Math.PI / 2;
    this.roadMesh.position.set(0, 0.02, roadLength / 2);
    this.roadMesh.receiveShadow = true;
    this.mesh.add(this.roadMesh);

    // ── 2. BRIDGE STRUCTURE ───────────────────────────────────────
    const concreteMat = isLightMode ? assets.concreteMatLight : assets.concreteMatDark;
    const steelBeamMat = isLightMode ? assets.steelBeamMatLight : assets.steelBeamMatDark;

    this.bridgeDeckMesh = new THREE.Mesh(assets.bridgeDeckGeo, concreteMat);
    this.bridgeDeckMesh.position.set(0, -0.4, roadLength / 2);
    this.bridgeDeckMesh.receiveShadow = true;
    this.mesh.add(this.bridgeDeckMesh);

    [-4, 0, 4].forEach(x => {
      const beam = new THREE.Mesh(assets.steelBeamGeo, steelBeamMat);
      beam.position.set(x, -1.0, roadLength / 2);
      this.steelBeamMeshes.push(beam);
      this.mesh.add(beam);
    });

    this.pierMesh = new THREE.Mesh(assets.pierGeo, concreteMat);
    this.pierMesh.position.set(0, -10.0, roadLength / 2);
    this.mesh.add(this.pierMesh);

    this.pierCapMesh = new THREE.Mesh(assets.pierCapGeo, concreteMat);
    this.pierCapMesh.position.set(0, -1.8, roadLength / 2);
    this.mesh.add(this.pierCapMesh);

    // ── 3. JERSEY BARRIERS ────────────────────────────────────────
    const railMat = isLightMode ? assets.railMatLight : assets.railMatDark;

    [-1, 1].forEach(side => {
      const barrierX = side * (roadWidth / 2 + 0.35);

      const bBase = new THREE.Mesh(assets.barrierBaseGeo, concreteMat);
      bBase.position.set(barrierX, 0.22, roadLength / 2);
      this.barrierBaseMeshes.push(bBase);
      this.mesh.add(bBase);

      const bTop = new THREE.Mesh(assets.barrierTopGeo, concreteMat);
      bTop.position.set(barrierX, 0.7, roadLength / 2);
      this.barrierTopMeshes.push(bTop);
      this.mesh.add(bTop);

      const rail = new THREE.Mesh(assets.railGeo, railMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(barrierX, 1.15, roadLength / 2);
      this.railMeshes.push(rail);
      this.mesh.add(rail);

      for (let z = 6; z < roadLength; z += 12) {
        const hazardPlate = new THREE.Mesh(assets.hazardPlateGeo, assets.hazardMat);
        hazardPlate.position.set(barrierX, 0.65, z);
        this.mesh.add(hazardPlate);

        const ref = new THREE.Mesh(assets.reflectorGeo, assets.amberReflectorMat);
        ref.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        ref.position.set(barrierX - side * 0.22, 0.8, z);
        this.mesh.add(ref);
      }
    });

    // ── 4. STREETLIGHTS ───────────────────────────────────────────
    const metalPoleMat = isLightMode ? assets.metalPoleMatLight : assets.metalPoleMatDark;
    const lampGlowMat = isLightMode ? assets.lampGlowMatLight : assets.lampGlowMatDark;

    for (let z = 10; z < roadLength; z += 20) {
      [-1, 1].forEach(side => {
        const poleX = side * 7.6;
        const armDir = -side;

        const mast = new THREE.Mesh(assets.mastGeo, metalPoleMat);
        mast.position.set(poleX, 4.5, z);
        this.metalPoleMeshes.push(mast);
        this.mesh.add(mast);

        const poleBase = new THREE.Mesh(assets.poleBaseGeo, concreteMat);
        poleBase.position.set(poleX, 0.25, z);
        this.mesh.add(poleBase);

        const arm = new THREE.Mesh(assets.armGeo, metalPoleMat);
        arm.rotation.z = armDir * (Math.PI / 3.5);
        arm.position.set(poleX + armDir * 1.3, 9.2, z);
        this.metalPoleMeshes.push(arm);
        this.mesh.add(arm);

        const head = new THREE.Mesh(assets.headGeo, metalPoleMat);
        head.position.set(poleX + armDir * 2.5, 9.7, z);
        this.metalPoleMeshes.push(head);
        this.mesh.add(head);

        const lens = new THREE.Mesh(assets.lensGeo, lampGlowMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(poleX + armDir * 2.5, 9.58, z);
        this.lampLensMeshes.push(lens);
        this.mesh.add(lens);
      });
    }

    // ── 5. SKYSCRAPERS & URBAN BACKGROUND ─────────────────────────
    // Buildings have shadow casting and receiving disabled for ultra-high FPS
    const buildingMats = isLightMode ? assets.buildingMatsLight : assets.buildingMatsDark;
    let bldIdx = 0;

    [-1, 1].forEach(side => {
      const numBuildings = 3;
      const stepZ = roadLength / numBuildings;

      for (let i = 0; i < numBuildings; i++) {
        const geoIdx = bldIdx % assets.bldGeos.length;
        const matIdx = bldIdx % buildingMats.length;
        const bldGeo = assets.bldGeos[geoIdx];
        const bldMat = buildingMats[matIdx];

        const bldZ = i * stepZ + stepZ * 0.5;
        const bldX = side * (22 + (i % 2) * 5);
        const bldHeight = 50 + (i % 3) * 20;

        const building = new THREE.Mesh(bldGeo, bldMat);
        building.position.set(bldX, bldHeight / 2 - 2, bldZ);
        building.castShadow = false;
        building.receiveShadow = false;
        this.buildingMeshes.push(building);
        this.mesh.add(building);

        const setback = new THREE.Mesh(assets.setbackGeos[geoIdx], concreteMat);
        setback.position.set(bldX, bldHeight + 2, bldZ);
        setback.castShadow = false;
        setback.receiveShadow = false;
        this.mesh.add(setback);

        const spire = new THREE.Mesh(assets.spireGeo, metalPoleMat);
        spire.position.set(bldX, bldHeight + 12, bldZ);
        this.metalPoleMeshes.push(spire);
        this.mesh.add(spire);

        const beacon = new THREE.Mesh(assets.beaconGeo, assets.redBeaconMat);
        beacon.position.set(bldX, bldHeight + 18, bldZ);
        this.mesh.add(beacon);

        const hvac = new THREE.Mesh(assets.hvacGeo, metalPoleMat);
        hvac.position.set(bldX, bldHeight - 1.3, bldZ);
        this.metalPoleMeshes.push(hvac);
        this.mesh.add(hvac);

        bldIdx++;
      }
    });

    // ── 6. OVERHEAD GANTRY ────────────────────────────────────────
    this.buildOverheadSignGantry(roadLength * 0.5, themeColor, isLightMode);
  }

  private buildOverheadSignGantry(z: number, themeColor: number, isLightMode: boolean) {
    const assets = SharedAssets.getInstance();
    const gantryMat = isLightMode ? assets.gantryMatLight : assets.gantryMatDark;
    const gantryWidth = 15.5;
    const gantryHeight = 7.5;

    this.gantryGroup = new THREE.Group();
    this.gantryGroup.position.set(0, 0, z);

    [-1, 1].forEach(side => {
      const legX = side * (gantryWidth / 2);
      const leg = new THREE.Mesh(assets.gantryLegGeo, gantryMat);
      leg.position.set(legX, gantryHeight / 2, 0);
      leg.castShadow = true;
      this.gantryGroup.add(leg);

      const brace = new THREE.Mesh(assets.gantryBraceGeo, gantryMat);
      brace.rotation.z = side * (Math.PI / 4);
      brace.position.set(legX - side * 0.9, 1.4, 0);
      this.gantryGroup.add(brace);
    });

    const trussTop = new THREE.Mesh(assets.trussTopBotGeo, gantryMat);
    trussTop.position.set(0, gantryHeight + 0.4, 0);
    this.gantryGroup.add(trussTop);

    const trussBot = new THREE.Mesh(assets.trussTopBotGeo, gantryMat);
    trussBot.position.set(0, gantryHeight - 0.4, 0);
    this.gantryGroup.add(trussBot);

    for (let x = -gantryWidth / 2 + 1; x < gantryWidth / 2; x += 1.8) {
      const strut = new THREE.Mesh(assets.strutGeo, gantryMat);
      strut.rotation.z = Math.PI / 4;
      strut.position.set(x, gantryHeight, 0);
      this.gantryGroup.add(strut);
    }

    const signTex = TextureGenerator.createHighwaySignTexture('AUTOMATED HIGHWAY SYSTEM', 'MAINTAIN SAFE LANE DISTANCE');
    this.gantrySignMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.4,
    });
    this.gantrySignMesh = new THREE.Mesh(assets.signGeo, this.gantrySignMat);
    this.gantrySignMesh.position.set(0, gantryHeight - 0.2, 0);
    this.gantryGroup.add(this.gantrySignMesh);

    const catwalk = new THREE.Mesh(assets.catwalkGeo, gantryMat);
    catwalk.position.set(0, gantryHeight - 1.5, 0);
    this.gantryGroup.add(catwalk);

    this.mesh.add(this.gantryGroup);
  }

  public reposition(newZ: number, themeColor: number, isLightMode: boolean, hasGantry: boolean = true) {
    this.mesh.position.z = newZ;
    this.gantryGroup.visible = hasGantry;
    this.updateTheme(isLightMode);
  }

  public updateTheme(isLightMode: boolean) {
    const assets = SharedAssets.getInstance();
    const concreteMat = isLightMode ? assets.concreteMatLight : assets.concreteMatDark;
    const steelBeamMat = isLightMode ? assets.steelBeamMatLight : assets.steelBeamMatDark;
    const metalPoleMat = isLightMode ? assets.metalPoleMatLight : assets.metalPoleMatDark;
    const railMat = isLightMode ? assets.railMatLight : assets.railMatDark;
    const lampGlowMat = isLightMode ? assets.lampGlowMatLight : assets.lampGlowMatDark;
    const buildingMats = isLightMode ? assets.buildingMatsLight : assets.buildingMatsDark;

    this.roadMesh.material = isLightMode ? assets.roadMatLight : assets.roadMatDark;
    this.bridgeDeckMesh.material = concreteMat;
    this.pierMesh.material = concreteMat;
    this.pierCapMesh.material = concreteMat;

    this.steelBeamMeshes.forEach(b => { b.material = steelBeamMat; });
    this.barrierBaseMeshes.forEach(b => { b.material = concreteMat; });
    this.barrierTopMeshes.forEach(b => { b.material = concreteMat; });
    this.railMeshes.forEach(r => { r.material = railMat; });
    this.metalPoleMeshes.forEach(m => { m.material = metalPoleMat; });
    this.lampLensMeshes.forEach(l => { l.material = lampGlowMat; });

    this.buildingMeshes.forEach((b, idx) => {
      b.material = buildingMats[idx % buildingMats.length];
    });
  }
}
