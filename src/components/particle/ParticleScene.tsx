import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

// Generate target positions for different shapes
function generateLetterE(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x = 0, y = 0;
    if (t < 0.25) { x = -1; y = (t / 0.25) * 3 - 1.5; }
    else if (t < 0.4) { x = ((t - 0.25) / 0.15) * 2 - 1; y = 1.5; }
    else if (t < 0.55) { x = ((t - 0.4) / 0.15) * 1.5 - 1; y = 0; }
    else if (t < 0.7) { x = ((t - 0.55) / 0.15) * 2 - 1; y = -1.5; }
    else { x = (Math.random() - 0.5) * 2.5; y = (Math.random() - 0.5) * 3.5; }
    pos[i * 3] = x + (Math.random() - 0.5) * 0.15;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.15;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return pos;
}

function generateTimeline(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = t * 4 - 2;
    const spread = (i % 20 < 3) ? 0.8 : 0.1;
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.05;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  return pos;
}

function generateGrid(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  const side = Math.cbrt(count);
  for (let i = 0; i < count; i++) {
    const x = (i % side) / side * 3 - 1.5;
    const y = (Math.floor(i / side) % side) / side * 3 - 1.5;
    const z = Math.floor(i / (side * side)) / side * 3 - 1.5;
    pos[i * 3] = x + (Math.random() - 0.5) * 0.05;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.05;
    pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.05;
  }
  return pos;
}

function generateSphere(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 1.5 + (Math.random() - 0.5) * 0.2;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return pos;
}

function generateCircle(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 1.2 + Math.random() * 0.8;
    pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 1] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  return pos;
}

function Particles({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const shapes = useMemo(() => [
    generateLetterE(PARTICLE_COUNT),
    generateTimeline(PARTICLE_COUNT),
    generateGrid(PARTICLE_COUNT),
    generateSphere(PARTICLE_COUNT),
    generateCircle(PARTICLE_COUNT),
  ], []);

  const currentPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    pos.set(shapes[0]);
    return pos;
  }, [shapes]);

  const colors = useMemo(() => {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const orange = new THREE.Color('#f6821f');
    const purple = new THREE.Color('#c850c0');
    const blue = new THREE.Color('#4158d0');
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random();
      const c = r < 0.6 ? orange : r < 0.8 ? purple : blue;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, []);

  // Track mouse
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    // Determine target shape
    const totalSections = shapes.length - 1;
    const rawSection = scrollProgress * totalSections;
    const sectionIdx = Math.min(Math.floor(rawSection), totalSections - 1);
    const blend = rawSection - sectionIdx;

    const from = shapes[sectionIdx];
    const to = shapes[Math.min(sectionIdx + 1, shapes.length - 1)];

    // Mouse repulsion
    const mx = mouseRef.current.x * viewport.width * 0.5;
    const my = mouseRef.current.y * viewport.height * 0.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      // Target position (lerp between shapes)
      const tx = THREE.MathUtils.lerp(from[idx], to[idx], blend);
      const ty = THREE.MathUtils.lerp(from[idx + 1], to[idx + 1], blend);
      const tz = THREE.MathUtils.lerp(from[idx + 2], to[idx + 2], blend);

      // Move toward target
      posArray[idx] += (tx - posArray[idx]) * 0.04;
      posArray[idx + 1] += (ty - posArray[idx + 1]) * 0.04;
      posArray[idx + 2] += (tz - posArray[idx + 2]) * 0.04;

      // Mouse repulsion
      const dx = posArray[idx] - mx;
      const dy = posArray[idx + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.8) {
        const force = (0.8 - dist) * 0.03;
        posArray[idx] += (dx / dist) * force;
        posArray[idx + 1] += (dy / dist) * force;
      }
    }
    posAttr.needsUpdate = true;

    // Slow rotation
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={currentPositions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <Particles scrollProgress={scrollProgress} />
    </>
  );
}

export default function ParticleScene() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) setScrollProgress(Math.max(0, Math.min(1, scrollTop / scrollHeight)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 4] }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: '#050505' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
