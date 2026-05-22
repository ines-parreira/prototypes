import { useEffect, useState } from 'react'

const shouldSkipAnimation = (): boolean => {
    if (typeof window === 'undefined') return true
    if (!window.matchMedia) return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Options = {
    delayMs?: number
    startAfterMs?: number
    enabled?: boolean
}

export const useTypewriter = (
    text: string,
    { delayMs = 20, startAfterMs = 0, enabled = true }: Options = {},
): { typed: string; isComplete: boolean } => {
    const shouldRunInstantly = shouldSkipAnimation()

    const [typed, setTyped] = useState(() =>
        enabled && shouldRunInstantly ? text : '',
    )
    const [isComplete, setIsComplete] = useState(
        () => enabled && shouldRunInstantly,
    )

    useEffect(() => {
        if (!enabled) {
            setTyped('')
            setIsComplete(false)
            return
        }

        if (shouldRunInstantly || text.length === 0) {
            setTyped(text)
            setIsComplete(true)
            return
        }

        setTyped('')
        setIsComplete(false)

        let cancelled = false
        let tickTimer: ReturnType<typeof setTimeout> | undefined
        let i = 0

        const tick = () => {
            if (cancelled) return
            i += 1
            setTyped(text.slice(0, i))
            if (i < text.length) {
                tickTimer = setTimeout(tick, delayMs)
            } else {
                setIsComplete(true)
            }
        }

        const startTimer = setTimeout(tick, startAfterMs)

        return () => {
            cancelled = true
            clearTimeout(startTimer)
            if (tickTimer) clearTimeout(tickTimer)
        }
    }, [text, delayMs, startAfterMs, enabled, shouldRunInstantly])

    return { typed, isComplete }
}
