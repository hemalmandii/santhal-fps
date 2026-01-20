import { useEffect, useRef, useState } from 'react'
import { useMobileInput } from '../../stores/useMobileInput'

// Simple Joystick Impl
const Joystick = () => {
    const { setMove } = useMobileInput()
    const containerRef = useRef<HTMLDivElement>(null)
    const stickRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(false)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let touchId: number | null = null
        const maxRadius = 50 // px

        const handleStart = (e: TouchEvent) => {
            if (touchId !== null) return
            const touch = e.changedTouches[0]
            touchId = touch.identifier
            setActive(true)
            update(touch.clientX, touch.clientY)
        }

        const handleMove = (e: TouchEvent) => {
            if (touchId === null) return
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    update(e.changedTouches[i].clientX, e.changedTouches[i].clientY)
                    break
                }
            }
        }

        const handleEnd = (e: TouchEvent) => {
            if (touchId === null) return
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null
                    setActive(false)
                    setMove(0, 0)
                    if (stickRef.current) {
                        stickRef.current.style.transform = `translate(0px, 0px)`
                    }
                    break
                }
            }
        }

        const update = (clientX: number, clientY: number) => {
            if (!container || !stickRef.current) return
            const rect = container.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            let dx = clientX - centerX
            let dy = clientY - centerY // Up is negative in screen space

            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > maxRadius) {
                const angle = Math.atan2(dy, dx)
                dx = Math.cos(angle) * maxRadius
                dy = Math.sin(angle) * maxRadius
            }

            stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`

            // Normalize -1 to 1 (Input Up means Y positive in game world usually... wait WASD)
            // W (Forward) -> Up on screen (Negative Y)
            // S (Backward) -> Down (Positive Y)
            // A (Left) -> Negative X
            // D (Right) -> Positive X

            // Map to Game Input:
            // Forward (Positive Y in our store logic maybe? Or directly map to boolean)
            // let's assume store expects: y > 0 is Forward.
            // Screen Up is dy < 0. So we invert Y.

            const normX = dx / maxRadius
            const normY = -(dy / maxRadius)

            setMove(normX, normY)
        }

        container.addEventListener('touchstart', handleStart, { passive: false })
        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', handleEnd)

        return () => {
            container.removeEventListener('touchstart', handleStart)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [setMove])

    return (
        <div ref={containerRef} className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm pointer-events-auto touch-none flex items-center justify-center border border-white/20">
            <div ref={stickRef} className={`w-12 h-12 bg-white/50 rounded-full transition-colors ${active ? 'bg-white/80' : ''}`} />
        </div>
    )
}

const ActionButton = ({ label, onPress, active }: { label: string, onPress: (active: boolean) => void, active: boolean }) => {
    return (
        <button
            className={`w-20 h-20 rounded-full backdrop-blur-sm border border-white/20 font-bold text-white transition-all active:scale-95 touch-none select-none ${active ? 'bg-orange-500/80' : 'bg-white/10'}`}
            onTouchStart={(e) => { e.preventDefault(); onPress(true) }}
            onTouchEnd={(e) => { e.preventDefault(); onPress(false) }}
            // Add Mouse events for testing on desktop if needed, though 'touch-none' might block it
            onMouseDown={() => onPress(true)}
            onMouseUp={() => onPress(false)}
        >
            {label}
        </button>
    )
}

const LookPad = () => {
    const { addLookDelta } = useMobileInput()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        let lastX = 0
        let lastY = 0
        let touchId: number | null = null

        const handleStart = (e: TouchEvent) => {
            if (touchId !== null) return
            const t = e.changedTouches[0]
            touchId = t.identifier
            lastX = t.clientX
            lastY = t.clientY
        }

        const handleMove = (e: TouchEvent) => {
            if (touchId === null) return
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i]
                if (t.identifier === touchId) {
                    const dx = t.clientX - lastX
                    const dy = t.clientY - lastY
                    addLookDelta(dx, dy)
                    lastX = t.clientX
                    lastY = t.clientY
                    break
                }
            }
        }

        const handleEnd = (e: TouchEvent) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null
                    break
                }
            }
        }

        el.addEventListener('touchstart', handleStart, { passive: false })
        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', handleEnd)

        return () => {
            el.removeEventListener('touchstart', handleStart)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [addLookDelta])

    return (
        <div ref={ref} className="absolute inset-0 z-0 pointer-events-auto touch-none" style={{ left: '40%' }} />
    )
}

export const MobileControls = () => {
    const { jump, shoot, setJump, setShoot } = useMobileInput()
    // Detect mobile simply? Or just show always if parent says so

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Joystick Zone */}
            <Joystick />

            {/* Look Zone (Invisible, right side mostly) */}
            <LookPad />

            {/* Buttons */}
            <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-auto">
                <ActionButton label="JUMP" active={jump} onPress={setJump} />
                <ActionButton label="FIRE" active={shoot} onPress={setShoot} />
            </div>
        </div>
    )
}
