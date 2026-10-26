import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface TechStackSectionProps {
  position?: [number, number, number];
}

const techItems = [
  { name: 'Java', color: '#f89820' },
  { name: 'Spring', color: '#6db33f' },
  { name: 'Python', color: '#3776ab' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'React', color: '#61dafb' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'K8s', color: '#326ce5' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Node.js', color: '#339933' },
  { name: 'PostgreSQL', color: '#4169e1' },
  { name: 'LangChain', color: '#1c3c3c' },
  { name: 'AI/ML', color: '#c850c0' },
];

function OrbitingSphere({ color, index, total, radius }: {
  color: string;
  index: number;
  total: number;
  radius: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const angle = (index / total) * Math.PI * 2;
  const orbitSpeed = 0.15 + (index % 3) * 0.05;
  const yOffset = (index % 3 - 1) * 0.8;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * orbitSpeed;
    const currentAngle = angle + time;
    meshRef.current.position.x = Math.cos(currentAngle) * radius;
    meshRef.current.position.z = Math.sin(currentAngle) * radius;
    meshRef.current.position.y = yOffset + Math.sin(time * 2) * 0.2;
    meshRef.current.rotation.y += 0.01;

    if (trailRef.current) {
      trailRef.current.position.copy(meshRef.current.position);
      trailRef.current.position.x -= Math.cos(currentAngle + 0.1) * 0.2;
      trailRef.current.position.z -= Math.sin(currentAngle + 0.1) * 0.2;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Trail dot */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </>
  );
}

export function TechStackSection({ position = [0, 0, -45] }: TechStackSectionProps) {
  // Orbit rings
  const ringCount = 3;
  const rings = useMemo(() =>
    Array.from({ length: ringCount }, (_, i) => ({
      radius: 1.5 + i * 1.2,
      rotation: [Math.PI / 2 + i * 0.2, 0, i * 0.3] as [number, number, number],
    })), []);

  return (
    <group position={position}>
      {/* Central core */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#f6821f"
            emissive="#f6821f"
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Orbit rings (visual) */}
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <torusGeometry args={[ring.radius, 0.003, 8, 64]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Orbiting tech spheres */}
      {techItems.map((tech, i) => (
        <OrbitingSphere
          key={tech.name}
          color={tech.color}
          index={i}
          total={techItems.length}
          radius={1.5 + (i % 3) * 1.2}
        />
      ))}

      {/* Radial grid on floor */}
      <gridHelper
        args={[10, 20, '#111111', '#0a0a0a']}
        position={[0, -3, 0]}
      />
    </group>
  );
}
