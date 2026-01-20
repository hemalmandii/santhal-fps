import { create } from 'zustand'

interface MobileInputState {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    jump: boolean
    shoot: boolean

    // Joystick values (0-1) for analog control if needed later
    moveX: number
    moveY: number

    setMove: (x: number, y: number) => void
    setJump: (active: boolean) => void
    setShoot: (active: boolean) => void

    // Camera look delta (consumed by Player)
    lookDelta: { x: number, y: number }
    addLookDelta: (dx: number, dy: number) => void
    resetLookDelta: () => void
}

export const useMobileInput = create<MobileInputState>((set) => ({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    shoot: false,
    moveX: 0,
    moveY: 0,

    setMove: (x, y) => {
        // Simple threshold for boolean logic
        const threshold = 0.2
        set({
            moveX: x,
            moveY: y,
            forward: y > threshold,
            backward: y < -threshold,
            right: x > threshold,
            left: x < -threshold
        })
    },

    setJump: (active) => set({ jump: active }),
    setShoot: (active) => set({ shoot: active }),

    lookDelta: { x: 0, y: 0 },
    addLookDelta: (dx, dy) => set((state) => ({
        lookDelta: { x: state.lookDelta.x + dx, y: state.lookDelta.y + dy }
    })),
    resetLookDelta: () => set({ lookDelta: { x: 0, y: 0 } })
}))
