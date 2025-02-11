import {useEffect, useRef, useCallback} from 'react'

export function useTimeout() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const set = useCallback((callback: () => void, delay: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(callback, delay)
    }, [])

    const clear = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return [set, clear] as const
}
