import type { DependencyList } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { Maybe } from '@repo/types'

import type { AsyncFnState } from './useAsyncFn'
import { useAsyncFn } from './useAsyncFn'

type FunctionReturningPromise = (...args: any[]) => Promise<any>

export const useDelayedAsyncFn = <T extends any[], Y>(
    fn: FunctionReturningPromise,
    deps: DependencyList = [],
    delay = 100,
): [AsyncFnState<Y>, (...args: T) => Promise<Y>] => {
    const timeoutRef = useRef<Maybe<number>>(null)
    const [isDelayed, setDelayed] = useState(false)
    const [{ loading, ...otherStatus }, handleFn] = useAsyncFn(fn, deps)
    const clearDelay = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setDelayed(false)
    }
    useEffect(() => clearDelay, [])

    return [
        {
            ...otherStatus,
            loading: isDelayed && loading,
        } as AsyncFnState<Y>,
        (...args) => {
            clearDelay()
            timeoutRef.current = window.setTimeout(() => {
                setDelayed(true)
            }, delay)
            return handleFn(...args)
        },
    ]
}
