import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface ExperienceSectionProps {
  position?: [number, number, number];
}

const experiences = [
  { title: 'Senior Tech Engineer', company: 'Allfunds Bank', year: '2024', color: '#f6821f' },
  { title: 'Senior Developer', company: 'Tenant Evaluation', year: '2021', color: '#c850c0' },
  { title: 'Mobile/Backend Dev', company: 'Grupo AL', year: '2015', color: '#4158d0' },
  { title: 'ABAP Developer', company: 'CEMOSA', year: '2014', color: '#00d4aa' },
];

function TimelineNode({ position, color, index }: { position: [number, number, number]; color: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.2;
  });

  return (
    <Float speed={1 + index * 0.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={position}>
        {/* Main geometric shape */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.005, 16, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>

        {/* Connection line downward */}
        {index < experiences.length - 1 && (
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 1.5, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

export function ExperienceSection({ position = [0, 0, -15] }: ExperienceSectionProps) {
  return (
    <group position={position}>
      {/* Timeline nodes arranged vertically */}
      {experiences.map((exp, i) => (
        <TimelineNode
          key={exp.year}
          position={[i % 2 === 0 ? -1.5 : 1.5, 2 - i * 2, 0]}
          color={exp.color}
          index={i}
        />
      ))}

      {/* Central vertical line */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 8, 8]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.5} />
      </mesh>

      {/* Ambient light panels */}
      <mesh position={[-4, 0, -2]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color="#f6821f" transparent opacity={0.1} />
      </mesh>
      <mesh position={[4, 0, -2]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color="#4158d0" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
