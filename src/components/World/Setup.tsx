// import { Environment, SoftShadows, Sky, Cloud } from '@react-three/drei'

export const Setup = () => {
    return (
        <>
            {/* BASIC LIGHTING ONLY - NO SHADOWS/ATMOSPHERE FOR DEBUGGING */}

            <color attach="background" args={['#87CEEB']} /> {/* Simple Blue Sky */}

            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 20, 10]} intensity={2} /> {/* No shadows */}

            {/* <SoftShadows size={25} samples={10} focus={0.5} /> */}

            {/* <fogExp2 attach="fog" args={['#eebb99', 0.002]} /> */}

            {/* <Sky
                sunPosition={[20, 30, 10]}
                turbidity={8}
                rayleigh={6}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
            /> */}
            {/* <Sky ... /> */}

            {/* <Cloud position={[-10, 20, -20]} opacity={0.3} speed={0.1} segments={10} bounds={[10, 2, 10]} /> */}
            {/* <Cloud ... /> */}

            {/* <Environment preset="sunset" background={false} blur={0.6} /> */}
            {/* <Environment ... /> */}
        </>
    )
}
