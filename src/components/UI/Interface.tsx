import { useGame } from '../../stores/useGame'

const ModeDisplay = () => {
    const { controlMode } = useGame()
    return <span className={controlMode === 'VEHICLE' ? 'text-green-400' : 'text-blue-400'}>{controlMode}</span>
}

const Speedometer = () => {
    // Placeholder since we don't have vehicle speed in store yet, but this prompts user they SHOULD be moving
    const { controlMode } = useGame()
    if (controlMode !== 'VEHICLE') return <span>0</span>
    return <span>--</span>
}

export const Interface = () => {
    const { flash, ammo, totalAmmo } = useGame()

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
            <div className="absolute top-8 left-8 text-white font-mono bg-black/50 p-4 rounded select-none">
                <div className="text-4xl font-bold">{ammo} / <span className="text-yellow-400">∞</span></div>
                <div className="text-sm opacity-70">ASSAULT RIFLE</div>
            </div>

            {/* Simplified Controls */}
            <div className="absolute top-8 right-8 text-white font-mono bg-black/50 p-4 rounded select-none text-right">
                <div className="font-bold border-b mb-2">CONTROLS</div>
                <div>LMB : SHOOT</div>
                <div>R : RELOAD</div>
                <div>W,A,S,D : MOVE</div>
                <div>SPACE : JUMP</div>
            </div>

            {/* Low Ammo / Reload Warning */}
            {ammo === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 text-red-500 font-bold font-mono animate-pulse">
                    PRESS 'R' TO RELOAD
                </div>
            )}
        </div>
    )
}
