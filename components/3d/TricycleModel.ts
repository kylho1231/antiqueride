import * as THREE from 'three';

export interface TricycleHotspot {
  id: string;
  name: string;
  description: string;
  position: THREE.Vector3;
}

export function createTricycleDecalCanvas(text: string, subtext?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background emerald / navy
    ctx.fillStyle = '#102A43';
    ctx.fillRect(0, 0, 512, 256);
    
    // Top & bottom accent stripe
    ctx.fillStyle = '#F5B301';
    ctx.fillRect(0, 0, 512, 16);
    ctx.fillRect(0, 240, 512, 16);
    
    ctx.fillStyle = '#087F5B';
    ctx.fillRect(0, 16, 512, 20);

    // Main Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 110);

    if (subtext) {
      ctx.fillStyle = '#F5B301';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText(subtext, 256, 175);
    }
  }
  return canvas;
}

export function buildPhilippineTricycleGroup(): {
  group: THREE.Group;
  wheels: THREE.Group[];
  headlightMesh: THREE.Mesh;
  headlightLight: THREE.PointLight;
  hotspots: TricycleHotspot[];
} {
  const root = new THREE.Group();
  root.name = 'PhilippineTricycle';

  // Palette Materials
  const emeraldMat = new THREE.MeshStandardMaterial({
    color: 0x087F5B,
    roughness: 0.3,
    metalness: 0.2,
  });
  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x102A43,
    roughness: 0.3,
    metalness: 0.3,
  });
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xF5B301,
    roughness: 0.4,
    metalness: 0.1,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    roughness: 0.15,
    metalness: 0.9,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.7,
  });
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.85,
    metalness: 0.05,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.6,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93C5FD,
    transmission: 0.8,
    opacity: 0.5,
    transparent: true,
    roughness: 0.1,
    ior: 1.4,
  });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xFFFBEB,
    emissive: 0xFDE047,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    emissive: 0xDC2626,
    emissiveIntensity: 0.8,
  });

  const wheels: THREE.Group[] = [];

  // Helper to build a spoked wheel
  function buildWheel(radius: number, width: number): THREE.Group {
    const wheelGroup = new THREE.Group();

    // Tire (torus-like using cylinder)
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, rubberMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim
    const rimRadius = radius * 0.75;
    const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width * 0.85, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheelGroup.add(rim);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, width * 1.1, 16);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, chromeMat);
    wheelGroup.add(hub);

    // Spokes
    const spokeMat = chromeMat;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const spokeGeo = new THREE.CylinderGeometry(0.012, 0.012, rimRadius * 1.9, 8);
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    return wheelGroup;
  }

  // ==========================================
  // 1. MOTORCYCLE UNIT (Left side, X ~ -0.45)
  // ==========================================
  const moto = new THREE.Group();
  moto.position.x = -0.45;

  // Front Wheel
  const frontWheel = buildWheel(0.32, 0.12);
  frontWheel.position.set(0, 0.32, 0.85);
  moto.add(frontWheel);
  wheels.push(frontWheel);

  // Rear Wheel
  const rearWheel = buildWheel(0.32, 0.12);
  rearWheel.position.set(0, 0.32, -0.65);
  moto.add(rearWheel);
  wheels.push(rearWheel);

  // Front Fork
  const forkGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72, 12);
  const leftFork = new THREE.Mesh(forkGeo, chromeMat);
  leftFork.position.set(-0.08, 0.58, 0.72);
  leftFork.rotation.x = -0.3;
  moto.add(leftFork);

  const rightFork = new THREE.Mesh(forkGeo, chromeMat);
  rightFork.position.set(0.08, 0.58, 0.72);
  rightFork.rotation.x = -0.3;
  moto.add(rightFork);

  // Handlebars
  const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12);
  handleGeo.rotateZ(Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, chromeMat);
  handle.position.set(0, 0.88, 0.62);
  moto.add(handle);

  // Grips
  const gripGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.1, 12);
  gripGeo.rotateZ(Math.PI / 2);
  const leftGrip = new THREE.Mesh(gripGeo, rubberMat);
  leftGrip.position.set(-0.3, 0.88, 0.62);
  const rightGrip = new THREE.Mesh(gripGeo, rubberMat);
  rightGrip.position.set(0.3, 0.88, 0.62);
  moto.add(leftGrip, rightGrip);

  // Mirrors
  const mirrorStemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8);
  const mirrorDiscGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16);
  mirrorDiscGeo.rotateX(Math.PI / 2);

  const leftStem = new THREE.Mesh(mirrorStemGeo, chromeMat);
  leftStem.position.set(-0.25, 0.96, 0.63);
  const leftDisc = new THREE.Mesh(mirrorDiscGeo, chromeMat);
  leftDisc.position.set(-0.25, 1.02, 0.63);
  moto.add(leftStem, leftDisc);

  const rightStem = new THREE.Mesh(mirrorStemGeo, chromeMat);
  rightStem.position.set(0.25, 0.96, 0.63);
  const rightDisc = new THREE.Mesh(mirrorDiscGeo, chromeMat);
  rightDisc.position.set(0.25, 1.02, 0.63);
  moto.add(rightStem, rightDisc);

  // Headlight (Round Chrome casing with glowing lens)
  const headlightCasing = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    chromeMat
  );
  headlightCasing.position.set(0, 0.74, 0.78);
  headlightCasing.scale.set(1, 1, 0.8);
  moto.add(headlightCasing);

  const headlightMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.09, 16),
    headlightMat
  );
  headlightMesh.position.set(0, 0.74, 0.87);
  moto.add(headlightMesh);

  // Point light for headlight
  const headlightLight = new THREE.PointLight(0xFEF08A, 1.5, 8);
  headlightLight.position.set(0, 0.74, 1.1);
  moto.add(headlightLight);

  // Motorcycle Main Frame
  const frameGeo = new THREE.BoxGeometry(0.14, 0.12, 1.1);
  const frame = new THREE.Mesh(frameGeo, darkMetalMat);
  frame.position.set(0, 0.44, 0.05);
  frame.castShadow = true;
  moto.add(frame);

  // Gas Tank (Curved top with AntiqueRide emerald finish)
  const tankGeo = new THREE.BoxGeometry(0.24, 0.22, 0.48);
  const tank = new THREE.Mesh(tankGeo, emeraldMat);
  tank.position.set(0, 0.72, 0.32);
  tank.castShadow = true;
  moto.add(tank);

  // Gas Tank Accent Stripe
  const tankStripeGeo = new THREE.BoxGeometry(0.25, 0.05, 0.46);
  const tankStripe = new THREE.Mesh(tankStripeGeo, yellowMat);
  tankStripe.position.set(0, 0.72, 0.32);
  moto.add(tankStripe);

  // Engine Block (detailed fins and cylinder)
  const engineGeo = new THREE.BoxGeometry(0.22, 0.28, 0.32);
  const engine = new THREE.Mesh(engineGeo, darkMetalMat);
  engine.position.set(0, 0.34, 0.18);
  engine.castShadow = true;
  moto.add(engine);

  // Engine Cooling Fins
  for (let f = 0; f < 4; f++) {
    const finGeo = new THREE.BoxGeometry(0.25, 0.02, 0.3);
    const fin = new THREE.Mesh(finGeo, chromeMat);
    fin.position.set(0, 0.26 + f * 0.06, 0.18);
    moto.add(fin);
  }

  // Exhaust Pipe & Muffler
  const exhaustGeo = new THREE.CylinderGeometry(0.032, 0.038, 0.85, 12);
  exhaustGeo.rotateX(Math.PI / 2);
  const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaust.position.set(0.14, 0.24, -0.22);
  exhaust.castShadow = true;
  moto.add(exhaust);

  // Driver Seat
  const seatGeo = new THREE.BoxGeometry(0.22, 0.1, 0.48);
  const seat = new THREE.Mesh(seatGeo, leatherMat);
  seat.position.set(0, 0.67, -0.15);
  seat.castShadow = true;
  moto.add(seat);

  // Rear Mudguard & Tail Light
  const rearGuardGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 16, 1, false, 0, Math.PI);
  rearGuardGeo.rotateZ(Math.PI / 2);
  const rearGuard = new THREE.Mesh(rearGuardGeo, emeraldMat);
  rearGuard.position.set(0, 0.32, -0.65);
  moto.add(rearGuard);

  const tailLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.05, 0.04),
    tailLightMat
  );
  tailLight.position.set(0, 0.46, -0.92);
  moto.add(tailLight);

  root.add(moto);

  // ==========================================
  // 2. CONNECTING CHASSIS (Bridging Motorcycle to Sidecar)
  // ==========================================
  const bridgeZPositions = [0.45, 0.0, -0.45];
  bridgeZPositions.forEach((z) => {
    const barGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.95, 12);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, darkMetalMat);
    bar.position.set(0.025, 0.28, z);
    bar.castShadow = true;
    root.add(bar);
  });

  // ==========================================
  // 3. PHILIPPINE SIDECAR UNIT (Right side, X ~ 0.55)
  // ==========================================
  const sidecar = new THREE.Group();
  sidecar.position.x = 0.55;

  // Sidecar Outer Wheel (Right side, X ~ 0.52 from sidecar center)
  const sidecarWheel = buildWheel(0.32, 0.12);
  sidecarWheel.position.set(0.52, 0.32, -0.05);
  sidecar.add(sidecarWheel);
  wheels.push(sidecarWheel);

  // Sidecar Wheel Mudguard (Fender)
  const fenderGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.16, 16, 1, false, 0, Math.PI);
  fenderGeo.rotateZ(Math.PI / 2);
  const fender = new THREE.Mesh(fenderGeo, emeraldMat);
  fender.position.set(0.52, 0.32, -0.05);
  sidecar.add(fender);

  // Sidecar Cabin Base / Tub
  const tubFloor = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.08, 1.35),
    darkMetalMat
  );
  tubFloor.position.set(0, 0.28, 0);
  tubFloor.castShadow = true;
  tubFloor.receiveShadow = true;
  sidecar.add(tubFloor);

  // Sidecar Body Panels (Lower Emerald, Upper Deep Navy, Accent Stripes)
  // Front curved nose
  const noseGeo = new THREE.BoxGeometry(0.84, 0.44, 0.28);
  const nose = new THREE.Mesh(noseGeo, emeraldMat);
  nose.position.set(0, 0.52, 0.56);
  nose.castShadow = true;
  sidecar.add(nose);

  // Front Yellow Accent Stripe
  const noseStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.06, 0.29),
    yellowMat
  );
  noseStripe.position.set(0, 0.52, 0.56);
  sidecar.add(noseStripe);

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.58, 0.12),
    navyMat
  );
  backWall.position.set(0, 0.59, -0.62);
  backWall.castShadow = true;
  sidecar.add(backWall);

  // Right Outer Wall
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.48, 1.25),
    emeraldMat
  );
  rightWall.position.set(0.40, 0.54, 0);
  rightWall.castShadow = true;
  sidecar.add(rightWall);

  // Left Inner Wall (low entry step for passenger ease of boarding)
  const leftEntryWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.24, 0.45),
    navyMat
  );
  leftEntryWall.position.set(-0.40, 0.42, 0.42);
  sidecar.add(leftEntryWall);

  const leftBackWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.48, 0.48),
    navyMat
  );
  leftBackWall.position.set(-0.40, 0.54, -0.4);
  sidecar.add(leftBackWall);

  // Passenger Bench Seats (Comfortable 2-passenger bench inside sidecar)
  const benchCushion = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.12, 0.38),
    leatherMat
  );
  benchCushion.position.set(0, 0.44, -0.32);
  benchCushion.castShadow = true;
  sidecar.add(benchCushion);

  const benchBackrest = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.32, 0.1),
    leatherMat
  );
  benchBackrest.position.set(0, 0.68, -0.48);
  benchBackrest.castShadow = true;
  sidecar.add(benchBackrest);

  // Front Passenger Grab Handle (Polished chrome tube)
  const grabGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.72, 12);
  grabGeo.rotateZ(Math.PI / 2);
  const grab = new THREE.Mesh(grabGeo, chromeMat);
  grab.position.set(0, 0.76, 0.4);
  sidecar.add(grab);

  // Sidecar Tinted Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.28, 0.02),
    glassMat
  );
  windshield.position.set(0, 0.88, 0.56);
  windshield.rotation.x = -0.18;
  sidecar.add(windshield);

  // Sidecar Roof / Canopy (Iconic Philippine curved roof with luggage rack)
  const roofPosts: THREE.Mesh[] = [];
  const postCoords = [
    [-0.38, 0.56],
    [0.38, 0.56],
    [-0.38, -0.58],
    [0.38, -0.58],
  ];
  postCoords.forEach(([px, pz]) => {
    const postGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.62, 10);
    const post = new THREE.Mesh(postGeo, chromeMat);
    post.position.set(px, 1.05, pz);
    sidecar.add(post);
    roofPosts.push(post);
  });

  // Canopy Roof Top
  const canopyGeo = new THREE.BoxGeometry(0.94, 0.06, 1.38);
  const canopy = new THREE.Mesh(canopyGeo, navyMat);
  canopy.position.set(0, 1.36, 0);
  canopy.castShadow = true;
  sidecar.add(canopy);

  // Canopy Accent Trim (Antique Gold / Yellow #F5B301)
  const canopyTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.03, 1.4),
    yellowMat
  );
  canopyTrim.position.set(0, 1.34, 0);
  sidecar.add(canopyTrim);

  // Roof Luggage Rack Rails
  const railMat = chromeMat;
  const leftRail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 8), railMat);
  leftRail.rotateX(Math.PI / 2);
  leftRail.position.set(-0.38, 1.44, 0);
  const rightRail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 8), railMat);
  rightRail.rotateX(Math.PI / 2);
  rightRail.position.set(0.38, 1.44, 0);
  sidecar.add(leftRail, rightRail);

  // Municipal Body Number Sign on Front Canopy ("SJB-042" San Jose de Buenavista)
  try {
    const decalCanvas = createTricycleDecalCanvas('SJB-042', 'SAN JOSE DE BUENAVISTA');
    const decalTex = new THREE.CanvasTexture(decalCanvas);
    decalTex.anisotropy = 4;
    const plateGeo = new THREE.PlaneGeometry(0.48, 0.16);
    const plateMat = new THREE.MeshStandardMaterial({
      map: decalTex,
      roughness: 0.3,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.set(0, 1.26, 0.69);
    sidecar.add(plateMesh);

    // Rear plate
    const rearPlateMesh = plateMesh.clone();
    rearPlateMesh.rotation.y = Math.PI;
    rearPlateMesh.position.set(0, 1.26, -0.69);
    sidecar.add(rearPlateMesh);
  } catch (err) {
    // Canvas texture fallback
  }

  // Sidecar Front Amber Running Light
  const sidecarMarker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16),
    headlightMat
  );
  sidecarMarker.rotateX(Math.PI / 2);
  sidecarMarker.position.set(0.38, 0.62, 0.7);
  sidecar.add(sidecarMarker);

  root.add(sidecar);

  // Hotspot coordinates for interactive inspection
  const hotspots: TricycleHotspot[] = [
    {
      id: 'sidecar',
      name: 'Passenger Sidecar Cabin',
      description: 'Spacious 2-seater upholstered cabin with rain canopy, grab handles, and easy step entry.',
      position: new THREE.Vector3(0.55, 0.65, 0),
    },
    {
      id: 'mtop',
      name: 'Verified MTOP Unit Plate',
      description: 'LGU San Jose de Buenavista body number #SJB-042 with franchise permit and TODA QR verification.',
      position: new THREE.Vector3(0.55, 1.26, 0.72),
    },
    {
      id: 'engine',
      name: 'Reliable 150cc 4-Stroke Engine',
      description: 'Euro-4 compliant fuel-efficient powertrain optimized for Antique coastal and provincial routes.',
      position: new THREE.Vector3(-0.45, 0.34, 0.18),
    },
  ];

  return {
    group: root,
    wheels,
    headlightMesh,
    headlightLight,
    hotspots,
  };
}
