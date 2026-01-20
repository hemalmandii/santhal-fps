import { EffectComposer, Bloom, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export const Effects = () => {
    return (
        <EffectComposer disableNormalPass>
            {/* Anti-aliasing */}
            <SMAA />

            {/* Glow */}
            <Bloom
                luminanceThreshold={1.1} // Higher threshold to only bloom very bright light sources (Sun)
                mipmapBlur
                intensity={0.4}
                levels={8} // Smoother bloom
            />

            {/* Cinematic focus */}
            <Vignette eskil={false} offset={0.1} darkness={0.6} />

            {/* Color Grading */}
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
    )
}
