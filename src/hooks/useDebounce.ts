import {DependencyList, useEffect} from 'react'
import useTimeoutFn from './useTimeoutFn'

export default function useDebounce(
    fn: () => unknown,
    ms = 0,
    deps: DependencyList = []
) {
    const [isReady, cancel, reset] = useTimeoutFn(fn, ms)

    useEffect(reset, [reset, ...deps])

    return [isReady, cancel]
}
