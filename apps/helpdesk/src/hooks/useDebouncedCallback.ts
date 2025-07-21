import { useMemo, useRef } from 'react'

import useUnmount from './useUnmount'

export type DebouncedFunction<Fn extends (...args: any[]) => any> = (
    this: ThisParameterType<Fn>,
    ...args: Parameters<Fn>
) => void

/**
 * Makes passed function debounced, otherwise acts like `useCallback`.
 *
 * @param callback Function that will be debounced.
 * @param delay Debounce delay.
 * @param maxWait The maximum time `callback` is allowed to be delayed before
 * it's invoked. 0 means no max wait.
 */
export default function useDebouncedCallback<
    Fn extends (...args: any[]) => any,
>(callback: Fn, delay: number, maxWait = 0): DebouncedFunction<Fn> {
    const timeout = useRef<ReturnType<typeof setTimeout>>()
    const waitTimeout = useRef<ReturnType<typeof setTimeout>>()
    const lastCall = useRef<{
        args: Parameters<Fn>
        this: ThisParameterType<Fn>
    }>()

    const clear = () => {
        if (timeout.current) {
            clearTimeout(timeout.current)
            timeout.current = undefined
        }

        if (waitTimeout.current) {
            clearTimeout(waitTimeout.current)
            waitTimeout.current = undefined
        }
    }

    // Cancel scheduled execution on unmount
    useUnmount(clear)

    return useMemo(() => {
        const execute = () => {
            if (!lastCall.current) return

            const context = lastCall.current
            lastCall.current = undefined

            callback.apply(context.this, context.args)

            clear()
        }

        const wrapped = function (this, ...args) {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }

            lastCall.current = { args, this: this }

            // Plan regular execution
            timeout.current = setTimeout(execute, delay)

            // Plan maxWait execution if required
            if (maxWait > 0 && !waitTimeout.current) {
                waitTimeout.current = setTimeout(execute, maxWait)
            }
        } as DebouncedFunction<Fn>

        Object.defineProperties(wrapped, {
            length: { value: callback.length },
            name: {
                value: `${callback.name || 'anonymous'}__debounced__${delay}`,
            },
        })

        return wrapped
    }, [delay, maxWait, callback])
}
