import { Physics } from '@react-three/rapier'
import { Setup } from './components/World/Setup'
import { Floor } from './components/World/Floor'
import { SanthalHut } from './components/World/SanthalHut'
import { Player, ControlsMap } from './components/Player/Player'
// import { Effects } from './components/World/Effects'
import { Vegetation } from './components/World/Vegetation'
// import { Vehicle } from './components/Vehicle/Vehicle'
import { SoundManager } from './components/Audio/SoundManager'
import { KeyboardControls } from '@react-three/drei'
import { useGame } from './stores/useGame'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// import { Target } from './components/World/Target'
import { Enemy } from './components/World/Enemy'

// Impact Spark System (Moved to World Space)
const SparkParticles = () => {
    const { impactPosition } = useGame()

    // We need a way to spawn multiple bursts. 
    // Since useGame only holds one "latest" impact, we might miss rapid fire if we just check state.
    // However, for now, let's just listen to changes.

    const particles = useRef<{ position: THREE.Vector3, velocity: THREE.Vector3, life: number }[]>([])
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = new THREE.Object3D()
    // const lastImpact = useRef<string>("")

    useEffect(() => {
        if (impactPosition) {
            // Spawn burst
            const pos = new THREE.Vector3(...impactPosition)
            for (let i = 0; i < 15; i++) { // More particles
                particles.current.push({
                    position: pos.clone(),
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 8, // Wider spread
                        (Math.random() - 0.5) * 8 + 4, // Higher pop
                        (Math.random() - 0.5) * 8
                    ),
                    life: 0.5 + Math.random() * 0.5 // Longer life
                })
            }
        }
    }, [impactPosition])

    useFrame((_, delta) => {
        if (!meshRef.current) return

        particles.current.forEach(p => {
            p.position.add(p.velocity.clone().multiplyScalar(delta))
            p.velocity.y -= 9.8 * delta // Gravity
            p.life -= delta
        })

        // Cleanup
        particles.current = particles.current.filter(p => p.life > 0)

        meshRef.current.count = particles.current.length
        particles.current.forEach((p, i) => {
            dummy.position.copy(p.position)
            // Fix: Scale was way too small (0.2). Increase to 1.0 or larger bloom.
            // visual scale = base geometry (0.05) * scale scalar
            // Let's make it pulsate or just shrink
            const scale = p.life * 1.5
            dummy.scale.setScalar(scale)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 100]}>
            {/* Increased base geometry size */}
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="orange" toneMapped={false} />
        </instancedMesh>
    )
}

export const Experience = () => {
    return (
        <KeyboardControls map={ControlsMap}>
            <Setup />
            <Physics debug={false}>
                <Floor />
                <SanthalHut position={[0, 0, 0]} />
                <SanthalHut position={[6, 0, -4]} rotation={[0, Math.PI / 4, 0]} />
                <SanthalHut position={[-6, 0, -5]} rotation={[0, -Math.PI / 6, 0]} />

                {/* Enemies */}
                <Enemy position={[5, 1, -10]} />
                <Enemy position={[-5, 1, -15]} />
                <Enemy position={[0, 1, -20]} />

                <Player />
                {/* Global FX */}
                <SparkParticles />
            </Physics>
            {/* <Effects /> */}
            <Vegetation />
            <SoundManager />
        </KeyboardControls>
    )
}
