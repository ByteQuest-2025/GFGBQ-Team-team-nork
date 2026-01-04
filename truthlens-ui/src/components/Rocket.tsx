import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Sparkles, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export const Rocket = ({ isLaunching }: { isLaunching: boolean }) => {
    const group = useRef<THREE.Group>(null);
    const engineRef = useRef<THREE.Mesh>(null);
    const fireRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        if (group.current) {
            if (isLaunching) {
                // Acceleration curve
                const speed = Math.min(0.8, (t * 0.05));
                group.current.position.y += speed;
                group.current.rotation.z = Math.sin(t * 10) * 0.02; // Vibration
            } else {
                // Gentle hover before launch
                group.current.position.y = Math.sin(t) * 0.1;
            }
        }

        if (engineRef.current) {
            engineRef.current.scale.x = engineRef.current.scale.z = 1 + Math.sin(t * 30) * 0.1;
        }

        if (fireRef.current) {
            fireRef.current.scale.y = isLaunching ? 2 + Math.random() * 0.5 : 1 + Math.sin(t * 40) * 0.2;
            (fireRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isLaunching ? 5 + Math.random() * 2 : 2;
        }
    });

    return (
        <group ref={group}>
            {/* Main Body - Metallic Chrome */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.7, 3, 32]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} envMapIntensity={2} />
            </mesh>

            {/* Nose Cone - Neon Cyan */}
            <mesh position={[0, 2.2, 0]}>
                <coneGeometry args={[0.5, 1.5, 32]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} />
            </mesh>

            {/* Fins - Magenta Accents */}
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
                <mesh key={i} position={[Math.cos(angle) * 0.6, -1, Math.sin(angle) * 0.6] as any} rotation={[0, -angle, 0] as any}>
                    <boxGeometry args={[0.05, 1.2, 0.6]} />
                    <meshStandardMaterial color="#FF2D95" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* Engine Housing */}
            <mesh position={[0, -1.6, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 0.5, 16]} />
                <meshStandardMaterial color="#333" metalness={1} />
            </mesh>

            {/* Engine Fire/Exhaust */}
            <mesh ref={fireRef} position={[0, -2.2, 0] as any} rotation={[Math.PI, 0, 0] as any}>
                <coneGeometry args={[0.3, 1.5, 16]} />
                <meshStandardMaterial
                    color="#CCFF00"
                    emissive="#CCFF00"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Engine Smoke/Sparkles Particles */}
            <Sparkles
                count={isLaunching ? 200 : 50}
                scale={isLaunching ? 5 : 2}
                size={isLaunching ? 4 : 2}
                speed={isLaunching ? 2 : 0.4}
                color={isLaunching ? "#ffffff" : "#00E5FF"}
                position={[0, -2, 0] as any}
            />
        </group>
    );
};

export const SpaceScene = ({ isLaunching }: { isLaunching: boolean }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#00E5FF" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#FF2D95" />
            <rectAreaLight width={10} height={10} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={isLaunching ? 5 : 1} color="#CCFF00" />

            <Rocket isLaunching={isLaunching} />

            <gridHelper args={[100, 50, '#121316', '#071430']} position={[0, -5, 0]} />

            {/* Floor Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.9, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
        </>
    );
};
