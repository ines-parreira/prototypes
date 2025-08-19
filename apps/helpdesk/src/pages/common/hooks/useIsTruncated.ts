import { RefObject, useLayoutEffect, useState } from 'react'

export const useIsTruncated = (
    ref: RefObject<HTMLElement>,
    dependency?: any,
) => {
    const [isTruncated, setIsTruncated] = useState(false)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) {
            return
        }

        const checkTruncation = () => {
            setIsTruncated(element.scrollWidth > element.clientWidth)
        }

        checkTruncation()

        const resizeObserver = new ResizeObserver(checkTruncation)
        resizeObserver.observe(element)

        return () => {
            resizeObserver.disconnect()
        }
    }, [ref, dependency])

    return isTruncated
}
