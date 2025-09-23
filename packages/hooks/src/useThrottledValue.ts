import { useEffect, useState } from 'react'

import { useThrottledCallback } from './useThrottledCallback'

export const useThrottledValue = <T, U extends any[]>(
    callback: (...args: U) => T,
    args: U,
    delay: number,
    noTrailing = false,
) => {
    const [state, setState] = useState<T | null>(null)

    const throttledSetState = useThrottledCallback(setState, delay, noTrailing)

    useEffect(() => {
        throttledSetState(() => callback(...args))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, args)

    return state
}
