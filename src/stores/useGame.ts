import { create } from 'zustand'

type ControlMode = 'CHARACTER' | 'VEHICLE'

interface GameState {
    controlMode: ControlMode
    setControlMode: (mode: ControlMode) => void
    vehiclePosition: [number, number, number] | null
    setVehiclePosition: (pos: [number, number, number]) => void
    flash: boolean
    triggerFlash: () => void

    // Ammo System
    ammo: number
    totalAmmo: number
    shoot: () => boolean // Returns success
    reload: () => void

    // FX System
    impactPosition: [number, number, number] | null
    triggerImpact: (pos: [number, number, number]) => void
}

export const useGame = create<GameState>((set, get) => ({
    controlMode: 'CHARACTER',
    setControlMode: (mode) => set({ controlMode: mode }),
    vehiclePosition: null, // Track where the vehicle is for camera
    setVehiclePosition: (pos) => set({ vehiclePosition: pos }),

    flash: false,
    triggerFlash: () => {
        set({ flash: true })
        setTimeout(() => set({ flash: false }), 200) // Quick flash
    },

    impactPosition: null,
    triggerImpact: (pos) => {
        set({ impactPosition: pos })
        setTimeout(() => set({ impactPosition: null }), 100) // Reset quickly to allow re-trigger logic to handle it or just use timestamp
    },

    ammo: 30,
    totalAmmo: 9999, // Infinite Reserve
    shoot: () => {
        const { ammo } = get()
        if (ammo <= 0) return false
        set({ ammo: ammo - 1 })
        return true
    },
    reload: () => {
        set({ ammo: 30 }) // Just reset mag, don't touch total
    }
}))
