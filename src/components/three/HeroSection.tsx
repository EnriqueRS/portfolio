import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

interface HeroSectionProps {
  position?: [number, number, number];
}

export function HeroSection({ position = [0, 0, 0] }: HeroSectionProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Particles that surround the name
  const particleCount = 500;
  const [particlePositions, particleSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 3;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.2 + Math.random() * 0.5;
    }
    return [pos, speeds];
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.elapsedTime;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const speed = particleSpeeds[i];
      const idx = i * 3;
      const x = posArray[idx];
      const z = posArray[idx + 2];
      const angle = speed * time * 0.1;
      posArray[idx] = x * Math.cos(angle * 0.01) - z * Math.sin(angle * 0.01);
      posArray[idx + 2] = x * Math.sin(angle * 0.01) + z * Math.cos(angle * 0.01);
      posArray[idx + 1] += Math.sin(time * speed) * 0.001;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main name - using simple geometry text */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <Center>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="#f6821f" emissive="#f6821f" emissiveIntensity={2} />
          </mesh>
          {/* Name using drei Text (bitmap) for reliability */}
        </Center>
      </Float>

      {/* Glowing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshBasicMaterial color="#f6821f" transparent opacity={0.4} />
      </mesh>

      {/* Secondary ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.005, 16, 100]} />
        <meshBasicMaterial color="#4158d0" transparent opacity={0.3} />
      </mesh>

      {/* Surrounding particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#f6821f"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Floor grid effect */}
      <gridHelper
        args={[20, 40, '#1a1a1a', '#111111']}
        position={[0, -3, 0]}
      />
    </group>
  );
}
