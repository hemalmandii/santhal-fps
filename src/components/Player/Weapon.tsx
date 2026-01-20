import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Hud, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
// import { RapierRigidBody, useRapier } from '@react-three/rapier'
import { useGame } from '../../stores/useGame'

export const Weapon = () => {
    const weaponRef = useRef<THREE.Group>(null)
    const { camera, scene } = useThree()
    // const { rapier, world } = useRapier()
    const { shoot: consumeAmmo, reload, triggerImpact } = useGame()

    // Recoil State
    const [recoil, setRecoil] = useState(0)
    const [muzzleFlash, setMuzzleFlash] = useState(false)
    const [shellTrigger, setShellTrigger] = useState(false) // Trigger for shells
    const [isReloading, setIsReloading] = useState(false)

    // Simple Audio Synth
    const playReloadSound = () => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        // Slide up pitch for "Inserting Mag" sound
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.5)
    }

    const playShootSound = () => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }

    const playEmptySound = () => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'square'
        osc.frequency.setValueAtTime(800, ctx.currentTime)

        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.05)
    }

    // Reload Logic
    const triggerReload = () => {
        if (isReloading) return

        setIsReloading(true)
        playReloadSound()

        // Slight delay for "Animation"
        setTimeout(() => {
            reload() // Actual state update
            setIsReloading(false)
        }, 1000)
    }

    // Weapon Stats (Realistic AR)
    const RPM = 600
    const FIRE_RATE = 60 / RPM // 0.1s
    const DAMAGE = 34 // 3 shots to kill

    const lastShotTime = useRef(0)

    // Shooting Logic
    const shoot = () => {
        const now = state.current.clock.getElapsedTime()
        if (now - lastShotTime.current < FIRE_RATE) return
        if (isReloading) return

        // Check Ammo Logic
        if (!consumeAmmo()) {
            playEmptySound()
            return // Out of ammo
        }

        lastShotTime.current = now

        setRecoil(0.2) // Kick back
        setMuzzleFlash(true)
        setShellTrigger(true) // Eject shell
        playShootSound()

        setTimeout(() => setMuzzleFlash(false), 50)
        setTimeout(() => setShellTrigger(false), 50) // Reset trigger

        // Visual Raycast (More reliable for Mesh interactions)
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)

        // Intersect with scene children
        // Filter out the weapon itself if it were in the scene (it involves HUD, so separate scene usually)
        // But we want to intersect the main scene.
        // We need 'scene' instance.
        const intersects = raycaster.intersectObjects(scene.children, true)

        // Find first valid impact
        const hit = intersects.find(i => i.object.type === 'Mesh') // Hit meshes

        if (hit) {
            // Trigger Impact Sparks
            triggerImpact([hit.point.x, hit.point.y, hit.point.z])

            // Apply Impulse if it has a rigid body parent (Bonus: Physics interaction)
            // We can try to find the rigid body by traversing up or using Rapier's world lookups if we had the ID, 
            // but for now, let's focus on logic.
            // Actually, we can just do the Damage Logic visually.

            // Traverse up to find userData.onHit
            let currentObj: THREE.Object3D | null = hit.object
            let damageDealt = false

            while (currentObj) {
                if (currentObj.userData && (currentObj.userData as any).onHit) {
                    console.log("Visual Raycast Hit Target:", currentObj.userData.type)
                        ; (currentObj.userData as any).onHit(DAMAGE)
                    damageDealt = true

                    // Simple knockback effect if we found the enemy root (which matches our Enemy component structure)
                    // We can't easily push the rapier body from the mesh without a ref, 
                    // but the Enemy die logic handles the fall.
                    break
                }
                currentObj = currentObj.parent
            }

            if (!damageDealt) {
                // Check if it's a Target (old system) or just a wall
                console.log("Hit Wall/Object:", hit.object.name || hit.object.uuid)
            }
        }
    }

    // We need 'state' for clock access in shoot, but shoot is called from event listener...
    // Actually, useThree gives us 'clock' but it's not reactive inside the callback ref unless we Ref it.
    // Let's use performance.now() / 1000 for pure JS timing which is fine.
    const state = useRef({ clock: { getElapsedTime: () => performance.now() / 1000 } })

    // Key Listeners (Shoot + Reload)
    const shootRef = useRef(shoot)
    const reloadRef = useRef(triggerReload)

    useEffect(() => {
        shootRef.current = shoot
        reloadRef.current = triggerReload
    }, [shoot, triggerReload])

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0 && document.pointerLockElement) {
                shootRef.current()
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
                reloadRef.current()
            }
        }

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    useFrame((state, delta) => {
        if (!weaponRef.current) return

        // Sway
        const time = state.clock.getElapsedTime()
        const swayX = Math.sin(time * 2) * 0.005
        const swayY = Math.sin(time * 1) * 0.005

        // Recoil Recovery
        if (recoil > 0) {
            setRecoil(r => Math.max(0, r - delta * 5))
        }

        const baseX = 0.4 // RIGHT SIDE
        const baseY = -0.3
        const baseZ = -0.8

        // Reload Animation (Dip down)
        const reloadRot = isReloading ? -Math.PI / 4 : 0
        const reloadY = isReloading ? -0.2 : 0

        // Lerp for smoothness
        weaponRef.current.position.x = THREE.MathUtils.lerp(weaponRef.current.position.x, baseX + swayX, delta * 10)
        weaponRef.current.position.y = THREE.MathUtils.lerp(weaponRef.current.position.y, baseY + swayY + reloadY, delta * 10)
        weaponRef.current.position.z = THREE.MathUtils.lerp(weaponRef.current.position.z, baseZ + (recoil * 0.2), delta * 10)

        // Combine rotations
        const targetRotX = (recoil * 0.5) + reloadRot
        weaponRef.current.rotation.x = THREE.MathUtils.lerp(weaponRef.current.rotation.x, targetRotX, delta * 10)
    })

    return (
        <>
            <Hud renderPriority={1}>
                <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={55} />
                <ambientLight intensity={1.5} />
                <pointLight position={[2, 5, 2]} intensity={1.5} />
                <directionalLight position={[-5, 5, 5]} intensity={1} />

                <group ref={weaponRef} position={[0.4, -0.3, -0.8]}>
                    {/* Weapon Meshes */}
                    <mesh position={[0.15, -0.1, 0.3]} rotation={[0.4, 0.2, -0.2]}>
                        <capsuleGeometry args={[0.07, 0.8, 8, 16]} />
                        <meshStandardMaterial color="#8d5524" roughness={0.5} />
                    </mesh>
                    <mesh castShadow position={[0, 0, 0.2]}>
                        <boxGeometry args={[0.1, 0.15, 0.7]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                    <mesh position={[0, 0.05, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.025, 0.025, 0.7, 16]} />
                        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, -0.2, 0.15]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[0.07, 0.35, 0.12]} />
                        <meshStandardMaterial color="#151515" />
                    </mesh>
                    <mesh position={[0, -0.15, 0.4]} rotation={[-0.2, 0, 0]}>
                        <boxGeometry args={[0.07, 0.25, 0.1]} />
                        <meshStandardMaterial color="#4a3b2a" />
                    </mesh>
                    <mesh position={[0, 0.11, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.035, 0.045, 0.25, 16]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* FX */}
                    {muzzleFlash && <pointLight position={[0, 0, -0.9]} color="#ffaa00" intensity={8} distance={3} />}
                    <SmokeParticles trigger={muzzleFlash} />
                    <ShellParticles trigger={shellTrigger} />
                </group>
            </Hud>

        </>
    )
}

