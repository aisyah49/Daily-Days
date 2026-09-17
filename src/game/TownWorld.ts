import * as THREE from 'three';
import { InteractionTarget } from '../types';
import {
  buildDenseResidentialArea,
  buildHospitalCisini,
  buildIndoaprilMart,
  buildMotorcycleGarage,
  buildKopiSenjaCafe,
} from './TownDistrictBuilder';

export interface WorldProps {
  scene: THREE.Scene;
  colliders: THREE.Box3[];
  interactiveTargets: InteractionTarget[];
  streetLamps: THREE.PointLight[];
}

export function buildCisiniWorld(scene: THREE.Scene): {
  colliders: THREE.Box3[];
  walkableMeshes: THREE.Object3D[];
  interactiveTargets: InteractionTarget[];
  streetLamps: THREE.PointLight[];
  setDayNightLighting: (period: string) => void;
  updateParticles: (delta: number) => void;
  fountainWater: THREE.Mesh;
} {
  const colliders: THREE.Box3[] = [];
  const walkableMeshes: THREE.Object3D[] = [];
  const interactiveTargets: InteractionTarget[] = [];
  const streetLamps: THREE.PointLight[] = [];

  const pendingColliders: { mesh: THREE.Object3D; padding: number }[] = [];
  // Helper to register solid physics box
  const addCollider = (mesh: THREE.Object3D, padding: number = 0.15) => {
    pendingColliders.push({ mesh, padding });
  };

  // Reusable Materials
  const roadMat = new THREE.MeshLambertMaterial({ color: '#333842' });
  const curbMat = new THREE.MeshLambertMaterial({ color: '#f3f4f6' });
  const sidewalkMat = new THREE.MeshLambertMaterial({ color: '#c4b5a5' });
  const grassMat = new THREE.MeshLambertMaterial({ color: '#4d7c0f' });
  const plazaStoneMat = new THREE.MeshLambertMaterial({ color: '#d1c7bd' });
  const brickWallMat = new THREE.MeshLambertMaterial({ color: '#9a3412' });
  const roofTileMat = new THREE.MeshLambertMaterial({ color: '#b91c1c' });
  const darkRoofMat = new THREE.MeshLambertMaterial({ color: '#44403c' });
  const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
  const wallWhiteMat = new THREE.MeshLambertMaterial({ color: '#f5f5f4' });
  const wallCreamMat = new THREE.MeshLambertMaterial({ color: '#fef08a' });
  const wallBlueMat = new THREE.MeshLambertMaterial({ color: '#93c5fd' });
  const waterMat = new THREE.MeshLambertMaterial({ color: '#38bdf8', transparent: true, opacity: 0.8 });
  const foliageMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
  const trunkMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
  const goldBrassMat = new THREE.MeshLambertMaterial({ color: '#eab308' });

  // 1. BASE TERRAIN & ZONES
  // Main Grass Plane
  const terrainGeom = new THREE.PlaneGeometry(160, 160);
  const terrainMesh = new THREE.Mesh(terrainGeom, grassMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);
  walkableMeshes.push(terrainMesh);

  // Central Cobblestone Plaza (Alun-Alun) - flush with gentle smooth curb
  const plazaGeom = new THREE.CylinderGeometry(20, 20, 0.04, 32);
  const plaza = new THREE.Mesh(plazaGeom, plazaStoneMat);
  plaza.position.set(0, 0.02, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);
  walkableMeshes.push(plaza);

  // Main Roads (Crossroads connecting areas)
  // Horizontal Road (East-West)
  const roadEW = new THREE.Mesh(new THREE.BoxGeometry(140, 0.03, 9), roadMat);
  roadEW.position.set(0, 0.015, 14);
  roadEW.receiveShadow = true;
  scene.add(roadEW);
  walkableMeshes.push(roadEW);

  // North-South Road
  const roadNS = new THREE.Mesh(new THREE.BoxGeometry(9, 0.03, 140), roadMat);
  roadNS.position.set(18, 0.015, 0);
  roadNS.receiveShadow = true;
  scene.add(roadNS);
  walkableMeshes.push(roadNS);

  // Zebra crossings
  for (let i = -3; i <= 3; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 6), curbMat);
    stripe.position.set(i * 1.6, 0.03, 14);
    scene.add(stripe);
  }

  // 2. CENTRAL CISINI LANDMARKS
  // Tugu Cisini (Monument)
  const monumentGroup = new THREE.Group();
  monumentGroup.position.set(0, 0, 0);

  // Low decorative stepped base (walkable & elegant)
  const tuguStepGeom = new THREE.CylinderGeometry(2.2, 2.4, 0.12, 8);
  const tuguStep = new THREE.Mesh(tuguStepGeom, plazaStoneMat);
  tuguStep.position.y = 0.06;
  tuguStep.castShadow = true;
  tuguStep.receiveShadow = true;
  monumentGroup.add(tuguStep);
  walkableMeshes.push(tuguStep);

  // Inner pedestal holding pillar (solid obstacle)
  const tuguBaseGeom = new THREE.CylinderGeometry(1.0, 1.2, 0.6, 8);
  const tuguBase = new THREE.Mesh(tuguBaseGeom, plazaStoneMat);
  tuguBase.position.y = 0.36;
  tuguBase.castShadow = true;
  tuguBase.receiveShadow = true;
  monumentGroup.add(tuguBase);

  const tuguPillarGeom = new THREE.CylinderGeometry(0.5, 0.7, 4.2, 8);
  const tuguPillar = new THREE.Mesh(tuguPillarGeom, wallWhiteMat);
  tuguPillar.position.y = 2.6;
  tuguPillar.castShadow = true;
  monumentGroup.add(tuguPillar);

  const tuguPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.1), goldBrassMat);
  tuguPlaque.position.set(0, 1.2, 0.85);
  monumentGroup.add(tuguPlaque);

  const tuguCrown = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.1, 8), goldBrassMat);
  tuguCrown.position.y = 5.2;
  tuguCrown.castShadow = true;
  monumentGroup.add(tuguCrown);

  scene.add(monumentGroup);
  addCollider(tuguBase, 0.2);

  interactiveTargets.push({
    id: 'tugu_cisini',
    type: 'inspectable',
    name: 'Prasasti Tugu Cisini',
    promptText: 'Baca Prasasti Tugu Cisini',
    position: [0, 1.0, 1.8],
    data: {
      title: 'Prasasti Tugu Peringatan Cisini',
      text: '"Diresmikan demi kebersamaan dan kedamaian seluruh warga. Dibangun di atas tanah persaudaraan tiga pilar perintis pada 16 September 1974."',
    },
  });

  // Alun-Alun Fountain (South of monument)
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(0, 0, 7);

  const basinOuter = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.7, 16), plazaStoneMat);
  basinOuter.position.y = 0.35;
  basinOuter.castShadow = true;
  fountainGroup.add(basinOuter);

  const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 16), waterMat);
  fountainWater.position.y = 0.55;
  fountainGroup.add(fountainWater);

  const jetSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8), plazaStoneMat);
  jetSpout.position.y = 0.8;
  fountainGroup.add(jetSpout);

  scene.add(fountainGroup);
  addCollider(basinOuter, 0.2);

  // 3. WARUNG MAKAN BU SITI
  const warung = new THREE.Group();
  warung.position.set(-10, 0, -8);

  const warungWalls = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 5), wallCreamMat);
  warungWalls.position.y = 1.6;
  warungWalls.castShadow = true;
  warungWalls.receiveShadow = true;
  warung.add(warungWalls);

  const warungRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), roofTileMat);
  warungRoof.position.y = 4.3;
  warungRoof.rotation.y = Math.PI / 4;
  warungRoof.castShadow = true;
  warung.add(warungRoof);

  // Warung Banner / Sign
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 512;
  bannerCanvas.height = 128;
  const bctx = bannerCanvas.getContext('2d');
  if (bctx) {
    bctx.fillStyle = '#dc2626';
    bctx.fillRect(0, 0, 512, 128);
    bctx.fillStyle = '#fef08a';
    bctx.font = 'bold 36px sans-serif';
    bctx.textAlign = 'center';
    bctx.fillText('WARUNG MAKAN BU SITI', 256, 50);
    bctx.fillStyle = '#ffffff';
    bctx.font = '24px sans-serif';
    bctx.fillText('Spesial Soto & Nasi Campur Cisini', 256, 95);
  }
  const bannerTex = new THREE.CanvasTexture(bannerCanvas);
  const bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 1.1),
    new THREE.MeshBasicMaterial({ map: bannerTex })
  );
  bannerMesh.position.set(0, 2.5, 2.55);
  warung.add(bannerMesh);

  // Outdoor wooden bench & table
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.9), woodMat);
  table.position.set(0, 0.35, 3.8);
  table.castShadow = true;
  warung.add(table);

  const bench1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.35), woodMat);
  bench1.position.set(0, 0.22, 4.6);
  bench1.castShadow = true;
  warung.add(bench1);

  // Warung Entrance Door & Sign
  const wDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.1), woodMat);
  wDoor.position.set(0, 1.1, 2.52);
  warung.add(wDoor);

  interactiveTargets.push({
    id: 'door_enter_warung',
    type: 'door',
    name: 'Pintu Masuk Warung Bu Siti',
    promptText: 'Masuk ke Dalam Warung Bu Siti',
    position: [-10, 0.8, -5.2],
    data: { targetZone: 'warung' },
  });

  scene.add(warung);
  addCollider(warungWalls);

  // 4. TOKO KELONTONG PAK JOKO
  const tokoJoko = new THREE.Group();
  tokoJoko.position.set(12, 0, -6);

  const tokoWalls = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 5), new THREE.MeshLambertMaterial({ color: '#86efac' }));
  tokoWalls.position.y = 1.6;
  tokoWalls.castShadow = true;
  tokoWalls.receiveShadow = true;
  tokoJoko.add(tokoWalls);

  const tokoRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.0, 4), roofTileMat);
  tokoRoof.position.y = 4.2;
  tokoRoof.rotation.y = Math.PI / 4;
  tokoJoko.add(tokoRoof);

  // Toko Signboard
  const tokoCanvas = document.createElement('canvas');
  tokoCanvas.width = 512;
  tokoCanvas.height = 128;
  const tctx = tokoCanvas.getContext('2d');
  if (tctx) {
    tctx.fillStyle = '#166534';
    tctx.fillRect(0, 0, 512, 128);
    tctx.fillStyle = '#fef08a';
    tctx.font = 'bold 36px sans-serif';
    tctx.textAlign = 'center';
    tctx.fillText('TOKO KELONTONG JOKO', 256, 52);
    tctx.fillStyle = '#ffffff';
    tctx.font = '22px sans-serif';
    tctx.fillText('Sembako • Minuman Dingin • Camilan', 256, 95);
  }
  const tokoTex = new THREE.CanvasTexture(tokoCanvas);
  const tokoSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.0),
    new THREE.MeshBasicMaterial({ map: tokoTex })
  );
  tokoSign.position.set(0, 2.5, 2.55);
  tokoJoko.add(tokoSign);

  scene.add(tokoJoko);
  addCollider(tokoWalls);

  // 5. DENSE RESIDENTIAL DISTRICT (Perumahan Padat Penduduk & Gang Kampung)
  buildDenseResidentialArea({ scene, addCollider, interactiveTargets });

  // Exterior Kosan Entrance Door Trigger (Kosan No. 07 Kamar Kamu)
  interactiveTargets.push({
    id: 'door_enter_kosan',
    type: 'door',
    name: 'Kosan No. 07 (Kamar Kamu)',
    promptText: 'Masuk ke Kamar Kosan Kamu',
    position: [-42, 0.8, -33.4],
    data: { targetZone: 'kosan' },
  });

  // =========================================================================
  // 5B. 3D INTERIOR ZONE: KAMAR KOSAN PRIBADI (PENGELANA CISINI)
  // Location offset: [80, 0, 80]
  // =========================================================================
  const kosanGroup = new THREE.Group();
  kosanGroup.position.set(80, 0, 80);

  // Parquet wood floor (8x8)
  const kosanFloorMat = new THREE.MeshLambertMaterial({ color: '#c29b68' });
  const kosanFloor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 8), kosanFloorMat);
  kosanFloor.position.y = 0.05;
  kosanFloor.receiveShadow = true;
  kosanGroup.add(kosanFloor);
  walkableMeshes.push(kosanFloor);

  // Ceiling
  const kosanCeiling = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 8.2), new THREE.MeshLambertMaterial({ color: '#fef3c7' }));
  kosanCeiling.position.y = 3.6;
  kosanGroup.add(kosanCeiling);

  // Ceiling Warm Lamp
  const kosanLight = new THREE.PointLight('#fef08a', 2.0, 14, 1.6);
  kosanLight.position.set(80, 3.2, 80);
  scene.add(kosanLight);
  streetLamps.push(kosanLight);

  // Kosan Interior Walls
  const kWallMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
  const kBackWall = new THREE.Mesh(new THREE.BoxGeometry(8, 3.6, 0.2), kWallMat);
  kBackWall.position.set(0, 1.8, 4);
  kosanGroup.add(kBackWall);
  addCollider(kBackWall);

  const kLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 8), kWallMat);
  kLeftWall.position.set(-4, 1.8, 0);
  kosanGroup.add(kLeftWall);
  addCollider(kLeftWall);

  const kRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 8), kWallMat);
  kRightWall.position.set(4, 1.8, 0);
  kosanGroup.add(kRightWall);
  addCollider(kRightWall);

  const kFrontL = new THREE.Mesh(new THREE.BoxGeometry(3, 3.6, 0.2), kWallMat);
  kFrontL.position.set(-2.5, 1.8, -4);
  kosanGroup.add(kFrontL);
  addCollider(kFrontL);

  const kFrontR = new THREE.Mesh(new THREE.BoxGeometry(3, 3.6, 0.2), kWallMat);
  kFrontR.position.set(2.5, 1.8, -4);
  kosanGroup.add(kFrontR);
  addCollider(kFrontR);

  const kDoorTop = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.2), kWallMat);
  kDoorTop.position.set(0, 3.0, -4);
  kosanGroup.add(kDoorTop);

  // Interior Exit Door
  const kExitDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.08), woodMat);
  kExitDoor.position.set(0, 1.2, -3.95);
  kosanGroup.add(kExitDoor);

  const kDoorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), goldBrassMat);
  kDoorKnob.position.set(0.6, 1.15, -3.88);
  kosanGroup.add(kDoorKnob);

  interactiveTargets.push({
    id: 'door_exit_kosan',
    type: 'door',
    name: 'Pintu Keluar Kosan',
    promptText: 'Keluar ke Kota Cisini',
    position: [80, 0.8, 76.5],
    data: { targetZone: 'town' },
  });

  // Bed (Kasur Nyaman Pemain)
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-2.2, 0, 2.2);
  const bFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 1.8), woodMat);
  bFrame.position.y = 0.2;
  bedGroup.add(bFrame);
  const bMat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.6), new THREE.MeshLambertMaterial({ color: '#ffffff' }));
  bMat.position.y = 0.48;
  bedGroup.add(bMat);
  const bBlanket = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.32, 1.62), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
  bBlanket.position.set(0.35, 0.50, 0);
  bedGroup.add(bBlanket);
  const bPillow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.9), new THREE.MeshLambertMaterial({ color: '#fef08a' }));
  bPillow.position.set(-0.8, 0.62, 0);
  bedGroup.add(bPillow);
  kosanGroup.add(bedGroup);
  addCollider(bFrame);

  interactiveTargets.push({
    id: 'kosan_bed',
    type: 'bed',
    name: 'Kasur Nyaman Kosan',
    promptText: 'Tidur & Istirahat (Pulihkan Energi Stamina Penuh)',
    position: [77.8, 0.8, 82.2],
    data: { action: 'sleep' },
  });

  // Big Wardrobe (Lemari Pakaian)
  const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.9), new THREE.MeshLambertMaterial({ color: '#451a03' }));
  wardrobe.position.set(2.8, 1.3, 3.4);
  kosanGroup.add(wardrobe);
  addCollider(wardrobe);

  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.8), new THREE.MeshBasicMaterial({ color: '#e0f2fe' }));
  mirror.position.set(2.8, 1.4, 2.94);
  mirror.rotation.y = Math.PI;
  kosanGroup.add(mirror);

  interactiveTargets.push({
    id: 'kosan_wardrobe',
    type: 'wardrobe',
    name: 'Lemari Pakaian Besar',
    promptText: 'Buka Lemari (Ganti Baju, Celana, Rambut & Aksesoris)',
    position: [82.8, 0.8, 82.0],
    data: { action: 'wardrobe' },
  });

  // Study Desk & Laptop
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.0), woodMat);
  desk.position.set(2.8, 0.4, -1.5);
  kosanGroup.add(desk);
  addCollider(desk);

  const deskChair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), woodMat);
  deskChair.position.set(2.8, 0.3, -0.4);
  kosanGroup.add(deskChair);

  interactiveTargets.push({
    id: 'kosan_desk',
    type: 'desk',
    name: 'Meja Kerja & Buku Catatan',
    promptText: 'Buka Buku Jurnal & Catatan Petualangan',
    position: [82.8, 0.8, 78.5],
    data: { action: 'journal' },
  });

  // Mini Fridge
  const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), new THREE.MeshLambertMaterial({ color: '#f1f5f9' }));
  fridge.position.set(-3.2, 0.55, -2.2);
  kosanGroup.add(fridge);
  addCollider(fridge);

  interactiveTargets.push({
    id: 'kosan_fridge',
    type: 'fridge',
    name: 'Kulkas Mini Kosan',
    promptText: 'Ambil Minuman Segar (+35 Stamina)',
    position: [76.8, 0.8, 77.8],
    data: { action: 'drink' },
  });

  // Center Rug
  const kRug = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 16), new THREE.MeshLambertMaterial({ color: '#059669' }));
  kRug.position.set(0, 0.11, 0.5);
  kosanGroup.add(kRug);

  scene.add(kosanGroup);

  // =========================================================================
  // 5C. 3D INTERIOR ZONE: WARUNG MAKAN BU SITI
  // Location offset: [80, 0, 120]
  // =========================================================================
  const warungGroup = new THREE.Group();
  warungGroup.position.set(80, 0, 120);

  // Warung Tile Floor (10x10)
  const wTileFloor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.1, 10),
    new THREE.MeshLambertMaterial({ color: '#e2e8f0' })
  );
  wTileFloor.position.y = 0.05;
  wTileFloor.receiveShadow = true;
  warungGroup.add(wTileFloor);
  walkableMeshes.push(wTileFloor);

  // Ceiling
  const wCeiling = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.1, 10.2), new THREE.MeshLambertMaterial({ color: '#fef3c7' }));
  wCeiling.position.y = 3.6;
  warungGroup.add(wCeiling);

  // Warm Lamps inside Warung
  const wLamp1 = new THREE.PointLight('#fef08a', 1.8, 14, 1.6);
  wLamp1.position.set(80, 3.2, 120);
  scene.add(wLamp1);
  streetLamps.push(wLamp1);

  // Warung Walls (Back, Left, Right, Front)
  const wWoodWallMat = new THREE.MeshLambertMaterial({ color: '#b45309' });
  const wBackWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3.6, 0.2), wWoodWallMat);
  wBackWall.position.set(0, 1.8, 5);
  warungGroup.add(wBackWall);
  addCollider(wBackWall);

  const wLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 10), wWoodWallMat);
  wLeftWall.position.set(-5, 1.8, 0);
  warungGroup.add(wLeftWall);
  addCollider(wLeftWall);

  const wRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 10), wWoodWallMat);
  wRightWall.position.set(5, 1.8, 0);
  warungGroup.add(wRightWall);
  addCollider(wRightWall);

  const wFrontL = new THREE.Mesh(new THREE.BoxGeometry(4, 3.6, 0.2), wWoodWallMat);
  wFrontL.position.set(-3, 1.8, -5);
  warungGroup.add(wFrontL);
  addCollider(wFrontL);

  const wFrontR = new THREE.Mesh(new THREE.BoxGeometry(4, 3.6, 0.2), wWoodWallMat);
  wFrontR.position.set(3, 1.8, -5);
  warungGroup.add(wFrontR);
  addCollider(wFrontR);

  const wDoorTop = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.2), wWoodWallMat);
  wDoorTop.position.set(0, 3.0, -5);
  warungGroup.add(wDoorTop);

  // Exit Door
  const wExitDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.08), woodMat);
  wExitDoor.position.set(0, 1.2, -4.95);
  warungGroup.add(wExitDoor);

  interactiveTargets.push({
    id: 'door_exit_warung',
    type: 'door',
    name: 'Pintu Keluar Warung',
    promptText: 'Keluar ke Alun-Alun Cisini',
    position: [80, 0.8, 115.5],
    data: { targetZone: 'town' },
  });

  // Bu Siti Cooking Counter & Cash Register
  const wCounter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.9, 1.2), woodMat);
  wCounter.position.set(-2.2, 0.45, 3.6);
  warungGroup.add(wCounter);
  addCollider(wCounter);

  // Glass Showcase for fried tempeh & bananas
  const glassCase = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.6, 0.8),
    new THREE.MeshLambertMaterial({ color: '#bae6fd', transparent: true, opacity: 0.6 })
  );
  glassCase.position.set(-3.2, 1.15, 3.6);
  warungGroup.add(glassCase);

  // Authentic Blue Kerupuk Tin Can (Kaleng Kerupuk Biru)
  const kerupukCan = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.5, 10), new THREE.MeshLambertMaterial({ color: '#2563eb' }));
  kerupukCan.position.set(-1.4, 1.15, 3.6);
  warungGroup.add(kerupukCan);

  // Big Soto Stockpot with hot soup
  const sotoPot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12), new THREE.MeshLambertMaterial({ color: '#94a3b8' }));
  sotoPot.position.set(-0.3, 1.2, 3.6);
  warungGroup.add(sotoPot);

  // Warung Job Station (Kerja di Warung)
  interactiveTargets.push({
    id: 'warung_job_station',
    type: 'job_station',
    name: 'Dapur Warung Bu Siti',
    promptText: 'Mulai Kerja Paruh Waktu di Warung (Dapatkan Koin & Makan)',
    position: [77.8, 0.8, 122.2],
    data: { jobId: 'job_warung_assistant' },
  });

  // Long Dining Tables and Benches
  const wTable1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 1.2), woodMat);
  wTable1.position.set(2.4, 0.38, 0.5);
  warungGroup.add(wTable1);
  addCollider(wTable1);

  // Bowls of Soto and Glasses of Ice Tea on Table
  const sotoBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.12, 8), new THREE.MeshLambertMaterial({ color: '#f59e0b' }));
  sotoBowl.position.set(2.2, 0.82, 0.5);
  warungGroup.add(sotoBowl);

  const esTehGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), new THREE.MeshLambertMaterial({ color: '#b45309' }));
  esTehGlass.position.set(2.7, 0.85, 0.5);
  warungGroup.add(esTehGlass);

  const wBenchL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 0.4), woodMat);
  wBenchL.position.set(2.4, 0.22, 1.4);
  warungGroup.add(wBenchL);

  const wBenchR = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 0.4), woodMat);
  wBenchR.position.set(2.4, 0.22, -0.4);
  warungGroup.add(wBenchR);

  interactiveTargets.push({
    id: 'warung_food_table',
    type: 'food_table',
    name: 'Meja Makan Warung Bu Siti',
    promptText: 'Pesan & Santap Soto Ayam Hangat (Isi Energi Penuh - Rp 15.000)',
    position: [82.4, 0.8, 120.5],
    data: { action: 'eat_soto' },
  });

  // Warung Wall Menu Banner
  const menuCanvas = document.createElement('canvas');
  menuCanvas.width = 512;
  menuCanvas.height = 256;
  const mctx = menuCanvas.getContext('2d');
  if (mctx) {
    mctx.fillStyle = '#1e1b4b';
    mctx.fillRect(0, 0, 512, 256);
    mctx.fillStyle = '#fde047';
    mctx.font = 'bold 32px sans-serif';
    mctx.fillText('MENU SPESIAL BU SITI', 40, 48);
    mctx.fillStyle = '#ffffff';
    mctx.font = '22px sans-serif';
    mctx.fillText('• Soto Ayam Kuah Kuning ... Rp 15.000', 40, 95);
    mctx.fillText('• Nasi Goreng Spesial Cisini ... Rp 18.000', 40, 135);
    mctx.fillText('• Es Teh Manis Jumbo ... Rp 5.000', 40, 175);
    mctx.fillText('• Kopi Tubruk Hangat ... Rp 6.000', 40, 215);
  }
  const menuTex = new THREE.CanvasTexture(menuCanvas);
  const menuBoard = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshBasicMaterial({ map: menuTex }));
  menuBoard.position.set(4.88, 2.0, 0.5);
  menuBoard.rotation.y = -Math.PI / 2;
  warungGroup.add(menuBoard);

  scene.add(warungGroup);

  // Pos Ronda Siskamling
  const posRonda = new THREE.Group();
  posRonda.position.set(-24, 0, -18);

  const rondaFloor = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 3), woodMat);
  rondaFloor.position.y = 0.2;
  posRonda.add(rondaFloor);

  // 4 pillars
  for (let px of [-1.2, 1.2]) {
    for (let pz of [-1.2, 1.2]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), woodMat);
      pillar.position.set(px, 1.2, pz);
      posRonda.add(pillar);
    }
  }

  const rondaRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 4), roofTileMat);
  rondaRoof.position.y = 2.9;
  rondaRoof.rotation.y = Math.PI / 4;
  posRonda.add(rondaRoof);

  // Kentongan wooden gong
  const kentongan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), woodMat);
  kentongan.position.set(1.1, 1.6, 0);
  kentongan.rotation.z = Math.PI / 2;
  posRonda.add(kentongan);

  scene.add(posRonda);
  addCollider(rondaFloor);

  // 6. SCHOOL AREA (SMP NEGERI 1 CISINI)
  const schoolGroup = new THREE.Group();
  schoolGroup.position.set(38, 0, -30);

  // Main 2-story building
  const schoolBuilding = new THREE.Mesh(new THREE.BoxGeometry(18, 6.0, 9), wallWhiteMat);
  schoolBuilding.position.y = 3.0;
  schoolBuilding.castShadow = true;
  schoolBuilding.receiveShadow = true;
  schoolGroup.add(schoolBuilding);

  const schoolRoof = new THREE.Mesh(new THREE.BoxGeometry(19, 0.6, 10), darkRoofMat);
  schoolRoof.position.y = 6.3;
  schoolGroup.add(schoolRoof);

  // School Sign
  const schCanvas = document.createElement('canvas');
  schCanvas.width = 512;
  schCanvas.height = 128;
  const sctx = schCanvas.getContext('2d');
  if (sctx) {
    sctx.fillStyle = '#1e3a8a';
    sctx.fillRect(0, 0, 512, 128);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 38px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('SMP NEGERI 1 CISINI', 256, 52);
    sctx.fillStyle = '#fde047';
    sctx.font = '22px sans-serif';
    sctx.fillText('Unggul • Santun • Berbudaya', 256, 95);
  }
  const schSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(schCanvas) })
  );
  schSign.position.set(0, 4.2, 4.55);
  schoolGroup.add(schSign);

  // Flagpole with Indonesian Flag
  const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.5, 8), wallWhiteMat);
  flagpole.position.set(-6, 3.25, 7.5);
  schoolGroup.add(flagpole);

  // Red & White Flag
  const flagRed = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.9), new THREE.MeshBasicMaterial({ color: '#dc2626' }));
  flagRed.position.set(-6, 5.8, 8.0);
  schoolGroup.add(flagRed);

  const flagWhite = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.9), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  flagWhite.position.set(-6, 5.4, 8.0);
  schoolGroup.add(flagWhite);

  // Futsal / Basketball Court
  const courtMesh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.04, 10), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
  courtMesh.position.set(4, 0.03, 9);
  courtMesh.receiveShadow = true;
  schoolGroup.add(courtMesh);

  // Basketball Hoop
  const hoopPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), new THREE.MeshLambertMaterial({ color: '#e5e7eb' }));
  hoopPole.position.set(11, 1.6, 9);
  schoolGroup.add(hoopPole);

  const backboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 1.4), wallWhiteMat);
  backboard.position.set(10.8, 2.9, 9);
  schoolGroup.add(backboard);

  scene.add(schoolGroup);
  addCollider(schoolBuilding);

  // Hidden lost whistle item for Budi near school bush
  interactiveTargets.push({
    id: 'item_peluit_kayu',
    type: 'item',
    name: 'Peluit Kayu Berkilau',
    promptText: 'Ambil Peluit Kayu Milik Budi',
    position: [24, 0.4, -27],
    data: {
      itemId: 'peluit_kayu',
      name: 'Peluit Kayu Budi',
      category: 'quest',
      description: 'Peluit kecil dari kayu jati dengan ukiran nama "Budi". Terjatuh di semak sekolah.',
      iconName: 'music',
      quantity: 1,
    },
  });

  // Visual marker for item
  const whistleMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#f59e0b' })
  );
  whistleMesh.position.set(24, 0.3, -27);
  scene.add(whistleMesh);

  // 7. TAMAN HARAPAN CISINI (The lush park)
  const parkCenter = new THREE.Vector3(-30, 0, 30);

  // Big stylized Beringin Tree (Centerpiece of park)
  const beringinGroup = new THREE.Group();
  beringinGroup.position.copy(parkCenter);

  const beringinTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 5, 8), trunkMat);
  beringinTrunk.position.y = 2.5;
  beringinTrunk.castShadow = true;
  beringinGroup.add(beringinTrunk);

  // Layered sprawling canopy
  const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(4.8, 8, 8), foliageMat);
  canopy1.position.set(0, 6.2, 0);
  canopy1.scale.set(1.4, 0.7, 1.3);
  canopy1.castShadow = true;
  beringinGroup.add(canopy1);

  const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 8), foliageMat);
  canopy2.position.set(1.5, 7.4, -1.0);
  canopy2.castShadow = true;
  beringinGroup.add(canopy2);

  scene.add(beringinGroup);
  addCollider(beringinTrunk, 0.8);

  // Park Pond with lilies
  const pond = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.0, 0.3, 16), waterMat);
  pond.position.set(-25, 0.15, 33);
  scene.add(pond);

  // Gazebo in Park
  const gazebo = new THREE.Group();
  gazebo.position.set(-36, 0, 36);

  const gzBase = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.4, 8), plazaStoneMat);
  gzBase.position.y = 0.2;
  gazebo.add(gzBase);

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 6), woodMat);
    post.position.set(Math.cos(a) * 2.6, 1.4, Math.sin(a) * 2.6);
    gazebo.add(post);
  }

  const gzRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 8), roofTileMat);
  gzRoof.position.y = 3.2;
  gazebo.add(gzRoof);

  scene.add(gazebo);
  addCollider(gzBase, 0.3);

  // 8. SHOPPING, HEALTHCARE & LIFESTYLE DISTRICT (INDOAPRIL, RS CISINI, BENGKEL MOTOR, KOPI SENJA)
  buildIndoaprilMart({ scene, addCollider, interactiveTargets });
  buildHospitalCisini({ scene, addCollider, interactiveTargets });
  buildMotorcycleGarage({ scene, addCollider, interactiveTargets });
  buildKopiSenjaCafe({ scene, addCollider, interactiveTargets });

  // 9. ALLEY (GANG DAMAI) & SECRET STOREHOUSE
  const alleyGroup = new THREE.Group();
  alleyGroup.position.set(10, 0, -42);

  // Brick walls on both sides of alley
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 3.5, 24), brickWallMat);
  wallLeft.position.set(-3.5, 1.75, 0);
  alleyGroup.add(wallLeft);
  addCollider(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(1, 3.5, 24), brickWallMat);
  wallRight.position.set(3.5, 1.75, 0);
  alleyGroup.add(wallRight);
  addCollider(wallRight);

  // Mystery graffiti on wall
  interactiveTargets.push({
    id: 'graffiti_simbol',
    type: 'inspectable',
    name: 'Goresan Simbol Kuno',
    promptText: 'Periksa Simbol di Dinding Gang',
    position: [10 - 2.8, 1.5, -42],
    data: {
      title: 'Ukiran Rahasia di Dinding Bata',
      text: 'Sebuah ukiran rahasia berbentuk tiga kelopak bunga dan jam berputar. Persis seperti sketsa simbol pendiri kota yang digambar Maya!',
    },
  });

  // Gudang Tua (Old Storehouse at the end of alley)
  const storehouse = new THREE.Group();
  storehouse.position.set(22, 0, -48);

  const shBuilding = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 7), new THREE.MeshLambertMaterial({ color: '#57534e' }));
  shBuilding.position.y = 2.25;
  shBuilding.castShadow = true;
  shBuilding.receiveShadow = true;
  storehouse.add(shBuilding);

  const shRoof = new THREE.Mesh(new THREE.ConeGeometry(6, 2.5, 4), darkRoofMat);
  shRoof.position.y = 5.2;
  shRoof.rotation.y = Math.PI / 4;
  storehouse.add(shRoof);

  // Old Storehouse Wooden Door
  const shDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), woodMat);
  shDoor.position.set(0, 1.3, 3.55);
  storehouse.add(shDoor);

  // Vintage Brass Padlock on Door
  const padlock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), goldBrassMat);
  padlock.position.set(0.4, 1.3, 3.7);
  storehouse.add(padlock);

  scene.add(storehouse);
  addCollider(shBuilding);

  // Interactive secret storehouse door
  interactiveTargets.push({
    id: 'door_gudang_tua',
    type: 'door',
    name: 'Gembok Tiga Kunci Gudang Tua',
    promptText: 'Buka Gembok Gudang Kapsul Waktu',
    position: [22, 1.3, -48 + 3.8],
    data: {
      isStorehouseDoor: true,
    },
  });

  scene.add(alleyGroup);

  // 10. OUTSKIRTS (BUKIT PINUS & SECRET LOOKOUT)
  const hillGroup = new THREE.Group();
  hillGroup.position.set(-52, 0, -50);

  // Raised hill elevation
  const hillMound = new THREE.Mesh(new THREE.CylinderGeometry(14, 18, 4, 16), grassMat);
  hillMound.position.y = 2;
  hillMound.receiveShadow = true;
  hillGroup.add(hillMound);

  // Lookout Gazebo on top of hill
  const lookoutGazebo = new THREE.Group();
  lookoutGazebo.position.set(0, 4, 0);

  const lkBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.5, 8), plazaStoneMat);
  lkBase.position.y = 0.25;
  lookoutGazebo.add(lkBase);

  // Ancient Bronze Bell in Gazebo
  const ancientBell = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 1.0, 12), goldBrassMat);
  ancientBell.position.set(0, 2.2, 0);
  lookoutGazebo.add(ancientBell);

  const lkRoof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 2.0, 8), roofTileMat);
  lkRoof.position.y = 3.6;
  lookoutGazebo.add(lkRoof);

  hillGroup.add(lookoutGazebo);

  // Ancient Stone Inscription
  interactiveTargets.push({
    id: 'prasasti_bukit',
    type: 'inspectable',
    name: 'Batu Prasasti Bukit Asri',
    promptText: 'Baca Tulisan di Prasasti Bukit',
    position: [-52, 4.5, -50 + 2.5],
    data: {
      title: 'Prasasti Batu Bukit Asri Cisini',
      text: '"Dari ketinggian ini kita melihat tempat kita bertumbuh. Jagalah setiap senyum yang ada di bawah sana, karena itulah sejatinya Cisini."',
    },
  });

  scene.add(hillGroup);
  addCollider(hillMound, 0.5);

  // 11. STREET LAMPS (With warm point lights)
  const lampPositions: [number, number][] = [
    [-6, -4], [6, -4], [-6, 10], [6, 10],
    [-20, 14], [25, 14], [-28, 22], [-35, 26],
    [10, -28], [10, -42], [32, 18], [-24, -14],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.6, 6), darkRoofMat);
    post.position.y = 1.8;
    post.castShadow = true;
    lamp.add(post);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), goldBrassMat);
    lantern.position.y = 3.6;
    lamp.add(lantern);

    const light = new THREE.PointLight('#fef08a', 1.2, 14, 1.8);
    light.position.set(lx, 3.6, lz);
    light.castShadow = false;
    scene.add(light);
    streetLamps.push(light);

    scene.add(lamp);
  });

  // 12. REST BENCHES (Player can sit and forward time)
  const benchPositions: [number, number, number, string][] = [
    [-4, 3, 0, 'Bangku Alun-Alun Cisini'],
    [-28, 26, Math.PI * 0.4, 'Bangku Taman Harapan'],
    [-52, -47, 0, 'Bangku Pemandangan Bukit'],
  ];

  benchPositions.forEach(([bx, bz, rot, bName], index) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.6), woodMat);
    bench.position.set(bx, 0.25, bz);
    bench.rotation.y = rot;
    bench.castShadow = true;
    scene.add(bench);

    interactiveTargets.push({
      id: `bench_${index}`,
      type: 'bench',
      name: bName,
      promptText: 'Duduk Santai & Atur Waktu',
      position: [bx, 0.6, bz],
      data: {
        benchName: bName,
      },
    });
  });

  // 13. SCENIC TREES & VEGETATION
  const treePositions: [number, number, number][] = [
    [-18, -6, 1.2], [-16, 2, 1.0], [18, -12, 1.1],
    [-24, 38, 1.4], [-38, 22, 1.3], [30, -18, 0.9],
    [48, -25, 1.2], [-46, -15, 1.1], [-8, 22, 1.0],
    [-48, -42, 1.5], [-58, -48, 1.3], [28, 36, 1.1],
  ];

  treePositions.forEach(([tx, tz, s]) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2.4 * s, 6), trunkMat);
    trunk.position.y = 1.2 * s;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 8, 8), foliageMat);
    foliage.position.y = 2.8 * s;
    foliage.castShadow = true;
    tree.add(foliage);

    scene.add(tree);
    addCollider(trunk, 0.2);
  });

  // Ensure entire scene world matrices are fully computed before creating collider boxes
  scene.updateMatrixWorld(true);
  pendingColliders.forEach(({ mesh, padding }) => {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    box.min.x -= padding;
    box.min.z -= padding;
    box.max.x += padding;
    box.max.z += padding;
    colliders.push(box);
  });

  // Lighting & Day/Night transitions
  const setDayNightLighting = (period: string) => {
    const isNight = period === 'Malam';
    streetLamps.forEach((lamp) => {
      lamp.intensity = isNight ? 2.2 : (period === 'Sore' ? 0.8 : 0);
    });
  };

  const updateParticles = (delta: number) => {
    // Gentle water ripple rotation
    fountainWater.rotation.y += delta * 0.4;
  };

  return {
    colliders,
    walkableMeshes,
    interactiveTargets,
    streetLamps,
    setDayNightLighting,
    updateParticles,
    fountainWater,
  };
}
