'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { buildPhilippineTricycleGroup, TricycleHotspot } from './TricycleModel';
import {
  RotateCcw,
  Sun,
  Moon,
  Compass,
  Eye,
  Info,
  Maximize2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface TricycleSceneProps {
  className?: string;
  autoRotateDefault?: boolean;
  interactive?: boolean;
  height?: string;
  showControls?: boolean;
}

type CameraPreset = 'HERO' | 'SIDECAR' | 'FRONT' | 'TOP';

export default function TricycleScene({
  className = '',
  autoRotateDefault = true,
  interactive = true,
  height = '480px',
  showControls = true,
}: TricycleSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGl, setHasWebGl] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(autoRotateDefault);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<CameraPreset>('HERO');
  const [selectedHotspot, setSelectedHotspot] = useState<TricycleHotspot | null>(null);

  // References for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tricycleGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const headlightLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Target camera positions
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.5, 1.4, 2.7));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0.05, 0.6, 0));

  // Pointer drag state
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotVelocityRef = useRef<{ y: number; x: number }>({ y: 0, x: 0 });

  // Camera presets coordinates
  const PRESET_COORDS: Record<CameraPreset, { pos: [number, number, number]; lookAt: [number, number, number] }> = {
    HERO: { pos: [2.5, 1.4, 2.7], lookAt: [0.05, 0.6, 0] },
    SIDECAR: { pos: [1.7, 0.95, 1.3], lookAt: [0.45, 0.6, 0.05] },
    FRONT: { pos: [0.05, 0.95, 3.2], lookAt: [0.05, 0.7, 0] },
    TOP: { pos: [0.1, 3.8, 0.1], lookAt: [0.05, 0.4, 0] },
  };

  const setCameraPreset = useCallback((preset: CameraPreset) => {
    setActivePreset(preset);
    const target = PRESET_COORDS[preset];
    targetCamPosRef.current.set(...target.pos);
    targetLookAtRef.current.set(...target.lookAt);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Test
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGl(false);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      setHasWebGl(false);
      setIsLoading(false);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsAutoRotating(false);
    }

    // 2. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 40);
    camera.position.copy(targetCamPosRef.current);
    cameraRef.current = camera;

    // 3. Setup Renderer with Shadow Map
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, heightPx);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (err) {
      setHasWebGl(false);
      setIsLoading(false);
      return;
    }

    // 4. Lighting Rig (Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 2.4);
    sunLight.position.set(4, 7, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 16;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Fill Light (Soft Navy)
    const fillLight = new THREE.DirectionalLight(0x93C5FD, 1.1);
    fillLight.position.set(-5, 3, -4);
    scene.add(fillLight);

    // Ground Rim / Bounce Light (Subtle Emerald)
    const rimLight = new THREE.DirectionalLight(0x087F5B, 0.8);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    // 5. Shadow Ground Receiver
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const ground = new THREE.Mesh(groundGeo, shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground Circular Ambient Shadow Disc
    const groundDiscGeo = new THREE.RingGeometry(0.1, 2.2, 32);
    const groundDiscMat = new THREE.MeshBasicMaterial({
      color: 0x07151E,
      opacity: 0.12,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const groundDisc = new THREE.Mesh(groundDiscGeo, groundDiscMat);
    groundDisc.rotation.x = -Math.PI / 2;
    groundDisc.position.y = 0.002;
    scene.add(groundDisc);

    // 6. Build & Add Tricycle
    const { group, wheels, headlightLight } = buildPhilippineTricycleGroup();
    tricycleGroupRef.current = group;
    wheelsRef.current = wheels;
    headlightLightRef.current = headlightLight;
    headlightLight.intensity = isNightMode ? 3.0 : 0.8;
    scene.add(group);

    setIsLoading(false);

    // 7. Visibility Observer (Pause animation when off-screen to save battery)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 8. Render & Animation Loop
    let lastTime = performance.now();
    const currentLookAt = new THREE.Vector3(0.05, 0.6, 0);

    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth camera interpolation towards target
      camera.position.lerp(targetCamPosRef.current, 0.06);
      currentLookAt.lerp(targetLookAtRef.current, 0.06);
      camera.lookAt(currentLookAt);

      // Handle Inertia / Drag Rotation
      if (tricycleGroupRef.current) {
        if (isAutoRotating && !isDraggingRef.current) {
          tricycleGroupRef.current.rotation.y += delta * 0.45;
        }

        // Apply drag velocity decay
        tricycleGroupRef.current.rotation.y += rotVelocityRef.current.y;
        rotVelocityRef.current.y *= 0.92;

        // Subtle wheel roll when rotating
        wheelsRef.current.forEach((w) => {
          w.rotation.x += rotVelocityRef.current.y * 1.5;
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Pointer Drag Handlers
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !interactive || !tricycleGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevPointerRef.current.x;
      const deltaY = clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: clientX, y: clientY };

      const sensitivity = 0.007;
      rotVelocityRef.current.y = deltaX * sensitivity;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);

      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // Clean WebGL resources
      scene.clear();
      renderer.dispose();
      if (domElem.parentNode) domElem.parentNode.removeChild(domElem);
    };
  }, [interactive, isAutoRotating, isNightMode]);

  // Toggle night / day lighting
  const toggleNightMode = () => {
    const next = !isNightMode;
    setIsNightMode(next);
    if (headlightLightRef.current) {
      headlightLightRef.current.intensity = next ? 3.5 : 0.8;
      headlightLightRef.current.color.setHex(next ? 0xFEF08A : 0xFFFBEB);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden select-none bg-gradient-to-b from-slate-900/5 via-slate-900/10 to-slate-900/20 dark:from-slate-900/60 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800 ${className}`}
      style={{ height }}
    >
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md z-20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg animate-pulse mb-3">
            <span>A</span>
            <span className="text-emerald-200">R</span>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Rendering 3D Philippine Tricycle...
          </span>
          <span className="text-[10px] text-slate-500">San Jose de Buenavista Unit #SJB-042</span>
        </div>
      )}

      {/* WebGL Fallback if device does not support WebGL */}
      {!hasWebGl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-emerald-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 z-20">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-black text-3xl shadow-xl mb-4">
            🛺
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Philippine Tricycle — San Jose Model
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-1">
            Euro-4 compliant motorized tricycle unit #SJB-042 with certified sidecar passenger cabin, MTOP franchise permit, and TODA verification.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full text-[11px] font-bold">
              ✓ 2-Seater Sidecar
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full text-[11px] font-bold">
              ✓ MTOP Certified
            </span>
          </div>
        </div>
      )}

      {/* Top Floating Badge */}
      <div className="absolute top-3.5 left-4 z-10 pointer-events-none flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-white/85 dark:bg-slate-900/85 backdrop-blur-md text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Interactive 3D Model
        </span>
        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-md">
          Unit #SJB-042
        </span>
      </div>

      {/* Bottom Floating Control Dock */}
      {showControls && hasWebGl && !isLoading && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-10 flex items-center justify-between sm:justify-end gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md">
          {/* Camera Angles */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCameraPreset('HERO')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activePreset === 'HERO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="3/4 Hero View"
            >
              3/4 View
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('SIDECAR')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activePreset === 'SIDECAR'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Passenger Sidecar Cabin"
            >
              Sidecar
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('FRONT')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activePreset === 'FRONT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Front View"
            >
              Front
            </button>
          </div>

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Action Toggles */}
          <div className="flex items-center gap-1">
            {/* Auto-spin Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                isAutoRotating
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isAutoRotating ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>

            {/* Night / Day Headlight Toggle */}
            <button
              type="button"
              onClick={toggleNightMode}
              className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                isNightMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isNightMode ? 'Daylight Mode' : 'Night Lighting Mode'}
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Touch Drag Hint (fades out after interaction) */}
      <div className="absolute bottom-3 left-4 hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        <span>Click & drag to inspect 360°</span>
      </div>
    </div>
  );
}
