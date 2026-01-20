import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { Weapon } from './Weapon'


// Controls map
// type Controls = 'forward' | 'backward' | 'left' | 'right' | 'jump'

import { useGame } from '../../stores/useGame'

// Controls map update to include Interaction
export const ControlsMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'shoot', keys: ['Click', 'KeyF'] }, // Left Click or F
    { name: 'interact', keys: ['KeyE'] },
]

export const Player = () => {
    const body = useRef<RapierRigidBody>(null)
    const [, getKeys] = useKeyboardControls() // Get both subscribe and get
    const { triggerFlash } = useGame()

    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3()
    const sideVector = new THREE.Vector3()

    // Interaction Logic (Event Based to prevent debounce issues)
    useFrame((state) => {
        if (!body.current) return

        // CHARACTER MODE Logic (Always Active)
        const { forward, backward, left, right, jump } = getKeys()
        const velocity = body.current.linvel()
        const translation = body.current.translation()

        // Void Respawn Check
        if (translation.y < -10) {
            triggerFlash() // FLASH EFFECT
            body.current.setTranslation({ x: 0, y: 5, z: 0 }, true)
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        }

        // Camera follow player (First Person)
        state.camera.position.set(translation.x, translation.y + 0.5, translation.z)

        // Movement
        frontVector.set(0, 0, Number(backward) - Number(forward))
        sideVector.set(Number(left) - Number(right), 0, 0)
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(5).applyEuler(state.camera.rotation)

        body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

        // Jump
        if (jump && translation.y < 1.0) {
            body.current.applyImpulse({ x: 0, y: 5, z: 0 }, true)
        }
    })

    return (
        <>
            <PointerLockControls />
            <RigidBody
                ref={body}
                colliders={false}
                mass={1}
                type="dynamic"
                position={[0, 5, 0]}
                enabledRotations={[false, false, false]}
                friction={0}
            >
                <CapsuleCollider args={[0.75, 0.5]} />
            </RigidBody>
            <Weapon />
        </>
    )
}

