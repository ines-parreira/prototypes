//@flow
//$FlowFixMe
import {useEffect, useRef, useState} from 'react'
import {useAsyncFn, type AsyncState} from 'react-use'

const useDelayedAsyncFn = <T: any[], Y>(
    fn: (...args: T) => Promise<Y>,
    deps?: any[] = [],
    delay?: number = 100
): [AsyncState<Y>, (...args: T) => Promise<Y>] => {
    const timeoutRef = useRef(null)
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
        },
        (...args) => {
            clearDelay()
            timeoutRef.current = setTimeout(() => {
                setDelayed(true)
            }, delay)
            return handleFn(args)
        },
    ]
}

export default useDelayedAsyncFn
