import { useRef, useState } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Target = ({ position = [0, 2, 0] }: { position?: [number, number, number] }) => {
    const [health, setHealth] = useState(100)
    const [hit, setHit] = useState(false)
    const meshRef = useRef<THREE.Mesh>(null)
    const [destroyed, setDestroyed] = useState(false)

    // Flash red on hit
    useFrame((state, delta) => {
        if (!meshRef.current || destroyed) return

        if (hit) {
            (meshRef.current.material as THREE.MeshStandardMaterial).color.lerp(new THREE.Color('red'), 0.2)
            meshRef.current.scale.lerp(new THREE.Vector3(0.9, 0.9, 0.9), 0.1) // Wince
        } else {
            (meshRef.current.material as THREE.MeshStandardMaterial).color.lerp(new THREE.Color('orange'), 0.1)
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1) // Recover
        }
    })

    const onHit = (damage: number = 100) => {
        if (destroyed) return

        setHit(true)
        setHealth(prev => {
            const newHealth = prev - damage
            if (newHealth <= 0) {
                setDestroyed(true)
                return 0
            }
            return newHealth
        })

        setTimeout(() => setHit(false), 150)
    }

    if (destroyed) return null // Remove from scene when destroyed

    return (
        <RigidBody position={position as any} type="dynamic" colliders="cuboid" userData={{ type: 'enemy', onHit }}>
            <mesh ref={meshRef} castShadow>
                <boxGeometry args={[1, 1, 0.2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            {/* Health Bar (Simple) */}
            <mesh position={[0, 0.8, 0]}>
                <planeGeometry args={[1 * (health / 100), 0.1]} />
                <meshBasicMaterial color={health > 50 ? 'green' : 'red'} side={THREE.DoubleSide} />
            </mesh>

            {/* Stand */}
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </RigidBody>
    )
}
