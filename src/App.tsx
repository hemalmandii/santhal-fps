import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience'
import { Loader } from '@react-three/drei'
import { Suspense } from 'react'
import { Interface } from './components/UI/Interface'

import { SplashScreen } from './components/UI/SplashScreen'
import { useGame } from './stores/useGame'

function App() {
  const { gameStatus } = useGame()

  return (
    <>
      <SplashScreen />

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
          antialias: false,
          stencil: false,
          depth: true
        }}
      >

        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader />

      {/* Only show Interface and Overlay when playing */}
      <div className={`transition-opacity duration-1000 ${gameStatus === 'PLAYING' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Interface />
        <div className="absolute top-0 left-0 p-4 text-white pointer-events-none">
          <h1 className="text-2xl font-bold">Santhal Village FPS</h1>
          <p>Pre-Alpha Build</p>
        </div>
      </div>
    </>
  )
}

export default App
