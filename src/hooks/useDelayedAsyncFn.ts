import {useEffect, useRef, useState, DependencyList} from 'react'
import {useAsyncFn} from 'react-use'
import {FunctionReturningPromise} from 'react-use/lib/misc/types'
import {AsyncState} from 'react-use/lib/useAsyncFn'

const useDelayedAsyncFn = <T extends any[], Y>(
    fn: FunctionReturningPromise,
    deps: DependencyList = [],
    delay = 100
): [AsyncState<Y>, (...args: T) => Promise<Y>] => {
    const timeoutRef = useRef<Maybe<number>>(null)
    const [isDelayed, setDelayed] = useState(false)
    const [{loading, ...otherStatus}, handleFn] = useAsyncFn(fn, deps)
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
        } as AsyncState<Y>,
        (...args) => {
            clearDelay()
            timeoutRef.current = window.setTimeout(() => {
                setDelayed(true)
            }, delay)
            return handleFn(...args)
        },
    ]
}

export default useDelayedAsyncFn
