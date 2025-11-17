import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

const useIntersectionObserver = (
    ref: RefObject<Element>,
    observerSettings?: IntersectionObserverInit,
) => {
    const [observerEntry, setObserverEntry] =
        useState<IntersectionObserverEntry>()

    useEffect(() => {
        const cachedRef = ref.current

        if (cachedRef) {
            const observer = new IntersectionObserver(([e]) => {
                setObserverEntry(e)
            }, observerSettings)

            observer.observe(cachedRef)

            return () => {
                observer.unobserve(cachedRef)
            }
        }
    }, [ref, observerSettings])

    return observerEntry
}

export default useIntersectionObserver
