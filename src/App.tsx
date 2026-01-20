import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience'
import { Loader } from '@react-three/drei'
import { Suspense } from 'react'
import { Interface } from './components/UI/Interface'

function App() {
  return (
    <>
      <Canvas
        shadows
        flat // Disable default R3F tonemapping to let PostProcessing handle it
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 2, 8]
        }}
        gl={{
          antialias: false, // Post-processing often handles AA or looks better without default AA if FXAA/SMAA is used
          stencil: false,
          depth: true
        }}
      >

        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader />
      <Interface />
      <div className="absolute top-0 left-0 p-4 text-white pointer-events-none">
        <h1 className="text-2xl font-bold">Santhal Village FPS</h1>
        <p>Pre-Alpha Build</p>
      </div>
    </>
  )
}

export default App
