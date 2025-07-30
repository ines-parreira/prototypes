import { useLayoutEffect, useRef, useState } from 'react'

export const useTextOverflow = <T extends HTMLElement>() => {
    const ref = useRef<T>(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    useLayoutEffect(() => {
        if (ref.current) {
            setIsOverflowing(ref.current.offsetWidth < ref.current.scrollWidth)
        }
    }, [ref])

    return { ref, isOverflowing }
}
