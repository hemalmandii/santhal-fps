// Placeholder for a real wheel model, using basic cylinders for now but structured for replacement
export const Wheel = ({ radius = 0.35 }) => {
    return (
        <group rotation={[0, 0, Math.PI / 2]}>
            <group rotation={[0, Math.PI / 2, 0]}>
                {/* Tire Rubber - Chunky Offroad Style */}
                <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[radius, radius, 0.3, 32]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                </mesh>

                {/* Sidewall Detail (Torus) */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius - 0.05, 0.05, 16, 32]} />
                    <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>

                {/* Rim / Hubcap */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.32, 16]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Spokes */}
                <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.3, 0.05, 0.05]} />
                    <meshStandardMaterial color="#666" metalness={0.6} />
                </mesh>
                <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.3, 0.05, 0.05]} />
                    <meshStandardMaterial color="#666" metalness={0.6} />
                </mesh>

                {/* Lug Nuts */}
                {[0, 1.57, 3.14, 4.71].map((r, i) => (
                    <mesh key={i} position={[Math.cos(r) * 0.1, Math.sin(r) * 0.1, 0.16]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.05, 6]} />
                        <meshStandardMaterial color="#silver" metalness={1} roughness={0.1} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}
