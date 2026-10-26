import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField } from './ParticleField';
import { HeroSection } from './HeroSection';
import { ExperienceSection } from './ExperienceSection';
import { ProjectsSection } from './ProjectsSection';
import { TechStackSection } from './TechStackSection';
import { ContactSection } from './ContactSection';

// Camera waypoints for each section
const WAYPOINTS = [
  { pos: [0, 0, 5], look: [0, 0, 0] },        // Hero
  { pos: [0, 0, -10], look: [0, 0, -15] },     // Experience
  { pos: [0, 0.5, -25], look: [0, 0, -30] },   // Projects
  { pos: [0, 1, -40], look: [0, 0, -45] },     // Tech Stack
  { pos: [0, 0, -55], look: [0, 0, -60] },     // Contact
];

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 5));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const totalSegments = WAYPOINTS.length - 1;
    const rawSegment = scrollProgress * totalSegments;
    const segmentIndex = Math.min(Math.floor(rawSegment), totalSegments - 1);
    const segmentProgress = rawSegment - segmentIndex;

    const from = WAYPOINTS[segmentIndex];
    const to = WAYPOINTS[Math.min(segmentIndex + 1, WAYPOINTS.length - 1)];

    const eased = segmentProgress * segmentProgress * (3 - 2 * segmentProgress);

    targetPos.current.set(
      THREE.MathUtils.lerp(from.pos[0], to.pos[0], eased),
      THREE.MathUtils.lerp(from.pos[1], to.pos[1], eased),
      THREE.MathUtils.lerp(from.pos[2], to.pos[2], eased),
    );

    targetLook.current.set(
      THREE.MathUtils.lerp(from.look[0], to.look[0], eased),
      THREE.MathUtils.lerp(from.look[1], to.look[1], eased),
      THREE.MathUtils.lerp(from.look[2], to.look[2], eased),
    );

    currentPos.current.lerp(targetPos.current, 0.05);
    currentLook.current.lerp(targetLook.current, 0.05);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <CameraController scrollProgress={scrollProgress} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#050505', 15, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#f6821f" />
      <pointLight position={[-10, -10, -30]} intensity={0.3} color="#4158d0" />
      <pointLight position={[0, 5, -45]} intensity={0.4} color="#c850c0" />
      <pointLight position={[5, 3, -60]} intensity={0.5} color="#f6821f" />

      {/* Stars */}
      <Stars radius={100} depth={80} count={3000} factor={2} saturation={0} fade speed={0.5} />

      {/* Particles */}
      <ParticleField count={1500} spread={30} size={0.015} color="#ffffff" />

      {/* Sections */}
      <HeroSection position={[0, 0, 0]} />
      <ExperienceSection position={[0, 0, -15]} />
      <ProjectsSection position={[0, 0, -30]} />
      <TechStackSection position={[0, 0, -45]} />
      <ContactSection position={[0, 0, -60]} />

      {/* Corridor */}
      <CorridorWalls />
    </>
  );
}

function CorridorWalls() {
  return (
    <group>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={`left-${i}`} position={[-6, 0, -i * 5]}>
          <boxGeometry args={[0.01, 6, 0.01]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={`right-${i}`} position={[6, 0, -i * 5]}>
          <boxGeometry args={[0.01, 6, 0.01]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 28 }, (_, i) => (
        <mesh key={`floor-${i}`} position={[0, -3, -i * 2.5]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.005, 12, 0.005]} />
          <meshBasicMaterial color="#0f0f0f" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function InfiniteRoom() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
    }}>
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 200, position: [0, 0, 5] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: '#050505' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
