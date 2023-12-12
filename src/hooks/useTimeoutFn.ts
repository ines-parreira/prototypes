import {useCallback, useEffect, useRef} from 'react'

export default function useTimeoutFn(fn: () => void, ms = 0) {
    const ready = useRef<boolean | null>(false)
    const timeout = useRef<ReturnType<typeof setTimeout>>()
    const callback = useRef(fn)

    const isReady = useCallback(() => ready.current, [])

    const set = useCallback(() => {
        ready.current = false
        timeout.current && clearTimeout(timeout.current)

        timeout.current = setTimeout(() => {
            ready.current = true
            callback.current()
        }, ms)
    }, [ms])

    const clear = useCallback(() => {
        ready.current = null
        timeout.current && clearTimeout(timeout.current)
    }, [])

    useEffect(() => {
        callback.current = fn
    }, [fn])

    useEffect(() => {
        set()

        return clear
    }, [clear, ms, set])

    return [isReady, clear, set] as const
}
