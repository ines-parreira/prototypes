import { useCallback, useEffect, useRef } from 'react'

export function useCustomSound(soundUrl: string, volume: number = 5) {
    const audioCtxRef = useRef<AudioContext | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const bufferRef = useRef<AudioBuffer | null>(null)

    useEffect(() => {
        const audioCtx = new AudioContext()
        const gainNode = audioCtx.createGain()
        gainNode.connect(audioCtx.destination)

        audioCtxRef.current = audioCtx
        gainNodeRef.current = gainNode

        return () => {
            void audioCtx.close()
        }
    }, [])

    useEffect(() => {
        if (!audioCtxRef.current) {
            return
        }

        let cancelled = false

        const loadSound = async () => {
            try {
                const res = await fetch(soundUrl)
                if (cancelled) return

                const arrBuff = await res.arrayBuffer()
                if (cancelled) return

                const buffer =
                    await audioCtxRef.current!.decodeAudioData(arrBuff)
                if (cancelled) return

                bufferRef.current = buffer
            } catch (err) {
                if (cancelled) return
                console.error('Failed to load custom sound:', err)
            }
        }

        void loadSound()

        return () => {
            cancelled = true
        }
    }, [soundUrl])

    const playSound = useCallback(() => {
        if (!audioCtxRef.current || !gainNodeRef.current) {
            console.warn('AudioContext not initialized')
            return
        }

        const buffer = bufferRef.current
        if (!buffer) {
            console.warn('Sound buffer not loaded yet')
            return
        }

        const source = audioCtxRef.current.createBufferSource()
        source.buffer = buffer
        gainNodeRef.current.gain.value = volume / 10
        source.connect(gainNodeRef.current)
        source.start(0)
    }, [volume])

    return { playSound }
}
