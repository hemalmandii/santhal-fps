import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../stores/useGame'
import { Wheel } from './Wheel'

const CHASSIS_WIDTH = 1.8
const CHASSIS_HEIGHT = 0.5
const CHASSIS_LENGTH = 3.6
const WHEEL_RADIUS = 0.4

export const Vehicle = ({ position = [0, 2, 0] }: { position?: [number, number, number] }) => {
    const chassisRef = useRef<RapierRigidBody>(null)
    const { controlMode, setVehiclePosition } = useGame()
    const [, getKeys] = useKeyboardControls()

    useFrame((_state, delta) => {
        if (!chassisRef.current) return

        // Update Global Position for Camera
        const t = chassisRef.current.translation()
        setVehiclePosition([t.x, t.y, t.z])

        // Input
        const { forward, backward, left, right } = getKeys()

        // 1. Vehicle Logic
        if (controlMode === 'VEHICLE') {
            // Acceleration (Impulse)
            const speed = 150 * delta
            const direction = new THREE.Vector3(0, 0, 0)
            // ... (middle content omitted for brevity, I will try to target specific blocks to avoid huge replacement or use multi_replace if needed, but here a simple replace of the top part and then the bottom usage is needed. actually I can just do 2 chunks)

            if (forward) direction.z += speed
            if (backward) direction.z -= speed

            // Rotate force to car's local forward
            const rotation = chassisRef.current.rotation()
            const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
            direction.applyQuaternion(quaternion)

            chassisRef.current.applyImpulse(direction, true)

            // Removed premature torque usage block

            // Turning (Torque) - INCREASED POWER (Replacing old block)
            const turnSpeed = 6000 * delta
            const torque = new THREE.Vector3(0, 0, 0)
            if (left) torque.y += turnSpeed
            if (right) torque.y -= turnSpeed

            // Apply turn
            chassisRef.current.applyTorqueImpulse(torque, true)

            // Vehicle Void Respawn (Auto-Reset)
            const currentPos = chassisRef.current.translation()
            if (currentPos.y < -20) {
                chassisRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true)
                chassisRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
                chassisRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
            }

            // Exit logic moved to Event Listener in Player.tsx to prevent debounce issues
        }
    })

    return (
        <group>
            <RigidBody
                ref={chassisRef}
                position={position as any}
                mass={500}
                colliders={false}
                type="dynamic"
                canSleep={false}
                linearDamping={0.5}
                angularDamping={0.9}
            >
                {/* Main Collider */}
                <CuboidCollider args={[CHASSIS_WIDTH / 2, CHASSIS_HEIGHT / 2, CHASSIS_LENGTH / 2]} position={[0, 0.5, 0]} />

                {/* --- HIGH FIDELITY JEEP VISUALS --- */}
                <group position={[0, 0.2, 0]}>

                    {/* 1. Main Chassis Body */}
                    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.8, 0.6, 3.8]} />
                        <meshPhysicalMaterial
                            color="#3d4c33" // Military Green
                            roughness={0.4}
                            metalness={0.1}
                            clearcoat={0.5}
                            clearcoatRoughness={0.1}
                        />
                    </mesh>

                    {/* 2. Hood Detail (Raised center) */}
                    <mesh position={[0, 0.71, 0.8]} castShadow>
                        <boxGeometry args={[1.2, 0.05, 1.5]} />
                        <meshStandardMaterial color="#303b28" />
                    </mesh>

                    {/* 3. Fender Flares (Wheel Arches) */}
                    <mesh position={[0.9, 0.4, 1.2]} rotation={[0, 0, -0.2]}>
                        <boxGeometry args={[0.4, 0.1, 1.2]} />
                        <meshStandardMaterial color="#111" roughness={0.8} />
                    </mesh>
                    <mesh position={[-0.9, 0.4, 1.2]} rotation={[0, 0, 0.2]}>
                        <boxGeometry args={[0.4, 0.1, 1.2]} />
                        <meshStandardMaterial color="#111" roughness={0.8} />
                    </mesh>
                    <mesh position={[0.9, 0.4, -1.2]} rotation={[0, 0, -0.2]}>
                        <boxGeometry args={[0.4, 0.1, 1.2]} />
                        <meshStandardMaterial color="#111" roughness={0.8} />
                    </mesh>
                    <mesh position={[-0.9, 0.4, -1.2]} rotation={[0, 0, 0.2]}>
                        <boxGeometry args={[0.4, 0.1, 1.2]} />
                        <meshStandardMaterial color="#111" roughness={0.8} />
                    </mesh>


                    {/* 4. Bull Bar / Bumper */}
                    <mesh position={[0, 0.2, 2.0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
                        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.2, -2.0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
                        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* 5. Roll Cage (Tube Frame) */}
                    {/* Vertical Posts */}
                    <mesh position={[0.85, 1.2, 0.5]}><cylinderGeometry args={[0.05, 0.05, 1.5]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[-0.85, 1.2, 0.5]}><cylinderGeometry args={[0.05, 0.05, 1.5]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0.85, 1.2, -1.5]}><cylinderGeometry args={[0.05, 0.05, 1.5]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[-0.85, 1.2, -1.5]}><cylinderGeometry args={[0.05, 0.05, 1.5]} /><meshStandardMaterial color="#111" /></mesh>
                    {/* Top Rails */}
                    <mesh position={[0.85, 1.9, -0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 2.0]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[-0.85, 1.9, -0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 2.0]} /><meshStandardMaterial color="#111" /></mesh>
                    {/* Crossbars */}
                    <mesh position={[0, 1.9, 0.5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 1.7]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, 1.9, -1.5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 1.7]} /><meshStandardMaterial color="#111" /></mesh>

                    {/* 6. Windshield */}
                    <group position={[0, 1.2, 1.0]} rotation={[-0.2, 0, 0]}>
                        {/* Frame */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[1.7, 0.8, 0.05]} />
                            <meshStandardMaterial color="#3d4c33" />
                        </mesh>
                        {/* Glass */}
                        <mesh position={[0, 0, 0.03]}>
                            <planeGeometry args={[1.5, 0.6]} />
                            <meshPhysicalMaterial
                                color="#88ccff"
                                metalness={0.9}
                                roughness={0.1}
                                transmission={0.2} // Slight transparency/glass effect
                                thickness={0.1}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    </group>

                    {/* 7. Interior */}
                    {/* Seats */}
                    <mesh position={[0.4, 0.6, -0.2]}>
                        <boxGeometry args={[0.6, 0.6, 0.6]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[-0.4, 0.6, -0.2]}>
                        <boxGeometry args={[0.6, 0.6, 0.6]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Dashboard */}
                    <group position={[-0.4, 0.9, 0.6]} rotation={[-0.3, 0, 0]}>
                        <mesh>
                            <boxGeometry args={[0.7, 0.2, 0.3]} />
                            <meshStandardMaterial color="#000" />
                        </mesh>
                        {/* Steering Wheel */}
                        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.18, 0.03, 8, 16]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>

                    {/* 8. Lights */}
                    {/* Headlights */}
                    <group position={[0, 0.5, 1.9]}>
                        <mesh position={[0.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
                        </mesh>
                        <mesh position={[-0.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
                        </mesh>
                    </group>
                    {/* Tail Lights */}
                    <group position={[0, 0.5, -1.9]}>
                        <mesh position={[0.7, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[0.2, 0.05, 0.1]} />
                            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
                        </mesh>
                        <mesh position={[-0.7, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[0.2, 0.05, 0.1]} />
                            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
                        </mesh>
                    </group>

                    {/* 9. Spare Tire (Rear) */}
                    <group position={[0, 0.6, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
                        <Wheel radius={0.35} />
                    </group>

                </group>

                {/* --- Wheels (Functional) --- */}
                <group position={[-0.9, 0, 1.2]}><Wheel radius={WHEEL_RADIUS} /></group>
                <group position={[0.9, 0, 1.2]}><Wheel radius={WHEEL_RADIUS} /></group>
                <group position={[-0.9, 0, -1.2]}><Wheel radius={WHEEL_RADIUS} /></group>
                <group position={[0.9, 0, -1.2]}><Wheel radius={WHEEL_RADIUS} /></group>

            </RigidBody>
        </group>
    )
}
