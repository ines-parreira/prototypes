//@flow
//$FlowFixMe
import {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'

const useDelayedAsyncFn = <T, Y>(fn: (...args: T | []) => Promise<Y>, deps?: any[] = [], delay?: number = 100) => {
    let timeoutId
    const [loading, setLoading] = useState(false)
    const [{
        loading: isPending,
        ...otherStatus
    }, handleFn] = useAsyncFn(fn, deps)
    const clearTimer = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
    }
    useEffect(() => {
        if (isPending) {
            timeoutId = setTimeout(() => {
                setLoading(true)
            }, delay)
        } else {
            clearTimer()
            setLoading(false)
        }
        return clearTimer
    }, [isPending])

    return [
        {
            ...otherStatus,
            loading,
        },
        handleFn,
    ]
}

export default useDelayedAsyncFn
