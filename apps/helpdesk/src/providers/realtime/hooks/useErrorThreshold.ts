import { useCallback, useRef } from 'react'

export const useErrorThreshold = (
    threshold: number,
    onThresholdReached: () => void,
) => {
    const errorCountRef = useRef(0)

    const incrementErrorCount = useCallback(() => {
        if (errorCountRef.current <= threshold) {
            errorCountRef.current += 1
        }

        if (errorCountRef.current === threshold) {
            onThresholdReached()
        }
    }, [threshold, onThresholdReached])

    const resetErrorCount = useCallback(() => {
        errorCountRef.current = 0
    }, [])

    return { incrementErrorCount, resetErrorCount }
}
