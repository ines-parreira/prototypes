import {useCallback, useState} from 'react'

interface Options {
    initial?: number
    loop?: boolean
}

export default function useSelectedIndex(
    max: number,
    {initial = -1, loop = false}: Options = {}
) {
    const [index, setIndex] = useState<number>(initial)

    const next = useCallback(() => {
        let nextIndex = index + 1
        if (nextIndex > max) {
            nextIndex = loop ? 0 : max
        }
        setIndex(nextIndex)
    }, [index, loop, max])

    const previous = useCallback(() => {
        let nextIndex = index - 1
        if (nextIndex < 0) {
            nextIndex = loop ? max : 0
        }
        setIndex(nextIndex)
    }, [index, loop, max])

    const reset = useCallback(() => {
        setIndex(-1)
    }, [])

    return {index, next, previous, reset, setIndex}
}
