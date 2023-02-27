import {useCallback, useState} from 'react'

export default function useSelectedIndex(max: number) {
    const [index, setIndex] = useState<number>(-1)

    const next = useCallback(() => {
        let nextIndex = index + 1
        if (nextIndex > max) nextIndex = 0
        setIndex(nextIndex)
    }, [index, max])

    const previous = useCallback(() => {
        let nextIndex = index - 1
        if (nextIndex < 0) nextIndex = max
        setIndex(nextIndex)
    }, [index, max])

    const reset = useCallback(() => {
        setIndex(-1)
    }, [])

    return {index, next, previous, reset, setIndex}
}
