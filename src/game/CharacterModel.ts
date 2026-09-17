import * as THREE from 'three';
import { CharacterAppearance } from '../types';

export type { CharacterAppearance };

export interface CharacterRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  animate: (time: number, speed: number, isInteracting: boolean) => void;
  lookAtPlayer: (playerPos: THREE.Vector3) => void;
  overheadMarker?: THREE.Sprite;
}

export function createCharacterModel(options: CharacterAppearance): CharacterRig {
  const {
    skinColor = '#e0a97b',
    shirtColor = '#2563eb',
    shirtStyle = 'casual',
    pantsColor = '#1e293b',
    pantsStyle = 'jeans',
    hairColor = '#1f1f1f',
    hairStyle = 'short',
    accessory = 'none',
    scale = 1.0,
    isPlayer = false,
  } = options;

  const root = new THREE.Group();
  root.scale.set(scale, scale, scale);

  // Materials with stylized toon/lambert shading
  const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
  const shoeMat = new THREE.MeshLambertMaterial({ color: '#2b2b2b' });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#111111' });
  const whiteMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // Body container (centered at hip height 0.85m so feet touch ground at Y = 0)
  const body = new THREE.Group();
  body.position.y = 0.82;
  root.add(body);

  // Torso
  const torsoGeom = new THREE.CylinderGeometry(0.24, 0.20, 0.48, 8);
  const torso = new THREE.Mesh(torsoGeom, shirtMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  body.add(torso);

  // Shirt Style details
  if (shirtStyle === 'jacket') {
    // Inner white t-shirt collar
    const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.1), whiteMat);
    innerShirt.position.set(0, 0.16, 0.17);
    body.add(innerShirt);
    // Jacket collar flaps
    const collarMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.04), collarMat);
    collarLeft.position.set(-0.11, 0.17, 0.2);
    collarLeft.rotation.z = -0.3;
    body.add(collarLeft);
    const collarRight = collarLeft.clone();
    collarRight.position.x = 0.11;
    collarRight.rotation.z = 0.3;
    body.add(collarRight);
  } else if (shirtStyle === 'hoodie') {
    // Cozy hood on back
    const hoodMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const hoodGeom = new THREE.SphereGeometry(0.16, 8, 8);
    const hood = new THREE.Mesh(hoodGeom, hoodMat);
    hood.position.set(0, 0.22, -0.16);
    hood.scale.set(1.2, 0.9, 0.9);
    body.add(hood);
    // Front kangaroo pouch pocket
    const pouchGeom = new THREE.BoxGeometry(0.28, 0.14, 0.06);
    const pouch = new THREE.Mesh(pouchGeom, hoodMat);
    pouch.position.set(0, -0.12, 0.19);
    body.add(pouch);
  } else if (shirtStyle === 'batik') {
    // Indonesian Batik motif golden trim
    const batikGold = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.04), batikGold);
    stripe.position.set(0, 0, 0.21);
    body.add(stripe);
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.04), batikGold);
    collar.position.set(0, 0.22, 0.18);
    body.add(collar);
  } else if (shirtStyle === 'vest') {
    // Adventurer vest with utility pockets
    const vestMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const vestFlapL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.06), vestMat);
    vestFlapL.position.set(-0.13, 0, 0.19);
    body.add(vestFlapL);
    const vestFlapR = vestFlapL.clone();
    vestFlapR.position.x = 0.13;
    body.add(vestFlapR);
  } else if (shirtStyle === 'oversized_tee') {
    // Loose relaxed silhouette
    const teeMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const extraHem = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.18, 8), teeMat);
    extraHem.position.y = -0.22;
    body.add(extraHem);
  } else if (shirtStyle === 'kemeja_formal') {
    // Formal buttoned shirt with necktie
    const tieMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.04), tieMat);
    tie.position.set(0, 0.08, 0.21);
    body.add(tie);
    const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), tieMat);
    tieKnot.position.set(0, 0.22, 0.20);
    body.add(tieKnot);
  } else if (shirtStyle === 'seragam_sekolah') {
    // Indonesian school uniform (White shirt + school tie & emblem)
    const schoolTieMat = new THREE.MeshLambertMaterial({ color: '#1e3a8a' });
    const sTie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.04), schoolTieMat);
    sTie.position.set(0, 0.08, 0.21);
    body.add(sTie);
    const badgeMat = new THREE.MeshBasicMaterial({ color: '#eab308' });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), badgeMat);
    badge.position.set(-0.12, 0.10, 0.21);
    body.add(badge);
  } else if (shirtStyle === 'kebaya') {
    // Traditional Indonesian Kebaya with golden sash (stagen)
    const sashMat = new THREE.MeshLambertMaterial({ color: '#eab308' });
    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 8), sashMat);
    sash.position.set(0, -0.10, 0);
    body.add(sash);
    const brocade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.03), sashMat);
    brocade.position.set(0, 0.06, 0.21);
    body.add(brocade);
  } else if (shirtStyle === 'jersey') {
    // Sporty jersey with striped accents
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), stripeMat);
    shoulderL.position.set(-0.16, 0.20, 0);
    body.add(shoulderL);
    const shoulderR = shoulderL.clone();
    shoulderR.position.x = 0.16;
    body.add(shoulderR);
    const number = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.02), stripeMat);
    number.position.set(0, 0.06, 0.21);
    body.add(number);
  } else if (shirtStyle === 'apron_koki') {
    // Chef apron with pocket
    const apronCloth = new THREE.MeshLambertMaterial({ color: '#ffffff' });
    const chefBib = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.05), apronCloth);
    chefBib.position.set(0, -0.04, 0.19);
    body.add(chefBib);
    const redTrim = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.06), new THREE.MeshLambertMaterial({ color: '#dc2626' }));
    redTrim.position.set(0, 0.16, 0.19);
    body.add(redTrim);
  } else if (shirtStyle === 'jaket_kulit') {
    // Biker leather jacket with silver zipper
    const zipMat = new THREE.MeshLambertMaterial({ color: '#cbd5e1' });
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.04), zipMat);
    zip.position.set(0, 0, 0.21);
    body.add(zip);
  } else if (shirtStyle === 'sweater') {
    // Cozy knit turtleneck/crewneck sweater
    const knitMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const knitCollar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), knitMat);
    knitCollar.position.set(0, 0.24, 0);
    knitCollar.rotation.x = Math.PI / 2;
    body.add(knitCollar);
  } else if (shirtStyle === 'baju_kurir') {
    // Delivery courier high-vis vest
    const courierMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const courierVest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.06), courierMat);
    courierVest.position.set(0, 0.02, 0.18);
    body.add(courierVest);
    const reflectStripe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.08), new THREE.MeshBasicMaterial({ color: '#facc15' }));
    reflectStripe.position.set(0, 0.02, 0.18);
    body.add(reflectStripe);
  }

  // Apron accessory for Bu Siti & Pak Joko
  if (accessory === 'apron') {
    const apronMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const apronGeom = new THREE.BoxGeometry(0.3, 0.42, 0.05);
    const apron = new THREE.Mesh(apronGeom, apronMat);
    apron.position.set(0, -0.05, 0.18);
    body.add(apron);
  }

  // Backpack or Satchel accessory
  if (accessory === 'backpack' || accessory === 'satchel') {
    const packMat = new THREE.MeshLambertMaterial({ color: '#92400e' });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.18), packMat);
    pack.position.set(0, 0.05, -0.24);
    pack.castShadow = true;
    body.add(pack);

    // Shoulder straps
    const strapMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.04), strapMat);
    strapL.position.set(-0.14, 0.05, 0.18);
    body.add(strapL);
    const strapR = strapL.clone();
    strapR.position.x = 0.14;
    body.add(strapR);
  }

  // Vintage Camera accessory
  if (accessory === 'tas_kamera') {
    const strapMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.03, 4, 12), strapMat);
    strap.position.set(0, 0.08, 0);
    strap.rotation.y = Math.PI / 4;
    body.add(strap);

    const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.08), new THREE.MeshLambertMaterial({ color: '#1c1917' }));
    cameraBox.position.set(0.18, -0.16, 0.14);
    body.add(cameraBox);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), new THREE.MeshLambertMaterial({ color: '#cbd5e1' }));
    lens.position.set(0.18, -0.16, 0.19);
    lens.rotation.x = Math.PI / 2;
    body.add(lens);
  }

  // Scarf accessory
  if (accessory === 'scarf') {
    const scarfMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });
    const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 12), scarfMat);
    scarfRing.position.set(0, 0.28, 0);
    scarfRing.rotation.x = Math.PI / 2;
    body.add(scarfRing);
    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.04), scarfMat);
    scarfTail.position.set(0.08, 0.16, 0.21);
    body.add(scarfTail);
  }

  // Pelvis / Hips
  const hipsGeom = new THREE.CylinderGeometry(0.20, 0.18, 0.14, 8);
  const hips = new THREE.Mesh(hipsGeom, pantsMat);
  hips.position.y = -0.28;
  body.add(hips);

  // Indonesian Traditional Sarung & Skirt
  let sarungMesh: THREE.Mesh | undefined;
  let skirtMesh: THREE.Mesh | undefined;
  if (pantsStyle === 'sarung') {
    const sarungGeom = new THREE.CylinderGeometry(0.22, 0.24, 0.48, 10);
    sarungMesh = new THREE.Mesh(sarungGeom, pantsMat);
    sarungMesh.position.set(0, -0.42, 0);
    body.add(sarungMesh);
    // Hem gold/white motif
    const hemMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.242, 0.242, 0.04, 10), hemMat);
    hem.position.set(0, -0.64, 0);
    body.add(hem);
  } else if (pantsStyle === 'skirt' || pantsStyle === 'pleated_skirt') {
    // Feminine flared / pleated skirt
    const skirtGeom = new THREE.ConeGeometry(0.36, 0.50, 12, 1, true);
    skirtMesh = new THREE.Mesh(skirtGeom, pantsMat);
    skirtMesh.position.set(0, -0.40, 0);
    body.add(skirtMesh);
    if (pantsStyle === 'pleated_skirt') {
      const pMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const pleatHem = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 4, 16), pMat);
      pleatHem.position.set(0, -0.62, 0);
      pleatHem.rotation.x = Math.PI / 2;
      body.add(pleatHem);
    }
  }

  // Head container
  const head = new THREE.Group();
  head.position.y = 0.40;
  body.add(head);

  const headGeom = new THREE.SphereGeometry(0.20, 10, 10);
  const headMesh = new THREE.Mesh(headGeom, skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Face - Eyes
  const eyeGeom = new THREE.SphereGeometry(0.03, 6, 6);
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.07, 0.02, 0.175);
  leftEye.scale.set(1, 1.2, 0.5);
  head.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.07;
  head.add(rightEye);

  // Eye highlights
  const shineGeom = new THREE.SphereGeometry(0.01, 4, 4);
  const leftShine = new THREE.Mesh(shineGeom, whiteMat);
  leftShine.position.set(-0.08, 0.04, 0.19);
  head.add(leftShine);

  const rightShine = leftShine.clone();
  rightShine.position.x = 0.06;
  head.add(rightShine);

  // Cute stylized smile
  const smileGeom = new THREE.TorusGeometry(0.04, 0.008, 4, 8, Math.PI);
  const smile = new THREE.Mesh(smileGeom, eyeMat);
  smile.position.set(0, -0.06, 0.185);
  smile.rotation.x = Math.PI * 0.15;
  head.add(smile);

  // Glasses & Eye/Head Accessories
  if (accessory === 'glasses') {
    const glassesMat = new THREE.MeshBasicMaterial({ color: '#222' });
    const frameGeom = new THREE.TorusGeometry(0.05, 0.01, 4, 12);
    const leftFrame = new THREE.Mesh(frameGeom, glassesMat);
    leftFrame.position.set(-0.07, 0.02, 0.185);
    head.add(leftFrame);

    const rightFrame = leftFrame.clone();
    rightFrame.position.x = 0.07;
    head.add(rightFrame);

    const bridgeGeom = new THREE.BoxGeometry(0.05, 0.01, 0.01);
    const bridge = new THREE.Mesh(bridgeGeom, glassesMat);
    bridge.position.set(0, 0.02, 0.185);
    head.add(bridge);
  } else if (accessory === 'sunglasses') {
    const sunMat = new THREE.MeshBasicMaterial({ color: '#111827' });
    const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.02), sunMat);
    leftLens.position.set(-0.07, 0.02, 0.19);
    head.add(leftLens);
    const rightLens = leftLens.clone();
    rightLens.position.x = 0.07;
    head.add(rightLens);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.02), sunMat);
    bridge.position.set(0, 0.03, 0.19);
    head.add(bridge);
  } else if (accessory === 'masker') {
    // Face mask
    const maskMat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.08), maskMat);
    mask.position.set(0, -0.06, 0.16);
    head.add(mask);
  }

  // Headphone accessory
  if (accessory === 'headphone') {
    const hpMat = new THREE.MeshLambertMaterial({ color: '#ef4444' });
    // Over head band
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 4, 16, Math.PI), hpMat);
    band.position.set(0, 0.05, 0);
    band.rotation.z = Math.PI;
    head.add(band);
    // Ear cups
    const cupGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8);
    const leftCup = new THREE.Mesh(cupGeom, hpMat);
    leftCup.position.set(-0.21, 0.03, 0);
    leftCup.rotation.z = Math.PI / 2;
    head.add(leftCup);
    const rightCup = leftCup.clone();
    rightCup.position.x = 0.21;
    head.add(rightCup);
  }

  // Hair & Headwear Styles
  if (hairStyle === 'hijab') {
    // Elegant Indonesian Hijab / Kerudung
    const hijabMat = new THREE.MeshLambertMaterial({ color: hairColor });
    // Head wrap
    const wrapGeom = new THREE.SphereGeometry(0.24, 12, 12);
    const wrap = new THREE.Mesh(wrapGeom, hijabMat);
    wrap.position.set(0, 0.02, -0.02);
    head.add(wrap);

    // Front opening showing face oval
    const faceMaskGeom = new THREE.SphereGeometry(0.19, 10, 10);
    const faceMask = new THREE.Mesh(faceMaskGeom, skinMat);
    faceMask.position.set(0, 0, 0.04);
    head.add(faceMask);

    // Re-attach eyes to faceMask
    faceMask.add(leftEye.clone());
    faceMask.add(rightEye.clone());
    faceMask.add(leftShine.clone());
    faceMask.add(rightShine.clone());
    faceMask.add(smile.clone());
    leftEye.visible = false;
    rightEye.visible = false;
    leftShine.visible = false;
    rightShine.visible = false;
    smile.visible = false;

    // Draped cloth over shoulders
    const drapeGeom = new THREE.ConeGeometry(0.34, 0.35, 10, 1, true);
    const drape = new THREE.Mesh(drapeGeom, hijabMat);
    drape.position.set(0, -0.16, -0.02);
    head.add(drape);
  } else if (hairStyle === 'peci') {
    // Indonesian Peci / Kopiah
    const peciMat = new THREE.MeshLambertMaterial({ color: '#18181b' });
    const peciGeom = new THREE.CylinderGeometry(0.21, 0.21, 0.16, 12);
    const peci = new THREE.Mesh(peciGeom, peciMat);
    peci.position.set(0, 0.16, 0);
    head.add(peci);

    const hairRim = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 12), hairMat);
    hairRim.position.set(0, 0.06, 0);
    head.add(hairRim);
  } else if (hairStyle === 'blangkon') {
    // Indonesian Traditional Javanese Blangkon
    const blangkonMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const blangkon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), blangkonMat);
    blangkon.position.set(0, 0.06, -0.02);
    head.add(blangkon);
    // Mondolan knot behind
    const mondolan = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), blangkonMat);
    mondolan.position.set(0, 0.02, -0.22);
    head.add(mondolan);
  } else if (hairStyle === 'beanie') {
    // Knit Beanie cap
    const beanieMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const beanie = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.18, 12), beanieMat);
    beanie.position.set(0, 0.14, -0.02);
    head.add(beanie);
    const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), beanieMat);
    pompom.position.set(0, 0.24, -0.04);
    head.add(pompom);
  } else if (hairStyle === 'bandana') {
    // Adventurer headband
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.06, 0);
    head.add(hairBase);
    const bandMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });
    const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 12), bandMat);
    headband.position.set(0, 0.08, 0);
    head.add(headband);
  } else if (hairStyle === 'hat' || accessory === 'hat' || accessory === 'caping') {
    // Caping / Sunhat
    const hatMat = new THREE.MeshLambertMaterial({ color: '#d97706' });
    const hatGeom = new THREE.ConeGeometry(0.40, 0.16, 12);
    const hat = new THREE.Mesh(hatGeom, hatMat);
    hat.position.set(0, 0.18, 0);
    head.add(hat);
  } else if (hairStyle === 'ponytail') {
    // Sporty High Ponytail
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.05, 0);
    head.add(hairBase);

    const ponytailGeom = new THREE.ConeGeometry(0.10, 0.38, 8);
    const ponytail = new THREE.Mesh(ponytailGeom, hairMat);
    ponytail.position.set(0, 0.16, -0.22);
    ponytail.rotation.x = -Math.PI * 0.45;
    head.add(ponytail);
  } else if (hairStyle === 'twin_tails') {
    // Twin Tails (Pigtails)
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.05, 0);
    head.add(hairBase);

    const tailGeom = new THREE.ConeGeometry(0.08, 0.32, 6);
    const tailL = new THREE.Mesh(tailGeom, hairMat);
    tailL.position.set(-0.20, 0.02, -0.10);
    tailL.rotation.z = 0.4;
    head.add(tailL);
    const tailR = tailL.clone();
    tailR.position.x = 0.20;
    tailR.rotation.z = -0.4;
    head.add(tailR);
  } else if (hairStyle === 'bob') {
    // Cute modern Bob cut
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), hairMat);
    hairBase.position.set(0, 0.06, -0.02);
    head.add(hairBase);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.16), hairMat);
    sideL.position.set(-0.16, -0.02, 0.02);
    head.add(sideL);
    const sideR = sideL.clone();
    sideR.position.x = 0.16;
    head.add(sideR);
  } else if (hairStyle === 'undercut') {
    // Modern sleek undercut with slicked top
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.07, 0);
    head.add(hairBase);
    const topSweep = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.28), hairMat);
    topSweep.position.set(0, 0.18, -0.02);
    head.add(topSweep);
  } else if (hairStyle === 'curls') {
    // Fluffy curly hair clusters
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.06, 0);
    head.add(hairBase);
    const curlGeom = new THREE.SphereGeometry(0.07, 6, 6);
    const positions = [
      [0, 0.20, 0.08],
      [-0.12, 0.18, 0.06],
      [0.12, 0.18, 0.06],
      [-0.16, 0.10, 0],
      [0.16, 0.10, 0],
      [0, 0.16, -0.16],
      [-0.12, 0.12, -0.12],
      [0.12, 0.12, -0.12],
    ];
    positions.forEach(([x, y, z]) => {
      const curl = new THREE.Mesh(curlGeom, hairMat);
      curl.position.set(x, y, z);
      head.add(curl);
    });
  } else if (hairStyle === 'bun') {
    // Elegant Hair Bun
    const hairGeom = new THREE.SphereGeometry(0.21, 8, 8);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.set(0, 0.05, -0.04);
    head.add(hair);

    const bunGeom = new THREE.SphereGeometry(0.10, 8, 8);
    const bun = new THREE.Mesh(bunGeom, hairMat);
    bun.position.set(0, 0.14, -0.19);
    head.add(bun);
  } else if (hairStyle === 'spiky') {
    // Spiky Hair
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.06, 0);
    head.add(hairBase);

    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), hairMat);
      spike.position.set((i - 2) * 0.06, 0.23, 0.02);
      spike.rotation.z = -(i - 2) * 0.2;
      head.add(spike);
    }
  } else if (hairStyle === 'long') {
    // Long flowing hair
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.05, 0);
    head.add(hairBase);

    const hairFallGeom = new THREE.BoxGeometry(0.38, 0.44, 0.14);
    const hairFall = new THREE.Mesh(hairFallGeom, hairMat);
    hairFall.position.set(0, -0.10, -0.11);
    head.add(hairFall);
  } else {
    // Default neat short hair with side part
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), hairMat);
    hairBase.position.set(0, 0.07, 0);
    head.add(hairBase);

    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.1), hairMat);
    fringe.position.set(0, 0.16, 0.15);
    head.add(fringe);
  }

  // Limbs with pivot joints
  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.30, 0.18, 0);
  body.add(leftArm);

  const armGeom = new THREE.CylinderGeometry(0.06, 0.055, 0.38, 6);
  armGeom.translate(0, -0.19, 0);
  const leftArmMesh = new THREE.Mesh(armGeom, shirtMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const handGeom = new THREE.SphereGeometry(0.06, 6, 6);
  handGeom.translate(0, -0.38, 0);
  const leftHand = new THREE.Mesh(handGeom, skinMat);
  leftArm.add(leftHand);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.30, 0.18, 0);
  body.add(rightArm);

  const rightArmMesh = new THREE.Mesh(armGeom, shirtMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightHand = new THREE.Mesh(handGeom, skinMat);
  rightArm.add(rightHand);

  // Clipboard accessory for Pak RT
  if (accessory === 'clipboard') {
    const boardMat = new THREE.MeshLambertMaterial({ color: '#8d6e63' });
    const paperMat = new THREE.MeshBasicMaterial({ color: '#fff' });
    const boardGeom = new THREE.BoxGeometry(0.04, 0.22, 0.16);
    const board = new THREE.Mesh(boardGeom, boardMat);
    board.position.set(0.08, -0.30, 0.05);
    board.rotation.x = 0.4;
    rightArm.add(board);

    const paperGeom = new THREE.BoxGeometry(0.01, 0.18, 0.13);
    const paper = new THREE.Mesh(paperGeom, paperMat);
    paper.position.set(0.02, 0, 0);
    board.add(paper);
  }

  // Legs
  // Hip pivot is at body.y(0.82) + leg.y(-0.32) = 0.50m from ground
  // Leg length is 0.44m, shoe bottom is at 0.50m -> bottom lands exactly at Y = 0.00!
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, -0.32, 0);
  body.add(leftLeg);

  // If shorts, upper leg is skin tone, lower is shoe
  const legMat = pantsStyle === 'shorts' ? skinMat : pantsMat;
  const legGeom = new THREE.CylinderGeometry(0.075, 0.065, 0.44, 6);
  legGeom.translate(0, -0.22, 0);
  const leftLegMesh = new THREE.Mesh(legGeom, legMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  if (pantsStyle === 'shorts') {
    // Shorts hem
    const shortsHem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6), pantsMat);
    shortsHem.position.set(0, -0.08, 0);
    leftLeg.add(shortsHem);
  } else if (pantsStyle === 'cargo') {
    // Utility cargo side pocket
    const cargoPocketL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.10), pantsMat);
    cargoPocketL.position.set(-0.08, -0.22, 0);
    leftLeg.add(cargoPocketL);
  } else if (pantsStyle === 'training') {
    // Sporty white side stripe
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.40, 0.04), whiteMat);
    stripeL.position.set(-0.075, -0.22, 0);
    leftLeg.add(stripeL);
  } else if (pantsStyle === 'jogger') {
    // Ribbed ankle cuff
    const cuffL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.06, 6), pantsMat);
    cuffL.position.set(0, -0.41, 0);
    leftLeg.add(cuffL);
  }

  const shoeGeom = new THREE.BoxGeometry(0.11, 0.08, 0.19);
  shoeGeom.translate(0, -0.46, 0.04);
  const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, -0.32, 0);
  body.add(rightLeg);

  const rightLegMesh = new THREE.Mesh(legGeom, legMat);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  if (pantsStyle === 'shorts') {
    const shortsHemR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6), pantsMat);
    shortsHemR.position.set(0, -0.08, 0);
    rightLeg.add(shortsHemR);
  } else if (pantsStyle === 'cargo') {
    const cargoPocketR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.10), pantsMat);
    cargoPocketR.position.set(0.08, -0.22, 0);
    rightLeg.add(cargoPocketR);
  } else if (pantsStyle === 'training') {
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.40, 0.04), whiteMat);
    stripeR.position.set(0.075, -0.22, 0);
    rightLeg.add(stripeR);
  } else if (pantsStyle === 'jogger') {
    const cuffR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.06, 6), pantsMat);
    cuffR.position.set(0, -0.41, 0);
    rightLeg.add(cuffR);
  }

  const rightShoe = new THREE.Mesh(shoeGeom, shoeMat);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);

  // Overhead interaction marker for NPC (exclamation / speech icon)
  let overheadMarker: THREE.Sprite | undefined;
  if (!isPlayer) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Glow speech bubble
      ctx.beginPath();
      ctx.arc(64, 56, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 64, 56);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    overheadMarker = new THREE.Sprite(spriteMat);
    overheadMarker.position.set(0, 1.8, 0);
    overheadMarker.scale.set(0.65, 0.65, 1);
    root.add(overheadMarker);
  }

  // Animation handler
  const animate = (time: number, speed: number, isInteracting: boolean) => {
    // Breathing idle
    const breath = Math.sin(time * 2.2) * 0.015;
    body.position.y = 0.82 + breath;
    head.rotation.y = Math.sin(time * 0.7) * 0.06;

    if (overheadMarker) {
      overheadMarker.position.y = 1.8 + Math.sin(time * 3) * 0.08;
    }

    if (speed > 0.05) {
      // Moving animation (walk / run)
      const freq = speed > 4 ? 12 : 7;
      const legAngle = Math.sin(time * freq) * (speed > 4 ? 0.65 : 0.40);
      const armAngle = -Math.sin(time * freq) * (speed > 4 ? 0.65 : 0.38);

      leftLeg.rotation.x = legAngle;
      rightLeg.rotation.x = -legAngle;

      leftArm.rotation.x = armAngle;
      rightArm.rotation.x = isInteracting ? -0.8 : -armAngle;

      // Vertical bounce
      body.position.y = 0.82 + Math.abs(Math.sin(time * freq)) * 0.04;

      if (skirtMesh) {
        skirtMesh.rotation.x = Math.sin(time * freq) * 0.1;
      }
    } else {
      // Reset limbs smoothly to idle
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;
      rightArm.rotation.x = isInteracting ? -0.9 : 0;
      if (skirtMesh) skirtMesh.rotation.x = 0;
    }

    if (isInteracting) {
      rightArm.rotation.x = -1.1 + Math.sin(time * 5) * 0.08;
      rightArm.rotation.z = 0.2;
    } else {
      rightArm.rotation.z = 0;
    }
  };

  const lookAtPlayer = (playerPos: THREE.Vector3) => {
    const diff = new THREE.Vector3().subVectors(playerPos, root.position);
    diff.y = 0;
    if (diff.lengthSq() > 0.1) {
      const targetAngle = Math.atan2(diff.x, diff.z);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetAngle, 0.08);
    }
  };

  return {
    root,
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    animate,
    lookAtPlayer,
    overheadMarker,
  };
}
