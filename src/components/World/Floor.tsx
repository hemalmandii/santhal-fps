import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useMemo } from 'react'

// Simple noise texture setup
const createNoise = (size = 512) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (context) {
        context.fillStyle = '#5d2906'
        context.fillRect(0, 0, size, size)

        // Add noise
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * size
            const y = Math.random() * size
            const alpha = Math.random() * 0.1
            context.fillStyle = `rgba(0, 0, 0, ${alpha})`
            context.fillRect(x, y, 2, 2)

            const x2 = Math.random() * size
            const y2 = Math.random() * size
            const alpha2 = Math.random() * 0.1
            context.fillStyle = `rgba(160, 82, 45, ${alpha2})` // lighter specks
            context.fillRect(x2, y2, 2, 2)
        }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(20, 20)
    return texture
}

export const Floor = () => {
    const floorTexture = useMemo(() => createNoise(), [])

    return (
        <RigidBody type="fixed" colliders="hull" restitution={0.2} friction={1}>
            <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    map={floorTexture}
                    roughness={1}
                    metalness={0}
                />
            </mesh>
        </RigidBody>
    )
}
