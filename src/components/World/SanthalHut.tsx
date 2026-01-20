import { RigidBody } from '@react-three/rapier'
import { Box, Cone, Cylinder } from '@react-three/drei'

interface SanthalHutProps {
    position?: [number, number, number]
    rotation?: [number, number, number]
}

export const SanthalHut = ({ position = [0, 0, 0], rotation = [0, 0, 0] }: SanthalHutProps) => {
    const mudColor = "#8B4513"
    const thatchColor = "#E6D690"

    const wallHeight = 2.5
    const roofHeight = 2

    return (
        <group position={position} rotation={rotation}>
            <RigidBody type="fixed" colliders="hull">
                {/* Mud Walls */}
                <Box args={[4, wallHeight, 4]} position={[0, wallHeight / 2, 0]}>
                    <meshStandardMaterial
                        color={mudColor}
                    />
                </Box>

                {/* Plinth */}
                <Box args={[5, 0.4, 5]} position={[0, 0.2, 0]}>
                    <meshStandardMaterial
                        color={mudColor}
                    />
                </Box>

                {/* Roof */}
                <group position={[0, wallHeight + roofHeight / 2, 0]}>
                    <Cone args={[3.5, roofHeight, 4]} rotation={[0, Math.PI / 4, 0]}>
                        <meshStandardMaterial
                            color={thatchColor}
                        />
                    </Cone>
                </group>

                {/* Pillars */}
                <Cylinder args={[0.1, 0.1, wallHeight]} position={[2.2, wallHeight / 2, 2.2]}>
                    <meshStandardMaterial color="#5C3317" />
                </Cylinder>
                <Cylinder args={[0.1, 0.1, wallHeight]} position={[-2.2, wallHeight / 2, 2.2]}>
                    <meshStandardMaterial color="#5C3317" />
                </Cylinder>
            </RigidBody>
        </group>
    )
}
