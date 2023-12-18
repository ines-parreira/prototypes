import {useRef} from 'react'
import useEffectOnce from './useEffectOnce'

export default function useUnmount(fn: () => void) {
    const fnRef = useRef(fn)
    fnRef.current = fn

    useEffectOnce(() => () => fnRef.current())
}
