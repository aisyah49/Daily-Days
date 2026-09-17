import * as THREE from 'three';
import { InteractiveTarget } from '../types';

export interface DistrictBuilderParams {
  scene: THREE.Scene;
  addCollider: (mesh: THREE.Mesh | THREE.Object3D, margin?: number) => void;
  interactiveTargets: InteractiveTarget[];
}

/**
 * Builds the Dense Residential District (Daerah Padat Penduduk)
 * Features:
 * - 16+ Indonesian residential houses organized in named alleys (Gang Melati, Gang Mawar, Gang Kenanga)
 * - Paved stone alleys connecting all houses
 * - Traditional Pos Ronda with wooden kentongan and ronda bench
 * - Laundry clotheslines (jemuran baju warna-warni)
 * - Parked motorcycles (motor matic & bebek khas pemukiman)
 * - Potted terrace plants (tanaman hias & bougenville)
 * - Streetlamps along the alleys
 */
export function buildDenseResidentialArea({ scene, addCollider, interactiveTargets }: DistrictBuilderParams) {
  const roofTileMat = new THREE.MeshLambertMaterial({ color: '#b91c1c' });
  const roofDarkMat = new THREE.MeshLambertMaterial({ color: '#7f1d1d' });
  const roofBlueMat = new THREE.MeshLambertMaterial({ color: '#1e3a8a' });
  const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
  const darkWoodMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
  const pavingMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' });
  const asphaltMat = new THREE.MeshLambertMaterial({ color: '#475569' });
  const concreteMat = new THREE.MeshLambertMaterial({ color: '#cbd5e1' });

  // List of houses in the dense residential quarter:
  // [x, z, wallColor, roofType, name, number, gangName]
  const houses: Array<{
    x: number;
    z: number;
    wallColor: string;
    roofMat: THREE.Material;
    name: string;
    number: string;
    gang: string;
    isPlayerKosan?: boolean;
  }> = [
    // GANG MELATI (Baris Utara)
    { x: -12, z: -25, wallColor: '#e0f2fe', roofMat: roofTileMat, name: 'Rumah dr. Aris', number: '01', gang: 'Gang Melati' },
    { x: -22, z: -25, wallColor: '#fef3c7', roofMat: roofTileMat, name: 'Rumah dr. Sarah', number: '02', gang: 'Gang Melati' },
    { x: -32, z: -25, wallColor: '#fef9c3', roofMat: roofDarkMat, name: 'Rumah Pak RT Wardoyo', number: '03', gang: 'Gang Melati' },
    { x: -42, z: -25, wallColor: '#dbeafe', roofMat: roofTileMat, name: 'Kediaman Nenek Minah', number: '04', gang: 'Gang Melati' },
    { x: -52, z: -25, wallColor: '#f1f5f9', roofMat: roofBlueMat, name: 'Rumah Pak Bambang', number: '05', gang: 'Gang Melati' },

    // GANG MAWAR (Baris Tengah)
    { x: -12, z: -37, wallColor: '#ffedd5', roofMat: roofTileMat, name: 'Rumah Reza Indoapril', number: '03', gang: 'Gang Mawar' },
    { x: -22, z: -37, wallColor: '#fce7f3', roofMat: roofTileMat, name: 'Rumah Nadia Indoapril', number: '04', gang: 'Gang Mawar' },
    { x: -32, z: -37, wallColor: '#f3e8ff', roofMat: roofTileMat, name: 'Rumah Warga No. 05', number: '05', gang: 'Gang Mawar' },
    { x: -42, z: -37, wallColor: '#e0e7ff', roofMat: roofBlueMat, name: 'Kosan No. 07 (Kamar Pengelana)', number: '07', gang: 'Gang Mawar', isPlayerKosan: true },
    { x: -52, z: -37, wallColor: '#ecfdf5', roofMat: roofDarkMat, name: 'Rumah Bu Endang', number: '08', gang: 'Gang Mawar' },

    // GANG KENANGA (Baris Selatan)
    { x: -12, z: -49, wallColor: '#ecfdf5', roofMat: roofTileMat, name: 'Rumah Lina (Guru SD)', number: '01', gang: 'Gang Kenanga' },
    { x: -22, z: -49, wallColor: '#fef3c7', roofMat: roofTileMat, name: 'Rumah Dimas (Pelatih)', number: '02', gang: 'Gang Kenanga' },
    { x: -32, z: -49, wallColor: '#f8fafc', roofMat: roofDarkMat, name: 'Rumah Fajar (Montir)', number: '03', gang: 'Gang Kenanga' },
    { x: -42, z: -49, wallColor: '#fed7aa', roofMat: roofTileMat, name: 'Rumah Bella (Barista)', number: '04', gang: 'Gang Kenanga' },
    { x: -52, z: -49, wallColor: '#e2e8f0', roofMat: roofBlueMat, name: 'Rumah Pak Slamet', number: '05', gang: 'Gang Kenanga' },

    // KOMPLEKS BARU TIMUR (Dekat SMP)
    { x: 30, z: -38, wallColor: '#fef08a', roofMat: roofTileMat, name: 'Kediaman Rian & Keluarga', number: 'B-01', gang: 'Kompleks Asri Timur' },
    { x: 42, z: -38, wallColor: '#dcfce7', roofMat: roofTileMat, name: 'Kediaman Maya & Keluarga', number: 'B-02', gang: 'Kompleks Asri Timur' },
    { x: 52, z: -38, wallColor: '#e0e7ff', roofMat: roofDarkMat, name: 'Rumah Warga Timur', number: 'B-03', gang: 'Kompleks Asri Timur' },
  ];

  // 1. Generate All Residential Houses
  houses.forEach((h) => {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(h.x, 0, h.z);

    // Wall
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 3.4, 5.8),
      new THREE.MeshLambertMaterial({ color: h.wallColor })
    );
    walls.position.y = 1.7;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Roof (Gable / Pyramid Style)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), h.roofMat);
    roof.position.y = 4.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    // Front Porch
    const porch = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 1.4), concreteMat);
    porch.position.set(0, 0.1, 3.4);
    porch.receiveShadow = true;
    houseGroup.add(porch);

    // Front Door
    const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.1), woodMat);
    frontDoor.position.set(0, 1.05, 2.92);
    houseGroup.add(frontDoor);

    // Windows (left and right)
    const glassMat = new THREE.MeshLambertMaterial({ color: '#93c5fd' });
    const winLeft = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.08), glassMat);
    winLeft.position.set(-1.8, 1.6, 2.92);
    houseGroup.add(winLeft);

    const winRight = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.08), glassMat);
    winRight.position.set(1.8, 1.6, 2.92);
    houseGroup.add(winRight);

    // Window awnings
    const awningMat = new THREE.MeshLambertMaterial({ color: '#b45309' });
    const awnL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), awningMat);
    awnL.position.set(-1.8, 2.2, 3.08);
    houseGroup.add(awnL);
    const awnR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), awningMat);
    awnR.position.set(1.8, 2.2, 3.08);
    houseGroup.add(awnR);

    // House Number Plaque
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128;
    numCanvas.height = 64;
    const nctx = numCanvas.getContext('2d');
    if (nctx) {
      nctx.fillStyle = h.isPlayerKosan ? '#1e3a8a' : '#334155';
      nctx.fillRect(0, 0, 128, 64);
      nctx.fillStyle = h.isPlayerKosan ? '#fde047' : '#ffffff';
      nctx.font = 'bold 26px sans-serif';
      nctx.textAlign = 'center';
      nctx.fillText(`No. ${h.number}`, 64, 42);
    }
    const plaqueTex = new THREE.CanvasTexture(numCanvas);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.35), new THREE.MeshBasicMaterial({ map: plaqueTex }));
    plaque.position.set(0.9, 2.1, 2.93);
    houseGroup.add(plaque);

    // Potted plants in front of house
    const potGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.35, 8);
    const plantGeo = new THREE.SphereGeometry(0.28, 6, 6);
    const potMat = new THREE.MeshLambertMaterial({ color: '#c2410c' });
    const plantMat = new THREE.MeshLambertMaterial({ color: '#15803d' });

    const potL = new THREE.Mesh(potGeo, potMat);
    potL.position.set(-1.1, 0.25, 3.4);
    const plantL = new THREE.Mesh(plantGeo, plantMat);
    plantL.position.set(-1.1, 0.5, 3.4);
    houseGroup.add(potL);
    houseGroup.add(plantL);

    const potR = new THREE.Mesh(potGeo, potMat);
    potR.position.set(1.1, 0.25, 3.4);
    const plantR = new THREE.Mesh(plantGeo, new THREE.MeshLambertMaterial({ color: '#047857' }));
    plantR.position.set(1.1, 0.5, 3.4);
    houseGroup.add(potR);
    houseGroup.add(plantR);

    // Trash bin (tempat sampah warga)
    const binGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.6, 8);
    const binMat = new THREE.MeshLambertMaterial({ color: (h.x + h.z) % 2 === 0 ? '#ea580c' : '#16a34a' });
    const bin = new THREE.Mesh(binGeo, binMat);
    bin.position.set(2.4, 0.3, 3.5);
    houseGroup.add(bin);

    scene.add(houseGroup);
    addCollider(walls);
  });

  // 2. Connecting Paved Alleys (Gang Melati, Gang Mawar, Gang Kenanga)
  const alleyZPositions = [-20, -32, -44, -56];
  alleyZPositions.forEach((z) => {
    const path = new THREE.Mesh(new THREE.PlaneGeometry(48, 2.8), pavingMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(-34, 0.02, z);
    path.receiveShadow = true;
    scene.add(path);
  });

  // North-South connecting walkways
  const nsWalkways = [-17, -27, -37, -47];
  nsWalkways.forEach((x) => {
    const nsPath = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 38), pavingMat);
    nsPath.rotation.x = -Math.PI / 2;
    nsPath.position.set(x, 0.025, -38);
    nsPath.receiveShadow = true;
    scene.add(nsPath);
  });

  // 3. Pos Ronda Pemukiman with Wooden Kentongan (Pos Kamling)
  const posRondaGroup = new THREE.Group();
  posRondaGroup.position.set(-26, 0, -17);

  // Platform floor
  const prFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 3.2), concreteMat);
  prFloor.position.y = 0.175;
  posRondaGroup.add(prFloor);

  // 4 Wooden Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
  const pil1 = new THREE.Mesh(pillarGeo, darkWoodMat);
  pil1.position.set(-1.6, 1.35, -1.4);
  const pil2 = new THREE.Mesh(pillarGeo, darkWoodMat);
  pil2.position.set(1.6, 1.35, -1.4);
  const pil3 = new THREE.Mesh(pillarGeo, darkWoodMat);
  pil3.position.set(-1.6, 1.35, 1.4);
  const pil4 = new THREE.Mesh(pillarGeo, darkWoodMat);
  pil4.position.set(1.6, 1.35, 1.4);
  posRondaGroup.add(pil1, pil2, pil3, pil4);

  // Pos Ronda Tile Roof
  const prRoof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.4, 4), roofTileMat);
  prRoof.position.y = 3.1;
  prRoof.rotation.y = Math.PI / 4;
  posRondaGroup.add(prRoof);

  // Wooden Kentongan (Hanging bamboo/wooden slit drum)
  const kentongan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: '#854d0e' })
  );
  kentongan.rotation.z = Math.PI / 2;
  kentongan.position.set(0, 2.0, -1.3);
  posRondaGroup.add(kentongan);

  // Wood bench inside Pos Ronda
  const prBench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.9), woodMat);
  prBench.position.set(0, 0.5, -0.6);
  posRondaGroup.add(prBench);

  // Signboard: POS RONDA PEMUKIMAN
  const prCanvas = document.createElement('canvas');
  prCanvas.width = 256;
  prCanvas.height = 64;
  const prCtx = prCanvas.getContext('2d');
  if (prCtx) {
    prCtx.fillStyle = '#065f46';
    prCtx.fillRect(0, 0, 256, 64);
    prCtx.fillStyle = '#ffffff';
    prCtx.font = 'bold 22px sans-serif';
    prCtx.textAlign = 'center';
    prCtx.fillText('POS RONDA RT 03', 128, 32);
    prCtx.fillStyle = '#fde047';
    prCtx.font = '14px sans-serif';
    prCtx.fillText('Siaga & Rukun Selalu', 128, 52);
  }
  const prSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(prCanvas) })
  );
  prSign.position.set(0, 2.4, 1.45);
  posRondaGroup.add(prSign);

  scene.add(posRondaGroup);
  addCollider(prFloor);

  interactiveTargets.push({
    id: 'inspect_pos_ronda',
    type: 'inspectable',
    name: 'Pos Ronda RT 03',
    promptText: 'Periksa Jadwal Jaga & Kentongan',
    position: [-26, 0.8, -15.5],
    data: {
      title: 'Pos Ronda Pemukiman Padat RT 03',
      text: 'Pos kamling tempat warga berkumpul di malam hari, meronda dengan kentongan kayu, minum kopi jahe hangat, dan bermain catur.',
    },
  });

  // 4. Jemuran Baju (Clotheslines with colorful clothes)
  const clotheslinePositions = [
    [-38, -27],
    [-20, -37],
    [-48, -47],
  ];

  clotheslinePositions.forEach(([cx, cz]) => {
    const clGroup = new THREE.Group();
    clGroup.position.set(cx, 0, cz);

    // Two wooden posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6);
    const postL = new THREE.Mesh(postGeo, woodMat);
    postL.position.set(-1.8, 1.1, 0);
    const postR = new THREE.Mesh(postGeo, woodMat);
    postR.position.set(1.8, 1.1, 0);
    clGroup.add(postL, postR);

    // Rope wire
    const rope = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: '#f8fafc' }));
    rope.position.set(0, 1.95, 0);
    clGroup.add(rope);

    // Hanging shirts & towels
    const clothesColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
    [-1.2, -0.6, 0.1, 0.8, 1.3].forEach((ox, idx) => {
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.7),
        new THREE.MeshLambertMaterial({ color: clothesColors[idx % clothesColors.length], side: THREE.DoubleSide })
      );
      cloth.position.set(ox, 1.55, 0);
      clGroup.add(cloth);
    });

    scene.add(clGroup);
  });

  // 5. Parked Motorcycles (Motor matic & bebek khas perkampungan Indonesia)
  const bikePositions: Array<{ x: number; z: number; rot: number; color: string }> = [
    { x: -31, z: -23.5, rot: 0.3, color: '#dc2626' },
    { x: -21, z: -33.5, rot: -0.2, color: '#2563eb' },
    { x: -41, z: -33.5, rot: 0.1, color: '#059669' },
    { x: -31, z: -43.5, rot: 0.4, color: '#1e293b' },
    { x: -11, z: -43.5, rot: -0.3, color: '#f59e0b' },
  ];

  bikePositions.forEach((b) => {
    const bike = new THREE.Group();
    bike.position.set(b.x, 0, b.z);
    bike.rotation.y = b.rot;

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: '#18181b' });
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0.7, 0.3, 0);
    const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(-0.7, 0.3, 0);
    bike.add(frontWheel, backWheel);

    // Body chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.45, 0.3),
      new THREE.MeshLambertMaterial({ color: b.color })
    );
    body.position.set(0, 0.55, 0);
    bike.add(body);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.1, 0.25),
      new THREE.MeshLambertMaterial({ color: '#09090b' })
    );
    seat.position.set(-0.1, 0.8, 0);
    bike.add(seat);

    // Handlebars
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.6),
      new THREE.MeshLambertMaterial({ color: '#71717a' })
    );
    handle.position.set(0.6, 0.95, 0);
    bike.add(handle);

    scene.add(bike);
  });

  // 6. Alley Name Signs (Papan Nama Gang)
  const gangSigns: Array<{ x: number; z: number; name: string }> = [
    { x: -10, z: -17, name: 'GANG MELATI' },
    { x: -10, z: -27, name: 'GANG MAWAR' },
    { x: -10, z: -37, name: 'GANG KENANGA' },
  ];

  gangSigns.forEach((g) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), darkWoodMat);
    post.position.set(g.x, 1.2, g.z);

    const sCanvas = document.createElement('canvas');
    sCanvas.width = 256;
    sCanvas.height = 64;
    const sctx = sCanvas.getContext('2d');
    if (sctx) {
      sctx.fillStyle = '#15803d';
      sctx.fillRect(0, 0, 256, 64);
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 24px sans-serif';
      sctx.textAlign = 'center';
      sctx.fillText(g.name, 128, 40);
    }
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.35),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sCanvas), side: THREE.DoubleSide })
    );
    signMesh.position.set(g.x, 2.1, g.z);
    scene.add(post, signMesh);
  });
}

