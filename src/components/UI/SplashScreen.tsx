import { useState } from 'react'
import { useGame } from '../../stores/useGame'

export const SplashScreen = () => {
    const { startGame, gameStatus } = useGame()
    const [fading, setFading] = useState(false)

    const handleStart = () => {
        setFading(true)
        setTimeout(() => {
            startGame()
        }, 1000) // Access to audio context often requires user interaction, so this click is good.
    }

    if (gameStatus === 'PLAYING' && !fading) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-1000 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="text-center space-y-8">
                {/* Ol Chiki Greeting */}
                <h1 className="text-8xl font-bold text-yellow-500 animate-pulse" style={{ fontFamily: '"Noto Sans Ol Chiki", sans-serif' }}>
                    ᱡᱚᱦᱟᱨ
                </h1>

                {/* Subtitle */}
                <h2 className="text-2xl tracking-[0.5em] text-gray-400 uppercase">
                    Santhal Village FPS
                </h2>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="mt-12 px-8 py-3 border border-white/20 hover:bg-white/10 hover:border-white/50 transition-all rounded text-sm tracking-widest uppercase"
                >
                    Enter World
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-gray-600">
                Created with React Three Fiber
            </div>
        </div>
    )
}
