import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Environment, ContactShadows } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function CreditCard() {
  const meshRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.3, y: -0.2 });
  const dragStart = useRef({ x: 0, y: 0 });
  const rotStart = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (!isDragging) {
      // Gentle idle animation
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1 + 0.2;
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotation.x, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation.y, 0.1);
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    rotStart.current = { x: meshRef.current?.rotation.x || 0, y: meshRef.current?.rotation.y || 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.current.x) * 0.01;
    const dy = (e.clientY - dragStart.current.y) * 0.01;
    setRotation({ x: rotStart.current.x + dy, y: rotStart.current.y + dx });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0a2e3d'),
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.6,
    thickness: 0.5,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2,
    transparent: true,
    opacity: 0.85,
  });

  return (
    <group
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Card body */}
      <RoundedBox args={[3.4, 2.1, 0.08]} radius={0.12} smoothness={8}>
        <primitive object={glassMaterial} attach="material" />
      </RoundedBox>

      {/* Subtle edge glow */}
      <RoundedBox args={[3.44, 2.14, 0.02]} radius={0.13} smoothness={8}>
        <meshBasicMaterial color="#2dd4a8" transparent opacity={0.08} />
      </RoundedBox>

      {/* Card chip */}
      <mesh position={[-0.9, 0.3, 0.05]}>
        <boxGeometry args={[0.45, 0.35, 0.02]} />
        <meshPhysicalMaterial color="#c9a84c" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Chip lines */}
      {[0, 0.08, -0.08].map((y, i) => (
        <mesh key={i} position={[-0.9, 0.3 + y, 0.065]}>
          <boxGeometry args={[0.4, 0.01, 0.005]} />
          <meshBasicMaterial color="#a08030" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Card number */}
      <Text
        position={[0, -0.15, 0.05]}
        fontSize={0.2}
        color="#b8e8d8"
        anchorX="center"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff"
        letterSpacing={0.15}
      >
        4582  ••••  ••••  7291
      </Text>

      {/* Cardholder */}
      <Text
        position={[-0.85, -0.6, 0.05]}
        fontSize={0.12}
        color="#7ab8a8"
        anchorX="left"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff"
        letterSpacing={0.08}
      >
        JOHN DOE
      </Text>

      {/* Expiry */}
      <Text
        position={[1.1, -0.6, 0.05]}
        fontSize={0.12}
        color="#7ab8a8"
        anchorX="center"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff"
      >
        09/28
      </Text>

      {/* Bank name */}
      <Text
        position={[-0.85, 0.75, 0.05]}
        fontSize={0.18}
        color="#2dd4a8"
        anchorX="left"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff"
        fontWeight={700}
        letterSpacing={0.1}
      >
        NEXUS
      </Text>

      {/* Contactless icon - circles */}
      {[0.12, 0.18, 0.24].map((r, i) => (
        <mesh key={`c${i}`} position={[1.3, 0.7, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[r - 0.02, r, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#2dd4a8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function GlassCard3D() {
  return (
    <div className="w-full h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#2dd4a8" />
        <directionalLight position={[-3, 3, 2]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[0, 0, 4]} intensity={0.5} color="#5cbdb9" />
        <spotLight position={[0, 5, 5]} intensity={0.6} color="#2dd4a8" angle={0.4} penumbra={0.5} />

        <CreditCard />

        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={6} blur={2.5} color="#0a2e3d" />
      </Canvas>
    </div>
  );
}
