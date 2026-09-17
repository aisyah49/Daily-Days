import * as THREE from 'three';
import { CharacterAppearance, CharacterRig, createCharacterModel } from './CharacterModel';
import { buildCisiniWorld } from './TownWorld';
import { NPCS_DATA } from '../data/gameData';
import { InteractionTarget, TimeOfDay, TimeState } from '../types';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onInteractionTargetChange: (target: InteractionTarget | null) => void;
  onTimeChange: (time: TimeState) => void;
  onPlayerPositionChange: (pos: [number, number, number], rot: number) => void;
  onLocationDiscovered: (locationId: string) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Lights
  private hemiLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  // Game World & Entities
  private playerRig: CharacterRig;
  private playerAppearance: CharacterAppearance;
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 0.02, 16);
  private playerVelocity: THREE.Vector3 = new THREE.Vector3();
  private playerRotation: number = Math.PI;
  private colliders: THREE.Box3[] = [];
  private walkableMeshes: THREE.Object3D[] = [];
  private downRaycaster = new THREE.Raycaster();
  private downVector = new THREE.Vector3(0, -1, 0);
  private interactiveTargets: InteractionTarget[] = [];
  private setDayNightLightingFn: (period: string) => void = () => {};
  private updateParticlesFn: (delta: number) => void = () => {};

  // NPCs
  private npcRigs: Map<string, CharacterRig> = new Map();
  private npcPositions: Map<string, THREE.Vector3> = new Map();

  // Time
  private timeState: TimeState = {
    hour: 8,
    minute: 30,
    period: 'Pagi',
    dayCount: 1,
  };
  private timeAccumulator: number = 0;

  // Controls & Inputs
  private keys: Record<string, boolean> = {};
  private virtualMoveVector: { x: number; y: number } = { x: 0, y: 0 };
  private isSprinting: boolean = false;
  private isInteracting: boolean = false;
  private cameraYaw: number = 0;
  private cameraPitch: number = 0.35;
  private cameraDistance: number = 6.5;
  private isMouseDown: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private footstepTimer: number = 0;

  // Active interaction
  private currentTarget: InteractionTarget | null = null;
  private callbacks: GameEngineCallbacks;
  private activeCompanionId: string | null = null;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks, initialAppearance?: CharacterAppearance) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.playerAppearance = initialAppearance || {
      name: 'Pengelana Cisini',
      gender: 'male',
      skinColor: '#f1be96',
      shirtColor: '#2563eb',
      shirtStyle: 'casual',
      pantsColor: '#1e293b',
      pantsStyle: 'jeans',
      hairColor: '#18181b',
      hairStyle: 'short',
      accessory: 'none',
      isPlayer: true,
    };

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#93c5fd');
    this.scene.fog = new THREE.FogExp2('#bae6fd', 0.012);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 300);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.dirLight.position.set(30, 60, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 160;
    this.dirLight.shadow.camera.left = -50;
    this.dirLight.shadow.camera.right = 50;
    this.dirLight.shadow.camera.top = 50;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Build World
    const world = buildCisiniWorld(this.scene);
    this.colliders = world.colliders;
    this.walkableMeshes = world.walkableMeshes;
    this.interactiveTargets = world.interactiveTargets;
    this.setDayNightLightingFn = world.setDayNightLighting;
    this.updateParticlesFn = world.updateParticles;

    // Initial ground snap for spawn position
    this.playerPos.y = this.getGroundHeight(this.playerPos.x, this.playerPos.z);

    // Build Player
    this.playerRig = createCharacterModel(this.playerAppearance);
    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.root.rotation.y = this.playerRotation;
    this.scene.add(this.playerRig.root);

    // Build NPCs
    this.spawnNPCs();

    // Event listeners
    this.setupInputs();
    this.updateTimeLighting();

    // Start render loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  private spawnNPCs() {
    Object.values(NPCS_DATA).forEach((npc) => {
      const rig = createCharacterModel({
        skinColor: npc.appearance.skinColor,
        shirtColor: npc.appearance.shirtColor,
        shirtStyle: (npc.appearance.shirtStyle as any) || 'casual',
        pantsColor: npc.appearance.pantsColor,
        pantsStyle: (npc.appearance.pantsStyle as any) || 'jeans',
        hairColor: npc.appearance.hairColor,
        hairStyle: (npc.appearance.hairStyle as any) || 'short',
        accessory: (npc.appearance.accessory as any) || 'none',
        scale: npc.appearance.scale ?? 1.0,
        isPlayer: false,
      });

      const schedule = npc.schedule[this.timeState.period];
      const pos = new THREE.Vector3(...schedule.position);
      rig.root.position.copy(pos);
      rig.root.rotation.y = schedule.rotation;

      this.scene.add(rig.root);
      this.npcRigs.set(npc.id, rig);
      this.npcPositions.set(npc.id, pos);

      // Register interaction target
      this.interactiveTargets.push({
        id: `npc_${npc.id}`,
        type: 'npc',
        name: npc.name,
        promptText: `Bicara dengan ${npc.name} (${npc.role})`,
        position: schedule.position,
        data: { npcId: npc.id },
      });
    });
  }

  public updateNPCPositionsForTime() {
    // Reposition NPCs smoothly based on routine
    Object.values(NPCS_DATA).forEach((npc) => {
      const rig = this.npcRigs.get(npc.id);
      if (!rig) return;

      const schedule = npc.schedule[this.timeState.period];
      const targetPos = new THREE.Vector3(...schedule.position);
      rig.root.position.copy(targetPos);
      rig.root.rotation.y = schedule.rotation;
      this.npcPositions.set(npc.id, targetPos);

      // Update interactive target position
      const itTarget = this.interactiveTargets.find((t) => t.id === `npc_${npc.id}`);
      if (itTarget) {
        itTarget.position = schedule.position;
      }
    });
  }

  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === 'Shift') this.isSprinting = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    if (e.key === 'Shift') this.isSprinting = false;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0 || e.button === 2) {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isMouseDown) return;
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.cameraYaw -= dx * 0.006;
    this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + dy * 0.005));
  };

  private handleMouseUp = () => {
    this.isMouseDown = false;
  };

  private handleWheel = (e: WheelEvent) => {
    this.cameraDistance = Math.max(3.5, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
  };

  public handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setVirtualMove(vector: { x: number; y: number }, sprint: boolean) {
    this.virtualMoveVector = vector;
    this.isSprinting = sprint;
  }

  public triggerInteractGesture() {
    this.isInteracting = true;
    soundManager.playInteract();
    setTimeout(() => {
      this.isInteracting = false;
    }, 450);
  }

  // Day / Night time cycle
  public setPeriod(period: TimeOfDay) {
    this.timeState.period = period;
    if (period === 'Pagi') this.timeState.hour = 8;
    else if (period === 'Siang') this.timeState.hour = 12;
    else if (period === 'Sore') this.timeState.hour = 16;
    else if (period === 'Malam') this.timeState.hour = 20;

    this.timeState.minute = 0;
    this.updateTimeLighting();
    this.updateNPCPositionsForTime();
    this.callbacks.onTimeChange({ ...this.timeState });
    soundManager.startBackgroundMusic(period);
    soundManager.playClockChime();
  }

  public forwardTimeStep() {
    const cycle: TimeOfDay[] = ['Pagi', 'Siang', 'Sore', 'Malam'];
    const idx = cycle.indexOf(this.timeState.period);
    const nextIdx = (idx + 1) % cycle.length;
    if (nextIdx === 0) {
      this.timeState.dayCount++;
    }
    this.setPeriod(cycle[nextIdx]);
  }

  private updateTimeLighting() {
    const { period } = this.timeState;
    if (period === 'Pagi') {
      // Warm golden morning
      this.scene.background = new THREE.Color('#93c5fd');
      (this.scene.fog as THREE.FogExp2).color.set('#bae6fd');
      this.dirLight.color.set('#fef08a');
      this.dirLight.intensity = 1.3;
      this.dirLight.position.set(40, 45, 30);
      this.hemiLight.intensity = 0.85;
    } else if (period === 'Siang') {
      // Bright tropical midday
      this.scene.background = new THREE.Color('#38bdf8');
      (this.scene.fog as THREE.FogExp2).color.set('#7dd3fc');
      this.dirLight.color.set('#ffffff');
      this.dirLight.intensity = 1.6;
      this.dirLight.position.set(10, 70, 10);
      this.hemiLight.intensity = 1.0;
    } else if (period === 'Sore') {
      // Golden hour sunset
      this.scene.background = new THREE.Color('#fb923c');
      (this.scene.fog as THREE.FogExp2).color.set('#fdba74');
      this.dirLight.color.set('#f97316');
      this.dirLight.intensity = 1.3;
      this.dirLight.position.set(-45, 25, 20);
      this.hemiLight.intensity = 0.75;
    } else {
      // Mysterious, peaceful night
      this.scene.background = new THREE.Color('#0f172a');
      (this.scene.fog as THREE.FogExp2).color.set('#1e293b');
      this.dirLight.color.set('#818cf8');
      this.dirLight.intensity = 0.35;
      this.dirLight.position.set(-20, 50, -30);
      this.hemiLight.intensity = 0.25;
    }

    this.setDayNightLightingFn(period);
  }

  // Get precise terrain/walkable surface height at (x, z)
  public getGroundHeight(x: number, z: number): number {
    if (!this.walkableMeshes || this.walkableMeshes.length === 0) return 0.02;
    // Cast ray downwards: if in interior (> 70), cast from below ceiling
    const rayStartY = (x > 70 && z > 70) ? 3.2 : 15;
    this.downRaycaster.set(new THREE.Vector3(x, rayStartY, z), this.downVector);
    const hits = this.downRaycaster.intersectObjects(this.walkableMeshes, false);
    if (hits.length > 0) {
      return hits[0].point.y;
    }
    return 0.02;
  }

  // Physics check
  private checkCollision(newPos: THREE.Vector3): boolean {
    // Check ground elevation difference - prevent climbing solid high walls
    const groundY = this.getGroundHeight(newPos.x, newPos.z);
    if (groundY - this.playerPos.y > 0.42) {
      return true;
    }

    const playerRadius = 0.32;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x - playerRadius, newPos.y + 0.15, newPos.z - playerRadius),
      new THREE.Vector3(newPos.x + playerRadius, newPos.y + 1.75, newPos.z + playerRadius)
    );

    // Boundary constraints: exterior -72 to 72, or interior rooms
    const inKosan = newPos.x >= 75.5 && newPos.x <= 84.5 && newPos.z >= 75.5 && newPos.z <= 84.5;
    const inWarung = newPos.x >= 74.5 && newPos.x <= 85.5 && newPos.z >= 114.5 && newPos.z <= 125.5;

    if (!inKosan && !inWarung) {
      if (newPos.x < -72 || newPos.x > 72 || newPos.z < -72 || newPos.z > 72) {
        return true;
      }
    }

    for (let i = 0; i < this.colliders.length; i++) {
      if (this.colliders[i].intersectsBox(playerBox)) {
        return true;
      }
    }
    return false;
  }

  // Main game tick
  private animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Natural subtle time increment (1 real second = ~1 game minute)
    this.timeAccumulator += delta;
    if (this.timeAccumulator >= 4.0) {
      this.timeAccumulator = 0;
      this.timeState.minute += 1;
      if (this.timeState.minute >= 60) {
        this.timeState.minute = 0;
        this.timeState.hour += 1;
        if (this.timeState.hour >= 24) {
          this.timeState.hour = 0;
          this.timeState.dayCount++;
        }
        // Auto period check
        let targetPeriod: TimeOfDay = 'Pagi';
        if (this.timeState.hour >= 5 && this.timeState.hour < 11) targetPeriod = 'Pagi';
        else if (this.timeState.hour >= 11 && this.timeState.hour < 15) targetPeriod = 'Siang';
        else if (this.timeState.hour >= 15 && this.timeState.hour < 18) targetPeriod = 'Sore';
        else targetPeriod = 'Malam';

        if (targetPeriod !== this.timeState.period) {
          this.setPeriod(targetPeriod);
        }
      }
      this.callbacks.onTimeChange({ ...this.timeState });
    }

    // 2. Input movement gathering
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveZ -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Combine with virtual joystick
    if (Math.abs(this.virtualMoveVector.x) > 0.1 || Math.abs(this.virtualMoveVector.y) > 0.1) {
      moveX = this.virtualMoveVector.x;
      moveZ = this.virtualMoveVector.y;
    }

    const inputLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
    let speed = 0;

    if (inputLen > 0.05) {
      // Normalize
      const normX = moveX / inputLen;
      const normZ = moveZ / inputLen;

      // Rotate movement relative to camera yaw
      const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, normX)
        .addScaledVector(forward, -normZ)
        .normalize();

      const moveSpeed = (this.isSprinting ? 6.5 : 3.8) * delta;
      speed = this.isSprinting ? 6.5 : 3.8;

      const targetX = this.playerPos.x + moveDir.x * moveSpeed;
      const targetZ = this.playerPos.z + moveDir.z * moveSpeed;
      const targetY = this.getGroundHeight(targetX, targetZ);
      const targetPos = new THREE.Vector3(targetX, targetY, targetZ);

      // Try full combined move (X & Z) first
      if (!this.checkCollision(targetPos)) {
        this.playerPos.x = targetPos.x;
        this.playerPos.z = targetPos.z;
      } else {
        // Smooth sliding: Try X movement alone
        const tryXPos = new THREE.Vector3(targetX, this.getGroundHeight(targetX, this.playerPos.z), this.playerPos.z);
        if (!this.checkCollision(tryXPos)) {
          this.playerPos.x = targetX;
        }

        // Smooth sliding: Try Z movement alone
        const tryZPos = new THREE.Vector3(this.playerPos.x, this.getGroundHeight(this.playerPos.x, targetZ), targetZ);
        if (!this.checkCollision(tryZPos)) {
          this.playerPos.z = targetZ;
        }
      }

      // Smooth step height transition to terrain
      const currentSurfaceY = this.getGroundHeight(this.playerPos.x, this.playerPos.z);
      this.playerPos.y = THREE.MathUtils.lerp(this.playerPos.y, currentSurfaceY, 0.35);

      // Face direction of movement
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      this.playerRotation = THREE.MathUtils.lerp(this.playerRotation, targetRotation, 0.2);
      this.playerRig.root.rotation.y = this.playerRotation;

      // Play footstep audio
      this.footstepTimer += delta * (this.isSprinting ? 1.5 : 1.0);
      if (this.footstepTimer >= 0.38) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
      }
    } else {
      // Idle height snap to prevent sinking
      const idleSurfaceY = this.getGroundHeight(this.playerPos.x, this.playerPos.z);
      this.playerPos.y = THREE.MathUtils.lerp(this.playerPos.y, idleSurfaceY, 0.35);
    }

    // Update Player Rig position & animation
    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.animate(elapsedTime, speed, this.isInteracting);
    this.callbacks.onPlayerPositionChange(
      [this.playerPos.x, this.playerPos.y, this.playerPos.z],
      this.playerRotation
    );

    // 3. Smooth Third-Person Camera Follow
    const camOffset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance,
      Math.sin(this.cameraPitch) * this.cameraDistance + 1.2,
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance
    );
    const targetCamPos = this.playerPos.clone().add(camOffset);
    this.camera.position.lerp(targetCamPos, 0.12);

    const lookTarget = this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    this.camera.lookAt(lookTarget);

    // 4. Update NPCs animation & awareness
    this.npcRigs.forEach((rig, npcId) => {
      // If this NPC is following the player as companion
      if (this.activeCompanionId === npcId) {
        // Calculate destination ~1.8m behind player
        const backDir = new THREE.Vector3(Math.sin(this.playerRotation), 0, Math.cos(this.playerRotation));
        const desiredPos = this.playerPos.clone().addScaledVector(backDir, 1.8);
        desiredPos.y = this.getGroundHeight(desiredPos.x, desiredPos.z);

        const currentPos = rig.root.position;
        const dist = currentPos.distanceTo(desiredPos);
        if (dist > 0.25) {
          currentPos.lerp(desiredPos, Math.min(1.0, delta * 5.0));
          const lookTarget = this.playerPos.clone();
          lookTarget.y = currentPos.y;
          rig.root.lookAt(lookTarget);
          const compSpeed = dist > 0.6 ? (dist > 3.0 ? 6.5 : 3.8) : 1.5;
          rig.animate(elapsedTime, compSpeed, false);
        } else {
          rig.animate(elapsedTime, 0, false);
        }
        this.npcPositions.set(npcId, currentPos.clone());
      } else {
        rig.animate(elapsedTime, 0, false);
        const npcPos = this.npcPositions.get(npcId);
        if (npcPos) {
          const distToPlayer = this.playerPos.distanceTo(npcPos);
          if (distToPlayer < 4.0) {
            rig.lookAtPlayer(this.playerPos);
          }
        }
      }
    });

    // 5. Environmental animations
    this.updateParticlesFn(delta);

    // 6. Interaction Proximity Detection
    let closestTarget: InteractionTarget | null = null;
    let closestDist = 2.8;

    for (const target of this.interactiveTargets) {
      const tPos = new THREE.Vector3(...target.position);
      const dist = this.playerPos.distanceTo(tPos);
      if (dist < closestDist) {
        closestDist = dist;
        closestTarget = { ...target, distance: dist };
      }
    }

    if (closestTarget?.id !== this.currentTarget?.id) {
      this.currentTarget = closestTarget;
      this.callbacks.onInteractionTargetChange(this.currentTarget);
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }

  public removeInteractiveTarget(id: string) {
    const idx = this.interactiveTargets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.interactiveTargets.splice(idx, 1);
    }
    // Also remove visual mesh from scene if matches item
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.position.distanceTo(new THREE.Vector3(24, 0.3, -27)) < 0.5) {
        this.scene.remove(child);
      }
    });
  }

  public teleportPlayer(x: number, y: number, z: number, yawAngle?: number) {
    const groundY = this.getGroundHeight(x, z);
    this.playerPos.set(x, y !== 0 ? y : groundY, z);
    this.playerRig.root.position.copy(this.playerPos);

    if (yawAngle !== undefined) {
      this.playerRotation = yawAngle;
      this.playerRig.root.rotation.y = yawAngle;
      this.cameraYaw = yawAngle;
    }

    // Teleport companion alongside player if following
    if (this.activeCompanionId) {
      const compRig = this.npcRigs.get(this.activeCompanionId);
      if (compRig) {
        const compPos = new THREE.Vector3(x - 1.2, this.getGroundHeight(x - 1.2, z - 1.2), z - 1.2);
        compRig.root.position.copy(compPos);
        this.npcPositions.set(this.activeCompanionId, compPos);
      }
    }
  }

  public setCompanion(npcId: string | null) {
    this.activeCompanionId = npcId;
  }

  public getCompanion(): string | null {
    return this.activeCompanionId;
  }

  public updatePlayerAppearance(config: CharacterAppearance) {
    this.playerAppearance = { ...config, isPlayer: true };
    const curPos = this.playerPos.clone();
    const curRot = this.playerRotation;

    this.scene.remove(this.playerRig.root);
    this.playerRig = createCharacterModel(this.playerAppearance);
    this.playerRig.root.position.copy(curPos);
    this.playerRig.root.rotation.y = curRot;
    this.scene.add(this.playerRig.root);
  }

  public getPlayerAppearance(): CharacterAppearance {
    return { ...this.playerAppearance };
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
