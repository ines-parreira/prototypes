import { RefObject, useEffect, useState } from 'react'

import useIntersectionObserver from './useIntersectionObserver'

const useIsIntersectingWithElement = (
    ref: RefObject<Element>,
    element?: Element | null,
) => {
    const [isIntersecting, setIsIntersecting] = useState<boolean>()

    const observerEntry = useIntersectionObserver(ref, {
        root: element,
        threshold: 1,
    })

    const { isIntersecting: currentIsIntersecting } = observerEntry || {}

    useEffect(() => {
        setIsIntersecting(currentIsIntersecting)
    }, [currentIsIntersecting])

    return isIntersecting
}

export default useIsIntersectingWithElement