/**
 * Builds the Hospital & Medical Clinic (Rumah Sakit & Klinik Cisini Sehat)
 * Position: [-38, 0, 10]
 */
export function buildHospitalCisini({ scene, addCollider, interactiveTargets }: DistrictBuilderParams) {
  const rsGroup = new THREE.Group();
  rsGroup.position.set(-38, 0, 10);

  const whiteWallMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
  const medicalCyanMat = new THREE.MeshLambertMaterial({ color: '#0284c7' });
  const glassMat = new THREE.MeshLambertMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.85 });
  const redMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });

  // Main 2-Story Medical Building
  const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(14, 6.2, 9), whiteWallMat);
  mainBuilding.position.y = 3.1;
  mainBuilding.castShadow = true;
  mainBuilding.receiveShadow = true;
  rsGroup.add(mainBuilding);

  // Cyan Facade Trim & Cornice
  const trim = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.6, 9.4), medicalCyanMat);
  trim.position.y = 6.2;
  rsGroup.add(trim);

  // Large Red Cross Emblem (+)
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.2), redMat);
  crossV.position.set(0, 4.8, 4.6);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.2), redMat);
  crossH.position.set(0, 4.8, 4.6);
  rsGroup.add(crossV, crossH);

  // Hospital Signboard
  const rsCanvas = document.createElement('canvas');
  rsCanvas.width = 512;
  rsCanvas.height = 128;
  const rsCtx = rsCanvas.getContext('2d');
  if (rsCtx) {
    rsCtx.fillStyle = '#0369a1';
    rsCtx.fillRect(0, 0, 512, 128);
    rsCtx.fillStyle = '#ffffff';
    rsCtx.font = 'bold 36px sans-serif';
    rsCtx.textAlign = 'center';
    rsCtx.fillText('RS & KLINIK CISINI SEHAT', 256, 52);
    rsCtx.fillStyle = '#fde047';
    rsCtx.font = 'bold 22px sans-serif';
    rsCtx.fillText('IGD 24 JAM • FARMASI & RAWAT JALAN', 256, 95);
  }
  const rsSign = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rsCanvas) })
  );
  rsSign.position.set(0, 3.2, 4.6);
  rsGroup.add(rsSign);

  // Automatic Glass Sliding Doors
  const doors = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 0.15), glassMat);
  doors.position.set(0, 1.3, 4.55);
  rsGroup.add(doors);

  // Second floor ribbon windows
  const winFloor2 = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 0.1), glassMat);
  winFloor2.position.set(0, 4.6, 4.55);
  rsGroup.add(winFloor2);

  // Ambulance Parking & Vehicle
  const ambGroup = new THREE.Group();
  ambGroup.position.set(-4.5, 0, 7.2);

  // Ambulance Body
  const ambBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 4.4), whiteWallMat);
  ambBody.position.y = 1.1;
  ambGroup.add(ambBody);

  // Red stripe
  const ambStripe = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.35, 4.45), redMat);
  ambStripe.position.y = 1.2;
  ambGroup.add(ambStripe);

  // Siren light on roof
  const siren = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.8),
    new THREE.MeshBasicMaterial({ color: '#ef4444' })
  );
  siren.position.set(0, 2.1, 0.6);
  ambGroup.add(siren);

  // Wheels
  const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12);
  const wMat = new THREE.MeshLambertMaterial({ color: '#18181b' });
  const w1 = new THREE.Mesh(wGeo, wMat);
  w1.rotation.z = Math.PI / 2;
  w1.position.set(-1.25, 0.38, 1.2);
  const w2 = new THREE.Mesh(wGeo, wMat);
  w2.rotation.z = Math.PI / 2;
  w2.position.set(1.25, 0.38, 1.2);
  const w3 = new THREE.Mesh(wGeo, wMat);
  w3.rotation.z = Math.PI / 2;
  w3.position.set(-1.25, 0.38, -1.2);
  const w4 = new THREE.Mesh(wGeo, wMat);
  w4.rotation.z = Math.PI / 2;
  w4.position.set(1.25, 0.38, -1.2);
  ambGroup.add(w1, w2, w3, w4);

  rsGroup.add(ambGroup);

  // Waiting benches outside hospital
  const benchMat = new THREE.MeshLambertMaterial({ color: '#64748b' });
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.8), benchMat);
  bench.position.set(4.2, 0.3, 5.5);
  rsGroup.add(bench);

  scene.add(rsGroup);
  addCollider(mainBuilding);

  // Interactive Target: RS Cisini
  interactiveTargets.push({
    id: 'inspect_hospital',
    type: 'inspectable',
    name: 'RS & Klinik Cisini Sehat',
    promptText: 'Konsultasi Kesehatan & Resep Dokter',
    position: [-38, 1.0, 15.5],
    data: {
      title: 'Rumah Sakit & Klinik Cisini Sehat',
      text: 'Pusat layanan kesehatan terpadu Cisini yang dipimpin oleh dr. Sarah dan dr. Aris. Menyediakan IGD 24 jam, konsultasi kesehatan, vitamin penambah stamina, dan pelayanan ramah tanpa dipungut biaya bagi warga yang membutuhkan.',
    },
  });
}

