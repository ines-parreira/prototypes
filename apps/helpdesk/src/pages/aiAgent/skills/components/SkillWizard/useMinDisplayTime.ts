import { useEffect, useRef, useState } from 'react'

export const useMinDisplayTime = (active: boolean, minMs: number): boolean => {
    const [held, setHeld] = useState(active)
    const startTimeRef = useRef<number | null>(active ? Date.now() : null)

    useEffect(() => {
        if (active) {
            setHeld(true)
            startTimeRef.current = Date.now()
            return
        }

        if (startTimeRef.current === null) {
            setHeld(false)
            return
        }

        const remaining = minMs - (Date.now() - startTimeRef.current)
        if (remaining <= 0) {
            setHeld(false)
            startTimeRef.current = null
            return
        }

        const timer = setTimeout(() => {
            setHeld(false)
            startTimeRef.current = null
        }, remaining)

        return () => clearTimeout(timer)
    }, [active, minMs])

    return held
}
