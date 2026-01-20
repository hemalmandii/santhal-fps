import { useGame } from '../../stores/useGame'
import { MobileControls } from './MobileControls'
import { useEffect, useState } from 'react'

export const Interface = () => {
    const { flash, ammo } = useGame()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            {/* Flash Effect */}
            <div className={`fixed inset-0 bg-white transition-opacity duration-100 ${flash ? 'opacity-100' : 'opacity-0'}`} style={{ mixBlendMode: 'overlay' }} />

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                <div className="w-1 h-4 bg-white/80 absolute top-0 left-1.5" />
                <div className="w-4 h-1 bg-white/80 absolute top-1.5 left-0" />
            </div>

            {/* Ammo Display */}
            {!isMobile && (
                <div className="absolute top-8 left-8 text-white font-mono bg-black/50 p-4 rounded select-none">
                    <div className="text-4xl font-bold">{ammo} / <span className="text-yellow-400">∞</span></div>
                    <div className="text-sm opacity-70">ASSAULT RIFLE</div>
                </div>
            )}

            {/* Mobile Ammo (Corner) */}
            {isMobile && (
                <div className="absolute top-4 left-4 text-white font-mono select-none" style={{ textShadow: '1px 1px 0 #000' }}>
                    <div className="text-2xl font-bold">{ammo}</div>
                </div>
            )}

            {/* Simplified Controls */}
            {!isMobile && (
                <div className="absolute top-8 right-8 text-white font-mono bg-black/50 p-4 rounded select-none text-right">
                    <div className="font-bold border-b mb-2">CONTROLS</div>
                    <div>LMB : SHOOT</div>
                    <div>R : RELOAD</div>
                    <div>W,A,S,D : MOVE</div>
                    <div>SPACE : JUMP</div>
                </div>
            )}

            {/* Low Ammo / Reload Warning */}
            {ammo === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 text-red-500 font-bold font-mono animate-pulse">
                    {isMobile ? "TAP RELOAD!" : "PRESS 'R' TO RELOAD"}
                </div>
            )}

            {/* Mobile Controls */}
            {isMobile && <MobileControls />}
        </div>
    )
}