/**
 * Builds the Indoapril Minimarket (Minimarket Indoapril Cisini)
 * Position: [35, 0, 25]
 */
export function buildIndoaprilMart({ scene, addCollider, interactiveTargets }: DistrictBuilderParams) {
  const martGroup = new THREE.Group();
  martGroup.position.set(35, 0, 25);

  const whiteWallMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
  const glassMat = new THREE.MeshLambertMaterial({ color: '#93c5fd', transparent: true, opacity: 0.8 });

  // Main Indoapril Building
  const building = new THREE.Mesh(new THREE.BoxGeometry(13, 4.6, 9), whiteWallMat);
  building.position.y = 2.3;
  building.castShadow = true;
  building.receiveShadow = true;
  martGroup.add(building);

  // Iconic Indoapril 3-Striped Canopy (Blue - Red - Yellow)
  const canopyBlue = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 0.4, 1.6),
    new THREE.MeshLambertMaterial({ color: '#1d4ed8' })
  );
  canopyBlue.position.set(0, 4.4, 4.8);
  const canopyRed = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 0.25, 1.6),
    new THREE.MeshLambertMaterial({ color: '#dc2626' })
  );
  canopyRed.position.set(0, 4.05, 4.8);
  const canopyYellow = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 0.25, 1.6),
    new THREE.MeshLambertMaterial({ color: '#eab308' })
  );
  canopyYellow.position.set(0, 3.8, 4.8);
  martGroup.add(canopyBlue, canopyRed, canopyYellow);

  // Large Indoapril Signboard
  const mCanvas = document.createElement('canvas');
  mCanvas.width = 512;
  mCanvas.height = 128;
  const mCtx = mCanvas.getContext('2d');
  if (mCtx) {
    // White background with iconic blue red border
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, 512, 128);
    mCtx.fillStyle = '#1d4ed8';
    mCtx.fillRect(0, 0, 512, 24);
    mCtx.fillStyle = '#dc2626';
    mCtx.fillRect(0, 24, 512, 14);

    mCtx.fillStyle = '#1d4ed8';
    mCtx.font = 'bold 44px sans-serif';
    mCtx.textAlign = 'center';
    mCtx.fillText('INDOAPRIL', 256, 80);

    mCtx.fillStyle = '#dc2626';
    mCtx.font = 'bold 20px sans-serif';
    mCtx.fillText('CISINI • BUKA 24 JAM', 256, 114);
  }
  const martSign = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 1.8),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(mCanvas) })
  );
  martSign.position.set(0, 3.1, 4.6);
  martGroup.add(martSign);

  // Sliding Glass Entrance
  const slidingDoor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.5, 0.1), glassMat);
  slidingDoor.position.set(0, 1.25, 4.56);
  martGroup.add(slidingDoor);

  // Welcome Red Carpet Floor Mat
  const matMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 1.4),
    new THREE.MeshLambertMaterial({ color: '#b91c1c' })
  );
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.position.set(0, 0.03, 5.2);
  martGroup.add(matMesh);

  // ATM Booth in front of Indoapril
  const atmBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 1.0),
    new THREE.MeshLambertMaterial({ color: '#0369a1' })
  );
  atmBox.position.set(4.5, 1.1, 4.8);
  martGroup.add(atmBox);

  const atmScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    new THREE.MeshBasicMaterial({ color: '#38bdf8' })
  );
  atmScreen.position.set(4.5, 1.4, 5.32);
  martGroup.add(atmScreen);

  // Aqua Gallon Dispenser Rack (Galon Air Biru)
  const gallonRack = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.4, 0.8),
    new THREE.MeshLambertMaterial({ color: '#475569' })
  );
  gallonRack.position.set(-4.5, 0.7, 4.8);
  martGroup.add(gallonRack);

  const gColor = new THREE.MeshLambertMaterial({ color: '#0284c7' });
  [-0.4, 0.4].forEach((gx) => {
    const galon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), gColor);
    galon.position.set(-4.5 + gx, 1.6, 4.8);
    martGroup.add(galon);
  });

  // Outdoor Wooden Bench for Chilling
  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.45, 0.8),
    new THREE.MeshLambertMaterial({ color: '#92400e' })
  );
  bench.position.set(-1.8, 0.3, 6.8);
  martGroup.add(bench);

  // Gerobak Bakso & Siomay Pak Kumis in Front
  const gerobak = new THREE.Group();
  gerobak.position.set(4.8, 0, 7.5);

  const gBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.0), new THREE.MeshLambertMaterial({ color: '#059669' }));
  gBox.position.y = 0.8;
  gerobak.add(gBox);

  const gRoof = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.2), new THREE.MeshLambertMaterial({ color: '#f59e0b' }));
  gRoof.position.y = 1.8;
  gerobak.add(gRoof);
  martGroup.add(gerobak);

  scene.add(martGroup);
  addCollider(building);

  // Interactive Target: Indoapril
  interactiveTargets.push({
    id: 'inspect_indoapril',
    type: 'inspectable',
    name: 'Minimarket Indoapril Cisini',
    promptText: 'Masuk & Belanja di Indoapril',
    position: [35, 1.0, 30.5],
    data: {
      title: 'Minimarket Indoapril Cisini (24 Jam)',
      text: 'Minimarket kebanggaan warga Cisini! Dikelola oleh Nadia (kasir manis) dan Reza (kepala toko & kurir). Menyediakan minuman dingin, es krim boba, mie instan, camilan renyah, dan layanan top up pulsa/listrik.',
    },
  });
}

