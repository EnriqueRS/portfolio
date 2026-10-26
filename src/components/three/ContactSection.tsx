import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface ContactSectionProps {
  position?: [number, number, number];
}

function Portal() {
  const ringRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  const particleCount = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Main portal ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#f6821f"
          emissive="#f6821f"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner ring */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[1.7, 0.015, 16, 64]} />
        <meshBasicMaterial color="#c850c0" transparent opacity={0.5} />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle ring */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#f6821f"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function ContactSection({ position = [0, 0, -60] }: ContactSectionProps) {
  return (
    <group position={position}>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <Portal />
      </Float>

      {/* Ambient floor beams */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3, -2, Math.sin(angle) * 3]}
            rotation={[0, 0, 0]}
          >
            <cylinderGeometry args={[0.005, 0.005, 4, 4]} />
            <meshBasicMaterial color="#f6821f" transparent opacity={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}
