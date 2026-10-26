import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Simple physics simulation without Rapier (avoids remount issues)
// Each card has position, velocity, and responds to gravity

interface CardState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
}

function useSimplePhysics(count: number, active: boolean) {
  const cards = useRef<CardState[]>([]);

  if (cards.current.length === 0) {
    for (let i = 0; i < count; i++) {
      cards.current.push({
        pos: new THREE.Vector3((i - 1.5) * 2, 5 + i * 1.5, (Math.random() - 0.5) * 2),
        vel: new THREE.Vector3(0, 0, 0),
        rot: new THREE.Euler(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.3
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
      });
    }
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const gravity = active ? -6 : 0;
    const floor = -2;
    const damping = 0.98;
    const bounce = 0.4;

    cards.current.forEach((card) => {
      if (!active) {
        // Float gently when not active
        card.vel.y *= 0.95;
        return;
      }

      card.vel.y += gravity * dt;
      card.vel.multiplyScalar(damping);
      card.pos.add(card.vel.clone().multiplyScalar(dt));

      // Floor collision
      if (card.pos.y < floor) {
        card.pos.y = floor;
        card.vel.y = -card.vel.y * bounce;
        card.vel.x *= 0.9;
        card.vel.z *= 0.9;
        card.rotVel.multiplyScalar(0.8);
      }

      // Wall collisions
      if (Math.abs(card.pos.x) > 4) {
        card.pos.x = Math.sign(card.pos.x) * 4;
        card.vel.x *= -bounce;
      }

      card.rot.x += card.rotVel.x;
      card.rot.y += card.rotVel.y;
      card.rot.z += card.rotVel.z;
      card.rotVel.multiplyScalar(0.995);
    });
  });

  return cards;
}

// ======= HERO OBJECT =======
function HeroObject({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    if (wireRef.current) {
      wireRef.current.rotation.x = -state.clock.elapsedTime * 0.1;
      wireRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
    }
    // Follow mouse
    const { pointer } = state;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, pointer.x * 0.5, 0.03);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, pointer.y * 0.3, 0.03);
  });

  return (
    <group visible={visible}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.2, 4]} />
          <MeshDistortMaterial
            color="#f6821f"
            metalness={0.9}
            roughness={0.1}
            distort={0.3}
            speed={2}
          />
        </mesh>
      </Float>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial color="#f6821f" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.2, 0.008, 16, 64]} />
        <meshBasicMaterial color="#f6821f" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ======= GRAVITY CARDS =======
const projectColors = ['#10b981', '#f59e0b', '#8b5cf6', '#f6821f'];

function GravityCardsSection({ active }: { active: boolean }) {
  const cards = useSimplePhysics(4, active);
  const meshRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    cards.current.forEach((card, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.copy(card.pos);
      mesh.rotation.copy(card.rot);
    });
  });

  return (
    <group>
      {projectColors.map((color, i) => (
        <group key={i} ref={(el) => { meshRefs.current[i] = el; }}>
          <RoundedBox args={[1.8, 1.1, 0.06]} radius={0.04} smoothness={4}>
            <meshStandardMaterial
              color="#111111"
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={0.08}
            />
          </RoundedBox>
          <mesh position={[-0.7, 0.35, 0.035]}>
            <boxGeometry args={[0.3, 0.03, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[-0.75, -0.35, 0.035]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ======= FLOATING BUBBLES =======
const techBubbles = [
  { color: '#f89820', size: 0.25 }, { color: '#6db33f', size: 0.22 },
  { color: '#3776ab', size: 0.24 }, { color: '#3178c6', size: 0.23 },
  { color: '#61dafb', size: 0.21 }, { color: '#2496ed', size: 0.2 },
  { color: '#326ce5', size: 0.22 }, { color: '#ff9900', size: 0.23 },
  { color: '#339933', size: 0.2 }, { color: '#4169e1', size: 0.2 },
  { color: '#c850c0', size: 0.24 }, { color: '#f6821f', size: 0.22 },
];

function BubblesSection({ active }: { active: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const velocities = useRef<THREE.Vector3[]>(
    techBubbles.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.01
    ))
  );

  useFrame((state) => {
    if (!active) return;
    const time = state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const vel = velocities.current[i];
      mesh.position.x += vel.x;
      mesh.position.y += vel.y + Math.sin(time + i) * 0.002;
      mesh.position.z += vel.z;

      // Bounce off bounds
      if (Math.abs(mesh.position.x) > 3) vel.x *= -1;
      if (Math.abs(mesh.position.y) > 2.5) vel.y *= -1;
      if (Math.abs(mesh.position.z) > 2) vel.z *= -1;

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.003;
    });
  });

  return (
    <group visible={active}>
      {techBubbles.map((bubble, i) => {
        const angle = (i / techBubbles.length) * Math.PI * 2;
        const r = 1.2 + (i % 3) * 0.6;
        return (
          <mesh
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            position={[Math.cos(angle) * r, (Math.random() - 0.5) * 2, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[bubble.size, 16, 16]} />
            <meshStandardMaterial
              color={bubble.color}
              emissive={bubble.color}
              emissiveIntensity={0.4}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ======= CAMERA =======
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera movement
    const t = scrollProgress;
    const targetY = Math.sin(t * Math.PI) * 0.5;
    const targetZ = 6 + Math.sin(t * Math.PI * 2) * 0.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ======= MAIN SCENE =======
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const section = scrollProgress < 0.25 ? 0 : scrollProgress < 0.5 ? 1 : scrollProgress < 0.75 ? 2 : 3;

  return (
    <>
      <CameraRig scrollProgress={scrollProgress} />

      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#f6821f" />
      <pointLight position={[-5, 3, -3]} intensity={0.4} color="#4158d0" />
      <pointLight position={[0, -2, 5]} intensity={0.3} color="#c850c0" />

      <Stars radius={50} depth={50} count={1500} factor={2} saturation={0} fade speed={0.3} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#080808" metalness={0.9} roughness={0.3} />
      </mesh>

      <HeroObject visible={section === 0} />
      <GravityCardsSection active={section === 1} />
      <BubblesSection active={section === 2} />
    </>
  );
}

export default function GravityScene() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      setScrollProgress(Math.max(0, Math.min(1, scrollTop / scrollHeight)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 6] }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: '#050505' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
