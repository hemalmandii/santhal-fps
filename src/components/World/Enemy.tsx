import { useRef, useState } from 'react'
import { RigidBody, CapsuleCollider, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Enemy = ({ position = [0, 2, 0] }: { position?: [number, number, number] }) => {
    const rigidBody = useRef<RapierRigidBody>(null)
    const [health, setHealth] = useState(100)
    const [hit, setHit] = useState(false)
    const [dead, setDead] = useState(false)

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: '#ffccaa' })
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: '#334455' })
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: '#222222' })

    const onHit = (damage: number) => {
        if (dead) return

        setHealth(h => {
            const newHealth = h - damage
            if (newHealth <= 0) {
                setDead(true)
                // Ragdoll effect: Unlock rotation and push back
                if (rigidBody.current) {
                    rigidBody.current.lockRotations(false, true) // Allow rotation
                    rigidBody.current.applyImpulse({ x: 0, y: 2, z: -5 }, true) // Knockback
                }
                return 0
            }
            return newHealth
        })

        setHit(true)
        setTimeout(() => setHit(false), 100)
    }

    useFrame((state, delta) => {
        // Flash red on hit
        if (hit) {
            skinMaterial.color.set('red')
            shirtMaterial.color.set('red')
        } else {
            skinMaterial.color.set('#ffccaa')
            shirtMaterial.color.set('#334455')
        }
    })

    return (
        <RigidBody
            ref={rigidBody}
            position={position as any}
            type="dynamic"
            colliders={false} // Custom colliders
            enabledRotations={[false, true, false]} // Lock tipping over until death
            userData={{ type: 'enemy', onHit }}
        >
            <CapsuleCollider
                args={[0.8, 0.4]}
                position={[0, 0.8, 0]}
            />

            <group position={[0, 0, 0]} userData={{ type: 'enemy', onHit }}>
                {/* HEAD */}
                <mesh position={[0, 1.6, 0]} material={skinMaterial} castShadow>
                    <boxGeometry args={[0.25, 0.25, 0.25]} />
                </mesh>

                {/* BODY */}
                <mesh position={[0, 1.1, 0]} material={shirtMaterial} castShadow>
                    <boxGeometry args={[0.4, 0.6, 0.2]} />
                </mesh>

                {/* ARMS */}
                <mesh position={[-0.28, 1.1, 0]} material={skinMaterial} castShadow>
                    <boxGeometry args={[0.12, 0.6, 0.12]} />
                </mesh>
                <mesh position={[0.28, 1.1, 0]} material={skinMaterial} castShadow>
                    <boxGeometry args={[0.12, 0.6, 0.12]} />
                </mesh>

                {/* LEGS */}
                <mesh position={[-0.1, 0.4, 0]} material={pantsMaterial} castShadow>
                    <boxGeometry args={[0.15, 0.7, 0.15]} />
                </mesh>
                <mesh position={[0.1, 0.4, 0]} material={pantsMaterial} castShadow>
                    <boxGeometry args={[0.15, 0.7, 0.15]} />
                </mesh>
            </group>

            {/* Health Bar */}
            {!dead && (
                <mesh position={[0, 2.0, 0]}>
                    <planeGeometry args={[1 * (health / 100), 0.1]} />
                    <meshBasicMaterial color={health > 50 ? 'green' : 'red'} side={THREE.DoubleSide} />
                </mesh>
            )}
        </RigidBody>
    )
}