// Shell Ejection System
const ShellParticles = ({ trigger }: { trigger: boolean }) => {
    const particles = useRef<{ position: THREE.Vector3, velocity: THREE.Vector3, life: number, rotation: THREE.Vector3 }[]>([])
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = new THREE.Object3D()

    useFrame((_, delta) => {
        if (!meshRef.current) return

        if (trigger && particles.current.length < 20) {
            // Eject to the right
            particles.current.push({
                position: new THREE.Vector3(0.1, 0, 0.2), // Ejection port
                velocity: new THREE.Vector3(2 + Math.random(), 2 + Math.random(), 0 + Math.random()), // Right + Up
                life: 1.0,
                rotation: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            })
        }

        particles.current.forEach(p => {
            p.velocity.y -= 9.8 * delta // Gravity
            p.position.add(p.velocity.clone().multiplyScalar(delta))
            p.life -= delta * 1.5
            // Tumble
            p.rotation.x += delta * 10
            p.rotation.z += delta * 10
        })

        particles.current = particles.current.filter(p => p.life > 0)

        meshRef.current.count = particles.current.length
        particles.current.forEach((p, i) => {
            dummy.position.copy(p.position)
            dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z)
            dummy.scale.setScalar(p.life)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 20]}>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
            <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.3} />
        </instancedMesh>
    )
}

// Enhanced Smoke Particles
const SmokeParticles = ({ trigger }: { trigger: boolean }) => {
    const particles = useRef<{ position: THREE.Vector3, velocity: THREE.Vector3, life: number, scale: number }[]>([])
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = new THREE.Object3D()

    useFrame((_, delta) => {
        if (!meshRef.current) return

        // Spawn new particles on trigger
        if (trigger && particles.current.length < 50) { // Limit count
            for (let i = 0; i < 5; i++) { // More particles per shot
                particles.current.push({
                    position: new THREE.Vector3(0, 0.05, -1.0 + (Math.random() * 0.3)), // Start further out
                    velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.8 + Math.random(), (Math.random() - 0.5) * 0.5), // Faster upward drift
                    life: 2.0, // Live longer (2 seconds)
                    scale: 0.2 + Math.random() * 0.3 // Start bigger
                })
            }
        }

        // Update Physics & Life
        particles.current.forEach(p => {
            p.position.add(p.velocity.clone().multiplyScalar(delta))
            p.life -= delta * 0.5 // Slower fade
            p.scale += delta * 1.0 // Expand continuously
            p.velocity.multiplyScalar(0.95) // Air resistance
        })

        // Remove dead particles
        particles.current = particles.current.filter(p => p.life > 0)

        // Render
        meshRef.current.count = particles.current.length
        particles.current.forEach((p, i) => {
            dummy.position.copy(p.position)
            dummy.scale.setScalar(p.scale * Math.min(p.life, 1)) // Fade out by shrinking or simple opacity
            dummy.rotation.set(0, 0, i)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 100]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#888888" transparent opacity={0.5} depthWrite={false} />
        </instancedMesh>
    )
}
