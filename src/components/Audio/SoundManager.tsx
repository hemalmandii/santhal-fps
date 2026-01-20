import { useEffect, useRef } from 'react'
import { useGame } from '../../stores/useGame'
// import { useKeyboardControls } from '@react-three/drei'

// Simple Sound Synth to avoid external asset dependencies
const playSynthTone = (freq: number, type: OscillatorType, duration: number) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
}

export const SoundManager = () => {
    const { controlMode } = useGame()

    // Engine Loop Mock
    const engineRef = useRef<OscillatorNode | null>(null)
    const engineCtx = useRef<AudioContext | null>(null)

    // Effect: Vehicle Engine Sound
    useEffect(() => {
        if (controlMode === 'VEHICLE') {
            // Start Engine Hum
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(100, ctx.currentTime)
            gain.gain.value = 0.05

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()

            engineRef.current = osc
            engineCtx.current = ctx

            playSynthTone(200, 'square', 0.5) // Start up sound
        } else {
            // Stop Engine
            if (engineRef.current) {
                engineRef.current.stop()
                engineRef.current.disconnect()
                engineRef.current = null
            }
            if (engineCtx.current) {
                engineCtx.current.close()
                engineCtx.current = null
            }
        }

        return () => {
            if (engineRef.current) engineRef.current.stop()
        }
    }, [controlMode])

    // Effect: Footsteps (Naive implementation for now)
    // Could subscribe to keys but `useFrame` in Player is better for sync. 
    // Here we just do UI sounds.

    return null
}
