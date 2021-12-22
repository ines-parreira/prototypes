import {useCallback, useLayoutEffect, useState} from 'react'

export default function useDimensions(): [
    (element: HTMLElement | null) => void,
    DOMRect | null
] {
    const [dimensions, setDimensions] = useState<DOMRect | null>(null)
    const [element, setElement] = useState<HTMLElement | null>(null)

    const ref = useCallback((element) => {
        setElement(element)
    }, [])
    useLayoutEffect(() => {
        if (element) {
            const measure = () =>
                window.requestAnimationFrame(() =>
                    setDimensions(element.getBoundingClientRect())
                )

            measure()
            window.addEventListener('resize', measure)
            return () => {
                window.removeEventListener('resize', measure)
            }
        }
    }, [element])

    return [ref, dimensions]
}
