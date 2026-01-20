import * as THREE from 'three'
import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'

export const Vegetation = () => {
    const grassCount = 1000 // Reduced from 5000 for stability check
    const treeCount = 20

    const grassData = useMemo(() => {
        return Array.from({ length: grassCount }).map(() => ({
            position: [
                (Math.random() - 0.5) * 90,
                0,
                (Math.random() - 0.5) * 90
            ],
            rotation: [0, Math.random() * Math.PI, 0],
            scale: 0.5 + Math.random() * 0.5
        }))
    }, [])

    const treeData = useMemo(() => {
        return Array.from({ length: treeCount }).map(() => ({
            position: [
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
            ],
            rotation: [0, Math.random() * Math.PI, 0],
            scale: 0.8 + Math.random() * 0.5
        }))
    }, [])

    return (
        <group>
            {/* GRASS - Optimized Instances */}
            <Instances range={grassCount}>
                <planeGeometry args={[0.2, 0.6]} />
                <meshStandardMaterial color="#4a6b22" side={THREE.DoubleSide} />
                {grassData.map((data, i) => (
                    <Instance
                        key={i}
                        position={data.position as any}
                        rotation={data.rotation as any}
                        scale={[data.scale, data.scale, data.scale]}
                    />
                ))}
            </Instances>

            {/* SAL TREES - Simple shapes for now */}
            {treeData.map((data, i) => {
                // Avoid placing trees too close to center (spawn)
                if (Math.abs(data.position[0]) < 5 && Math.abs(data.position[2]) < 5) return null

                return (
                    <group key={i} position={data.position as any} rotation={data.rotation as any} scale={data.scale}>
                        {/* Trunk */}
                        <mesh position={[0, 2.5, 0]} castShadow>
                            <cylinderGeometry args={[0.3, 0.5, 5]} />
                            <meshStandardMaterial color="#3e2723" roughness={0.9} />
                        </mesh>
                        {/* Canopy */}
                        <mesh position={[0, 5, 0]} castShadow>
                            <dodecahedronGeometry args={[2.5]} />
                            <meshStandardMaterial color="#2e4e1e" roughness={0.8} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    )
}