/**
 * Builds the Motorcycle Repair Garage (Bengkel Motor Maju Lancar)
 * Position: [36, 0, 4]
 */
export function buildMotorcycleGarage({ scene, addCollider, interactiveTargets }: DistrictBuilderParams) {
  const garageGroup = new THREE.Group();
  garageGroup.position.set(36, 0, 4);

  const wallMat = new THREE.MeshLambertMaterial({ color: '#334155' });
  const metalRoofMat = new THREE.MeshLambertMaterial({ color: '#64748b' });
  const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });

  // Workshop Building
  const building = new THREE.Mesh(new THREE.BoxGeometry(11, 4.0, 8), wallMat);
  building.position.y = 2.0;
  building.castShadow = true;
  building.receiveShadow = true;
  garageGroup.add(building);

  // Corrugated Workshop Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.2, 3.2), metalRoofMat);
  canopy.position.set(0, 3.8, 5.2);
  canopy.rotation.x = 0.08;
  garageGroup.add(canopy);

  // Open Rolling Door Frame
  const rollDoor = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 3.0, 0.1),
    new THREE.MeshLambertMaterial({ color: '#1e293b' })
  );
  rollDoor.position.set(0, 1.5, 4.05);
  garageGroup.add(rollDoor);

  // Signboard: BENGKEL MOTOR MAJU LANCAR
  const gCanvas = document.createElement('canvas');
  gCanvas.width = 512;
  gCanvas.height = 128;
  const gCtx = gCanvas.getContext('2d');
  if (gCtx) {
    gCtx.fillStyle = '#dc2626';
    gCtx.fillRect(0, 0, 512, 128);
    gCtx.fillStyle = '#ffffff';
    gCtx.font = 'bold 36px sans-serif';
    gCtx.textAlign = 'center';
    gCtx.fillText('BENGKEL MAJU LANCAR', 256, 52);
    gCtx.fillStyle = '#fde047';
    gCtx.font = 'bold 22px sans-serif';
    gCtx.fillText('SERVIS MOTOR • GANTI OLI • TAMBAL BAN', 256, 95);
  }
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.8, 1.7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gCanvas) })
  );
  signMesh.position.set(0, 3.2, 4.1);
  garageGroup.add(signMesh);

  // Tire Stacks (Tumpukan Ban Motor Bekas)
  const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 12);
  const tireMat = new THREE.MeshLambertMaterial({ color: '#09090b' });
  [0, 0.24, 0.48, 0.72].forEach((ty) => {
    const t = new THREE.Mesh(tireGeo, tireMat);
    t.position.set(-3.8, ty + 0.11, 4.8);
    garageGroup.add(t);
  });

  // Red Air Compressor Tank (Tabung Kompresor Angin)
  const compBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 1.0, 10),
    new THREE.MeshLambertMaterial({ color: '#ef4444' })
  );
  compBody.rotation.z = Math.PI / 2;
  compBody.position.set(3.8, 0.45, 4.8);
  garageGroup.add(compBody);

  // Motorcycle on Service Stand
  const bikeMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
  const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.3), bikeMat);
  bikeBody.position.set(0, 0.65, 5.0);
  garageGroup.add(bikeBody);

  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 10);
  const wMat = new THREE.MeshLambertMaterial({ color: '#18181b' });
  const fw = new THREE.Mesh(wheelGeo, wMat);
  fw.rotation.z = Math.PI / 2;
  fw.position.set(0.7, 0.4, 5.0);
  const bw = new THREE.Mesh(wheelGeo, wMat);
  bw.rotation.z = Math.PI / 2;
  bw.position.set(-0.7, 0.4, 5.0);
  garageGroup.add(fw, bw);

  scene.add(garageGroup);
  addCollider(building);

  interactiveTargets.push({
    id: 'inspect_bengkel',
    type: 'inspectable',
    name: 'Bengkel Motor Maju Lancar',
    promptText: 'Cek Servis & Ganti Oli Motor',
    position: [36, 1.0, 9.5],
    data: {
      title: 'Bengkel Motor Maju Lancar',
      text: 'Bengkel andalan warga Cisini yang dikelola oleh Fajar, montir muda berbakat. Melayani servis karburator, ganti oli mesin, tune up, dan tambal ban dengan cepat dan ramah.',
    },
  });
}

