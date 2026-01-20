import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../stores/useGame'

export const Jeep = ({ position = [0, 2, 0] }: { position?: [number, number, number] }) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const [, getKeys] = useKeyboardControls()
    const { controlMode, setControlMode, setVehiclePosition } = useGame()

    // Car settings
    const speed = 15
    const turnSpeed = 2

    useFrame((_state, delta) => {
        if (!rigidBodyRef.current) return

        // Update global vehicle position for camera tracking if driving
        const translation = rigidBodyRef.current.translation()
        setVehiclePosition([translation.x, translation.y, translation.z])

        if (controlMode !== 'VEHICLE') return

        const { forward, backward, left, right, interact } = getKeys()

        // Basic Arcade Physics
        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const currentRotation = rigidBodyRef.current.rotation()
        const quaternion = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w)

        // Forward direction vector based on car rotation
        const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion)

        if (forward) {
            impulse.x += forwardDir.x * speed * delta * 50
            impulse.z += forwardDir.z * speed * delta * 50
        }
        if (backward) {
            impulse.x -= forwardDir.x * speed * delta * 50
            impulse.z -= forwardDir.z * speed * delta * 50
        }

        if (left) {
            torque.y += turnSpeed * delta * 50
        }
        if (right) {
            torque.y -= turnSpeed * delta * 50
        }

        // Exit vehicle
        if (interact) {
            setControlMode('CHARACTER')
        }

        rigidBodyRef.current.applyImpulse(impulse, true)
        rigidBodyRef.current.applyTorqueImpulse(torque, true)
    })

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position as any}
            colliders="hull"
            mass={500}
            friction={0.5}
            restitution={0.1}
            linearDamping={0.5}
            angularDamping={0.5}
        >
            {/* Chassis */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[2, 1.2, 4]} />
                <meshStandardMaterial color="#2F4F4F" roughness={0.6} />
            </mesh>

            {/* Upper Frame */}
            <mesh position={[0, 1, -0.5]} castShadow>
                <boxGeometry args={[1.8, 0.8, 2]} />
                <meshStandardMaterial color="#1a2e2e" />
            </mesh>

            {/* Wheels (Visual Only for Arcade Physics) */}
            <group position={[1.1, -0.5, 1.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>
            <group position={[-1.1, -0.5, 1.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>
            <group position={[1.1, -0.5, -1.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>
            <group position={[-1.1, -0.5, -1.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>
        </RigidBody>
    )
}
