import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ProjectsSectionProps {
  position?: [number, number, number];
}

const projects = [
  {
    title: 'TravelMap',
    tech: 'SvelteKit + NestJS + PostGIS',
    color: '#10b981',
    position: [-2.5, 0.5, 0] as [number, number, number],
    rotation: [0, 0.2, 0] as [number, number, number],
  },
  {
    title: 'RunApp',
    tech: 'Next.js + PostgreSQL',
    color: '#f59e0b',
    position: [0, 1, -1] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  {
    title: 'AntimoleBot',
    tech: 'Hono + Cloudflare Workers',
    color: '#8b5cf6',
    position: [2.5, 0.5, 0] as [number, number, number],
    rotation: [0, -0.2, 0] as [number, number, number],
  },
];

function ProjectScreen({ title, color, position, rotation, index }: {
  title: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.001;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={groupRef} position={position} rotation={rotation}>
        {/* Screen frame */}
        <RoundedBox args={[2.4, 1.5, 0.05]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Screen content (glowing panel) */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.2, 1.3]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>

        {/* Screen glow border */}
        <mesh position={[0, 0, 0.026]}>
          <ringGeometry args={[1.35, 1.38, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>

        {/* Dot indicator */}
        <mesh position={[-0.9, 0.5, 0.04]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Connection beam to floor */}
        <mesh position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.01, 2, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

export function ProjectsSection({ position = [0, 0, -30] }: ProjectsSectionProps) {
  return (
    <group position={position}>
      {projects.map((project, i) => (
        <ProjectScreen
          key={project.title}
          title={project.title}
          color={project.color}
          position={project.position}
          rotation={project.rotation}
          index={i}
        />
      ))}

      {/* Floor reflection plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial
          color="#050505"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