/**
 * Builds the Cafe "Kopi Senja Cisini"
 * Position: [-12, 0, 25]
 */
export function buildKopiSenjaCafe({ scene, addCollider, interactiveTargets }: DistrictBuilderParams) {
  const cafeGroup = new THREE.Group();
  cafeGroup.position.set(-12, 0, 25);

  const darkWoodMat = new THREE.MeshLambertMaterial({ color: '#3b1d11' });
  const warmWoodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
  const creamMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' });
  const glassMat = new THREE.MeshLambertMaterial({ color: '#fed7aa', transparent: true, opacity: 0.85 });

  // Main Cozy Coffee Shop Building
  const building = new THREE.Mesh(new THREE.BoxGeometry(10, 4.2, 7.5), warmWoodMat);
  building.position.y = 2.1;
  building.castShadow = true;
  building.receiveShadow = true;
  cafeGroup.add(building);

  // Cafe Awning
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.3, 2.2),
    new THREE.MeshLambertMaterial({ color: '#451a03' })
  );
  awning.position.set(0, 3.8, 4.4);
  awning.rotation.x = 0.12;
  cafeGroup.add(awning);

  // Large Cafe Glass Window
  const bigWindow = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 0.1), glassMat);
  bigWindow.position.set(-1.8, 1.8, 3.8);
  cafeGroup.add(bigWindow);

  // Cafe Entrance Door
  const cafeDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.1), darkWoodMat);
  cafeDoor.position.set(2.4, 1.2, 3.8);
  cafeGroup.add(cafeDoor);

  // Signboard: KOPI SENJA CISINI
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 512;
  cCanvas.height = 128;
  const cCtx = cCanvas.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#291811';
    cCtx.fillRect(0, 0, 512, 128);
    cCtx.fillStyle = '#fde68a';
    cCtx.font = 'bold 42px sans-serif';
    cCtx.textAlign = 'center';
    cCtx.fillText('KOPI SENJA', 256, 52);
    cCtx.fillStyle = '#ffffff';
    cCtx.font = 'bold 20px sans-serif';
    cCtx.fillText('KOPI SUSU AREN • LATTE ART • CROISSANT', 256, 95);
  }
  const cafeSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 1.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cCanvas) })
  );
  cafeSign.position.set(0, 3.2, 3.85);
  cafeGroup.add(cafeSign);

  // Patio Deck Floor
  const patioDeck = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 4.5),
    new THREE.MeshLambertMaterial({ color: '#78350f' })
  );
  patioDeck.rotation.x = -Math.PI / 2;
  patioDeck.position.set(0, 0.04, 5.8);
  cafeGroup.add(patioDeck);

  // Outdoor Table with Parasol Umbrella
  const makeTableWithUmbrella = (tx: number, tz: number, umbrellaColor: string) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, 0, tz);

    // Table
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.08, 12),
      new THREE.MeshLambertMaterial({ color: '#57301c' })
    );
    tableTop.position.y = 0.8;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
      new THREE.MeshLambertMaterial({ color: '#1c1917' })
    );
    leg.position.y = 0.4;
    tGroup.add(tableTop, leg);

    // Umbrella
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
      new THREE.MeshLambertMaterial({ color: '#e2e8f0' })
    );
    pole.position.y = 1.35;
    const canvasCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.6, 8),
      new THREE.MeshLambertMaterial({ color: umbrellaColor })
    );
    canvasCone.position.y = 2.4;
    tGroup.add(pole, canvasCone);

    // 2 Chairs
    [-0.9, 0.9].forEach((cx) => {
      const chair = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8),
        new THREE.MeshLambertMaterial({ color: '#78350f' })
      );
      chair.position.set(cx, 0.45, 0);
      tGroup.add(chair);
    });

    return tGroup;
  };

  const table1 = makeTableWithUmbrella(-2.4, 5.8, '#b45309');
  const table2 = makeTableWithUmbrella(2.4, 5.8, '#0f766e');
  cafeGroup.add(table1, table2);

  // Chalkboard Menu Board
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.2, 0.08),
    new THREE.MeshLambertMaterial({ color: '#18181b' })
  );
  board.position.set(-4.2, 0.8, 4.5);
  cafeGroup.add(board);

  scene.add(cafeGroup);
  addCollider(building);

  interactiveTargets.push({
    id: 'inspect_cafe',
    type: 'inspectable',
    name: 'Cafe Kopi Senja Cisini',
    promptText: 'Pesan Kopi & Nikmati Suasana Senja',
    position: [-12, 1.0, 30.5],
    data: {
      title: 'Cafe Kopi Senja Cisini',
      text: 'Tempat berkumpul favorit warga menikmati senja di bawah rimbun pohon taman. Bella, sang barista, siap menyeduhkan kopi susu aren hangat dan latte art terbaik untukmu.',
    },
  });
}
