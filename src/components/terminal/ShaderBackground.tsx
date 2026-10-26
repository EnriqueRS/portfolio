import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * smoothNoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;

    float n1 = fbm(uv * 3.0 + t);
    float n2 = fbm(uv * 2.0 - t * 0.7 + vec2(5.0, 3.0));
    float n3 = fbm(uv * 4.0 + t * 0.3 + vec2(n1, n2));

    vec3 green = vec3(0.0, 1.0, 0.53);
    vec3 cyan = vec3(0.0, 0.8, 0.9);
    vec3 dark = vec3(0.02, 0.02, 0.03);

    float intensity = n3 * 0.15 + n1 * 0.05;
    vec3 color = mix(dark, mix(green, cyan, n2) * intensity, smoothstep(0.3, 0.7, n1));

    // Scanline effect
    float scanline = sin(uv.y * uResolution.y * 0.5) * 0.02;
    color += scanline;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        }}
      />
    </mesh>
  );
}

export default function ShaderBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1]}
        style={{ background: '#0a0a0a' }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
